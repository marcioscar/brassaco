import type { Route } from "./+types/api.produto";
import {
	atualizarProdutoAdmin,
	criarProdutoAdmin,
	listarOpcoesDeGrupoAdmin,
	listarProdutosAdminComAtivo,
	sugerirProximoCodigoAdmin,
} from "../models/produtos.server";
import { validarCredenciaisAdmin } from "../services/admin-auth.server";

type PayloadListarProdutosAdmin = {
	intent: "admin_listar_produtos";
	email: string;
	senha: string;
};

type PayloadCriarProdutoAdmin = {
	intent: "admin_criar_produto";
	email: string;
	senha: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	grupo: number;
	nomeGrupo: string;
	fornecedor?: string;
	ativo: boolean;
};

type PayloadAtualizarProdutoAdmin = {
	intent: "admin_atualizar_produto";
	email: string;
	senha: string;
	produtoId: string;
	preco: number;
	ativo: boolean;
};

type PayloadProdutoAdmin =
	| PayloadListarProdutosAdmin
	| PayloadCriarProdutoAdmin
	| PayloadAtualizarProdutoAdmin;

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
		intent === "admin_criar_produto" &&
		ehString(payload.email) &&
		ehString(payload.senha) &&
		ehNumero(payload.codigo) &&
		ehString(payload.descricao) &&
		ehString(payload.unidade) &&
		ehNumero(payload.preco) &&
		ehNumero(payload.grupo) &&
		ehString(payload.nomeGrupo) &&
		ehBoolean(payload.ativo)
	) {
		return {
			intent,
			email: payload.email,
			senha: payload.senha,
			codigo: payload.codigo,
			descricao: payload.descricao,
			unidade: payload.unidade,
			preco: payload.preco,
			grupo: payload.grupo,
			nomeGrupo: payload.nomeGrupo,
			fornecedor: ehString(payload.fornecedor) ? payload.fornecedor : undefined,
			ativo: payload.ativo,
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
		const [produtos, grupos, proximoCodigo] = await Promise.all([
			listarProdutosAdminComAtivo(),
			listarOpcoesDeGrupoAdmin(),
			sugerirProximoCodigoAdmin(),
		]);
		return respostaJson({ produtos, grupos, proximoCodigo });
	}

	if (payload.intent === "admin_criar_produto") {
		const resultado = await criarProdutoAdmin({
			codigo: payload.codigo,
			descricao: payload.descricao,
			unidade: payload.unidade,
			preco: payload.preco,
			grupo: payload.grupo,
			nomeGrupo: payload.nomeGrupo,
			fornecedor: payload.fornecedor,
			ativo: payload.ativo,
		});
		if (!resultado.ok) {
			return respostaJson({ erro: resultado.erro }, 400);
		}

		return respostaJson({ produto: resultado.produto });
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
