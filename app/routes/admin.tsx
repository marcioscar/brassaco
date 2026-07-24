import type { Route } from "./+types/admin";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ListaPedidosAdmin } from "~/components/admin/lista-pedidos-admin";
import {
	ProdutosDataTable,
	type ProdutoAdmin,
} from "~/components/admin/produtos-data-table";

type CredenciaisAdmin = {
	email: string;
	senha: string;
};

type ItemPedidoResumo = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	quantidade: number;
};

type PedidoAdmin = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	itens: ItemPedidoResumo[];
	pagamentoStatus?: string;
	pagamentoLinkUrl?: string;
	clienteNome?: string;
	clienteEmail?: string;
	clienteTelefone?: string;
	clienteEndereco?: string;
	clienteDocumento?: string;
	observacoesCliente?: string;
};

const CHAVE_ADMIN = "bel:admin-auth:v1";
const STATUS_PEDIDO = [
	"AGUARDANDO_CONFIRMACAO",
	"EM_SEPARACAO",
	"EM_ROTA",
	"ENTREGUE",
	"CANCELADO",
] as const;

type StatusPedidoAdmin = (typeof STATUS_PEDIDO)[number];

export function meta({}: Route.MetaArgs) {
	return [{ title: "Admin | Brassaco Embalagens" }];
}

function NavbarAdmin({
	aoIrParaLoja,
	aoAtualizar,
	aoSair,
	carregando,
	logado,
}: {
	aoIrParaLoja: () => void;
	aoAtualizar: () => void;
	aoSair: () => void;
	carregando: boolean;
	logado: boolean;
}) {
	return (
		<header className='fixed inset-x-0 top-0 z-50 border-b bg-background/90 backdrop-blur'>
			<div className='mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4'>
				<Button
					type='button'
					onClick={aoIrParaLoja}
					variant='ghost'
					size='sm'
					className='shrink-0 p-1'
					aria-label='Ir para inicio'>
					<img src='/logo_bel.svg' alt='BEL' className='h-8 w-auto' />
				</Button>
				<p className='text-sm font-medium text-muted-foreground'>
					Painel administrativo
				</p>
				<div className='ml-auto flex items-center gap-2'>
					<Button type='button' variant='outline' size='sm' onClick={aoIrParaLoja}>
						Loja
					</Button>
					{logado ? (
						<>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={aoAtualizar}
								disabled={carregando}>
								Atualizar
							</Button>
							<Button type='button' variant='outline' size='sm' onClick={aoSair}>
								Sair
							</Button>
						</>
					) : null}
				</div>
			</div>
		</header>
	);
}

function formatarStatus(status: string) {
	return status.toLowerCase().replaceAll("_", " ");
}

