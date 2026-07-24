import { db } from "../db.server";
import type { Prisma } from "@prisma/client";

async function normalizarCamposInteiros() {
	for (const campo of ["codigo", "grupo"] as const) {
		await db.$runCommandRaw({
			update: "produtos_preco",
			updates: [
				{
					q: { [campo]: { $type: "string" } },
					u: [
						{
							$set: {
								[campo]: {
									$convert: {
										input: `$${campo}`,
										to: "int",
										onError: 0,
										onNull: 0,
									},
								},
							},
						},
					],
					multi: true,
				},
			],
		});
	}
}

async function comNormalizacaoAutomatica<T>(consulta: () => Promise<T>): Promise<T> {
	try {
		return await consulta();
	} catch (erro) {
		const mensagem = String((erro as Error).message ?? "");
		if (mensagem.includes("Failed to convert") && mensagem.includes("to 'Int'")) {
			await normalizarCamposInteiros();
			return await consulta();
		}
		throw erro;
	}
}

const GRUPOS_POR_CODIGO: Record<number, string> = {
	1: "Sacos",
	2: "Sacolas",
	4: "Copos",
	5: "Pratos",
	6: "Potes",
	7: "Talheres",
	8: "Isopor",
	9: "Guardanapos",
	10: "Papel toalha",
	11: "Saco e sacola de papel",
	12: "Bobinas",
	13: "Dispenser e Suportes",
	14: "Guarrafas",
	16: "Canudos",
	18: "Aluminio",
	20: "Alcool e sabonete liquido",
	21: "Caixa de papelao",
	22: "Fitas",
	23: "LUVAS/MASCARAS/TOUCA",
	24: "Rafia",
	25: "Saco para Lixo",
	26: "Saco adesivado",
	27: "Saco Zip",
	28: "PVC",
	30: "Papel Higienico",
	31: "embalagem Doces, bolos",
	32: "Sacos PP",
};

const AGRUPAMENTO_CATEGORIAS: Array<{ categoria: string; grupo: string }> = [
	{ categoria: "Seladoras", grupo: "Caixas e Fechamento" },
	{ categoria: "Caixa de papelão", grupo: "Caixas e Fechamento" },
	{ categoria: "Fitas", grupo: "Caixas e Fechamento" },
	{ categoria: "Copos", grupo: "Descartáveis e Festa" },
	{ categoria: "Pratos", grupo: "Descartáveis e Festa" },
	{ categoria: "Talheres", grupo: "Descartáveis e Festa" },
	{ categoria: "Guardanapos", grupo: "Descartáveis e Festa" },
	{ categoria: "Canudos", grupo: "Descartáveis e Festa" },
	{ categoria: "Guarrafas", grupo: "Descartáveis e Festa" },
	{ categoria: "Papel toalha", grupo: "Higiene e Proteção" },
	{ categoria: "LUVAS/MASCARAS/TOUCA", grupo: "Higiene e Proteção" },
	{ categoria: "Papel Higiênico", grupo: "Higiene e Proteção" },
	{ categoria: "Alcool e sabonete liquido", grupo: "Higiene e Proteção" },
	{ categoria: "Dispenser e Suportes", grupo: "Higiene e Proteção" },
	{ categoria: "Isopor", grupo: "Isopor" },
	{ categoria: "Outros", grupo: "Outros" },
	{ categoria: "Potes", grupo: "Potes e Recipientes" },
	{ categoria: "embalagem Doces, bolos", grupo: "Potes e Recipientes" },
	{ categoria: "Aluminio", grupo: "Potes e Recipientes" },
	{ categoria: "PVC", grupo: "Potes e Recipientes" },
	{ categoria: "Sacolas", grupo: "Sacolas" },
	{ categoria: "Saco e sacola de papel", grupo: "Sacolas" },
	{ categoria: "Rafia", grupo: "Sacolas" },
	{ categoria: "Sacos", grupo: "Sacos" },
	{ categoria: "Saco para Lixo", grupo: "Sacos" },
	{ categoria: "Bobinas", grupo: "Sacos" },
	{ categoria: "Saco adesivado", grupo: "Sacos" },
	{ categoria: "Saco Zip", grupo: "Sacos" },
	{ categoria: "Sacos PP", grupo: "Sacos" },
	{ categoria: "Saco Nylon", grupo: "Sacos" },
];

export function listarProdutos() {
	return comNormalizacaoAutomatica(() =>
		db.produtos_preco.findMany({
			where: {
				OR: [{ ativo: true }, { ativo: { isSet: false } }],
			},
			orderBy: { descricao: "asc" },
		}),
	);
}

type Produto = Awaited<ReturnType<typeof listarProdutos>>[number];
type ProdutoAdmin = Awaited<ReturnType<typeof listarProdutosAdmin>>[number];

type GrupoResumo = {
	codigo: number;
	nome: string;
	totalProdutos: number;
	codigosOriginais: number[];
	categoriasOriginais: string[];
};

export type FaixaPrecoCatalogo = {
	id: string;
	min: number;
	max: number;
};

