import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export type CadastroCliente = {
	nome: string;
	email: string;
	telefone: string;
	endereco: string;
	observacoes: string;
};

export type CadastroClienteComSenha = CadastroCliente & {
	senha: string;
};

type CadastroClienteDialogProps = {
	aberto: boolean;
	cadastroInicial: CadastroCliente | null;
	estaLogado: boolean;
	aoAlterarAberto: (aberto: boolean) => void;
	estaSalvando: boolean;
	estaEntrando: boolean;
	aoSalvar: (cadastro: CadastroClienteComSenha) => Promise<void>;
	aoEntrarComEmailESenha: (
		email: string,
		senha: string,
	) => Promise<CadastroCliente | null>;
	aoSolicitarRecuperacao: (email: string) => Promise<boolean>;
	aoDeslogar: () => void;
};

function criarCadastroVazio(): CadastroCliente {
	return {
		nome: "",
		email: "",
		telefone: "",
		endereco: "",
		observacoes: "",
	};
}

function validarCadastro(cadastro: CadastroCliente) {
	if (!cadastro.nome.trim()) {
		return "Informe o nome completo.";
	}
	if (!cadastro.telefone.trim()) {
		return "Informe um telefone para contato.";
	}
	if (!cadastro.endereco.trim()) {
		return "Informe o endereco de entrega.";
	}
	if (!cadastro.email.trim()) {
		return "Informe um e-mail.";
	}

	return "";
}

export function CadastroClienteDialog({
	aberto,
	cadastroInicial,
	estaLogado,
	aoAlterarAberto,
	estaSalvando,
	estaEntrando,
	aoSalvar,
	aoEntrarComEmailESenha,
	aoSolicitarRecuperacao,
	aoDeslogar,
}: CadastroClienteDialogProps) {
	const [cadastro, setCadastro] = useState<CadastroCliente>(criarCadastroVazio());
	const [senha, setSenha] = useState("");
	const [mensagem, setMensagem] = useState("");
	const [erro, setErro] = useState("");

	useEffect(() => {
		setCadastro(cadastroInicial ?? criarCadastroVazio());
		setSenha("");
		setMensagem("");
		setErro("");
	}, [aberto, cadastroInicial]);

	function atualizarCampo(campo: keyof CadastroCliente, valor: string) {
		setCadastro((atual) => ({ ...atual, [campo]: valor }));
		if (erro) {
			setErro("");
		}
		if (mensagem) {
			setMensagem("");
		}
	}

	async function entrarComEmailESenha() {
		const email = cadastro.email.trim();
		if (!email) {
			setErro("Informe um e-mail para entrar.");
			return;
		}
		if (!senha.trim()) {
			setErro("Informe a senha para entrar.");
			return;
		}

		const cliente = await aoEntrarComEmailESenha(email, senha);
		if (!cliente) {
			setErro(
				"E-mail ou senha invalidos. Se ainda nao tiver conta, complete os dados para cadastrar.",
			);
			return;
		}

		setCadastro(cliente);
		setErro("");
	}

	async function solicitarRecuperacao() {
		const email = cadastro.email.trim();
		if (!email) {
			setErro("Informe o e-mail para recuperar a senha.");
			return;
		}

		const ok = await aoSolicitarRecuperacao(email);
		if (!ok) {
			setErro("Nao foi possivel enviar as instrucoes agora. Tente novamente.");
			return;
		}

		setMensagem(
			"Se o e-mail estiver cadastrado, enviamos as instrucoes para trocar a senha.",
		);
		setErro("");
	}

	async function salvarCadastro() {
		const erroValidacao = validarCadastro(cadastro);
		if (erroValidacao) {
			setErro(erroValidacao);
			return;
		}
		if (!senha.trim()) {
			setErro("Informe uma senha para cadastrar ou atualizar a conta.");
			return;
		}

		await aoSalvar({
			nome: cadastro.nome.trim(),
			email: cadastro.email.trim(),
			senha: senha.trim(),
			telefone: cadastro.telefone.trim(),
			endereco: cadastro.endereco.trim(),
			observacoes: cadastro.observacoes.trim(),
		});
	}

	return (
		<Dialog open={aberto} onOpenChange={aoAlterarAberto}>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Cadastro do cliente</DialogTitle>
					<DialogDescription>
						Entre com e-mail e senha ou preencha os dados para criar a conta.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-3'>
					<div className='space-y-1.5'>
						<label htmlFor='cliente-nome' className='text-sm font-medium'>
							Nome
						</label>
						<Input
							id='cliente-nome'
							value={cadastro.nome}
							onChange={(event) => atualizarCampo("nome", event.target.value)}
							placeholder='Nome completo'
						/>
					</div>
					<div className='space-y-1.5'>
						<label htmlFor='cliente-email' className='text-sm font-medium'>
							E-mail
						</label>
						<div className='flex gap-2'>
							<Input
								id='cliente-email'
								type='email'
								value={cadastro.email}
								onChange={(event) =>
									atualizarCampo("email", event.target.value)
								}
								placeholder='cliente@email.com'
							/>
							<Button
								type='button'
								variant='outline'
								onClick={entrarComEmailESenha}
								disabled={estaEntrando || estaSalvando}>
								{estaEntrando ? "Entrando..." : "Entrar"}
							</Button>
						</div>
					</div>
					<div className='space-y-1.5'>
						<label htmlFor='cliente-senha' className='text-sm font-medium'>
							Senha
						</label>
						<Input
							id='cliente-senha'
							type='password'
							value={senha}
							onChange={(event) => setSenha(event.target.value)}
							placeholder='Digite sua senha'
						/>
					</div>
					<div className='flex justify-start'>
						<Button type='button' variant='outline' onClick={solicitarRecuperacao}>
							Trocar senha
						</Button>
					</div>
					<div className='space-y-1.5'>
						<label htmlFor='cliente-telefone' className='text-sm font-medium'>
							Telefone
						</label>
						<Input
							id='cliente-telefone'
							value={cadastro.telefone}
							onChange={(event) =>
								atualizarCampo("telefone", event.target.value)
							}
							placeholder='(61) 99999-9999'
						/>
					</div>
					<div className='space-y-1.5'>
						<label htmlFor='cliente-endereco' className='text-sm font-medium'>
							Endereco de entrega
						</label>
						<Textarea
							id='cliente-endereco'
							value={cadastro.endereco}
							onChange={(event) =>
								atualizarCampo("endereco", event.target.value)
							}
							placeholder='Rua, numero, bairro e cidade'
						/>
					</div>
					<div className='space-y-1.5'>
						<label htmlFor='cliente-observacoes' className='text-sm font-medium'>
							Observacoes (opcional)
						</label>
						<Textarea
							id='cliente-observacoes'
							value={cadastro.observacoes}
							onChange={(event) =>
								atualizarCampo("observacoes", event.target.value)
							}
							placeholder='Ponto de referencia, horario, etc.'
						/>
					</div>
					{erro ? <p className='text-sm text-destructive'>{erro}</p> : null}
					{mensagem ? <p className='text-sm text-emerald-600'>{mensagem}</p> : null}
				</div>

				<DialogFooter>
					{estaLogado ? (
						<Button type='button' variant='outline' onClick={aoDeslogar}>
							Deslogar
						</Button>
					) : null}
					<Button type='button' variant='outline' onClick={() => aoAlterarAberto(false)}>
						Cancelar
					</Button>
					<Button
						type='button'
						onClick={salvarCadastro}
						disabled={estaSalvando || estaEntrando}>
						{estaSalvando ? "Salvando..." : "Salvar cadastro"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
