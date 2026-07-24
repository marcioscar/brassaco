export function validarCredenciaisAdmin(email: string, senha: string) {
	const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	const adminSenha = process.env.ADMIN_PASSWORD?.trim();
	if (!adminEmail || !adminSenha) {
		return false;
	}

	return email.trim().toLowerCase() === adminEmail && senha.trim() === adminSenha;
}
