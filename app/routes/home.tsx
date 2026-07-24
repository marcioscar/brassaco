import type { Route } from "./+types/home";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import {
	Box,
	ChevronDown,
	CircleDot,
	CupSoda,
	HandPlatter,
	PackageCheck,
	PackageOpen,
	PackageSearch,
	Minus,
	MapPin,
	Package,
	PartyPopper,
	Recycle,
	ScanBarcode,
	ShieldCheck,
	Shirt,
	User,
	Plus,
	Search,
	ShoppingBag,
	ShoppingCart,
	SprayCan,
	Sparkles,
	Tags,
	UtensilsCrossed,
	Warehouse,
	ArrowRight,
	Store,
	Truck,
} from "lucide-react";
import {
	listarGruposDeProdutos,
	listarProdutos,
} from "../models/produtos.server";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "../components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import fundoBrassImagem from "../assets/fundobrass.jpg";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Brassaco Embalagens" },
		{ name: "description", content: "Brassaco Embalagens" },
	];
}

export async function loader() {
	const produtos = await listarProdutos();
	const grupos = listarGruposDeProdutos(produtos);

	return { produtos, grupos };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;
type Grupo = LoaderData["grupos"][number];
type Produto = LoaderData["produtos"][number];
type SubgrupoProdutos = {
	id: string;
	nome: string;
	produtos: Produto[];
};
type CarrinhoItem = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	quantidade: number;
};
type ClienteLogado = {
	id: string;
	nome: string;
	email: string;
	cpf?: string;
	cep?: string;
	telefone: string;
	endereco: string;
	observacoes: string;
};
type PedidoResumo = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	pagamentoStatus?: string;
	pagamentoLinkUrl?: string;
};
type OpcaoTamanho = {
	rotulo: string;
	produto: Produto;
};
type FretePedido = {
	valor: number | null;
	resumo: string;
	observacao: string;
};

type NavbarClienteProps = {
	totalItensCarrinho: number;
	estaLogado: boolean;
	nomeDoUsuarioLogado?: string;
	valorBusca: string;
	aoSelecionarInicio: () => void;
	aoAlterarBusca: (valor: string) => void;
	aoBuscar: () => void;
	aoAbrirConta: () => void;
	aoAbrirCarrinho: () => void;
};

const CHAVE_CARRINHO = "bel:carrinho:v1";
const CHAVE_CLIENTE_ID = "bel:cliente-id:v1";
const LOGO_BRASSACO = "/logo_bel.svg";
const LOGO_WHATSAPP = "/whatsapp.png";
const LINK_MAPA_SCLRN = "https://maps.google.com/?q=-15.770343,-47.889381";
const LINK_MAPA_QI14 = "https://maps.google.com/?q=-15.809405,-48.076214";
const LOJAS_POR_CIDADE: Array<{
	cidade: string;
	whatsapp: string;
	enderecos: string[];
}> = [
	{
		cidade: "Taguatinga",
		whatsapp: "(61) 3354-8888",
		enderecos: ["📍 QI 14 lote 39", "📍 QNE 34 lote 27 "],
	},
	{
		cidade: "Plano Piloto",
		whatsapp: "(61) 3340-7777",
		enderecos: [
			"📍 Ed Venancio loja 14 -  subsolo (conic)",
			"📍 SCLRN 706 norte Bl. E lj. 03 ",
		],
	},
];

function obterIconeDoGrupo(nomeDoGrupo: string) {
	const nomeNormalizado = normalizarTexto(nomeDoGrupo);
	if (nomeNormalizado.includes("saco") || nomeNormalizado.includes("sacola")) {
		return ShoppingBag;
	}
	if (nomeNormalizado.includes("copo")) {
		return CupSoda;
	}
	if (nomeNormalizado.includes("prato")) {
		return HandPlatter;
	}
	if (
		nomeNormalizado.includes("talher") ||
		nomeNormalizado.includes("cozinha") ||
		nomeNormalizado.includes("festa")
	) {
		return UtensilsCrossed;
	}
	if (nomeNormalizado.includes("isopor")) {
		return PackageSearch;
	}
	if (
		nomeNormalizado.includes("limpeza") ||
		nomeNormalizado.includes("alcool") ||
		nomeNormalizado.includes("sabonete")
	) {
		return SprayCan;
	}
	if (nomeNormalizado.includes("papel") || nomeNormalizado.includes("bobina")) {
		return Package;
	}
	if (nomeNormalizado.includes("fita") || nomeNormalizado.includes("adesiv")) {
		return ScanBarcode;
	}
	if (
		nomeNormalizado.includes("luva") ||
		nomeNormalizado.includes("mascara") ||
		nomeNormalizado.includes("touca")
	) {
		return ShieldCheck;
	}
	if (
		nomeNormalizado.includes("rafia") ||
		nomeNormalizado.includes("zip") ||
		nomeNormalizado.includes("pp") ||
		nomeNormalizado.includes("pvc")
	) {
		return Recycle;
	}
	if (nomeNormalizado.includes("caixa")) {
		return Box;
	}
	if (
		nomeNormalizado.includes("dispenser") ||
		nomeNormalizado.includes("suporte")
	) {
		return PackageCheck;
	}
	if (nomeNormalizado.includes("garrafa")) {
		return CircleDot;
	}
	if (nomeNormalizado.includes("canudo")) {
		return PartyPopper;
	}
	if (nomeNormalizado.includes("embal")) {
		return PackageOpen;
	}
	if (nomeNormalizado.includes("doces") || nomeNormalizado.includes("bolo")) {
		return Sparkles;
	}
	if (
		nomeNormalizado.includes("uniforme") ||
		nomeNormalizado.includes("roupa")
	) {
		return Shirt;
	}
	if (
		nomeNormalizado.includes("deposito") ||
		nomeNormalizado.includes("estoque")
	) {
		return Warehouse;
	}
	if (nomeNormalizado.includes("produto")) {
		return Package;
	}

	return Tags;
}

