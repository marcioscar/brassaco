import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "../db.server";

export type ClienteInput = {
	nome: string;
	email: string;
	senha: string;
	cpf: string;
	cep: string;
	telefone: string;
	endereco: string;
	observacoes: string;
};

export type ClienteSessao = {
	id: string;
	nome: string;
	email: string;
	cpf: string;
	cep: string;
	telefone: string;
	endereco: string;
	observacoes: string;
};

const MINUTOS_EXPIRACAO_RECUPERACAO = 60;

function normalizarTelefone(telefone: string) {
	return telefone.replace(/\D/g, "");
}

function normalizarEmail(email: string) {
	return email.trim().toLowerCase();
}

function normalizarCpf(cpf: string) {
	return cpf.replace(/\D/g, "");
}

function normalizarCep(cep: string) {
	return cep.replace(/\D/g, "");
}

function gerarHashDaSenha(senha: string) {
	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(senha, salt, 64).toString("hex");
	return `${salt}:${hash}`;
}

function gerarCodigoRecuperacao() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

function filtroRecuperacaoNaoUsada() {
	return {
		OR: [{ usedAt: null }, { usedAt: { isSet: false } }],
	};
}

function verificarHashDaSenha(senha: string, hashArmazenado: string) {
	const partes = hashArmazenado.split(":");
	if (partes.length !== 2) {
		return false;
	}

	const [salt, hashOriginal] = partes;
	const hashCalculado = scryptSync(senha, salt, 64).toString("hex");
	return timingSafeEqual(
		Buffer.from(hashCalculado, "hex"),
		Buffer.from(hashOriginal, "hex"),
	);
}

function gerarHashGenerico(valor: string) {
	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(valor, salt, 64).toString("hex");
	return `${salt}:${hash}`;
}

function verificarHashGenerico(valor: string, hashArmazenado: string) {
	const partes = hashArmazenado.split(":");
	if (partes.length !== 2) {
		return false;
	}
	const [salt, hashOriginal] = partes;
	const hashCalculado = scryptSync(valor, salt, 64).toString("hex");
	return timingSafeEqual(
		Buffer.from(hashCalculado, "hex"),
		Buffer.from(hashOriginal, "hex"),
	);
}

function paraClienteSessao(cliente: {
	id: string;
	nome: string | null;
	email: string | null;
	cpf: string | null;
	cep: string | null;
	telefone: string | null;
	endereco: string | null;
	observacoes: string | null;
}): ClienteSessao | null {
	if (!cliente.nome || !cliente.email || !cliente.telefone || !cliente.endereco) {
		return null;
	}

	return {
		id: cliente.id,
		nome: cliente.nome,
		email: cliente.email,
		cpf: cliente.cpf ?? "",
		cep: cliente.cep ?? "",
		telefone: cliente.telefone,
		endereco: cliente.endereco,
		observacoes: cliente.observacoes ?? "",
	};
}

function validarDadosObrigatorios(input: ClienteInput) {
	const nome = input.nome.trim();
	const email = input.email.trim();
	const senha = input.senha.trim();
	const cpf = input.cpf.trim();
	const cep = input.cep.trim();
	const telefone = input.telefone.trim();
	const endereco = input.endereco.trim();
	const observacoes = input.observacoes.trim();
	const emailNormalizado = normalizarEmail(email);
	const cpfNormalizado = normalizarCpf(cpf);
	const cepNormalizado = normalizarCep(cep);
	const telefoneNormalizado = normalizarTelefone(telefone);

	if (
		!nome ||
		!email ||
		!senha ||
		!cpf ||
		!cep ||
		!telefone ||
		!endereco ||
		!emailNormalizado ||
		cpfNormalizado.length !== 11 ||
		cepNormalizado.length !== 8 ||
		!telefoneNormalizado
	) {
		return null;
	}

	return {
		nome,
		email,
		senha,
		cpf,
		cep,
		telefone,
		endereco,
		observacoes,
		emailNormalizado,
		cpfNormalizado,
		cepNormalizado,
		telefoneNormalizado,
	};
}

export async function buscarClientePorId(id: string) {
	const cliente = await db.clientes.findUnique({
		where: { id },
		select: {
			id: true,
			nome: true,
			email: true,
			cpf: true,
			cep: true,
			telefone: true,
			endereco: true,
			observacoes: true,
		},
	});
	if (!cliente) {
		return null;
	}

	return paraClienteSessao(cliente);
}

