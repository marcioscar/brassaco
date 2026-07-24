import { db } from "../db.server";

export const STATUS_PEDIDO = {
	AGUARDANDO_CONFIRMACAO: "AGUARDANDO_CONFIRMACAO",
	EM_SEPARACAO: "EM_SEPARACAO",
	EM_ROTA: "EM_ROTA",
	ENTREGUE: "ENTREGUE",
	CANCELADO: "CANCELADO",
} as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[keyof typeof STATUS_PEDIDO];

export type ItemPedidoInput = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	quantidade: number;
};

export type CriarPedidoInput = {
	clienteId: string;
	clienteNome: string;
	clienteEmail: string;
	clienteTelefone: string;
	clienteEndereco: string;
	clienteDocumento: string;
	observacoesCliente: string;
	itens: ItemPedidoInput[];
	total: number;
	pagamento?: DadosPagamentoInput;
};

export type DadosPagamentoInput = {
	provedor: string;
	status: string;
	linkId: string;
	linkUrl: string;
};

export type PedidoResumo = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	itens: ItemPedidoInput[];
	pagamentoStatus?: string;
	pagamentoLinkUrl?: string;
};

export type PedidoResumoAdmin = PedidoResumo & {
	clienteNome?: string;
	clienteEmail?: string;
	clienteTelefone?: string;
	clienteEndereco?: string;
	clienteDocumento?: string;
	observacoesCliente?: string;
};

type AtualizarPagamentoPedidoInput = {
	pagamentoLinkId: string;
	statusPedido?: StatusPedido;
	pagamentoStatus: string;
};

function ehItemPedidoValido(item: ItemPedidoInput) {
	return Boolean(
		item.id &&
			item.descricao.trim() &&
			item.unidade.trim() &&
			item.quantidade > 0 &&
			item.preco >= 0,
	);
}

function paraNumero(valor: unknown) {
	if (typeof valor === "number" && Number.isFinite(valor)) {
		return valor;
	}
	if (typeof valor === "string") {
		const numero = Number(valor.replace(",", "."));
		if (Number.isFinite(numero)) {
			return numero;
		}
	}
	if (valor && typeof valor === "object") {
		const objeto = valor as Record<string, unknown>;
		const candidatoBson =
			objeto.$numberInt ??
			objeto.$numberLong ??
			objeto.$numberDouble ??
			objeto.$numberDecimal;
		if (typeof candidatoBson === "string") {
			const numero = Number(candidatoBson.replace(",", "."));
			if (Number.isFinite(numero)) {
				return numero;
			}
		}
	}
	return null;
}

function paraTexto(valor: unknown) {
	return typeof valor === "string" ? valor.trim() : "";
}

function parseJsonSeguro(valor: string) {
	try {
		return JSON.parse(valor) as unknown;
	} catch {
		return null;
	}
}

function ehObjetoComChavesNumericas(valor: Record<string, unknown>) {
	const chaves = Object.keys(valor);
	return chaves.length > 0 && chaves.every((chave) => /^\d+$/.test(chave));
}

function extrairArrayDeItens(valor: unknown) {
	if (Array.isArray(valor)) {
		return valor;
	}

	if (typeof valor === "string") {
		const valorParseado = parseJsonSeguro(valor);
		if (valorParseado) {
			return extrairArrayDeItens(valorParseado);
		}
		return [];
	}

	if (valor && typeof valor === "object") {
		const objeto = valor as Record<string, unknown>;
		if (Array.isArray(objeto.itens)) {
			return objeto.itens;
		}
		if (objeto.itens) {
			return extrairArrayDeItens(objeto.itens);
		}
		if (objeto.data) {
			return extrairArrayDeItens(objeto.data);
		}
		if (ehObjetoComChavesNumericas(objeto)) {
			return Object.values(objeto);
		}
	}

	return [];
}