function obterNomeDoGrupo(codigo: number) {
	return GRUPOS_POR_CODIGO[codigo] ?? `Grupo ${codigo}`;
}

function obterNomeDoGrupoDoProduto(produto: Produto) {
	const nomeDoProduto = produto.nomeGrupo?.trim();
	if (nomeDoProduto) {
		return nomeDoProduto;
	}

	return obterNomeDoGrupo(produto.grupo);
}

function normalizarNomeDoGrupo(nome: string) {
	return nome
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function criarMapaCategoriaParaGrupo() {
	return new Map(
		AGRUPAMENTO_CATEGORIAS.map((item) => [
			normalizarNomeDoGrupo(item.categoria),
			item.grupo,
		]),
	);
}

const CATEGORIA_PARA_GRUPO = criarMapaCategoriaParaGrupo();

function obterCategoriaDoProduto(produto: Produto) {
	return obterNomeDoGrupoDoProduto(produto);
}

function obterNomeDoCardDoProduto(produto: Produto) {
	const categoria = obterCategoriaDoProduto(produto);
	const grupoMapeado = CATEGORIA_PARA_GRUPO.get(normalizarNomeDoGrupo(categoria));

	return grupoMapeado ?? categoria;
}

export function listarGruposDeProdutos(produtos: Produto[]): GrupoResumo[] {
	const acumulador = new Map<string, GrupoResumo>();

	for (const produto of produtos) {
		const nomeDoGrupo = obterNomeDoCardDoProduto(produto);
		const categoriaDoProduto = obterCategoriaDoProduto(produto);
		const chaveDoGrupo = normalizarNomeDoGrupo(nomeDoGrupo);
		const grupoExistente = acumulador.get(chaveDoGrupo);

		if (grupoExistente) {
			grupoExistente.totalProdutos += 1;
			if (!grupoExistente.codigosOriginais.includes(produto.grupo)) {
				grupoExistente.codigosOriginais.push(produto.grupo);
			}
			if (!grupoExistente.categoriasOriginais.includes(categoriaDoProduto)) {
				grupoExistente.categoriasOriginais.push(categoriaDoProduto);
			}
			continue;
		}

		acumulador.set(chaveDoGrupo, {
			codigo: acumulador.size + 1,
			nome: nomeDoGrupo,
			totalProdutos: 1,
			codigosOriginais: [produto.grupo],
			categoriasOriginais: [categoriaDoProduto],
		});
	}

	return [...acumulador.values()]
		.map((grupo) => ({
			...grupo,
			codigosOriginais: grupo.codigosOriginais.sort((a, b) => a - b),
			categoriasOriginais: grupo.categoriasOriginais.sort((a, b) =>
				a.localeCompare(b, "pt-BR"),
			),
		}))
		.sort((a, b) => a.nome.localeCompare(b.nome));
}

type ListarProdutosCatalogoInput = {
	grupoSelecionado: GrupoResumo | null;
	busca: string;
	tiposSelecionados: string[];
	marcasSelecionadas: string[];
	faixasSelecionadas: FaixaPrecoCatalogo[];
	pagina: number;
	tamanhoPagina: number;
};

function filtrarListaTexto(valores: string[]) {
	return valores.map((valor) => valor.trim()).filter(Boolean);
}

function extrairCodigosDeTipo(tipos: string[]) {
	return tipos
		.map((tipo) => {
			const match = tipo.match(/^Grupo\s+(\d+)$/i);
			if (!match) {
				return null;
			}
			const codigo = Number(match[1]);
			return Number.isFinite(codigo) ? codigo : null;
		})
		.filter((codigo): codigo is number => codigo !== null);
}

function construirFiltroStatusAtivo(): Prisma.produtos_precoWhereInput {
	return {
		OR: [{ ativo: true }, { ativo: { isSet: false } }],
	};
}

function construirFiltroGrupo(
	grupoSelecionado: GrupoResumo | null,
): Prisma.produtos_precoWhereInput | null {
	if (!grupoSelecionado) {
		return null;
	}

	const codigos = grupoSelecionado.codigosOriginais ?? [];
	const categorias = filtrarListaTexto(grupoSelecionado.categoriasOriginais ?? []);
	if (codigos.length === 0 && categorias.length === 0) {
		return null;
	}

	const condicoes: Prisma.produtos_precoWhereInput[] = [];
	if (codigos.length > 0) {
		condicoes.push({ grupo: { in: codigos } });
	}
	if (categorias.length > 0) {
		condicoes.push({ nomeGrupo: { in: categorias } });
	}

	return condicoes.length > 0 ? { OR: condicoes } : null;
}

function construirFiltroBusca(busca: string): Prisma.produtos_precoWhereInput | null {
	const termo = busca.trim();
	if (!termo) {
		return null;
	}

	return {
		descricao: {
			contains: termo,
			mode: "insensitive",
		},
	};
}

function construirFiltroTipo(tiposSelecionados: string[]): Prisma.produtos_precoWhereInput | null {
	const tipos = filtrarListaTexto(tiposSelecionados);
	if (tipos.length === 0) {
		return null;
	}

	const codigosTipo = extrairCodigosDeTipo(tipos);
	const nomesTipo = tipos.filter((tipo) => !/^Grupo\s+\d+$/i.test(tipo));
	const condicoes: Prisma.produtos_precoWhereInput[] = [];
	if (nomesTipo.length > 0) {
		condicoes.push({ nomeGrupo: { in: nomesTipo } });
	}
	if (codigosTipo.length > 0) {
		condicoes.push({ grupo: { in: codigosTipo } });
	}

	return condicoes.length > 0 ? { OR: condicoes } : null;
}

function construirFiltroMarca(
	marcasSelecionadas: string[],
): Prisma.produtos_precoWhereInput | null {
	const marcas = filtrarListaTexto(marcasSelecionadas);
	if (marcas.length === 0) {
		return null;
	}

	return {
		fornecedor: { in: marcas },
	};
}

function construirFiltroFaixaPreco(
	faixasSelecionadas: FaixaPrecoCatalogo[],
): Prisma.produtos_precoWhereInput | null {
	if (faixasSelecionadas.length === 0) {
		return null;
	}

	const condicoes = faixasSelecionadas.map((faixa) => ({
		preco: { gte: faixa.min, lte: faixa.max },
	}));

	return { OR: condicoes };
}

function construirWhereCatalogo({
	grupoSelecionado,
	busca,
	tiposSelecionados,
	marcasSelecionadas,
	faixasSelecionadas,
}: Omit<ListarProdutosCatalogoInput, "pagina" | "tamanhoPagina">): Prisma.produtos_precoWhereInput {
	const filtros: Prisma.produtos_precoWhereInput[] = [construirFiltroStatusAtivo()];

	const filtroGrupo = construirFiltroGrupo(grupoSelecionado);
	const filtroBusca = construirFiltroBusca(busca);
	const filtroTipo = construirFiltroTipo(tiposSelecionados);
	const filtroMarca = construirFiltroMarca(marcasSelecionadas);
	const filtroFaixa = construirFiltroFaixaPreco(faixasSelecionadas);

	if (filtroGrupo) filtros.push(filtroGrupo);
	if (filtroBusca) filtros.push(filtroBusca);
	if (filtroTipo) filtros.push(filtroTipo);
	if (filtroMarca) filtros.push(filtroMarca);
	if (filtroFaixa) filtros.push(filtroFaixa);

	return { AND: filtros };
}

export async function listarProdutosCatalogo(input: ListarProdutosCatalogoInput) {
	const pagina = Math.max(1, input.pagina);
	const tamanhoPagina = Math.max(1, input.tamanhoPagina);
	const where = construirWhereCatalogo(input);

	const queryArgs = {
		where,
		orderBy: [{ descricao: "asc" as const }, { codigo: "asc" as const }],
		skip: (pagina - 1) * tamanhoPagina,
		take: tamanhoPagina,
		select: {
			id: true,
			codigo: true,
			descricao: true,
			preco: true,
			unidade: true,
			fornecedor: true,
			nomeGrupo: true,
			ativo: true,
			grupo: true,
		},
	};

	const [totalProdutos, produtos] = await comNormalizacaoAutomatica(() =>
		Promise.all([
			db.produtos_preco.count({ where }),
			db.produtos_preco.findMany(queryArgs),
		]),
	);

	return { produtos, totalProdutos };
}

export function listarProdutosAdmin() {
	return comNormalizacaoAutomatica(() =>
		db.produtos_preco.findMany({
			orderBy: { descricao: "asc" },
			select: {
				id: true,
				codigo: true,
				descricao: true,
				unidade: true,
				preco: true,
				grupo: true,
				nomeGrupo: true,
				ativo: true,
			},
		}),
	);
}

function normalizarPreco(valor: number) {
	if (!Number.isFinite(valor) || valor < 0) {
		return null;
	}
	return Number(valor.toFixed(2));
}

function mapearProdutoAdmin(produto: ProdutoAdmin) {
	return {
		...produto,
		ativo: produto.ativo ?? true,
	};
}

export async function listarProdutosAdminComAtivo() {
	await db.produtos_preco.updateMany({
		where: { ativo: { isSet: false } },
		data: { ativo: true },
	});

	const produtos = await listarProdutosAdmin();
	return produtos.map(mapearProdutoAdmin);
}

export async function atualizarProdutoAdmin(input: {
	produtoId: string;
	preco: number;
	ativo: boolean;
}) {
	const produtoId = input.produtoId.trim();
	const preco = normalizarPreco(input.preco);
	if (!produtoId || preco === null) {
		return null;
	}

	const produto = await db.produtos_preco.update({
		where: { id: produtoId },
		data: {
			preco,
			ativo: input.ativo,
		},
		select: {
			id: true,
			codigo: true,
			descricao: true,
			unidade: true,
			preco: true,
			grupo: true,
			nomeGrupo: true,
			ativo: true,
		},
	});

	return mapearProdutoAdmin(produto);
}