export async function buscarClientePorEmailESenha(email: string, senha: string) {
	const emailNormalizado = normalizarEmail(email);
	const senhaLimpa = senha.trim();
	if (!emailNormalizado || !senhaLimpa) {
		return null;
	}

	const cliente = await db.clientes.findFirst({
		where: { emailNormalizado },
		orderBy: { updatedAt: "desc" },
		select: {
			id: true,
			nome: true,
			email: true,
			cpf: true,
			cep: true,
			telefone: true,
			endereco: true,
			observacoes: true,
			senhaHash: true,
		},
	});
	if (!cliente?.senhaHash) {
		return null;
	}
	if (!verificarHashDaSenha(senhaLimpa, cliente.senhaHash)) {
		return null;
	}

	return paraClienteSessao(cliente);
}

export async function salvarCliente(input: ClienteInput) {
	const dados = validarDadosObrigatorios(input);
	if (!dados) {
		return null;
	}

	const clienteExistente = await db.clientes.findFirst({
		where: { emailNormalizado: dados.emailNormalizado },
		select: { id: true },
	});

	const agora = new Date();
	const senhaHash = gerarHashDaSenha(dados.senha);
	if (!clienteExistente) {
		const clienteCriado = await db.clientes.create({
			data: {
				nome: dados.nome,
				email: dados.email,
				emailNormalizado: dados.emailNormalizado,
				senhaHash,
				cpf: dados.cpf,
				cpfNormalizado: dados.cpfNormalizado,
				cep: dados.cep,
				telefone: dados.telefone,
				telefoneNormalizado: dados.telefoneNormalizado,
				endereco: dados.endereco,
				observacoes: dados.observacoes || null,
				createdAt: agora,
				updatedAt: agora,
			},
			select: {
				id: true,
				nome: true,
				email: true,
				cpf: true,
				cep: true,
				telefone: true,
				endereco: true,
				observacoes: true,
			},
		});

		return paraClienteSessao(clienteCriado);
	}

	const clienteAtualizado = await db.clientes.update({
		where: { id: clienteExistente.id },
		data: {
			nome: dados.nome,
			email: dados.email,
			emailNormalizado: dados.emailNormalizado,
			senhaHash,
			cpf: dados.cpf,
			cpfNormalizado: dados.cpfNormalizado,
			cep: dados.cep,
			telefone: dados.telefone,
			telefoneNormalizado: dados.telefoneNormalizado,
			endereco: dados.endereco,
			observacoes: dados.observacoes || null,
			updatedAt: agora,
		},
		select: {
			id: true,
			nome: true,
			email: true,
			cpf: true,
			cep: true,
			telefone: true,
			endereco: true,
			observacoes: true,
		},
	});

	return paraClienteSessao(clienteAtualizado);
}

export async function alterarSenhaDoCliente(
	clienteId: string,
	senhaAtual: string,
	novaSenha: string,
) {
	const id = clienteId.trim();
	const senhaAtualLimpa = senhaAtual.trim();
	const novaSenhaLimpa = novaSenha.trim();
	if (!id || !senhaAtualLimpa || !novaSenhaLimpa) {
		return false;
	}

	const cliente = await db.clientes.findUnique({
		where: { id },
		select: { id: true, senhaHash: true },
	});
	if (!cliente?.senhaHash) {
		return false;
	}
	if (!verificarHashDaSenha(senhaAtualLimpa, cliente.senhaHash)) {
		return false;
	}

	await db.clientes.update({
		where: { id: cliente.id },
		data: {
			senhaHash: gerarHashDaSenha(novaSenhaLimpa),
			updatedAt: new Date(),
		},
	});
	return true;
}

export async function solicitarRecuperacaoSenha(email: string) {
	const emailNormalizado = normalizarEmail(email);
	if (!emailNormalizado) {
		return {
			sucesso: true,
			codigo: null as string | null,
			email: null as string | null,
			tokenId: null as string | null,
		};
	}

	const cliente = await db.clientes.findFirst({
		where: { emailNormalizado },
		select: { id: true, email: true },
	});
	if (!cliente) {
		// Nao vaza se o e-mail existe.
		return {
			sucesso: true,
			codigo: null as string | null,
			email: null as string | null,
			tokenId: null as string | null,
		};
	}

	const codigo = gerarCodigoRecuperacao();
	const agora = new Date();
	const expiresAt = new Date(
		agora.getTime() + MINUTOS_EXPIRACAO_RECUPERACAO * 60 * 1000,
	);

	const recuperacaoCriada = await db.recuperacoes_senha.create({
		data: {
			clienteId: cliente.id,
			codigoHash: gerarHashGenerico(codigo),
			expiresAt,
			createdAt: agora,
		},
	});

	return {
		sucesso: true,
		codigo,
		email: cliente.email ?? null,
		tokenId: recuperacaoCriada.id,
	};
}

