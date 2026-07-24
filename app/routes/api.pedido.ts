import type { Route } from "./+types/api.pedido";
import {
	STATUS_PEDIDO,
	atualizarStatusDoPedido,
	criarPedido,
	listarTodosPedidos,
	listarPedidosPorCliente,
} from "../models/pedidos.server";
import { validarCredenciaisAdmin } from "../services/admin-auth.server";
import { criarCheckoutPontualPagarme } from "../services/pagarme.server";
import { enviarEmailPedidoEmRota } from "../services/email.server";

type PayloadCriarPedido = {
	intent: "criar";
	clienteId: string;
	clienteNome: string;
	clienteEmail: string;
	clienteTelefone: string;
	clienteEndereco?: string;
	clienteCpf?: string;
	observacoesCliente?: string;
	criarCheckout?: boolean;
	itens: Array<{
		id: string;
		codigo: number;
		descricao: string;
		unidade: string;
		preco: number;
		quantidade: number;
	}>;
	total: number;
};

type PayloadListarPedidos = {
	intent: "listar";
	clienteId: string;
};

type PayloadAtualizarStatusPedido = {
	intent: "atualizar_status";
	pedidoId: string;
	status: string;
};

type PayloadLoginAdmin = {
	intent: "admin_login";
	email: string;
	senha: string;
};

type PayloadListarTodosAdmin = {
	intent: "admin_listar_todos";
	email: string;
	senha: string;
};

type PayloadAtualizarStatusAdmin = {
	intent: "admin_atualizar_status";
	email: string;
	senha: string;
	pedidoId: string;
	status: string;
};

type PayloadPedido =
	| PayloadCriarPedido
	| PayloadListarPedidos
	| PayloadAtualizarStatusPedido
	| PayloadLoginAdmin
	| PayloadListarTodosAdmin
	| PayloadAtualizarStatusAdmin;

function respostaJson(body: unknown, status = 200) {
	return Response.json(body, { status });
}

function ehString(valor: unknown): valor is string {
	return typeof valor === "string";
}

function ehNumero(valor: unknown): valor is number {
	return typeof valor === "number" && Number.isFinite(valor);
}

function ehBoolean(valor: unknown): valor is boolean {
	return typeof valor === "boolean";
}

function converterReaisParaCentavos(valor: number) {
	return Math.round(valor * 100);
}

function criarDescricaoItemCheckout(item: PayloadCriarPedido["itens"][number]) {
	const descricao = item.descricao.trim();
	if (descricao.length > 0) {
		return descricao;
	}

	return `Produto ${item.codigo}`;
}

function calcularValorTotalItensEmCentavos(itens: PayloadCriarPedido["itens"]) {
	return itens.reduce(
		(total, item) => total + converterReaisParaCentavos(item.preco * item.quantidade),
		0,
	);
}

function criarItensCheckout(payload: PayloadCriarPedido) {
	const itensCheckout = payload.itens
		.filter(
			(item) =>
				ehString(item.descricao) &&
				item.descricao.trim().length > 0 &&
				ehNumero(item.preco) &&
				ehNumero(item.quantidade) &&
				item.quantidade > 0,
		)
		.map((item) => ({
			amount: converterReaisParaCentavos(item.preco),
			description: criarDescricaoItemCheckout(item),
			quantity: item.quantidade,
		}));

	const totalItens = calcularValorTotalItensEmCentavos(payload.itens);
	const totalPedido = converterReaisParaCentavos(payload.total);
	if (totalPedido > totalItens) {
		itensCheckout.push({
			amount: totalPedido - totalItens,
			description: "Frete e taxas",
			quantity: 1,
		});
	}

	return itensCheckout;
}

function deveCriarCheckoutNoPedido(payload: PayloadCriarPedido) {
	if (ehBoolean(payload.criarCheckout)) {
		return payload.criarCheckout;
	}

	return true;
}

function criarMensagemPedidoSemCheckout() {
	return "Pedido registrado com frete pendente. Em breve enviaremos o valor do frete, o total final e o link de pagamento.";
}

function parsearPayload(data: unknown): PayloadPedido | null {
	if (!data || typeof data !== "object") {
		return null;
	}

	const payload = data as Record<string, unknown>;
	const intent = payload.intent;
	if (!ehString(intent)) {
		return null;
	}

	if (intent === "listar" && ehString(payload.clienteId)) {
		return { intent, clienteId: payload.clienteId };
	}

	if (
		intent === "atualizar_status" &&
		ehString(payload.pedidoId) &&
		ehString(payload.status)
	) {
		return {
			intent,
			pedidoId: payload.pedidoId,
			status: payload.status,
		};
	}

	if (intent === "admin_login" && ehString(payload.email) && ehString(payload.senha)) {
		return {
			intent,
			email: payload.email,
			senha: payload.senha,
		};
	}

	if (
		intent === "admin_listar_todos" &&
		ehString(payload.email) &&
		ehString(payload.senha)
	) {
		return {
			intent,
			email: payload.email,
			senha: payload.senha,
		};
	}

	if (
		intent === "admin_atualizar_status" &&
		ehString(payload.email) &&
		ehString(payload.senha) &&
		ehString(payload.pedidoId) &&
		ehString(payload.status)
	) {
		return {
			intent,
			email: payload.email,
			senha: payload.senha,
			pedidoId: payload.pedidoId,
			status: payload.status,
		};
	}

	if (
		intent === "criar" &&
		ehString(payload.clienteId) &&
		ehString(payload.clienteNome) &&
		ehString(payload.clienteEmail) &&
		ehString(payload.clienteTelefone) &&
		Array.isArray(payload.itens) &&
		ehNumero(payload.total)
	) {
		return {
			intent,
			clienteId: payload.clienteId,
			clienteNome: payload.clienteNome,
			clienteEmail: payload.clienteEmail,
			clienteTelefone: payload.clienteTelefone,
			clienteEndereco: ehString(payload.clienteEndereco)
				? payload.clienteEndereco
				: "",
			clienteCpf: ehString(payload.clienteCpf) ? payload.clienteCpf : "",
			observacoesCliente: ehString(payload.observacoesCliente)
				? payload.observacoesCliente
				: "",
			criarCheckout: ehBoolean(payload.criarCheckout)
				? payload.criarCheckout
				: true,
			itens: payload.itens as PayloadCriarPedido["itens"],
			total: payload.total,
		};
	}

	return null;
}

