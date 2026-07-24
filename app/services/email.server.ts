import nodemailer from "nodemailer";

type EnviarEmailRecuperacaoParams = {
	para: string;
	linkRedefinicao: string;
	codigoRecuperacao: string;
};

function obterConfiguracaoSmtp() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT ?? "465");
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const from = process.env.EMAIL_FROM;

	if (!host || !user || !pass || !from || !Number.isFinite(port)) {
		return null;
	}

	return { host, port, user, pass, from };
}

export async function enviarEmailRecuperacaoSenha({
	para,
	linkRedefinicao,
	codigoRecuperacao,
}: EnviarEmailRecuperacaoParams) {
	const config = obterConfiguracaoSmtp();
	if (!config) {
		return false;
	}

	const transporter = nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: true,
		auth: {
			user: config.user,
			pass: config.pass,
		},
	});

	await transporter.sendMail({
		from: config.from,
		to: para,
		subject: "Brassaco - Recuperacao de senha",
		text: `Recebemos uma solicitacao para trocar sua senha.\n\nCodigo de recuperacao: ${codigoRecuperacao}\n\nClique no link abaixo para redefinir:\n${linkRedefinicao}\n\nSe voce nao solicitou, ignore este e-mail.`,
		html: `
			<p>Recebemos uma solicitacao para trocar sua senha.</p>
			<p><strong>Codigo de recuperacao:</strong> ${codigoRecuperacao}</p>
			<p>
				<a href="${linkRedefinicao}" target="_blank" rel="noreferrer">
					Clique aqui para redefinir sua senha
				</a>
			</p>
			<p>Se voce nao solicitou, ignore este e-mail.</p>
		`,
	});

	return true;
}
