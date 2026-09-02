import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Script pontual: pedidos que o webhook da Pagar.me marcou como EM_SEPARACAO
// ao receber o pagamento passam a usar o novo status PAGO.
const db = new PrismaClient();

async function main() {
	const resultado = await db.pedidos.updateMany({
		where: { status: "EM_SEPARACAO", pagamentoStatus: "PAID" },
		data: { status: "PAGO", updatedAt: new Date() },
	});
	console.log(`pedidos atualizados: ${resultado.count}`);

	const porStatus = await db.pedidos.groupBy({ by: ["status"], _count: true });
	console.log(porStatus);
}

main()
	.catch((erro) => {
		console.error(erro);
		process.exitCode = 1;
	})
	.finally(() => db.$disconnect());