async function notificarSeEntrouEmRota(pedido: {
	id: string;
	status: string;
	total: number;
	statusAnterior: string;
	clienteEmail?: string;
	clienteNome?: string;
}) {
	if (
		pedido.status !== STATUS_PEDIDO.EM_ROTA ||
		pedido.statusAnterior === STATUS_PEDIDO.EM_ROTA ||
		!pedido.clienteEmail
	) {
		return;
	}

	try {
		await enviarEmailPedidoEmRota({
			para: pedido.clienteEmail,
			nomeCliente: pedido.clienteNome,
			pedidoId: pedido.id,
			total: pedido.total,
		});
	} catch {
		// Falha no envio de e-mail nao deve impedir a atualizacao do status do pedido.
	}
}

export async function action({ request }: Route.ActionArgs) {
	let data: unknown;
	try {
		data = await request.json();
	} catch {
		return respostaJson({ erro: "Payload invalido." }, 400);
	}

	const payload = parsearPayload(data);
	if (!payload) {
		return respostaJson({ erro: "Payload invalido." }, 400);
	}

	if (payload.intent === "listar") {
		const pedidos = await listarPedidosPorCliente(payload.clienteId);
		return respostaJson({ pedidos });
	}

	if (payload.intent === "atualizar_status") {
		const pedido = await atualizarStatusDoPedido(payload.pedidoId, payload.status);
		if (!pedido) {
			return respostaJson({ erro: "Nao foi possivel atualizar o status." }, 400);
		}
		await notificarSeEntrouEmRota(pedido);
		return respostaJson({ pedido });
	}

	if (payload.intent === "admin_login") {
		const ok = validarCredenciaisAdmin(payload.email, payload.senha);
		if (!ok) {
			return respostaJson({ ok: false, erro: "Credenciais de admin invalidas." }, 401);
		}
		return respostaJson({ ok: true });
	}

	if (payload.intent === "admin_listar_todos") {
		const ok = validarCredenciaisAdmin(payload.email, payload.senha);
		if (!ok) {
			return respostaJson({ erro: "Nao autorizado." }, 401);
		}
		const pedidos = await listarTodosPedidos();
		return respostaJson({ pedidos });
	}

	if (payload.intent === "admin_atualizar_status") {
		const ok = validarCredenciaisAdmin(payload.email, payload.senha);
		if (!ok) {
			return respostaJson({ erro: "Nao autorizado." }, 401);
		}
		const pedido = await atualizarStatusDoPedido(payload.pedidoId, payload.status);
		if (!pedido) {
			return respostaJson({ erro: "Nao foi possivel atualizar o status." }, 400);
		}
		await notificarSeEntrouEmRota(pedido);
		return respostaJson({ pedido });
	}

	const precisaCheckout = deveCriarCheckoutNoPedido(payload);
	if (!precisaCheckout) {
		const pedidoSemCheckout = await criarPedido({
			...payload,
			clienteEndereco: payload.clienteEndereco ?? "",
			clienteDocumento: payload.clienteCpf ?? "",
			observacoesCliente: payload.observacoesCliente ?? "",
		});
		if (!pedidoSemCheckout) {
			return respostaJson({ erro: "Dados do pedido invalidos." }, 400);
		}

		return respostaJson({
			pedido: pedidoSemCheckout,
			checkoutPendente: true,
			mensagemCliente: criarMensagemPedidoSemCheckout(),
		});
	}

	let checkoutPagarme: { id: string; url: string; status: string };
	try {
		checkoutPagarme = await criarCheckoutPontualPagarme({
			items: criarItensCheckout(payload),
			customer: {
				name: payload.clienteNome,
				email: payload.clienteEmail,
				document: payload.clienteCpf,
				phone: payload.clienteTelefone,
			},
		});
	} catch (error) {
		const mensagem =
			error instanceof Error
				? error.message
				: "Nao foi possivel criar checkout na Pagar.me.";
		return respostaJson({ erro: mensagem }, 502);
	}

	const pedido = await criarPedido({
		...payload,
		clienteEndereco: payload.clienteEndereco ?? "",
		clienteDocumento: payload.clienteCpf ?? "",
		observacoesCliente: payload.observacoesCliente ?? "",
		pagamento: {
			provedor: "PAGARME",
			status: checkoutPagarme.status,
			linkId: checkoutPagarme.id,
			linkUrl: checkoutPagarme.url,
		},
	});
	if (!pedido) {
		return respostaJson({ erro: "Dados do pedido invalidos." }, 400);
	}

	return respostaJson({ pedido, checkoutUrl: checkoutPagarme.url });
}