function normalizarItensDoPedido(valor: unknown): ItemPedidoInput[] {
	const itensBrutos = extrairArrayDeItens(valor);

	return itensBrutos
		.map((item, indice) => {
			if (typeof item === "string") {
				const itemParseado = parseJsonSeguro(item);
				if (itemParseado && typeof itemParseado === "object") {
					item = itemParseado;
				}
			}

			if (!item || typeof item !== "object") {
				return null;
			}

			const candidato = item as Record<string, unknown>;
			const produto =
				candidato.produto && typeof candidato.produto === "object"
					? (candidato.produto as Record<string, unknown>)
					: null;
			const descricao = paraTexto(
				candidato.descricao ??
					candidato.description ??
					candidato.item ??
					candidato.nome ??
					candidato.produtoDescricao ??
					produto?.descricao ??
					produto?.nome,
			);
			const unidade = paraTexto(candidato.unidade ?? candidato.unid) || "UN";
			const quantidade = paraNumero(
				candidato.quantidade ??
					candidato.qtd ??
					candidato.qtde ??
					candidato.quant ??
					produto?.quantidade,
			);
			const preco = paraNumero(
				candidato.preco ??
					candidato.valorUnitario ??
					candidato.valor ??
					candidato.price ??
					candidato.unitPrice ??
					produto?.preco,
			);
			const codigo = paraNumero(candidato.codigo ?? produto?.codigo) ?? 0;
			const id =
				paraTexto(candidato.id) ||
				`${codigo}-${descricao || "item"}-${indice + 1}`;

			if (!descricao || !quantidade || quantidade <= 0 || preco === null || preco < 0) {
				return null;
			}

			return {
				id,
				codigo,
				descricao,
				unidade,
				preco,
				quantidade,
			} satisfies ItemPedidoInput;
		})
		.filter((item): item is ItemPedidoInput => item !== null);
}

function normalizarInput(input: CriarPedidoInput) {
	const clienteId = input.clienteId.trim();
	const clienteNome = input.clienteNome.trim();
	const clienteEmail = input.clienteEmail.trim();
	const clienteTelefone = input.clienteTelefone.trim();
	const clienteEndereco = input.clienteEndereco.trim();
	const clienteDocumento = input.clienteDocumento.trim();
	const observacoesCliente = input.observacoesCliente.trim();
	const itens = input.itens.filter(ehItemPedidoValido);
	const total = Number(input.total);
	const pagamento = normalizarDadosPagamento(input.pagamento);

	if (
		!clienteId ||
		!clienteNome ||
		!clienteEmail ||
		!clienteTelefone ||
		itens.length === 0 ||
		!Number.isFinite(total) ||
		total < 0
	) {
		return null;
	}

	return {
		clienteId,
		clienteNome,
		clienteEmail,
		clienteTelefone,
		clienteEndereco,
		clienteDocumento,
		observacoesCliente,
		itens,
		total,
		pagamento,
	};
}

function normalizarDadosPagamento(dados?: DadosPagamentoInput) {
	if (!dados) {
		return null;
	}

	const provedor = dados.provedor.trim();
	const status = dados.status.trim();
	const linkId = dados.linkId.trim();
	const linkUrl = dados.linkUrl.trim();
	if (!provedor || !status || !linkId || !linkUrl) {
		return null;
	}

	return { provedor, status, linkId, linkUrl };
}

function paraPedidoResumo(pedido: {
	id: string;
	status: string;
	total: number;
	createdAt: Date;
	itens?: unknown;
	pagamentoStatus?: string | null;
	pagamentoLinkUrl?: string | null;
}): PedidoResumo {
	return {
		id: pedido.id,
		status: pedido.status,
		total: pedido.total,
		createdAt: pedido.createdAt.toISOString(),
		itens: normalizarItensDoPedido(pedido.itens),
		pagamentoStatus: pedido.pagamentoStatus ?? undefined,
		pagamentoLinkUrl: pedido.pagamentoLinkUrl ?? undefined,
	};
}

function paraPedidoResumoAdmin(pedido: {
	id: string;
	status: string;
	total: number;
	createdAt: Date;
	itens?: unknown;
	pagamentoStatus?: string | null;
	pagamentoLinkUrl?: string | null;
	clienteNome?: string | null;
	clienteEmail?: string | null;
	clienteTelefone?: string | null;
	clienteEndereco?: string | null;
	clienteDocumento?: string | null;
	observacoesCliente?: string | null;
}): PedidoResumoAdmin {
	return {
		...paraPedidoResumo(pedido),
		clienteNome: pedido.clienteNome ?? undefined,
		clienteEmail: pedido.clienteEmail ?? undefined,
		clienteTelefone: pedido.clienteTelefone ?? undefined,
		clienteEndereco: pedido.clienteEndereco ?? undefined,
		clienteDocumento: pedido.clienteDocumento ?? undefined,
		observacoesCliente: pedido.observacoesCliente?.trim() || undefined,
	};
}

