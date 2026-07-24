import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ResultadoComando = {
	n?: number;
	nModified?: number;
	ok?: number;
};

async function normalizarCampoInteiro(campo: "codigo" | "grupo") {
	const resultado = (await prisma.$runCommandRaw({
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
	})) as ResultadoComando;

	return resultado;
}

async function main() {
	console.log("Normalizando campos codigo e grupo em produtos_preco...");

	for (const campo of ["codigo", "grupo"] as const) {
		const resultado = await normalizarCampoInteiro(campo);
		console.log(
			`${campo}: ${resultado.nModified ?? resultado.n ?? 0} documento(s) atualizado(s)`,
		);
	}

	const teste = await prisma.produtos_preco.findMany({ take: 3, select: { codigo: true, grupo: true } });
	console.log("Amostra apos normalizacao:", teste);
}

main()
	.catch((erro) => {
		console.error("Falha ao normalizar produtos:", erro);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
