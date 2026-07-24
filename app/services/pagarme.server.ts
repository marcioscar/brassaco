type CheckoutItemInput = {
	amount: number;
	description: string;
	quantity: number;
};

type CriarCheckoutPontualInput = {
	items: CheckoutItemInput[];
	customer?: CheckoutCustomerInput;
};

type CriarCheckoutPontualOutput = {
	id: string;
	url: string;
	status: string;
};

type CheckoutCustomerInput = {
	name: string;
	email?: string;
	document?: string;
	phone?: string;
};

type CheckoutItemPayload = {
	amount: number;
	name: string;
	description: string;
	default_quantity: number;
};

const USER_AGENT = "pagarme-skill-generated/1.0";
// Padrao em producao. Para usar o sandbox defina PAGARME_BASE_URL=https://sdx-api.pagar.me/core/v5
const BASE_URL_PADRAO = "https://api.pagar.me/core/v5";

function obterConfiguracaoPagarme() {
	const secretKey = process.env.PAGARME_SECRET_KEY?.trim();
	const baseUrl = process.env.PAGARME_BASE_URL?.trim() || BASE_URL_PADRAO;
	if (!secretKey || !baseUrl) {
		return null;
	}

	return { secretKey, baseUrl };
}

function criarHeaderDeAutorizacao(secretKey: string) {
	return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

function normalizarItens(items: CheckoutItemInput[]) {
	return items
		.filter(
			(item) =>
				item.description.trim().length > 0 &&
				Number.isInteger(item.quantity) &&
				item.quantity > 0 &&
				Number.isInteger(item.amount) &&
				item.amount > 0,
		)
		.map((item) => ({
			amount: item.amount,
			description: item.description.trim(),
			quantity: item.quantity,
		}));
}

function criarItensDoPayload(items: CheckoutItemInput[]): CheckoutItemPayload[] {
	return items.map((item) => ({
		amount: item.amount,
		name: item.description,
		description: item.description,
		default_quantity: item.quantity,
	}));
}

function calcularTotalDoCheckout(items: CheckoutItemInput[]) {
	return items.reduce((total, item) => total + item.amount * item.quantity, 0);
}

function somenteDigitos(valor: string) {
	return valor.replace(/\D/g, "");
}

function normalizarDocumento(documento?: string) {
	if (!documento) {
		return null;
	}

	const digitos = somenteDigitos(documento);
	if (digitos.length === 11) {
		return {
			document: digitos,
			document_type: "CPF" as const,
			customer_type: "individual" as const,
		};
	}
	if (digitos.length === 14) {
		return {
			document: digitos,
			document_type: "CNPJ" as const,
			customer_type: "company" as const,
		};
	}

	return null;
}

function normalizarTelefone(phone?: string) {
	if (!phone) {
		return null;
	}

	const digitos = somenteDigitos(phone);
	if (digitos.length === 10 || digitos.length === 11) {
		return {
			country_code: "55",
			area_code: digitos.slice(0, 2),
			number: digitos.slice(2),
		};
	}
	if (digitos.length === 12 || digitos.length === 13) {
		return {
			country_code: digitos.slice(0, 2),
			area_code: digitos.slice(2, 4),
			number: digitos.slice(4),
		};
	}

	return null;
}

function construirCustomerSettings(customer?: CheckoutCustomerInput) {
	if (!customer?.name?.trim()) {
		return undefined;
	}

	const documento = normalizarDocumento(customer.document);
	const telefone = normalizarTelefone(customer.phone);
	const email = customer.email?.trim();

	return {
		customer: {
			name: customer.name.trim(),
			...(email ? { email } : {}),
			...(documento
				? {
						type: documento.customer_type,
						document: documento.document,
						document_type: documento.document_type,
					}
				: {}),
			...(telefone
				? {
						phones: {
							mobile_phone: telefone,
						},
					}
				: {}),
		},
	};
}

function construirPayloadCheckout(
	items: CheckoutItemInput[],
	customer?: CheckoutCustomerInput,
) {
	const itensPayload = criarItensDoPayload(items);
	const totalEmCentavos = calcularTotalDoCheckout(items);
	const customerSettings = construirCustomerSettings(customer);

	return {
		type: "order",
		name: "Pedido BRASSACO",
		payment_settings: {
			accepted_payment_methods: ["credit_card", "pix", "boleto"],
			credit_card_settings: {
				operation_type: "auth_and_capture",
				installments: [{ number: 1, total: totalEmCentavos }],
			},
			boleto_settings: {
				due_in: 3,
				instructions: "Pagamento referente ao pedido BRASSACO.",
			},
			pix_settings: {
				expires_in: 1800,
			},
		},
		cart_settings: {
			items: itensPayload,
		},
		...(customerSettings ? { customer_settings: customerSettings } : {}),
	};
}

function resumirErrosDeValidacao(errors?: Record<string, unknown>) {
	if (!errors || typeof errors !== "object") {
		return "";
	}

	const mensagens = Object.entries(errors)
		.map(([campo, valor]) => {
			if (Array.isArray(valor) && valor.length > 0) {
				return `${campo}: ${String(valor[0])}`;
			}
			if (typeof valor === "string") {
				return `${campo}: ${valor}`;
			}
			return "";
		})
		.filter(Boolean);

	return mensagens.join(" | ");
}

async function parsearErroDaResposta(resposta: Response) {
	try {
		const dados = (await resposta.json()) as {
			message?: string;
			title?: string;
			detail?: string;
			errors?: Record<string, unknown>;
		};
		if (dados?.message) {
			return dados.message;
		}
		const resumoValidacao = resumirErrosDeValidacao(dados.errors);
		if (resumoValidacao) {
			return resumoValidacao;
		}
		if (dados.detail) {
			return dados.detail;
		}
		if (dados.title) {
			return dados.title;
		}
	} catch {
		// Ignora erros de parse para manter fallback de mensagem.
	}

	return `Falha na API da Pagar.me (status ${resposta.status}).`;
}

function validarRespostaCheckout(data: unknown): CriarCheckoutPontualOutput | null {
	if (!data || typeof data !== "object") {
		return null;
	}

	const payload = data as Record<string, unknown>;
	if (
		typeof payload.id !== "string" ||
		typeof payload.url !== "string" ||
		typeof payload.status !== "string"
	) {
		return null;
	}

	return {
		id: payload.id,
		url: payload.url,
		status: payload.status,
	};
}

export async function criarCheckoutPontualPagarme({
	items,
	customer,
}: CriarCheckoutPontualInput): Promise<CriarCheckoutPontualOutput> {
	const config = obterConfiguracaoPagarme();
	if (!config) {
		throw new Error("Configuracao da Pagar.me ausente no ambiente.");
	}

	const itensNormalizados = normalizarItens(items);
	if (itensNormalizados.length === 0) {
		throw new Error("Nenhum item valido para criar checkout na Pagar.me.");
	}

	const resposta = await fetch(`${config.baseUrl}/paymentlinks`, {
		method: "POST",
		headers: {
			Authorization: criarHeaderDeAutorizacao(config.secretKey),
			"Content-Type": "application/json",
			"User-Agent": USER_AGENT,
		},
		body: JSON.stringify(construirPayloadCheckout(itensNormalizados, customer)),
	});

	if (!resposta.ok) {
		throw new Error(await parsearErroDaResposta(resposta));
	}

	const dados = (await resposta.json()) as unknown;
	const checkout = validarRespostaCheckout(dados);
	if (!checkout) {
		throw new Error("Resposta invalida ao criar checkout na Pagar.me.");
	}

	return checkout;
}