export async function criarPedido(input: CriarPedidoInput) {
	const dados = normalizarInput(input);
	if (!dados) {
		return null;
	}

	const agora = new Date();
	const pedido = await db.pedidos.create({
		data: {
			clienteId: dados.clienteId,
			clienteNome: dados.clienteNome,
			clienteEmail: dados.clienteEmail,
			clienteTelefone: dados.clienteTelefone,
			clienteEndereco: dados.clienteEndereco || null,
			clienteDocumento: dados.clienteDocumento || null,
			status: STATUS_PEDIDO.AGUARDANDO_CONFIRMACAO,
			pagamentoProvedor: dados.pagamento?.provedor ?? null,
			pagamentoStatus: dados.pagamento?.status ?? null,
			pagamentoLinkId: dados.pagamento?.linkId ?? null,
			pagamentoLinkUrl: dados.pagamento?.linkUrl ?? null,
			pagamentoAtualizadoEm: dados.pagamento ? agora : null,
			itens: dados.itens,
			total: dados.total,
			observacoesCliente: dados.observacoesCliente || null,
			createdAt: agora,
			updatedAt: agora,
		},
		select: {
			id: true,
			status: true,
			total: true,
			createdAt: true,
			itens: true,
			pagamentoStatus: true,
			pagamentoLinkUrl: true,
		},
	});

	return paraPedidoResumo(pedido);
}

export async function listarPedidosPorCliente(clienteId: string, limite = 8) {
	const id = clienteId.trim();
	if (!id) {
		return [];
	}

	const pedidos = await db.pedidos.findMany({
		where: { clienteId: id },
		orderBy: { createdAt: "desc" },
		take: limite,
		select: {
			id: true,
			status: true,
			total: true,
			createdAt: true,
			itens: true,
			pagamentoStatus: true,
			pagamentoLinkUrl: true,
		},
	});

	return pedidos.map(paraPedidoResumo);
}

export async function listarTodosPedidos(limite = 60): Promise<PedidoResumoAdmin[]> {
	const pedidos = await db.pedidos.findMany({
		orderBy: { createdAt: "desc" },
		take: limite,
		select: {
			id: true,
			status: true,
			total: true,
			createdAt: true,
			itens: true,
			pagamentoStatus: true,
			pagamentoLinkUrl: true,
			clienteNome: true,
			clienteEmail: true,
			clienteTelefone: true,
			clienteEndereco: true,
			clienteDocumento: true,
			observacoesCliente: true,
		},
	});

	return pedidos.map(paraPedidoResumoAdmin);
}

function ehStatusValido(status: string): status is StatusPedido {
	return Object.values(STATUS_PEDIDO).includes(status as StatusPedido);
}

export async function atualizarStatusDoPedido(pedidoId: string, status: string) {
	const id = pedidoId.trim();
	if (!id || !ehStatusValido(status)) {
		return null;
	}

	const pedidoAtualizado = await db.pedidos.update({
		where: { id },
		data: {
			status,
			updatedAt: new Date(),
		},
		select: {
			id: true,
			status: true,
			total: true,
			createdAt: true,
		},
	});

	return paraPedidoResumo(pedidoAtualizado);
}

function normalizarAtualizacaoPagamento(input: AtualizarPagamentoPedidoInput) {
	const pagamentoLinkId = input.pagamentoLinkId.trim();
	const pagamentoStatus = input.pagamentoStatus.trim();
	if (!pagamentoLinkId || !pagamentoStatus) {
		return null;
	}

	return {
		pagamentoLinkId,
		statusPedido: input.statusPedido,
		pagamentoStatus,
	};
}

export async function atualizarPedidoPorPagamento(input: AtualizarPagamentoPedidoInput) {
	const dados = normalizarAtualizacaoPagamento(input);
	if (!dados) {
		return null;
	}

	const pedido = await db.pedidos.findFirst({
		where: { pagamentoLinkId: dados.pagamentoLinkId },
		orderBy: { createdAt: "desc" },
		select: { id: true },
	});
	if (!pedido) {
		return null;
	}

	const agora = new Date();
	const pedidoAtualizado = await db.pedidos.update({
		where: { id: pedido.id },
		data: {
			pagamentoStatus: dados.pagamentoStatus,
			pagamentoAtualizadoEm: agora,
			status: dados.statusPedido ?? undefined,
			updatedAt: agora,
		},
		select: {
			id: true,
			status: true,
			total: true,
			createdAt: true,
			itens: true,
			pagamentoStatus: true,
			pagamentoLinkUrl: true,
		},
	});

	return paraPedidoResumo(pedidoAtualizado);
}