function obterDescricaoDoGrupo(nomeDoGrupo: string) {
	const nomeNormalizado = normalizarTexto(nomeDoGrupo);
	if (nomeNormalizado === "sacos") {
		return "Lixo, picotado, tubular";
	}
	if (nomeNormalizado === "sacolas") {
		return "Kraft, alça, boca de palhaço";
	}
	if (nomeNormalizado === "caixas e fechamento") {
		return "Papelão, fitas, envelopes";
	}
	if (
		nomeNormalizado === "descartaveis e festa" ||
		nomeNormalizado === "descartaveis de mesa"
	) {
		return "Copos, talheres, pratos";
	}
	if (
		nomeNormalizado === "higiene e protecao" ||
		nomeNormalizado === "higiene e proteção"
	) {
		return "Álcool, luvas, máscaras";
	}
	if (nomeNormalizado === "isopor") {
		return "Marmitas, copos, bandejas";
	}
	if (nomeNormalizado === "potes e recipientes") {
		return "Potes, marmitex, tampas";
	}
	if (nomeNormalizado === "outros") {
		return "Bobinas, plásticos, diversos";
	}

	return "Ver produtos";
}

function ordenarGruposParaHome(grupos: Grupo[]) {
	const gruposPrioritarios = ["sacos", "sacolas"];
	const prioridades = new Map(gruposPrioritarios.map((nome, indice) => [nome, indice]));

	return [...grupos].sort((grupoA, grupoB) => {
		const nomeA = normalizarTexto(grupoA.nome);
		const nomeB = normalizarTexto(grupoB.nome);
		const prioridadeA = prioridades.get(nomeA);
		const prioridadeB = prioridades.get(nomeB);

		if (prioridadeA !== undefined && prioridadeB !== undefined) {
			return prioridadeA - prioridadeB;
		}
		if (prioridadeA !== undefined) {
			return -1;
		}
		if (prioridadeB !== undefined) {
			return 1;
		}

		return 0;
	});
}

function obterLinkMapaDoEndereco(endereco: string) {
	const enderecoNormalizado = normalizarTexto(endereco);

	if (enderecoNormalizado.includes("qi 14 lote 39")) {
		return LINK_MAPA_QI14;
	}
	if (enderecoNormalizado.includes("sclrn 706 norte")) {
		return LINK_MAPA_SCLRN;
	}

	return null;
}

function NavbarCliente({
	totalItensCarrinho,
	estaLogado,
	nomeDoUsuarioLogado,
	valorBusca,
	aoSelecionarInicio,
	aoAlterarBusca,
	aoBuscar,
	aoAbrirConta,
	aoAbrirCarrinho,
}: NavbarClienteProps) {
	return (
		<header className='sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur'>
			<div className='mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-1.5 md:h-16 md:flex-row md:items-center md:gap-4 md:py-0'>
				<div className='flex w-full items-center justify-between gap-2'>
					<div className='flex items-center gap-2'>
						<Button
							type='button'
							onClick={aoSelecionarInicio}
							variant='ghost'
							size='sm'
							className='shrink-0 p-1'
							aria-label='Ir para início'>
							<img src='/logo_bel.svg' alt='BEL' className='h-8 w-auto' />
						</Button>
						<form
							className='hidden w-72 md:block'
							onSubmit={(event) => {
								event.preventDefault();
								aoBuscar();
							}}>
							<div className='relative w-full'>
								<Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
								<input
									type='search'
									value={valorBusca}
									onChange={(event) => aoAlterarBusca(event.target.value)}
									placeholder='Buscar em todos os produtos...'
									className='h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
								/>
							</div>
						</form>
					</div>
					<div className='flex shrink-0 items-center gap-2'>
						{estaLogado && nomeDoUsuarioLogado ? (
							<span className='max-w-36 truncate text-xs font-medium text-muted-foreground sm:max-w-56'>
								{nomeDoUsuarioLogado}
							</span>
						) : null}
						<Button
							type='button'
							variant={estaLogado ? "outline" : "ghost"}
							size='icon-sm'
							onClick={aoAbrirConta}
							aria-label={estaLogado ? "Minha conta" : "Entrar ou cadastrar"}>
							<User className='size-4' />
						</Button>
						<Button
							type='button'
							variant='ghost'
							size='icon-sm'
							onClick={aoAbrirCarrinho}
							aria-label='Carrinho'>
							<ShoppingCart className='size-4' />
							{totalItensCarrinho > 0 ? (
								<span className='ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground'>
									{totalItensCarrinho}
								</span>
							) : null}
						</Button>
					</div>
				</div>
				<form
					className='w-full md:hidden'
					onSubmit={(event) => {
						event.preventDefault();
						aoBuscar();
					}}>
					<div className='relative w-full'>
						<Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
						<input
							type='search'
							value={valorBusca}
							onChange={(event) => aoAlterarBusca(event.target.value)}
							placeholder='Buscar em todos os produtos...'
							className='h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
						/>
					</div>
				</form>
			</div>
		</header>
	);
}

function CategoriaCard({
	grupo,
	aoClicar,
}: {
	grupo: Grupo;
	aoClicar: (codigoDoGrupo: number) => void;
}) {
	const Icone = obterIconeDoGrupo(grupo.nome);

	return (
		<button
			type='button'
			onClick={() => aoClicar(grupo.codigo)}
			className='group flex h-full flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md'>
			<span className='flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700'>
				<Icone className='size-6' />
			</span>
			<span className='font-semibold text-zinc-900'>{grupo.nome}</span>
			<span className='text-sm text-zinc-500'>
				{obterDescricaoDoGrupo(grupo.nome)}
			</span>
			<span className='mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700'>
				Ver produtos
				<ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
			</span>
		</button>
	);
}

