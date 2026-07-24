import type { Route } from "./+types/api.cliente";
import {
	alterarSenhaDoCliente,
	buscarClientePorId,
	buscarClientePorEmailESenha,
	redefinirSenhaComCodigo,
	salvarCliente,
	solicitarRecuperacaoSenha,
} from "../models/clientes.server";
import { enviarEmailRecuperacaoSenha } from "../services/email.server";

type PayloadLoginPorEmailESenha = {
	intent: "login_por_email_senha";
	email: string;
	senha: string;
};

type PayloadLoginPorId = {
	intent: "login_por_id";
	id: string;
};

type PayloadSalvar = {
	intent: "salvar";
	nome: string;
	email: string;
	senha: string;
	cpf: string;
	cep: string;
	telefone: string;
	endereco: string;
	observacoes?: string;
};

type PayloadSolicitarRecuperacao = {
	intent: "solicitar_recuperacao";
	email: string;
};

type PayloadRedefinirSenha = {
	intent: "redefinir_senha";
	email: string;
	codigo: string;
	novaSenha: string;
	tokenId?: string;
};

type PayloadAlterarSenhaLogado = {
	intent: "alterar_senha_logado";
	clienteId: string;
	senhaAtual: string;
	novaSenha: string;
};

type PayloadCliente =
	| PayloadLoginPorEmailESenha
	| PayloadLoginPorId
	| PayloadSalvar
	| PayloadSolicitarRecuperacao
	| PayloadRedefinirSenha
	| PayloadAlterarSenhaLogado;

function respostaJson(body: unknown, status = 200) {
	return Response.json(body, { status });
}

function ehString(valor: unknown): valor is string {
	return typeof valor === "string";
}

function parsearPayload(data: unknown): PayloadCliente | null {
	if (!data || typeof data !== "object") {
		return null;
	}

	const payload = data as Record<string, unknown>;
	const intent = payload.intent;
	if (!ehString(intent)) {
		return null;
	}

	if (
		intent === "login_por_email_senha" &&
		ehString(payload.email) &&
		ehString(payload.senha)
	) {
		return { intent, email: payload.email, senha: payload.senha };
	}

	if (intent === "login_por_id" && ehString(payload.id)) {
		return { intent, id: payload.id };
	}

	if (intent === "solicitar_recuperacao" && ehString(payload.email)) {
		return { intent, email: payload.email };
	}

	if (
		intent === "redefinir_senha" &&
		ehString(payload.email) &&
		ehString(payload.novaSenha)
	) {
		return {
			intent,
			email: payload.email,
			codigo: ehString(payload.codigo) ? payload.codigo : "",
			novaSenha: payload.novaSenha,
			tokenId: ehString(payload.tokenId) ? payload.tokenId : "",
		};
	}

	if (
		intent === "alterar_senha_logado" &&
		ehString(payload.clienteId) &&
		ehString(payload.senhaAtual) &&
		ehString(payload.novaSenha)
	) {
		return {
			intent,
			clienteId: payload.clienteId,
			senhaAtual: payload.senhaAtual,
			novaSenha: payload.novaSenha,
		};
	}

	if (
		intent === "salvar" &&
		ehString(payload.nome) &&
		ehString(payload.email) &&
		ehString(payload.senha) &&
		ehString(payload.cpf) &&
		ehString(payload.cep) &&
		ehString(payload.telefone) &&
		ehString(payload.endereco)
	) {
		return {
			intent,
			nome: payload.nome,
			email: payload.email,
			senha: payload.senha,
			cpf: payload.cpf,
			cep: payload.cep,
			telefone: payload.telefone,
			endereco: payload.endereco,
			observacoes: ehString(payload.observacoes) ? payload.observacoes : "",
		};
	}

	return null;
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

	if (payload.intent === "login_por_id") {
		const cliente = await buscarClientePorId(payload.id);
		if (!cliente) {
			return respostaJson({ cliente: null }, 404);
		}
		return respostaJson({ cliente });
	}

	if (payload.intent === "login_por_email_senha") {
		const cliente = await buscarClientePorEmailESenha(
			payload.email,
			payload.senha,
		);
		if (!cliente) {
			return respostaJson({ cliente: null }, 404);
		}
		return respostaJson({ cliente });
	}

	if (payload.intent === "solicitar_recuperacao") {
		const resultado = await solicitarRecuperacaoSenha(payload.email);
		const appUrl = process.env.APP_URL ?? "http://localhost:5173";
		if (resultado.email && resultado.codigo) {
			const linkRedefinicao = `${appUrl}/redefinir-senha?email=${encodeURIComponent(resultado.email)}&codigo=${encodeURIComponent(resultado.codigo)}&token=${encodeURIComponent(resultado.tokenId ?? "")}`;
			await enviarEmailRecuperacaoSenha({
				para: resultado.email,
				linkRedefinicao,
				codigoRecuperacao: resultado.codigo,
			});
		}
		return respostaJson({ ok: true });
	}

	if (payload.intent === "redefinir_senha") {
		const resultado = await redefinirSenhaComCodigo(
			payload.email,
			payload.codigo,
			payload.novaSenha,
			payload.tokenId,
		);
		if (!resultado.ok) {
			const body: { ok: false; erro: string; motivo?: string } = {
				ok: false,
				erro: "Codigo invalido ou expirado.",
			};
			if (process.env.NODE_ENV !== "production") {
				body.motivo = resultado.motivo;
			}
			return respostaJson(body, 400);
		}
		return respostaJson({ ok: true });
	}

	if (payload.intent === "alterar_senha_logado") {
		const ok = await alterarSenhaDoCliente(
			payload.clienteId,
			payload.senhaAtual,
			payload.novaSenha,
		);
		if (!ok) {
			return respostaJson({ ok: false, erro: "Senha atual invalida." }, 400);
		}
		return respostaJson({ ok: true });
	}

	const cliente = await salvarCliente({
		nome: payload.nome,
		email: payload.email,
		senha: payload.senha,
		cpf: payload.cpf,
		cep: payload.cep,
		telefone: payload.telefone,
		endereco: payload.endereco,
		observacoes: payload.observacoes ?? "",
	});
	if (!cliente) {
		return respostaJson({ erro: "Dados do cliente invalidos." }, 400);
	}

	return respostaJson({ cliente });
}