type ResultadoRedefinicao =
	| { ok: true }
	| {
			ok: false;
			motivo:
				| "email_invalido"
				| "cliente_nao_encontrado"
				| "codigo_invalido_ou_expirado";
	  };

export async function redefinirSenhaComCodigo(
	email: string,
	codigo: string,
	novaSenha: string,
	tokenId?: string,
): Promise<ResultadoRedefinicao> {
	const emailNormalizado = normalizarEmail(email);
	const codigoLimpo = codigo.replace(/\D/g, "").trim();
	const tokenExtraido = tokenId?.match(/[a-f0-9]{8,24}/i)?.[0]?.toLowerCase() ?? "";
	const tokenIdLimpo = tokenExtraido.length === 24 ? tokenExtraido : "";
	const tokenPrefixo = tokenExtraido.length >= 8 ? tokenExtraido.slice(0, 8) : "";
	const novaSenhaLimpa = novaSenha.trim();
	if (!novaSenhaLimpa) {
		return { ok: false, motivo: "email_invalido" };
	}

	const agora = new Date();
	let clienteIdDaRecuperacao = "";
	let recuperacaoValida:
		| { id: string; codigoHash: string; expiresAt: Date }
		| undefined;

	if (tokenIdLimpo) {
		const recuperacaoPorToken = await db.recuperacoes_senha.findFirst({
			where: {
				id: tokenIdLimpo,
				...filtroRecuperacaoNaoUsada(),
				expiresAt: { gt: agora },
			},
			select: {
				id: true,
				clienteId: true,
				codigoHash: true,
				expiresAt: true,
			},
		});
		recuperacaoValida = recuperacaoPorToken ?? undefined;
		clienteIdDaRecuperacao = recuperacaoPorToken?.clienteId ?? "";
	}

	if (!recuperacaoValida && tokenPrefixo) {
		const clientePorEmail = emailNormalizado
			? await db.clientes.findFirst({
					where: { emailNormalizado },
					select: { id: true },
			  })
			: null;
		if (!clientePorEmail) {
			return { ok: false, motivo: "cliente_nao_encontrado" };
		}

		const recuperacoesPorPrefixo = await db.recuperacoes_senha.findMany({
			where: {
				clienteId: clientePorEmail.id,
				...filtroRecuperacaoNaoUsada(),
				expiresAt: { gt: agora },
			},
			orderBy: { createdAt: "desc" },
			take: 50,
			select: {
				id: true,
				codigoHash: true,
				expiresAt: true,
			},
		});

		recuperacaoValida = recuperacoesPorPrefixo.find((item) =>
			item.id.toLowerCase().startsWith(tokenPrefixo),
		);
		clienteIdDaRecuperacao = clientePorEmail.id;
	}

	if (!recuperacaoValida) {
		const clientePorEmail = emailNormalizado
			? await db.clientes.findFirst({
					where: { emailNormalizado },
					select: { id: true },
			  })
			: null;
		if (!clientePorEmail) {
			return { ok: false, motivo: "cliente_nao_encontrado" };
		}

		if (!codigoLimpo) {
			return { ok: false, motivo: "codigo_invalido_ou_expirado" };
		}
		const recuperacoes = await db.recuperacoes_senha.findMany({
			where: {
				clienteId: clientePorEmail.id,
				...filtroRecuperacaoNaoUsada(),
				expiresAt: { gt: agora },
			},
			orderBy: { createdAt: "desc" },
			take: 50,
			select: {
				id: true,
				codigoHash: true,
				expiresAt: true,
			},
		});
		recuperacaoValida = recuperacoes.find(
			(item) =>
				item.expiresAt > agora &&
				verificarHashGenerico(codigoLimpo, item.codigoHash),
		);
		clienteIdDaRecuperacao = clientePorEmail.id;
	}
	if (!recuperacaoValida) {
		return { ok: false, motivo: "codigo_invalido_ou_expirado" };
	}

	if (!clienteIdDaRecuperacao) {
		return { ok: false, motivo: "cliente_nao_encontrado" };
	}

	await db.clientes.update({
		where: { id: clienteIdDaRecuperacao },
		data: {
			senhaHash: gerarHashDaSenha(novaSenhaLimpa),
			updatedAt: agora,
		},
	});

	await db.recuperacoes_senha.updateMany({
		where: {
			clienteId: clienteIdDaRecuperacao,
			...filtroRecuperacaoNaoUsada(),
		},
		data: { usedAt: agora },
	});

	return { ok: true };
}
