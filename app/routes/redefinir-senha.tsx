import { Form, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function RedefinirSenha() {
	const [searchParams] = useSearchParams();
	const emailInicial = searchParams.get("email") ?? "";
	const codigoInicial = searchParams.get("codigo") ?? "";
	const tokenInicial = searchParams.get("token") ?? "";

	return (
		<main className='mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-4'>
			<h1 className='text-2xl font-semibold'>Redefinir senha</h1>
			<p className='text-sm text-muted-foreground'>
				Defina sua nova senha para a conta.
			</p>

			<Form
				method='post'
				className='space-y-3'
				onSubmit={async (event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);
					const email = String(formData.get("email") ?? "");
					const codigo = String(formData.get("codigo") ?? "");
					const tokenId = String(formData.get("tokenId") ?? "");
					const novaSenha = String(formData.get("novaSenha") ?? "");
					const confirmarSenha = String(formData.get("confirmarSenha") ?? "");
					if (!email || (!codigo && !tokenId)) {
						window.alert(
							"Link de recuperacao invalido. Solicite um novo link por e-mail.",
						);
						return;
					}
					if (!novaSenha || novaSenha !== confirmarSenha) {
						window.alert("As senhas devem ser iguais.");
						return;
					}

					const resposta = await fetch("/api/cliente", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							intent: "redefinir_senha",
							email,
							codigo,
							novaSenha,
							tokenId,
						}),
					});

					if (!resposta.ok) {
						const dados = (await resposta.json().catch(() => null)) as
							| { erro?: string; motivo?: string }
							| null;
						if (dados?.motivo === "codigo_invalido_ou_expirado" && email) {
							await fetch("/api/cliente", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									intent: "solicitar_recuperacao",
									email,
								}),
							});
						}
						const detalhe = dados?.motivo ? ` (${dados.motivo})` : "";
						window.alert(
							(dados?.erro ?? "Link invalido ou expirado.") +
								detalhe +
								" Enviamos um novo link para seu e-mail.",
						);
						return;
					}

					window.alert("Senha redefinida com sucesso.");
					window.location.href = "/";
				}}>
				<Input
					type='email'
					name='email'
					defaultValue={emailInicial}
					placeholder='E-mail'
					required
				/>
				<input type='hidden' name='codigo' defaultValue={codigoInicial} />
				<input type='hidden' name='tokenId' defaultValue={tokenInicial} />
				<Input
					type='password'
					name='novaSenha'
					placeholder='Nova senha'
					required
				/>
				<Input
					type='password'
					name='confirmarSenha'
					placeholder='Confirmar nova senha'
					required
				/>
				<Button type='submit' className='w-full'>
					Salvar nova senha
				</Button>
				<Button
					type='button'
					variant='outline'
					className='w-full'
					onClick={async () => {
						const emailInput = document.querySelector<HTMLInputElement>(
							"input[name='email']",
						);
						const email = emailInput?.value?.trim() ?? "";
						if (!email) {
							window.alert("Informe o e-mail para enviar um novo link.");
							return;
						}

						await fetch("/api/cliente", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								intent: "solicitar_recuperacao",
								email,
							}),
						});
						window.alert(
							"Se o e-mail estiver cadastrado, enviamos um novo link de recuperacao.",
						);
					}}>
					Enviar novo link
				</Button>
			</Form>
		</main>
	);
}