function normalizarTexto(valor: string) {
	return valor
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

function filtrarPorCliente(pedido: PedidoAdmin, termoBusca: string) {
	const termo = normalizarTexto(termoBusca);
	if (!termo) {
		return true;
	}

	const nome = normalizarTexto(pedido.clienteNome ?? "");
	const email = normalizarTexto(pedido.clienteEmail ?? "");
	const telefone = normalizarTexto(pedido.clienteTelefone ?? "");
	return (
		nome.includes(termo) ||
		email.includes(termo) ||
		telefone.includes(termo)
	);
}

function filtrarPorStatus(pedido: PedidoAdmin, status: string) {
	if (!status) {
		return true;
	}

	return pedido.status === status;
}

function ehStatusPedidoAdmin(valor: string): valor is StatusPedidoAdmin {
	return (STATUS_PEDIDO as readonly string[]).includes(valor);
}

function carregarCredenciaisSalvas() {
	const salvo = window.localStorage.getItem(CHAVE_ADMIN);
	if (!salvo) {
		return null;
	}

	try {
		const credenciais = JSON.parse(salvo) as CredenciaisAdmin;
		if (!credenciais.email || !credenciais.senha) {
			return null;
		}
		return credenciais;
	} catch {
		return null;
	}
}

function salvarCredenciais(credenciais: CredenciaisAdmin) {
	window.localStorage.setItem(CHAVE_ADMIN, JSON.stringify(credenciais));
}

function limparCredenciais() {
	window.localStorage.removeItem(CHAVE_ADMIN);
}

async function requisitarApiPedido(payload: unknown) {
	const resposta = await fetch("/api/pedido", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const dados = (await resposta.json()) as {
		ok?: boolean;
		erro?: string;
		pedidos?: PedidoAdmin[];
		pedido?: PedidoAdmin;
	};
	return { resposta, dados };
}

async function requisitarApiProduto(payload: unknown) {
	const resposta = await fetch("/api/produto", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const dados = (await resposta.json()) as {
		erro?: string;
		produtos?: ProdutoAdmin[];
		produto?: ProdutoAdmin;
	};
	return { resposta, dados };
}

function normalizarPrecoDigitado(valor: string) {
	return Number(valor.replace(",", ".").trim());
}

export default function Admin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [credenciais, setCredenciais] = useState<CredenciaisAdmin | null>(null);
	const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
	const [statusSelecionado, setStatusSelecionado] = useState<Record<string, string>>({});
	const [filtroStatus, setFiltroStatus] = useState("");
	const [buscaCliente, setBuscaCliente] = useState("");
	const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
	const [precoEditado, setPrecoEditado] = useState<Record<string, string>>({});
	const [ativoEditado, setAtivoEditado] = useState<Record<string, boolean>>({});
	const [carregando, setCarregando] = useState(false);
	const [erro, setErro] = useState("");
	const [mensagem, setMensagem] = useState("");

	const pedidosFiltrados = pedidos.filter(
		(pedido) =>
			filtrarPorStatus(pedido, filtroStatus) &&
			filtrarPorCliente(pedido, buscaCliente),
	);
	async function carregarPedidos(cred: CredenciaisAdmin) {
		setCarregando(true);
		setErro("");
		try {
			const { resposta, dados } = await requisitarApiPedido({
				intent: "admin_listar_todos",
				email: cred.email,
				senha: cred.senha,
			});
			if (!resposta.ok || !dados.pedidos) {
				setErro(dados.erro ?? "Nao foi possivel carregar pedidos.");
				return;
			}

			setPedidos(dados.pedidos);
			setStatusSelecionado(
				Object.fromEntries(dados.pedidos.map((pedido) => [pedido.id, pedido.status])),
			);
		} finally {
			setCarregando(false);
		}
	}

	async function carregarProdutos(cred: CredenciaisAdmin) {
		setCarregando(true);
		setErro("");
		try {
			const { resposta, dados } = await requisitarApiProduto({
				intent: "admin_listar_produtos",
				email: cred.email,
				senha: cred.senha,
			});
			if (!resposta.ok || !dados.produtos) {
				setErro(dados.erro ?? "Nao foi possivel carregar produtos.");
				return;
			}

			setProdutos(dados.produtos);
			setPrecoEditado(
				Object.fromEntries(
					dados.produtos.map((produto) => [produto.id, String(produto.preco)]),
				),
			);
			setAtivoEditado(
				Object.fromEntries(
					dados.produtos.map((produto) => [produto.id, produto.ativo]),
				),
			);
		} finally {
			setCarregando(false);
		}
	}

	useEffect(() => {
		const salvas = carregarCredenciaisSalvas();
		if (!salvas) {
			return;
		}
		setCredenciais(salvas);
		setEmail(salvas.email);
		setSenha(salvas.senha);
		void carregarPedidos(salvas);
		void carregarProdutos(salvas);
	}, []);

	async function fazerLogin() {
		if (!email.trim() || !senha.trim()) {
			setErro("Informe e-mail e senha do administrador.");
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const cred = { email: email.trim(), senha: senha.trim() };
			const { resposta, dados } = await requisitarApiPedido({
				intent: "admin_login",
				email: cred.email,
				senha: cred.senha,
			});
			if (!resposta.ok || !dados.ok) {
				setErro(dados.erro ?? "Credenciais invalidas.");
				return;
			}

			salvarCredenciais(cred);
			setCredenciais(cred);
			await Promise.all([carregarPedidos(cred), carregarProdutos(cred)]);
		} finally {
			setCarregando(false);
		}
	}

	function sair() {
		limparCredenciais();
		setCredenciais(null);
		setPedidos([]);
		setProdutos([]);
		setErro("");
		setMensagem("");
	}

	async function atualizarStatus(pedidoId: string) {
		if (!credenciais) {
			return;
		}

		const status = statusSelecionado[pedidoId];
		if (!status || !ehStatusPedidoAdmin(status)) {
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const { resposta, dados } = await requisitarApiPedido({
				intent: "admin_atualizar_status",
				email: credenciais.email,
				senha: credenciais.senha,
				pedidoId,
				status,
			});
			if (!resposta.ok) {
				setErro(dados.erro ?? "Nao foi possivel atualizar o status.");
				return;
			}

			setMensagem("Status atualizado com sucesso.");
			await carregarPedidos(credenciais);
		} finally {
			setCarregando(false);
		}
	}

	async function atualizarProduto(produtoId: string) {
		if (!credenciais) {
			return;
		}

		const preco = normalizarPrecoDigitado(precoEditado[produtoId] ?? "");
		const ativo = ativoEditado[produtoId] ?? true;
		if (!Number.isFinite(preco) || preco < 0) {
			setErro("Informe um preco valido para o produto.");
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const { resposta, dados } = await requisitarApiProduto({
				intent: "admin_atualizar_produto",
				email: credenciais.email,
				senha: credenciais.senha,
				produtoId,
				preco,
				ativo,
			});
			if (!resposta.ok || !dados.produto) {
				setErro(dados.erro ?? "Nao foi possivel atualizar o produto.");
				return;
			}

			setMensagem("Produto atualizado com sucesso.");
			await carregarProdutos(credenciais);
		} finally {
			setCarregando(false);
		}
	}

	async function atualizarProdutosFiltrados(produtoIds: string[]) {
		if (!credenciais || produtoIds.length === 0) {
			return;
		}

		const idsUnicos = Array.from(new Set(produtoIds));
		const idsComPrecoInvalido = idsUnicos.filter((produtoId) => {
			const preco = normalizarPrecoDigitado(precoEditado[produtoId] ?? "");
			return !Number.isFinite(preco) || preco < 0;
		});
		if (idsComPrecoInvalido.length > 0) {
			setErro(
				`Existem ${idsComPrecoInvalido.length} produto(s) filtrados com preco invalido.`,
			);
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const resultados = await Promise.all(
				idsUnicos.map(async (produtoId) => {
					const preco = normalizarPrecoDigitado(precoEditado[produtoId] ?? "");
					const ativo = ativoEditado[produtoId] ?? true;
					const { resposta, dados } = await requisitarApiProduto({
						intent: "admin_atualizar_produto",
						email: credenciais.email,
						senha: credenciais.senha,
						produtoId,
						preco,
						ativo,
					});

					if (!resposta.ok || !dados.produto) {
						return {
							ok: false,
							erro: dados.erro ?? "Nao foi possivel atualizar o produto.",
						};
					}

					return { ok: true, erro: "" };
				}),
			);

			const falhas = resultados.filter((resultado) => !resultado.ok);
			const totalSucessos = resultados.length - falhas.length;

			if (totalSucessos > 0) {
				await carregarProdutos(credenciais);
			}

			if (falhas.length > 0) {
				const primeiraFalha = falhas[0];
				setErro(
					`${falhas.length} produto(s) nao foram atualizados. ${primeiraFalha?.erro ?? ""}`.trim(),
				);
				if (totalSucessos > 0) {
					setMensagem(`${totalSucessos} produto(s) atualizados com sucesso.`);
				}
				return;
			}

			setMensagem(`${totalSucessos} produto(s) atualizados com sucesso.`);
		} finally {
			setCarregando(false);
		}
	}

	return (
		<>
			<NavbarAdmin
				aoIrParaLoja={() => navigate("/")}
				aoAtualizar={() => {
					if (credenciais) {
						void carregarPedidos(credenciais);
						void carregarProdutos(credenciais);
					}
				}}
				aoSair={sair}
				carregando={carregando}
				logado={Boolean(credenciais)}
			/>
			<div className='mx-auto flex min-h-screen w-full max-w-7xl items-start px-4 pb-10 pt-24'>
				<Card className='w-full'>
					<CardContent className='space-y-4 pt-6'>
						<div>
							<h1 className='text-2xl font-semibold'>Painel administrativo</h1>
							<p className='text-sm text-muted-foreground'>
								Gerencie pedidos e atualize status.
							</p>
						</div>

						{!credenciais ? (
							<div className='space-y-3 rounded-md border p-4'>
								<Input
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder='E-mail administrador'
									type='email'
								/>
								<Input
									value={senha}
									onChange={(event) => setSenha(event.target.value)}
									placeholder='Senha administrador'
									type='password'
								/>
								<Button type='button' onClick={fazerLogin} disabled={carregando}>
									{carregando ? "Entrando..." : "Entrar"}
								</Button>
							</div>
						) : (
							<div className='space-y-3'>
								<div className='flex flex-wrap gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => void carregarPedidos(credenciais)}
										disabled={carregando}>
										Atualizar lista
									</Button>
									<Button type='button' variant='outline' onClick={sair}>
										Sair do admin
									</Button>
								</div>
								<Tabs defaultValue='pedidos' className='w-full'>
									<TabsList>
										<TabsTrigger value='pedidos'>Pedidos</TabsTrigger>
										<TabsTrigger value='produtos'>Produtos</TabsTrigger>
									</TabsList>
									<TabsContent value='pedidos' className='space-y-3'>
										<div className='grid gap-2 rounded-md border p-3 sm:grid-cols-2'>
											<select
												value={filtroStatus}
												onChange={(event) => setFiltroStatus(event.target.value)}
												className='h-10 rounded-md border bg-background px-3 text-sm'>
												<option value=''>Todos os status</option>
												{STATUS_PEDIDO.map((status) => (
													<option key={status} value={status}>
														{formatarStatus(status)}
													</option>
												))}
											</select>
											<Input
												value={buscaCliente}
												onChange={(event) => setBuscaCliente(event.target.value)}
												placeholder='Buscar por cliente (nome, e-mail, telefone)'
											/>
										</div>
										<ListaPedidosAdmin
											pedidos={pedidosFiltrados}
											statusSelecionado={statusSelecionado}
											carregando={carregando}
											onAlterarStatus={(pedidoId, status) =>
												setStatusSelecionado((atual) => ({
													...atual,
													[pedidoId]: status,
												}))
											}
											onSalvarStatus={(pedidoId) => {
												void atualizarStatus(pedidoId);
											}}
										/>
									</TabsContent>
									<TabsContent value='produtos' className='space-y-3'>
										<ProdutosDataTable
											produtos={produtos}
											precoEditado={precoEditado}
											ativoEditado={ativoEditado}
											carregando={carregando}
											onAtualizarPreco={(produtoId, valor) =>
												setPrecoEditado((atual) => ({
													...atual,
													[produtoId]: valor,
												}))
											}
											onAtualizarAtivo={(produtoId, ativo) =>
												setAtivoEditado((atual) => ({
													...atual,
													[produtoId]: ativo,
												}))
											}
											onSalvarProduto={(produtoId) => {
												void atualizarProduto(produtoId);
											}}
											onSalvarProdutosFiltrados={(produtoIds) => {
												void atualizarProdutosFiltrados(produtoIds);
											}}
										/>
									</TabsContent>
								</Tabs>
							</div>
						)}

						{erro ? <p className='text-sm text-destructive'>{erro}</p> : null}
						{mensagem ? <p className='text-sm text-emerald-700'>{mensagem}</p> : null}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
