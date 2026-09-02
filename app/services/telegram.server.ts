import type { PedidoResumo } from "../models/pedidos.server";

/**
 * Avisos pelo Telegram — o grupo da loja recebe cada pedido novo e cada
 * pagamento confirmado.
 *
 * A Bot API e um POST com o token na URL: sem SDK. O destino e um chat so,
 * configurado por variavel de ambiente (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID).
 */

const API_TELEGRAM = "https://api.telegram.org";

// O cliente nao pode esperar o Telegram para receber o link de pagamento.
const LIMITE_MS = 5_000;

type ResultadoAviso = { ok: true } | { ok: false; erro: string };

type PedidoParaAviso = PedidoResumo & {
	clienteNome?: string;
	clienteTelefone?: string;
	clienteEndereco?: string;
	observacoesCliente?: string;
};

function credenciais() {
	const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
	const chat = process.env.TELEGRAM_CHAT_ID?.trim();
	return token && chat ? { token, chat } : null;
}

export function telegramConfigurado() {
	return credenciais() !== null;
}

/** Escapa o que vai dentro do HTML do Telegram (nomes, observacoes, descricoes). */
function escaparTexto(valor: string) {
	return valor
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function formatarMoeda(valor: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(valor);
}

/**
 * Manda o texto para o grupo. Nunca lanca: o aviso e acessorio, o pedido ja
 * esta no banco e aparece no admin mesmo se o Telegram estiver fora.
 */
export async function enviarTelegram(texto: string): Promise<ResultadoAviso> {
	const config = credenciais();
	if (!config) {
		return { ok: false, erro: "Telegram nao configurado" };
	}

	try {
		const resposta = await fetch(`${API_TELEGRAM}/bot${config.token}/sendMessage`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				chat_id: config.chat,
				text: texto,
				parse_mode: "HTML",
				disable_web_page_preview: true,
			}),
			signal: AbortSignal.timeout(LIMITE_MS),
		});

		if (!resposta.ok) {
			const corpo = await resposta.text().catch(() => "");
			return {
				ok: false,
				erro: `Telegram respondeu ${resposta.status}: ${corpo.slice(0, 200)}`,
			};
		}

		return { ok: true };
	} catch (erro) {
		return {
			ok: false,
			erro: erro instanceof Error ? erro.message : "Falha ao falar com o Telegram",
		};
	}
}

/** Dispara sem segurar quem chamou; falha so vai para o log do servidor. */
export function enviarTelegramEmSegundoPlano(texto: string) {
	if (!telegramConfigurado()) {
		return;
	}

	void enviarTelegram(texto).then((resultado) => {
		if (!resultado.ok) {
			console.error("[telegram] aviso nao enviado:", resultado.erro);
		}
	});
}

function linhasDosItens(pedido: PedidoParaAviso) {
	// Os tres primeiros itens: da para reconhecer a compra sem virar um cupom
	// na tela de bloqueio do celular.
	const amostra = pedido.itens.slice(0, 3);
	const linhas = amostra.map(
		(item) =>
			`• ${item.quantidade}× ${escaparTexto(item.descricao)} (${escaparTexto(item.unidade)})`,
	);

	if (pedido.itens.length > amostra.length) {
		linhas.push(`• +${pedido.itens.length - amostra.length} outros itens`);
	}

	return linhas;
}

function linkDoAdmin() {
	const appUrl = process.env.APP_URL?.trim();
	return appUrl ? `${appUrl.replace(/\/$/, "")}/admin` : "";
}

function linhaDoAdmin() {
	const url = linkDoAdmin();
	return url ? ["", `<a href="${escaparTexto(url)}">Abrir o admin</a>`] : [];
}

function mensagemPedidoNovo(pedido: PedidoParaAviso) {
	const linhas = [
		"🛒 <b>Novo pedido na loja</b>",
		escaparTexto(pedido.clienteNome?.trim() || "Cliente sem nome"),
	];

	if (pedido.clienteTelefone?.trim()) {
		linhas.push(escaparTexto(pedido.clienteTelefone.trim()));
	}
	if (pedido.clienteEndereco?.trim()) {
		linhas.push(escaparTexto(pedido.clienteEndereco.trim()));
	}

	linhas.push("", ...linhasDosItens(pedido), "", `Total <b>${formatarMoeda(pedido.total)}</b>`);

	if (pedido.observacoesCliente?.trim()) {
		linhas.push("", `Obs.: ${escaparTexto(pedido.observacoesCliente.trim())}`);
	}

	linhas.push(
		"",
		pedido.pagamentoLinkUrl
			? "Link de pagamento enviado ao cliente."
			: "⚠️ Sem link de pagamento — frete a calcular.",
		...linhaDoAdmin(),
	);

	return linhas.join("\n");
}

function mensagemPedidoPago(pedido: PedidoParaAviso) {
	const linhas = [
		"✅ <b>Pedido pago</b>",
		escaparTexto(pedido.clienteNome?.trim() || "Cliente sem nome"),
		"",
		...linhasDosItens(pedido),
		"",
		`Total <b>${formatarMoeda(pedido.total)}</b>`,
		...linhaDoAdmin(),
	];

	return linhas.join("\n");
}

/** Avisa o grupo que entrou pedido novo. Nunca segura quem chamou. */
export function avisarPedidoNovo(pedido: PedidoParaAviso) {
	enviarTelegramEmSegundoPlano(mensagemPedidoNovo(pedido));
}

/** Avisa o grupo que a Pagar.me confirmou o pagamento. */
export function avisarPedidoPago(pedido: PedidoParaAviso) {
	enviarTelegramEmSegundoPlano(mensagemPedidoPago(pedido));
}
