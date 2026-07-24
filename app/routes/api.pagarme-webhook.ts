import { timingSafeEqual } from "node:crypto";
import type { Route } from "./+types/api.pagarme-webhook";
import {
	STATUS_PEDIDO,
	type StatusPedido,
	atualizarPedidoPorPagamento,
} from "../models/pedidos.server";

type EventoPagarmeMapeado = {
	statusPedido?: StatusPedido;
	pagamentoStatus: string;
};

function respostaJson(body: unknown, status = 200) {
	return Response.json(body, { status });
}

function compararSeguro(recebido: string, esperado: string) {
	const bufferRecebido = Buffer.from(recebido);
	const bufferEsperado = Buffer.from(esperado);
	if (bufferRecebido.length !== bufferEsperado.length) {
		return false;
	}
	return timingSafeEqual(bufferRecebido, bufferEsperado);
}

function validarBasicAuth(request: Request) {
	const usuario = process.env.PAGARME_WEBHOOK_USER?.trim();
	const senha = process.env.PAGARME_WEBHOOK_PASSWORD ?? "";
	if (!usuario) {
		return null;
	}

	const header = request.headers.get("authorization")?.trim() ?? "";
	if (!/^basic\s+/i.test(header)) {
		return false;
	}

	const credenciaisEsperadas = `${usuario}:${senha}`;
	const credenciaisRecebidas = Buffer.from(
		header.replace(/^basic\s+/i, ""),
		"base64",
	).toString("utf8");
	return compararSeguro(credenciaisRecebidas, credenciaisEsperadas);
}

function validarTokenCustomizado(request: Request) {
	const tokenConfigurado = process.env.PAGARME_WEBHOOK_TOKEN?.trim();
	if (!tokenConfigurado) {
		return null;
	}

	const tokenRecebido = request.headers.get("x-webhook-token")?.trim() ?? "";
	return compararSeguro(tokenRecebido, tokenConfigurado);
}

function validarTokenDoWebhook(request: Request) {
	// Pagar.me v5 autentica webhooks via Basic Auth (usuario/senha configurados no painel).
	// Suporta tambem um header customizado opcional (PAGARME_WEBHOOK_TOKEN).
	// Falha fechado: se nenhum segredo estiver configurado, rejeita a requisicao.
	const resultadoBasic = validarBasicAuth(request);
	if (resultadoBasic !== null) {
		return resultadoBasic;
	}

	const resultadoToken = validarTokenCustomizado(request);
	if (resultadoToken !== null) {
		return resultadoToken;
	}

	return false;
}

function parsearPayloadWebhook(data: unknown) {
	if (!data || typeof data !== "object") {
		return null;
	}

	return data as Record<string, unknown>;
}

function extrairTipoDoEvento(payload: Record<string, unknown>) {
	const candidatos = [payload.type, payload.event, payload.event_type];
	for (const candidato of candidatos) {
		if (typeof candidato === "string" && candidato.trim()) {
			return candidato.trim().toLowerCase();
		}
	}

	return "";
}

function mapearEventoPagarme(tipoEvento: string): EventoPagarmeMapeado | null {
	// Eventos conforme a API v5 da Pagar.me (notacao com ponto).
	switch (tipoEvento) {
		case "order.paid":
		case "charge.paid":
			return {
				statusPedido: STATUS_PEDIDO.EM_SEPARACAO,
				pagamentoStatus: "PAID",
			};
		case "order.payment_failed":
		case "charge.payment_failed":
			return {
				statusPedido: STATUS_PEDIDO.AGUARDANDO_CONFIRMACAO,
				pagamentoStatus: "FAILED",
			};
		case "charge.pending":
			return {
				pagamentoStatus: "PENDING",
			};
		case "charge.refunded":
			return {
				statusPedido: STATUS_PEDIDO.CANCELADO,
				pagamentoStatus: "REFUNDED",
			};
		case "charge.chargedback":
			return {
				statusPedido: STATUS_PEDIDO.CANCELADO,
				pagamentoStatus: "CHARGEDBACK",
			};
		case "order.canceled":
			return {
				statusPedido: STATUS_PEDIDO.CANCELADO,
				pagamentoStatus: "CANCELED",
			};
		default:
			return null;
	}
}

function extrairIdDireto(valor: unknown) {
	if (typeof valor !== "string") {
		return "";
	}

	const id = valor.trim();
	return /^pl_/i.test(id) ? id : "";
}

function buscarIdLinkPagamentoRecursivo(
	valor: unknown,
	profundidade = 0,
): string {
	if (profundidade > 5 || valor === null || valor === undefined) {
		return "";
	}

	const idDireto = extrairIdDireto(valor);
	if (idDireto) {
		return idDireto;
	}

	if (Array.isArray(valor)) {
		for (const item of valor) {
			const id = buscarIdLinkPagamentoRecursivo(item, profundidade + 1);
			if (id) {
				return id;
			}
		}
		return "";
	}

	if (typeof valor === "object") {
		const objeto = valor as Record<string, unknown>;
		if (objeto.payment_link && typeof objeto.payment_link === "object") {
			const idNoPaymentLink = extrairIdDireto(
				(objeto.payment_link as Record<string, unknown>).id,
			);
			if (idNoPaymentLink) {
				return idNoPaymentLink;
			}
		}

		for (const item of Object.values(objeto)) {
			const id = buscarIdLinkPagamentoRecursivo(item, profundidade + 1);
			if (id) {
				return id;
			}
		}
	}

	return "";
}

function extrairPaymentLinkId(payload: Record<string, unknown>) {
	const candidatos = [payload.data, payload, payload.payload];
	for (const candidato of candidatos) {
		const id = buscarIdLinkPagamentoRecursivo(candidato);
		if (id) {
			return id;
		}
	}

	return "";
}

export async function action({ request }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return respostaJson({ erro: "Metodo nao permitido." }, 405);
	}

	if (!validarTokenDoWebhook(request)) {
		return respostaJson({ erro: "Webhook nao autorizado." }, 401);
	}

	let data: unknown;
	try {
		data = await request.json();
	} catch {
		return respostaJson({ erro: "Payload invalido." }, 400);
	}

	const payload = parsearPayloadWebhook(data);
	if (!payload) {
		return respostaJson({ erro: "Payload invalido." }, 400);
	}

	const tipoEvento = extrairTipoDoEvento(payload);
	const eventoMapeado = mapearEventoPagarme(tipoEvento);
	if (!eventoMapeado) {
		return respostaJson(
			{ ok: true, ignorado: true, motivo: "evento_nao_mapeado", tipoEvento },
			202,
		);
	}

	const paymentLinkId = extrairPaymentLinkId(payload);
	if (!paymentLinkId) {
		return respostaJson(
			{
				ok: true,
				ignorado: true,
				motivo: "payment_link_id_nao_encontrado",
				tipoEvento,
			},
			202,
		);
	}

	const pedido = await atualizarPedidoPorPagamento({
		pagamentoLinkId: paymentLinkId,
		pagamentoStatus: eventoMapeado.pagamentoStatus,
		statusPedido: eventoMapeado.statusPedido,
	});
	if (!pedido) {
		return respostaJson(
			{
				ok: true,
				ignorado: true,
				motivo: "pedido_nao_encontrado_para_payment_link",
				tipoEvento,
				paymentLinkId,
			},
			202,
		);
	}

	return respostaJson({
		ok: true,
		tipoEvento,
		paymentLinkId,
		pedidoId: pedido.id,
		statusPedido: pedido.status,
		pagamentoStatus: pedido.pagamentoStatus,
	});
}
