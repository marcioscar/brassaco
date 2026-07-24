import type { Route } from "./+types/api.produto";
import {
	atualizarProdutoAdmin,
	listarProdutosAdminComAtivo,
} from "../models/produtos.server";
import { validarCredenciaisAdmin } from "../services/admin-auth.server";

type PayloadListarProdutosAdmin = {
	intent: "admin_listar_produtos";
	email: string;
	senha: string;
};

type PayloadAtualizarProdutoAdmin = {
	intent: "admin_atualizar_produto";
	email: string;
	senha: string;
	produtoId: string;
	preco: number;
	ativo: boolean;
};

type PayloadProdutoAdmin = PayloadListarProdutosAdmin | PayloadAtualizarProdutoAdmin;

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

function parsearPayload(data: unknown): PayloadProdutoAdmin | null {
	if (!data || typeof data !== "object") {
		return null;
	}

	const payload = data as Record<string, unknown>;
	const intent = payload.intent;
	if (!ehString(intent)) {
		return null;
	}

	if (
		intent === "admin_listar_produtos" &&
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
		intent === "admin_atualizar_produto" &&
		ehString(payload.email) &&
		ehString(payload.senha) &&
		ehString(payload.produtoId) &&
		ehNumero(payload.preco) &&
		ehBoolean(payload.ativo)
	) {
		return {
			intent,
			email: payload.email,
			senha: payload.senha,
			produtoId: payload.produtoId,
			preco: payload.preco,
			ativo: payload.ativo,
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

	const autorizado = validarCredenciaisAdmin(payload.email, payload.senha);
	if (!autorizado) {
		return respostaJson({ erro: "Nao autorizado." }, 401);
	}

	if (payload.intent === "admin_listar_produtos") {
		const produtos = await listarProdutosAdminComAtivo();
		return respostaJson({ produtos });
	}

	const produto = await atualizarProdutoAdmin({
		produtoId: payload.produtoId,
		preco: payload.preco,
		ativo: payload.ativo,
	});
	if (!produto) {
		return respostaJson({ erro: "Nao foi possivel atualizar o produto." }, 400);
	}

	return respostaJson({ produto });
}
