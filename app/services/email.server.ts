import nodemailer from "nodemailer";

type EnviarEmailRecuperacaoParams = {
	para: string;
	linkRedefinicao: string;
	codigoRecuperacao: string;
};

type EnviarEmailPedidoEmRotaParams = {
	para: string;
	nomeCliente?: string;
	pedidoId: string;
	total: number;
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

function criarTransportador(config: NonNullable<ReturnType<typeof obterConfiguracaoSmtp>>) {
	return nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: true,
		auth: {
			user: config.user,
			pass: config.pass,
		},
	});
}

function formatarPreco(preco: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(preco);
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

	const transporter = criarTransportador(config);

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

export async function enviarEmailPedidoEmRota({
	para,
	nomeCliente,
	pedidoId,
	total,
}: EnviarEmailPedidoEmRotaParams) {
	const config = obterConfiguracaoSmtp();
	if (!config) {
		return false;
	}

	const transporter = criarTransportador(config);
	const numeroPedido = pedidoId.slice(-6).toUpperCase();
	const saudacao = nomeCliente?.trim() ? `Ola, ${nomeCliente.trim()}!` : "Ola!";
	const totalFormatado = formatarPreco(total);

	await transporter.sendMail({
		from: config.from,
		to: para,
		subject: `Brassaco - Pedido #${numeroPedido} saiu para entrega`,
		text: `${saudacao}\n\nSeu pedido #${numeroPedido} (total ${totalFormatado}) saiu para entrega e deve chegar em breve.\n\nObrigado por comprar na Brassaco Embalagens!`,
		html: `
			<p>${saudacao}</p>
			<p>Seu pedido <strong>#${numeroPedido}</strong> (total ${totalFormatado}) saiu para entrega e deve chegar em breve.</p>
			<p>Obrigado por comprar na Brassaco Embalagens!</p>
		`,
	});

	return true;
}