function filtrarProdutosDoGrupo(
	produtos: Produto[],
	grupoSelecionado: Grupo | undefined,
) {
	if (!grupoSelecionado) {
		return [];
	}

	const categoriasSelecionadas = new Set(
		(grupoSelecionado.categoriasOriginais ?? []).map((categoria) =>
			normalizarTexto(categoria),
		),
	);
	const deveFiltrarPorCategoria = categoriasSelecionadas.size > 0;

	return produtos.filter((produto) => {
		if (!deveFiltrarPorCategoria) {
			return grupoSelecionado.codigosOriginais.includes(produto.grupo);
		}

		const categoriaDoProduto = produto.nomeGrupo?.trim();
		if (!categoriaDoProduto) {
			return grupoSelecionado.codigosOriginais.includes(produto.grupo);
		}

		return categoriasSelecionadas.has(normalizarTexto(categoriaDoProduto));
	});
}

function filtrarProdutosPorDescricao(produtos: Produto[], termoBusca: string) {
	const termoNormalizado = termoBusca.trim().toLowerCase();
	if (!termoNormalizado) {
		return produtos;
	}

	return produtos.filter((produto) =>
		produto.descricao.toLowerCase().includes(termoNormalizado),
	);
}

function normalizarTexto(texto: string) {
	return texto
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function carregarCarrinhoInicial() {
	if (typeof window === "undefined") {
		return {} as Record<string, CarrinhoItem>;
	}

	try {
		const carrinhoSerializado = window.localStorage.getItem(CHAVE_CARRINHO);
		if (!carrinhoSerializado) {
			return {};
		}

		return JSON.parse(carrinhoSerializado) as Record<string, CarrinhoItem>;
	} catch {
		window.localStorage.removeItem(CHAVE_CARRINHO);
		return {};
	}
}

function extrairNomeDoSubgrupo(descricao: string) {
	const textoLimpo = descricao.trim();
	if (!textoLimpo) {
		return "Outros";
	}

	const [primeiraPalavra] = textoLimpo.split(/\s+/);
	if (!primeiraPalavra) {
		return "Outros";
	}

	if (normalizarTexto(primeiraPalavra) === "sbn") {
		return "Sacos de baixa densidade";
	}

	return (
		primeiraPalavra.charAt(0).toUpperCase() +
		primeiraPalavra.slice(1).toLowerCase()
	);
}

function agruparProdutosPorNome(produtos: Produto[]): SubgrupoProdutos[] {
	const acumulador = new Map<string, SubgrupoProdutos>();

	for (const produto of produtos) {
		const nomeDoSubgrupo = extrairNomeDoSubgrupo(produto.descricao);
		const idDoSubgrupo = normalizarTexto(nomeDoSubgrupo);
		const subgrupoExistente = acumulador.get(idDoSubgrupo);

		if (subgrupoExistente) {
			subgrupoExistente.produtos.push(produto);
			continue;
		}

		acumulador.set(idDoSubgrupo, {
			id: idDoSubgrupo,
			nome: nomeDoSubgrupo,
			produtos: [produto],
		});
	}

	return [...acumulador.values()]
		.map((subgrupo) => ({
			...subgrupo,
			produtos: subgrupo.produtos.sort((a, b) =>
				a.descricao.localeCompare(b.descricao),
			),
		}))
		.sort((a, b) => a.nome.localeCompare(b.nome));
}

function ehSubgrupoSacosDeBaixaDensidade(nomeDoSubgrupo: string) {
	return normalizarTexto(nomeDoSubgrupo) === "sacos de baixa densidade";
}

function extrairRotuloDoTamanho(descricao: string) {
	const correspondenciaComEspessura = descricao.match(
		/(\d+(?:[.,]\d+)?)\s*[xX]\s*(\d+(?:[.,]\d+)?)\s*[xX]\s*0\s*([0-9]{3,4})/i,
	);
	if (correspondenciaComEspessura) {
		const [, largura, altura, espessura] = correspondenciaComEspessura;
		return `${largura}x${altura}x 0,${espessura}`;
	}

	const correspondenciaTamanho = descricao.match(
		/\d+(?:[.,]\d+)?\s*[xX]\s*\d+(?:[.,]\d+)?(?:\s*[xX]\s*\d+(?:[.,]\d+)?)?/,
	);
	if (correspondenciaTamanho) {
		return correspondenciaTamanho[0]
			.replace(/\s+/g, "")
			.replace(/x0([0-9]{3,4})/i, "x 0,$1")
			.replace(/x0$/i, "x 0");
	}

	const descricaoSemSbn = descricao.replace(/^sbn\b/i, "").trim();
	if (descricaoSemSbn) {
		return descricaoSemSbn;
	}

	return descricao;
}

function formatarPreco(preco: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(preco);
}

function possuiClienteLogadoValido(
	cliente: ClienteLogado | null,
): cliente is ClienteLogado {
	if (!cliente?.id) {
		return false;
	}

	return Boolean(
		cliente.nome.trim() &&
		cliente.email.trim() &&
		cliente.telefone.trim() &&
		cliente.endereco.trim(),
	);
}

async function requisitarCliente(payload: unknown) {
	const resposta = await fetch("/api/cliente", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const dados = (await resposta.json()) as {
		cliente?: ClienteLogado | null;
		ok?: boolean;
		erro?: string;
	};

	return { resposta, dados };
}

async function requisitarPedido(payload: unknown) {
	const resposta = await fetch("/api/pedido", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const dados = (await resposta.json()) as {
		pedido?: PedidoResumo;
		pedidos?: PedidoResumo[];
		checkoutUrl?: string;
		checkoutPendente?: boolean;
		mensagemCliente?: string;
		erro?: string;
	};

	return { resposta, dados };
}

function obterMensagemDeErroPedido(dados: {
	erro?: string;
}): string {
	const mensagem = dados.erro?.trim();
	if (mensagem) {
		return mensagem;
	}

	return "Nao foi possivel registrar o pedido. Tente novamente.";
}

function obterMensagemDeErroInesperado(error: unknown): string {
	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	return "Nao foi possivel registrar o pedido por falha de conexao.";
}

function criarMensagemPedidoForaDoDf(mensagemCliente?: string) {
	const mensagem = mensagemCliente?.trim();
	if (mensagem) {
		return mensagem;
	}

	return "Pedido registrado com frete pendente. Em breve enviaremos o valor do frete, o total final e o link de pagamento.";
}

function normalizarCep(cep: string) {
	return cep.replace(/\D/g, "");
}

function cepEhDoDistritoFederal(cep: string) {
	const cepNormalizado = normalizarCep(cep);
	if (cepNormalizado.length !== 8) {
		return false;
	}

	const prefixo = Number(cepNormalizado.slice(0, 2));
	return prefixo >= 70 && prefixo <= 73;
}

function calcularFretePedido(
	totalCarrinho: number,
	cepDoCliente?: string,
): FretePedido {
	if (!cepEhDoDistritoFederal(cepDoCliente ?? "")) {
		return {
			valor: null,
			resumo: "Frete a informar (fora do DF)",
			observacao: "Frete: valor a informar posteriormente (fora do DF).",
		};
	}

	if (totalCarrinho >= 100) {
		return {
			valor: 0,
			resumo: "Frete gratis (DF para pedidos acima de R$ 100,00)",
			observacao: "Frete: gratis (DF, pedido acima de R$ 100,00).",
		};
	}

	return {
		valor: 30,
		resumo: "Frete R$ 30,00 (DF para pedidos abaixo de R$ 100,00)",
		observacao: "Frete: R$ 30,00 (DF, pedido abaixo de R$ 100,00).",
	};
}

function calcularTotalComFrete(totalCarrinho: number, frete: FretePedido) {
	if (frete.valor === null) {
		return totalCarrinho;
	}

	return totalCarrinho + frete.valor;
}

function SeletorDeTamanhoSacosBaixaDensidade({
	produtos,
	aoSelecionarProduto,
}: {
	produtos: Produto[];
	aoSelecionarProduto: (produto: Produto) => void;
}) {
	const opcoesDeTamanho: OpcaoTamanho[] = produtos.map((produto) => ({
		rotulo: extrairRotuloDoTamanho(produto.descricao),
		produto,
	}));
	const tamanhosDisponiveis = Array.from(
		new Set(opcoesDeTamanho.map((opcao) => opcao.rotulo)),
	);
	const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("");

	useEffect(() => {
		setTamanhoSelecionado("");
	}, [produtos]);

	const produtoSelecionado = opcoesDeTamanho.find(
		(opcao) => opcao.rotulo === tamanhoSelecionado,
	)?.produto;

	return (
		<div className='flex flex-col gap-3 p-2 pt-0 text-sm'>
			<p className='text-xs text-muted-foreground'>
				Escolha o tamanho do saco para ver o detalhe.
			</p>
			<Combobox
				items={tamanhosDisponiveis}
				value={tamanhoSelecionado}
				onValueChange={(tamanho) =>
					setTamanhoSelecionado(typeof tamanho === "string" ? tamanho : "")
				}>
				<ComboboxInput placeholder='Selecione o tamanho' showClear />
				<ComboboxContent>
					<ComboboxEmpty>Nenhum tamanho encontrado.</ComboboxEmpty>
					<ComboboxList>
						{(tamanho) => (
							<ComboboxItem key={tamanho} value={tamanho}>
								{tamanho}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{produtoSelecionado ? (
				<div className='flex items-center gap-2 rounded-md border px-2 py-1.5'>
					<div className='min-w-0 flex-1'>
						<p className='truncate'>{produtoSelecionado.descricao}</p>
						<p className='text-xs text-muted-foreground'>
							{formatarPreco(produtoSelecionado.preco)} /{" "}
							{produtoSelecionado.unidade}
						</p>
					</div>
					<Button
						type='button'
						onClick={() => aoSelecionarProduto(produtoSelecionado)}
						variant='outline'
						size='xs'>
						Ver detalhes
					</Button>
				</div>
			) : (
				<p className='text-xs text-muted-foreground'>
					Selecione um tamanho para visualizar o produto.
				</p>
			)}
		</div>
	);
}

function ListaDeSubgruposColapsaveis({
	subgrupos,
	nomeDoGrupo,
	aoSelecionarProduto,
}: {
	subgrupos: SubgrupoProdutos[];
	nomeDoGrupo: string;
	aoSelecionarProduto: (produto: Produto) => void;
}) {
	if (subgrupos.length === 0) {
		return <p>Nenhum produto encontrado para os filtros informados.</p>;
	}

	return (
		<section className='space-y-3'>
			<h2 className='text-lg font-semibold'>Tipos em {nomeDoGrupo}</h2>
			<ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
				{subgrupos.map((subgrupo) => (
					<li key={subgrupo.id}>
						<Card className='h-full'>
							<CardContent className='p-2'>
								<Collapsible className='rounded-md data-[state=open]:bg-muted'>
									<CollapsibleTrigger
										className={cn(
											buttonVariants({ variant: "ghost" }),
											"group w-full justify-start",
										)}>
										{subgrupo.nome} ({subgrupo.produtos.length})
										<ChevronDown className='ml-auto transition-transform group-data-[state=open]:rotate-180' />
									</CollapsibleTrigger>
									<CollapsibleContent className='flex flex-col gap-2 p-2 pt-0 text-sm'>
										{ehSubgrupoSacosDeBaixaDensidade(subgrupo.nome) ? (
											<SeletorDeTamanhoSacosBaixaDensidade
												produtos={subgrupo.produtos}
												aoSelecionarProduto={aoSelecionarProduto}
											/>
										) : (
											subgrupo.produtos.map((produto) => (
												<div
													key={`${produto.grupo}-${produto.codigo}-${produto.descricao}`}
													className='flex items-center gap-2 rounded-md border px-2 py-1.5'>
													<div className='min-w-0 flex-1'>
														<p className='truncate'>{produto.descricao}</p>
														<p className='text-xs text-muted-foreground'>
															{formatarPreco(produto.preco)} / {produto.unidade}
														</p>
													</div>
													<Button
														type='button'
														onClick={() => aoSelecionarProduto(produto)}
														variant='outline'
														size='xs'>
														Ver detalhes
													</Button>
												</div>
											))
										)}
									</CollapsibleContent>
								</Collapsible>
							</CardContent>
						</Card>
					</li>
				))}
			</ul>
		</section>
	);
}

function DialogProduto({
	aberto,
	produto,
	quantidadeSelecionada,
	aoDecrementarQuantidade,
	aoIncrementarQuantidade,
	aoAlterarAberto,
	aoAdicionarAoCarrinho,
}: {
	aberto: boolean;
	produto: Produto | null;
	quantidadeSelecionada: number;
	aoDecrementarQuantidade: () => void;
	aoIncrementarQuantidade: () => void;
	aoAlterarAberto: (aberto: boolean) => void;
	aoAdicionarAoCarrinho: (produto: Produto, quantidade: number) => void;
}) {
	if (!produto) {
		return null;
	}

	return (
		<Dialog open={aberto} onOpenChange={aoAlterarAberto}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{produto.descricao}</DialogTitle>
					<DialogDescription>Codigo: {produto.codigo}</DialogDescription>
				</DialogHeader>

				<div className='space-y-2 rounded-md border p-3'>
					<p className='text-sm'>
						<strong>Descricao:</strong> {produto.descricao}
					</p>
					<p className='text-sm'>
						<strong>Unidade:</strong> {produto.unidade}
					</p>
					<p className='text-sm'>
						<strong>Preco:</strong> {formatarPreco(produto.preco)}
					</p>
					<div className='flex items-center justify-between rounded-md border p-2'>
						<span className='text-sm font-medium'>Quantidade</span>
						<div className='flex items-center gap-2'>
							<Button
								type='button'
								variant='outline'
								size='icon-xs'
								onClick={aoDecrementarQuantidade}
								disabled={quantidadeSelecionada <= 1}
								aria-label='Diminuir quantidade'>
								<Minus />
							</Button>
							<span className='w-8 text-center text-sm font-medium'>
								{quantidadeSelecionada}
							</span>
							<Button
								type='button'
								variant='outline'
								size='icon-xs'
								onClick={aoIncrementarQuantidade}
								aria-label='Aumentar quantidade'>
								<Plus />
							</Button>
						</div>
					</div>
					<p className='text-sm'>
						<strong>Subtotal:</strong>{" "}
						{formatarPreco(produto.preco * quantidadeSelecionada)}
					</p>
				</div>

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={() => aoAlterarAberto(false)}>
						Cancelar
					</Button>
					<Button
						type='button'
						onClick={() =>
							aoAdicionarAoCarrinho(produto, quantidadeSelecionada)
						}>
						Adicionar ao carrinho
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ListaDoCarrinho({
	itens,
	aoRemoverItem,
}: {
	itens: CarrinhoItem[];
	aoRemoverItem: (idDoProduto: string) => void;
}) {
	if (itens.length === 0) {
		return (
			<p className='text-sm text-muted-foreground'>Seu carrinho esta vazio.</p>
		);
	}

	return (
		<ul className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
			{itens.map((item) => (
				<li
					key={item.id}
					className='flex items-center gap-2 rounded-md border p-2'>
					<div className='min-w-0 flex-1'>
						<p className='truncate text-sm font-medium'>{item.descricao}</p>
						<p className='text-xs text-muted-foreground'>
							{item.quantidade} x {formatarPreco(item.preco)} / {item.unidade}
						</p>
					</div>
					<Button
						type='button'
						variant='ghost'
						size='xs'
						onClick={() => aoRemoverItem(item.id)}>
						Remover
					</Button>
				</li>
			))}
		</ul>
	);
}

function HeroBrassaco({
	valorBusca,
	aoAlterarBusca,
	aoBuscar,
	aoVerCatalogo,
}: {
	valorBusca: string;
	aoAlterarBusca: (valor: string) => void;
	aoBuscar: () => void;
	aoVerCatalogo: () => void;
}) {
	return (
		<section className='grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12'>
			<div className='order-2 lg:order-1'>
				<span className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700'>
					<span className='size-1.5 rounded-full bg-emerald-600' />
					Brassaco Embalagens · Brasília-DF
				</span>
				<h1 className='mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl'>
					Tudo em embalagens
					<br />
					para o seu negócio<span className='text-emerald-600'>.</span>
				</h1>
				<p className='mt-5 max-w-[42ch] text-base text-zinc-600 sm:text-lg'>
					Sacos, sacolas, descartáveis, isopor e higiene — do saco de lixo à
					mesa de festa. Peça online e receba no seu endereço, em todo o DF.
				</p>
				<form
					className='mt-7 flex flex-col gap-3 sm:flex-row'
					onSubmit={(event) => {
						event.preventDefault();
						aoBuscar();
					}}>
					<div className='relative flex-1'>
						<Search className='pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400' />
						<input
							type='search'
							value={valorBusca}
							onChange={(event) => aoAlterarBusca(event.target.value)}
							placeholder='O que você procura?'
							className='h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-[15px] shadow-sm outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-100'
						/>
					</div>
					<Button
						type='button'
						onClick={aoVerCatalogo}
						className='h-12 gap-2 rounded-xl bg-emerald-600 px-6 text-[15px] font-bold text-white hover:bg-emerald-700'>
						Ver catálogo
						<ArrowRight className='size-4' />
					</Button>
				</form>
				<div className='mt-6 flex flex-wrap gap-x-6 gap-y-2.5'>
					<span className='inline-flex items-center gap-2 text-sm font-medium text-zinc-600'>
						<Store className='size-4 text-emerald-600' />4 lojas físicas no DF
					</span>
					<span className='inline-flex items-center gap-2 text-sm font-medium text-zinc-600'>
						<Truck className='size-4 text-emerald-600' />Entrega em todo o DF
					</span>
					<span className='inline-flex items-center gap-2 text-sm font-medium text-zinc-600'>
						<Tags className='size-4 text-emerald-600' />Atacado e varejo
					</span>
				</div>
			</div>
			<div className='relative order-1 lg:order-2'>
				<div className='relative -mx-4 aspect-[16/10] overflow-hidden rounded-b-3xl border border-t-0 border-zinc-200 shadow-md lg:mx-0 lg:aspect-[5/4] lg:rounded-3xl lg:border-t lg:shadow-xl'>
					<img
						src={fundoBrassImagem}
						alt='Sacos plásticos azul e verde da Brassaco'
						className='size-full object-cover'
					/>
					<div className='pointer-events-none absolute inset-0 flex flex-col items-end justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent p-5 text-right sm:p-7'>
						<img
							src={LOGO_BRASSACO}
							alt='Brassaco Embalagens'
							className='h-11 w-auto drop-shadow sm:h-14'
						/>
						<span className='mt-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-700 sm:text-xs'>
							Sacos · Sacolas · Descartáveis
						</span>
					</div>
					<div className='absolute left-4 top-1/2 hidden -translate-y-1/2 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 pr-4 shadow-xl lg:flex'>
						<span className='flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700'>
							<Truck className='size-5' />
						</span>
						<span className='block'>
							<span className='block text-sm font-semibold text-zinc-900'>
								Frete grátis no DF
							</span>
							<span className='block text-xs text-zinc-500'>
								em pedidos acima de R$ 100
							</span>
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function CardNossasLojas() {
	return (
		<Card className='h-full overflow-hidden rounded-3xl border border-emerald-100 bg-white text-foreground shadow-sm'>
			<CardContent className='p-6'>
				<div className='mb-4 flex items-center gap-2'>
					<MapPin className='size-5 text-emerald-600' />
					<h2 className='text-2xl font-black tracking-tight'>Nossas lojas</h2>
				</div>
				<div className='grid gap-3 sm:grid-cols-2'>
					{LOJAS_POR_CIDADE.map((loja) => (
						<div
							key={loja.cidade}
							className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-4'>
							<div className='mb-2 flex items-center justify-between gap-2'>
								<p className='text-lg font-semibold  text-zinc-900'>
									{loja.cidade}
								</p>
								<a
									href={`https://wa.me/55${loja.whatsapp.replace(/\D/g, "")}`}
									target='_blank'
									rel='noreferrer'
									aria-label={`Conversar com a loja ${loja.cidade} no WhatsApp`}
									className='flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm transition-colors hover:bg-emerald-100'>
									<img
										src={LOGO_WHATSAPP}
										alt='WhatsApp'
										className='size-4 object-contain'
									/>
									<span className='text-xs font-semibold text-emerald-700'>
										{loja.whatsapp}
									</span>
								</a>
							</div>
							<div className='grid gap-2'>
								{loja.enderecos.map((endereco) => (
									(() => {
										const linkMapa = obterLinkMapaDoEndereco(endereco);
										if (!linkMapa) {
											return (
												<p
													key={`${loja.cidade}-${endereco}`}
													className='text-sm leading-relaxed'>
													{endereco}
												</p>
											);
										}

										return (
											<a
												key={`${loja.cidade}-${endereco}`}
												href={linkMapa}
												target='_blank'
												rel='noreferrer'
												className='text-sm leading-relaxed underline-offset-2 hover:underline'>
												{endereco}
											</a>
										);
									})()
								))}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default function Home() {
	const navigate = useNavigate();
	const { grupos, produtos } = useLoaderData<typeof loader>();
	const gruposOrdenados = ordenarGruposParaHome(grupos);
	const [buscaNavbar, setBuscaNavbar] = useState("");
	const [codigoDoGrupoSelecionado, setCodigoDoGrupoSelecionado] = useState<
		number | null
	>(null);
	const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
		null,
	);
	const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
	const [carrinhoAberto, setCarrinhoAberto] = useState(false);
	const [carrinho, setCarrinho] = useState<Record<string, CarrinhoItem>>(() =>
		carregarCarrinhoInicial(),
	);
	const [clienteLogado, setClienteLogado] = useState<ClienteLogado | null>(
		null,
	);
	const [estaCriandoPedido, setEstaCriandoPedido] = useState(false);
	const [erroPedido, setErroPedido] = useState("");
	const [mensagemPedido, setMensagemPedido] = useState("");
	const [estaRevisandoPedido, setEstaRevisandoPedido] = useState(false);

	useEffect(() => {
		window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
	}, [carrinho]);

	useEffect(() => {
		const clienteId = window.localStorage.getItem(CHAVE_CLIENTE_ID);
		if (!clienteId) {
			return;
		}

		async function carregarClienteSalvo() {
			try {
				const { resposta, dados } = await requisitarCliente({
					intent: "login_por_id",
					id: clienteId,
				});
				if (
					!resposta.ok ||
					!dados.cliente ||
					!possuiClienteLogadoValido(dados.cliente)
				) {
					window.localStorage.removeItem(CHAVE_CLIENTE_ID);
					return;
				}

				setClienteLogado(dados.cliente);
			} catch {
				window.localStorage.removeItem(CHAVE_CLIENTE_ID);
			}
		}

		void carregarClienteSalvo();
	}, []);

	function selecionarGrupo(codigoDoGrupo: number) {
		const grupo = grupos.find((item) => item.codigo === codigoDoGrupo);
		if (!grupo) {
			return;
		}

		navigate(`/catalogo?grupo=${encodeURIComponent(grupo.nome)}`);
	}

	function buscarNoCatalogoPelaNavbar() {
		const termo = buscaNavbar.trim();
		if (!termo) {
			navigate("/catalogo");
			return;
		}
		navigate(`/catalogo?busca=${encodeURIComponent(termo)}`);
	}

	function abrirDetalhesDoProduto(produto: Produto) {
		setProdutoSelecionado(produto);
		setQuantidadeSelecionada(1);
	}

	function adicionarAoCarrinho(produto: Produto, quantidade: number) {
		setCarrinho((valorAtual) => {
			const itemExistente = valorAtual[produto.id];
			if (itemExistente) {
				return {
					...valorAtual,
					[produto.id]: {
						...itemExistente,
						quantidade: itemExistente.quantidade + quantidade,
					},
				};
			}

			return {
				...valorAtual,
				[produto.id]: {
					id: produto.id,
					codigo: produto.codigo,
					descricao: produto.descricao,
					unidade: produto.unidade,
					preco: produto.preco,
					quantidade,
				},
			};
		});
		setProdutoSelecionado(null);
		setQuantidadeSelecionada(1);
	}

	function removerItemDoCarrinho(idDoProduto: string) {
		setCarrinho((valorAtual) => {
			const item = valorAtual[idDoProduto];
			if (!item) {
				return valorAtual;
			}
			if (item.quantidade > 1) {
				return {
					...valorAtual,
					[idDoProduto]: { ...item, quantidade: item.quantidade - 1 },
				};
			}

			const { [idDoProduto]: _removido, ...restante } = valorAtual;
			return restante;
		});
	}

	function limparCarrinho() {
		setCarrinho({});
	}

	function iniciarRevisaoDoPedido() {
		if (itensDoCarrinho.length === 0) {
			return;
		}

		if (!possuiClienteLogadoValido(clienteLogado)) {
			setCarrinhoAberto(false);
			navigate("/conta?next=checkout");
			return;
		}

		setErroPedido("");
		setMensagemPedido("");
		setEstaRevisandoPedido(true);
	}

	function criarObservacoesComFrete(
		observacoesCliente: string,
		fretePedido: FretePedido,
	) {
		return [observacoesCliente.trim(), fretePedido.observacao]
			.filter(Boolean)
			.join(" | ");
	}

	async function finalizarPedido() {
		if (
			itensDoCarrinho.length === 0 ||
			!possuiClienteLogadoValido(clienteLogado)
		) {
			return;
		}

		const fretePedido = calcularFretePedido(totalCarrinho, clienteLogado.cep);
		const totalComFrete = calcularTotalComFrete(totalCarrinho, fretePedido);
		const observacoesComFrete = criarObservacoesComFrete(
			clienteLogado.observacoes,
			fretePedido,
		);

		setErroPedido("");
		setMensagemPedido("");
		setEstaCriandoPedido(true);

		try {
			const precisaCheckout = fretePedido.valor !== null;
			const { resposta, dados } = await requisitarPedido({
				intent: "criar",
				clienteId: clienteLogado.id,
				clienteNome: clienteLogado.nome,
				clienteEmail: clienteLogado.email,
				clienteTelefone: clienteLogado.telefone,
				clienteCpf: clienteLogado.cpf,
				observacoesCliente: observacoesComFrete,
				criarCheckout: precisaCheckout,
				itens: itensDoCarrinho,
				total: totalComFrete,
			});
			if (!resposta.ok || !dados.pedido) {
				setErroPedido(obterMensagemDeErroPedido(dados));
				return;
			}

			limparCarrinho();
			setEstaRevisandoPedido(false);

			if (!precisaCheckout || dados.checkoutPendente) {
				setMensagemPedido(criarMensagemPedidoForaDoDf(dados.mensagemCliente));
				return;
			}

			if (!dados.checkoutUrl) {
				setErroPedido("Pedido registrado, mas sem link de pagamento.");
				return;
			}

			setCarrinhoAberto(false);
			window.open(dados.checkoutUrl, "_blank", "noopener,noreferrer");
		} catch (error) {
			setErroPedido(obterMensagemDeErroInesperado(error));
		} finally {
			setEstaCriandoPedido(false);
		}
	}

	const itensDoCarrinho = Object.values(carrinho);
	const totalItensCarrinho = itensDoCarrinho.reduce(
		(soma, item) => soma + item.quantidade,
		0,
	);
	const totalCarrinho = itensDoCarrinho.reduce(
		(soma, item) => soma + item.preco * item.quantidade,
		0,
	);
	const fretePedido = calcularFretePedido(totalCarrinho, clienteLogado?.cep);
	const totalComFrete = calcularTotalComFrete(totalCarrinho, fretePedido);

	return (
		<div className='min-h-screen bg-[#f4f8f4] text-zinc-900'>
			<div className='bg-emerald-600 px-4 py-1.5 text-center text-xs font-semibold text-white'>
				Frete grátis no DF para pedidos acima de R$ 100 · Atacado e varejo
			</div>
			<NavbarCliente
				totalItensCarrinho={totalItensCarrinho}
				estaLogado={Boolean(clienteLogado)}
				nomeDoUsuarioLogado={clienteLogado?.nome}
				valorBusca={buscaNavbar}
				aoSelecionarInicio={() => {
					setCodigoDoGrupoSelecionado(null);
					setProdutoSelecionado(null);
				}}
				aoAlterarBusca={setBuscaNavbar}
				aoBuscar={buscarNoCatalogoPelaNavbar}
				aoAbrirConta={() => navigate("/conta")}
				aoAbrirCarrinho={() => setCarrinhoAberto(true)}
			/>

			<main className='mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-16 pt-6 sm:pt-10'>
				<HeroBrassaco
					valorBusca={buscaNavbar}
					aoAlterarBusca={setBuscaNavbar}
					aoBuscar={buscarNoCatalogoPelaNavbar}
					aoVerCatalogo={() => navigate("/catalogo")}
				/>

				<section>
					<div className='mb-6 flex items-end justify-between gap-4'>
						<div>
							<h2 className='text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl'>
								Categorias
							</h2>
							<p className='mt-1 text-sm text-zinc-500'>
								Escolha um grupo para abrir o catálogo completo.
							</p>
						</div>
						<button
							type='button'
							onClick={() => navigate("/catalogo")}
							className='inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-800'>
							Ver todos
							<ArrowRight className='size-4' />
						</button>
					</div>
					{gruposOrdenados.length === 0 ? (
						<p className='text-sm text-zinc-500'>Nenhum grupo encontrado.</p>
					) : (
						<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
							{gruposOrdenados.map((grupo) => (
								<CategoriaCard
									key={grupo.codigo}
									grupo={grupo}
									aoClicar={selecionarGrupo}
								/>
							))}
						</div>
					)}
				</section>

				<section>
					<CardNossasLojas />
				</section>
			</main>
				<DialogProduto
					aberto={Boolean(produtoSelecionado)}
					produto={produtoSelecionado}
					quantidadeSelecionada={quantidadeSelecionada}
					aoDecrementarQuantidade={() =>
						setQuantidadeSelecionada((valorAtual) =>
							Math.max(1, valorAtual - 1),
						)
					}
					aoIncrementarQuantidade={() =>
						setQuantidadeSelecionada((valorAtual) => valorAtual + 1)
					}
					aoAlterarAberto={(aberto) => {
						if (!aberto) {
							setProdutoSelecionado(null);
							setQuantidadeSelecionada(1);
						}
					}}
					aoAdicionarAoCarrinho={adicionarAoCarrinho}
				/>
				<Dialog
					open={carrinhoAberto}
					onOpenChange={(aberto) => {
						setCarrinhoAberto(aberto);
						if (!aberto) {
							setEstaRevisandoPedido(false);
							setMensagemPedido("");
						}
					}}>
					<DialogContent className='sm:max-w-lg'>
						<DialogHeader>
							<DialogTitle>
								{estaRevisandoPedido ? "Revisao do pedido" : "Carrinho"}
							</DialogTitle>
							<DialogDescription>
								{estaRevisandoPedido
									? "Revise os itens e o frete antes de confirmar."
									: "Confira os itens adicionados antes de finalizar."}
							</DialogDescription>
						</DialogHeader>
						{clienteLogado ? (
							<div className='rounded-md border p-3 text-sm'>
								<p className='font-medium'>{clienteLogado.nome}</p>
								<p className='text-muted-foreground'>{clienteLogado.email}</p>
								<p className='text-muted-foreground'>
									{clienteLogado.telefone}
								</p>
								<p className='text-muted-foreground'>
									{clienteLogado.endereco}
								</p>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>
								Faca login com e-mail e senha ou cadastre seus dados para
								concluir o pedido.
							</p>
						)}
						{estaRevisandoPedido ? (
							<div className='space-y-3 rounded-md border p-3 text-sm'>
								<p className='font-medium'>Resumo para confirmacao</p>
								<ul className='space-y-1 text-muted-foreground'>
									{itensDoCarrinho.map((item) => (
										<li key={item.id}>
											{item.quantidade}x {item.descricao} (
											{formatarPreco(item.preco)} / {item.unidade})
										</li>
									))}
								</ul>
								<div className='space-y-1 border-t pt-2 text-sm'>
									<p>Subtotal: {formatarPreco(totalCarrinho)}</p>
									<p>
										Frete:{" "}
										{fretePedido.valor === null
											? "A informar"
											: formatarPreco(fretePedido.valor)}
									</p>
									<p className='text-xs text-muted-foreground'>
										{fretePedido.resumo}
									</p>
									<p className='font-medium'>
										Total para registro: {formatarPreco(totalComFrete)}
									</p>
								</div>
							</div>
						) : (
							<ListaDoCarrinho
								itens={itensDoCarrinho}
								aoRemoverItem={removerItemDoCarrinho}
							/>
						)}
						{erroPedido ? (
							<p className='text-sm text-destructive'>{erroPedido}</p>
						) : null}
						{mensagemPedido ? (
							<p className='text-sm text-emerald-700'>{mensagemPedido}</p>
						) : null}
						<DialogFooter>
							<div className='mr-auto text-sm font-medium'>
								Total: {formatarPreco(totalComFrete)}
							</div>
							{estaRevisandoPedido ? (
								<Button
									type='button'
									variant='outline'
									onClick={() => setEstaRevisandoPedido(false)}>
									Voltar ao carrinho
								</Button>
							) : (
								<Button
									type='button'
									variant='outline'
									onClick={limparCarrinho}>
									Limpar carrinho
								</Button>
							)}
							<Button
								type='button'
								onClick={
									estaRevisandoPedido ? finalizarPedido : iniciarRevisaoDoPedido
								}
								disabled={itensDoCarrinho.length === 0 || estaCriandoPedido}>
								{estaCriandoPedido
									? "Registrando pedido..."
									: estaRevisandoPedido
										? "Confirmar pedido"
										: "Revisar pedido"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
		</div>
	);
}
