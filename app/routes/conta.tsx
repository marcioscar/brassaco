import type { Route } from "./+types/conta";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

type ModoConta = "login" | "cadastro";

type ClienteLogado = {
	id: string;
	nome: string;
	email: string;
	cpf: string;
	cep: string;
	telefone: string;
	endereco: string;
	observacoes: string;
};

type CadastroClienteComSenha = {
	nome: string;
	email: string;
	cpf: string;
	cep: string;
	telefone: string;
	endereco: string;
	observacoes: string;
	senha: string;
};

type FormularioCadastro = Omit<CadastroClienteComSenha, "senha">;
type ItemPedidoResumo = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	quantidade: number;
};
type PedidoResumo = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	itens: ItemPedidoResumo[];
};

const CHAVE_CLIENTE_ID = "bel:cliente-id:v1";

function criarFormularioVazio(): FormularioCadastro {
	return {
		nome: "",
		email: "",
		cpf: "",
		cep: "",
		telefone: "",
		endereco: "",
		observacoes: "",
	};
}

function normalizarCpf(cpf: string) {
	return cpf.replace(/\D/g, "");
}

function normalizarCep(cep: string) {
	return cep.replace(/\D/g, "");
}

function formatarCpf(cpf: string) {
	const digitos = normalizarCpf(cpf).slice(0, 11);
	if (digitos.length <= 3) {
		return digitos;
	}
	if (digitos.length <= 6) {
		return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
	}
	if (digitos.length <= 9) {
		return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
	}
	return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

function formatarCep(cep: string) {
	const digitos = normalizarCep(cep).slice(0, 8);
	if (digitos.length <= 5) {
		return digitos;
	}
	return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function validarLogin(email: string, senha: string) {
	if (!email.trim()) {
		return "Informe o e-mail para entrar.";
	}
	if (!senha.trim()) {
		return "Informe a senha para entrar.";
	}
	return "";
}

function validarCadastro(
	cadastro: FormularioCadastro,
	numeroEndereco: string,
	senha: string,
) {
	if (!cadastro.nome.trim()) {
		return "Informe o nome completo.";
	}
	if (!cadastro.email.trim()) {
		return "Informe o e-mail.";
	}
	if (normalizarCpf(cadastro.cpf).length !== 11) {
		return "Informe um CPF valido.";
	}
	if (normalizarCep(cadastro.cep).length !== 8) {
		return "Informe um CEP valido.";
	}
	if (!cadastro.telefone.trim()) {
		return "Informe um telefone para contato.";
	}
	if (!cadastro.endereco.trim()) {
		return "Informe o endereco de entrega.";
	}
	if (!numeroEndereco.trim()) {
		return "Informe o numero do endereco.";
	}
	if (!senha.trim()) {
		return "Informe uma senha para criar a conta.";
	}
	return "";
}

type EnderecoViaCep = {
	logradouro?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
	erro?: boolean;
};

function montarEnderecoViaCep(endereco: EnderecoViaCep) {
	const partes = [
		endereco.logradouro?.trim(),
		endereco.bairro?.trim(),
		endereco.localidade?.trim(),
		endereco.uf?.trim(),
	].filter(Boolean);

	return partes.join(", ");
}

function montarEnderecoCompleto(
	enderecoBase: string,
	numeroEndereco: string,
	complementoEndereco: string,
) {
	const base = enderecoBase.trim();
	const numero = numeroEndereco.trim();
	const complemento = complementoEndereco.trim();
	const partes = [base, numero ? `Nº ${numero}` : "", complemento].filter(Boolean);
	return partes.join(", ");
}

async function requisitarCliente(payload: unknown) {
	const resposta = await fetch("/api/cliente", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	const dados = (await resposta.json()) as {
		ok?: boolean;
		erro?: string;
		cliente?: ClienteLogado | null;
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
		pedidos?: PedidoResumo[];
		erro?: string;
	};

	return { resposta, dados };
}

function possuirClienteLogadoValido(
	cliente: ClienteLogado | null,
): cliente is ClienteLogado {
	return Boolean(cliente?.id && cliente.nome && cliente.email);
}

function obterRotaRetorno(next: string | null) {
	if (next === "checkout") {
		return "/";
	}

	return "/";
}

function formatarPreco(preco: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(preco);
}

function formatarData(dataIso: string) {
	const data = new Date(dataIso);
	if (Number.isNaN(data.getTime())) {
		return "";
	}

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(data);
}

function formatarStatus(status: string) {
	switch (status) {
		case "AGUARDANDO_CONFIRMACAO":
			return "Aguardando confirmacao";
		case "EM_SEPARACAO":
			return "Em separacao";
		case "EM_ROTA":
			return "Em rota";
		case "ENTREGUE":
			return "Entregue";
		case "CANCELADO":
			return "Cancelado";
		default:
			return status;
	}
}

function obterCorStatus(status: string) {
	if (status === "AGUARDANDO_CONFIRMACAO") {
		return "#84370B";
	}

	return "#E5E7EB";
}

function obterCorTextoStatus(status: string) {
	if (status === "AGUARDANDO_CONFIRMACAO") {
		return "#FFFFFF";
	}

	return "#111827";
}

export function meta({}: Route.MetaArgs) {
	return [{ title: "Minha conta | Brassaco Embalagens" }];
}

function NavbarConta({ aoIrParaLoja }: { aoIrParaLoja: () => void }) {
	return (
		<header className='fixed inset-x-0 top-0 z-50 border-b bg-background/90 backdrop-blur'>
			<div className='mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4'>
				<Button
					type='button'
					onClick={aoIrParaLoja}
					variant='ghost'
					size='sm'
					className='shrink-0 p-1'
					aria-label='Ir para inicio'>
					<img src='/logo_bel.svg' alt='BEL' className='h-8 w-auto' />
				</Button>
				<div className='ml-auto'>
					<Button type='button' variant='ghost' onClick={aoIrParaLoja}>
						Loja
					</Button>
				</div>
			</div>
		</header>
	);
}

export default function ContaRoute() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [modo, setModo] = useState<ModoConta>("login");
	const [clienteLogado, setClienteLogado] = useState<ClienteLogado | null>(
		null,
	);
	const [cadastro, setCadastro] = useState<FormularioCadastro>(
		criarFormularioVazio(),
	);
	const [senha, setSenha] = useState("");
	const [carregando, setCarregando] = useState(false);
	const [mensagem, setMensagem] = useState("");
	const [erro, setErro] = useState("");
	const [carregandoCep, setCarregandoCep] = useState(false);
	const [numeroEndereco, setNumeroEndereco] = useState("");
	const [complementoEndereco, setComplementoEndereco] = useState("");
	const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
	const [carregandoPedidos, setCarregandoPedidos] = useState(false);
	const [erroPedidos, setErroPedidos] = useState("");
	const [pedidoExpandidoId, setPedidoExpandidoId] = useState<string | null>(null);

	async function carregarPedidosDoCliente(clienteId: string) {
		setCarregandoPedidos(true);
		setErroPedidos("");
		try {
			const { resposta, dados } = await requisitarPedido({
				intent: "listar",
				clienteId,
			});
			if (!resposta.ok || !dados.pedidos) {
				setPedidos([]);
				setErroPedidos("Nao foi possivel carregar seus pedidos.");
				return;
			}

			setPedidos(dados.pedidos);
		} catch {
			setPedidos([]);
			setErroPedidos("Nao foi possivel carregar seus pedidos.");
		} finally {
			setCarregandoPedidos(false);
		}
	}

	useEffect(() => {
		const clienteId = window.localStorage.getItem(CHAVE_CLIENTE_ID);
		if (!clienteId) {
			return;
		}

		async function carregarClienteAtual() {
			try {
				const { resposta, dados } = await requisitarCliente({
					intent: "login_por_id",
					id: clienteId,
				});

				if (
					!resposta.ok ||
					!dados.cliente ||
					!possuirClienteLogadoValido(dados.cliente)
				) {
					window.localStorage.removeItem(CHAVE_CLIENTE_ID);
					return;
				}

				setClienteLogado(dados.cliente);
				setCadastro({
					nome: dados.cliente.nome,
					email: dados.cliente.email,
					cpf: formatarCpf(dados.cliente.cpf ?? ""),
					cep: formatarCep(dados.cliente.cep ?? ""),
					telefone: dados.cliente.telefone,
					endereco: dados.cliente.endereco,
					observacoes: dados.cliente.observacoes,
				});
				await carregarPedidosDoCliente(dados.cliente.id);
			} catch {
				window.localStorage.removeItem(CHAVE_CLIENTE_ID);
			}
		}

		void carregarClienteAtual();
	}, []);

	function atualizarCampo(campo: keyof FormularioCadastro, valor: string) {
		setCadastro((atual) => ({ ...atual, [campo]: valor }));
		setErro("");
		setMensagem("");
	}

	function atualizarNumeroEndereco(valor: string) {
		setNumeroEndereco(valor);
		setErro("");
		setMensagem("");
	}

	function atualizarComplementoEndereco(valor: string) {
		setComplementoEndereco(valor);
		setErro("");
		setMensagem("");
	}

	async function buscarEnderecoPorCep() {
		const cepLimpo = normalizarCep(cadastro.cep);
		if (cepLimpo.length !== 8) {
			setErro("Informe um CEP valido para buscar o endereco.");
			return;
		}

		setCarregandoCep(true);
		setErro("");
		try {
			const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
			if (!resposta.ok) {
				setErro("Nao foi possivel consultar o CEP agora.");
				return;
			}

			const dados = (await resposta.json()) as EnderecoViaCep;
			if (dados.erro) {
				setErro("CEP nao encontrado.");
				return;
			}

			const enderecoBase = montarEnderecoViaCep(dados);
			if (!enderecoBase) {
				setErro("Nao encontramos endereco para esse CEP.");
				return;
			}

			setCadastro((atual) => ({ ...atual, endereco: enderecoBase }));
			setMensagem(
				"Endereco preenchido pelo CEP. Complete com numero e complemento, se necessario.",
			);
		} catch {
			setErro("Nao foi possivel consultar o CEP agora.");
		} finally {
			setCarregandoCep(false);
		}
	}

	function guardarSessao(cliente: ClienteLogado) {
		window.localStorage.setItem(CHAVE_CLIENTE_ID, cliente.id);
		setClienteLogado(cliente);
	}

	async function iniciarSessao(cliente: ClienteLogado) {
		guardarSessao(cliente);
		await carregarPedidosDoCliente(cliente.id);
	}

	function redirecionarAposSucesso() {
		const next = searchParams.get("next");
		navigate(obterRotaRetorno(next));
	}

	async function entrar() {
		const erroValidacao = validarLogin(cadastro.email, senha);
		if (erroValidacao) {
			setErro(erroValidacao);
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const { resposta, dados } = await requisitarCliente({
				intent: "login_por_email_senha",
				email: cadastro.email.trim(),
				senha: senha.trim(),
			});

			if (
				!resposta.ok ||
				!dados.cliente ||
				!possuirClienteLogadoValido(dados.cliente)
			) {
				setErro("E-mail ou senha invalidos.");
				return;
			}

			await iniciarSessao(dados.cliente);
			redirecionarAposSucesso();
		} catch {
			setErro("Nao foi possivel entrar agora. Tente novamente.");
		} finally {
			setCarregando(false);
		}
	}

	async function cadastrar() {
		const erroValidacao = validarCadastro(cadastro, numeroEndereco, senha);
		if (erroValidacao) {
			setErro(erroValidacao);
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const payload: CadastroClienteComSenha = {
				nome: cadastro.nome.trim(),
				email: cadastro.email.trim(),
				cpf: normalizarCpf(cadastro.cpf),
				cep: normalizarCep(cadastro.cep),
				telefone: cadastro.telefone.trim(),
				endereco: montarEnderecoCompleto(
					cadastro.endereco,
					numeroEndereco,
					complementoEndereco,
				),
				observacoes: cadastro.observacoes.trim(),
				senha: senha.trim(),
			};
			const { resposta, dados } = await requisitarCliente({
				intent: "salvar",
				...payload,
			});

			if (
				!resposta.ok ||
				!dados.cliente ||
				!possuirClienteLogadoValido(dados.cliente)
			) {
				setErro(dados.erro ?? "Nao foi possivel criar a conta.");
				return;
			}

			await iniciarSessao(dados.cliente);
			redirecionarAposSucesso();
		} catch {
			setErro("Nao foi possivel criar a conta agora. Tente novamente.");
		} finally {
			setCarregando(false);
		}
	}

	async function solicitarRecuperacaoSenha() {
		if (!cadastro.email.trim()) {
			setErro("Informe o e-mail para receber o link de troca de senha.");
			return;
		}

		setCarregando(true);
		setErro("");
		setMensagem("");
		try {
			const { resposta, dados } = await requisitarCliente({
				intent: "solicitar_recuperacao",
				email: cadastro.email.trim(),
			});
			if (!resposta.ok || !dados.ok) {
				setErro("Nao foi possivel enviar o link agora. Tente novamente.");
				return;
			}

			setMensagem(
				"Se o e-mail estiver cadastrado, enviamos um link para troca de senha.",
			);
		} catch {
			setErro("Nao foi possivel enviar o link agora. Tente novamente.");
		} finally {
			setCarregando(false);
		}
	}

	function deslogar() {
		window.localStorage.removeItem(CHAVE_CLIENTE_ID);
		setClienteLogado(null);
		setPedidos([]);
		setErroPedidos("");
		setPedidoExpandidoId(null);
		setCadastro(criarFormularioVazio());
		setNumeroEndereco("");
		setComplementoEndereco("");
		setSenha("");
		setMensagem("Sessao encerrada.");
		setErro("");
	}

	return (
		<>
			<NavbarConta aoIrParaLoja={() => navigate("/")} />
			<div className='mx-auto flex min-h-screen w-full max-w-3xl items-start px-4 pb-10 pt-24'>
				<Card className='w-full'>
					<CardContent className='space-y-5 pt-6'>
					<div className='space-y-1'>
						<h1 className='text-2xl font-semibold'>Minha conta</h1>
						<p className='text-sm text-muted-foreground'>
							Entre com e-mail e senha. Se ainda nao tiver conta, faca seu
							cadastro.
						</p>
					</div>

					{clienteLogado ? (
						<div className='space-y-4 rounded-md border p-4'>
							<div className='text-sm'>
								<p className='font-medium'>{clienteLogado.nome}</p>
								<p className='text-muted-foreground'>{clienteLogado.email}</p>
								<p className='text-muted-foreground'>
									CPF: {formatarCpf(clienteLogado.cpf ?? "")}
								</p>
								<p className='text-muted-foreground'>
									CEP: {formatarCep(clienteLogado.cep ?? "")}
								</p>
								<p className='text-muted-foreground'>
									{clienteLogado.telefone}
								</p>
							</div>
							<div className='space-y-2 rounded-md border p-3'>
								<p className='text-sm font-medium'>Meus pedidos</p>
								{carregandoPedidos ? (
									<p className='text-sm text-muted-foreground'>
										Carregando pedidos...
									</p>
								) : null}
								{erroPedidos ? (
									<p className='text-sm text-destructive'>{erroPedidos}</p>
								) : null}
								{!carregandoPedidos && !erroPedidos && pedidos.length === 0 ? (
									<p className='text-sm text-muted-foreground'>
										Voce ainda nao tem pedidos.
									</p>
								) : null}
								{!carregandoPedidos && pedidos.length > 0 ? (
									<ul className='space-y-2 text-sm'>
										{pedidos.map((pedido) => (
											<li
												key={pedido.id}
												className='space-y-2 rounded border p-2'>
												<div className='flex flex-wrap items-center gap-2'>
													<span className='font-medium'>
														#{pedido.id.slice(-6).toUpperCase()}
													</span>
													<span
														className='rounded px-2 py-0.5 text-xs font-medium text-foreground'
														style={{
															backgroundColor: obterCorStatus(pedido.status),
															color: obterCorTextoStatus(pedido.status),
														}}>
														{formatarStatus(pedido.status)}
													</span>
													<span className='text-muted-foreground'>-</span>
													<span>{formatarPreco(pedido.total)}</span>
													<span className='text-muted-foreground'>-</span>
													<span className='text-muted-foreground'>
														{formatarData(pedido.createdAt)}
													</span>
													<Button
														type='button'
														variant='outline'
														size='sm'
														className='ml-auto'
														onClick={() =>
															setPedidoExpandidoId((atual) =>
																atual === pedido.id ? null : pedido.id,
															)
														}>
														{pedidoExpandidoId === pedido.id
															? "Ocultar produtos"
															: "Ver produtos"}
													</Button>
												</div>
												{pedidoExpandidoId === pedido.id ? (
													<div className='rounded bg-muted/40 p-2 text-xs text-muted-foreground'>
														{pedido.itens.length > 0 ? (
															<ul className='space-y-1'>
																{pedido.itens.map((item) => (
																	<li key={`${pedido.id}-${item.id}`}>
																		{item.quantidade}x {item.descricao} (
																		{formatarPreco(item.preco)} /{" "}
																		{item.unidade})
																	</li>
																))}
															</ul>
														) : (
															<p>Este pedido nao possui detalhes de itens.</p>
														)}
													</div>
												) : null}
											</li>
										))}
									</ul>
								) : null}
							</div>
							<div className='flex flex-wrap gap-2'>
								<Button type='button' onClick={() => navigate("/")}>
									Voltar para loja
								</Button>
								<Button type='button' variant='outline' onClick={deslogar}>
									Sair
								</Button>
							</div>
						</div>
					) : (
						<>
							<div className='text-sm text-muted-foreground'>
								{modo === "login" ? (
									<>
										Nao tem conta?{" "}
										<Button
											type='button'
											variant='link'
											className='h-auto p-0 text-sm'
											onClick={() => setModo("cadastro")}>
											Criar conta
										</Button>
									</>
								) : (
									<>
										Ja tem conta?{" "}
										<Button
											type='button'
											variant='link'
											className='h-auto p-0 text-sm'
											onClick={() => setModo("login")}>
											Entrar
										</Button>
									</>
								)}
							</div>

							<div className='space-y-3'>
								{modo === "cadastro" ? (
									<>
										<Input
											value={cadastro.nome}
											onChange={(event) =>
												atualizarCampo("nome", event.target.value)
											}
											placeholder='Nome completo'
										/>
										<Input
											value={cadastro.cpf}
											onChange={(event) =>
												atualizarCampo("cpf", formatarCpf(event.target.value))
											}
											placeholder='CPF'
											inputMode='numeric'
										/>
										<div className='flex gap-2'>
											<Input
												value={cadastro.cep}
												onChange={(event) =>
													atualizarCampo(
														"cep",
														formatarCep(event.target.value),
													)
												}
												placeholder='CEP'
												inputMode='numeric'
											/>
											<Button
												type='button'
												variant='outline'
												onClick={buscarEnderecoPorCep}
												disabled={carregandoCep || carregando}>
												{carregandoCep ? "Buscando..." : "Buscar CEP"}
											</Button>
										</div>
										<Input
											value={cadastro.telefone}
											onChange={(event) =>
												atualizarCampo("telefone", event.target.value)
											}
											placeholder='Telefone'
										/>
										<Input
											value={cadastro.endereco}
											onChange={(event) =>
												atualizarCampo("endereco", event.target.value)
											}
											placeholder='Endereco base (logradouro, bairro, cidade, UF)'
										/>
										<div className='grid gap-2 sm:grid-cols-2'>
											<Input
												value={numeroEndereco}
												onChange={(event) =>
													atualizarNumeroEndereco(event.target.value)
												}
												placeholder='Numero'
											/>
											<Input
												value={complementoEndereco}
												onChange={(event) =>
													atualizarComplementoEndereco(event.target.value)
												}
												placeholder='Complemento (casa, apto, bloco...)'
											/>
										</div>
										<p className='text-xs text-muted-foreground'>
											O CEP preenche o endereco base. Complete com numero e
											complemento.
										</p>
										<Textarea
											value={cadastro.observacoes}
											onChange={(event) =>
												atualizarCampo("observacoes", event.target.value)
											}
											placeholder='Observacoes (opcional)'
											rows={3}
										/>
									</>
								) : null}

								<Input
									type='email'
									value={cadastro.email}
									onChange={(event) =>
										atualizarCampo("email", event.target.value)
									}
									placeholder='E-mail'
								/>
								<Input
									type='password'
									value={senha}
									onChange={(event) => setSenha(event.target.value)}
									placeholder='Senha'
								/>
							</div>

							<div className='flex flex-wrap gap-2'>
								{modo === "login" ? (
									<Button type='button' onClick={entrar} disabled={carregando}>
										{carregando ? "Entrando..." : "Entrar"}
									</Button>
								) : (
									<Button
										type='button'
										onClick={cadastrar}
										disabled={carregando}>
										{carregando ? "Criando conta..." : "Criar conta"}
									</Button>
								)}
								<Button
									type='button'
									variant='outline'
									onClick={solicitarRecuperacaoSenha}
									disabled={carregando}>
									Trocar senha
								</Button>
								<Button
									type='button'
									variant='ghost'
									onClick={() => navigate("/")}>
									Voltar para loja
								</Button>
							</div>
						</>
					)}

					{erro ? <p className='text-sm text-destructive'>{erro}</p> : null}
					{mensagem ? (
						<p className='text-sm text-green-700'>{mensagem}</p>
					) : null}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
