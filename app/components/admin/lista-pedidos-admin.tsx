import { useState } from "react";
import { Button } from "~/components/ui/button";

export type ItemPedidoAdmin = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	quantidade: number;
};

export type PedidoAdminLista = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	itens: ItemPedidoAdmin[];
	pagamentoStatus?: string;
	pagamentoLinkUrl?: string;
	clienteNome?: string;
	clienteEmail?: string;
	clienteTelefone?: string;
	clienteEndereco?: string;
	clienteDocumento?: string;
	observacoesCliente?: string;
};

const STATUS_PEDIDO = [
	"AGUARDANDO_CONFIRMACAO",
	"EM_SEPARACAO",
	"EM_ROTA",
	"ENTREGUE",
	"CANCELADO",
] as const;

type ListaPedidosAdminProps = {
	pedidos: PedidoAdminLista[];
	statusSelecionado: Record<string, string>;
	carregando: boolean;
	onAlterarStatus: (pedidoId: string, status: string) => void;
	onSalvarStatus: (pedidoId: string) => void;
};

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
	return status.toLowerCase().replaceAll("_", " ");
}

function calcularSubtotalItem(item: ItemPedidoAdmin) {
	return item.preco * item.quantidade;
}

function calcularSubtotalPedido(itens: ItemPedidoAdmin[]) {
	return itens.reduce((total, item) => total + calcularSubtotalItem(item), 0);
}

function DetalhesItensPedido({ itens }: { itens: ItemPedidoAdmin[] }) {
	if (itens.length === 0) {
		return (
			<p className='text-sm text-muted-foreground'>
				Este pedido nao possui itens registrados.
			</p>
		);
	}

	return (
		<div className='overflow-x-auto rounded-md border'>
			<table className='w-full text-left text-sm'>
				<thead className='border-b bg-muted/40 text-xs text-muted-foreground'>
					<tr>
						<th className='px-3 py-2 font-medium'>Codigo</th>
						<th className='px-3 py-2 font-medium'>Produto</th>
						<th className='px-3 py-2 font-medium'>Qtd</th>
						<th className='px-3 py-2 font-medium'>Unidade</th>
						<th className='px-3 py-2 font-medium'>Preco unit.</th>
						<th className='px-3 py-2 font-medium'>Subtotal</th>
					</tr>
				</thead>
				<tbody>
					{itens.map((item) => (
						<tr key={item.id} className='border-b last:border-b-0'>
							<td className='px-3 py-2'>{item.codigo}</td>
							<td className='px-3 py-2'>{item.descricao}</td>
							<td className='px-3 py-2'>{item.quantidade}</td>
							<td className='px-3 py-2'>{item.unidade}</td>
							<td className='px-3 py-2'>{formatarPreco(item.preco)}</td>
							<td className='px-3 py-2 font-medium'>
								{formatarPreco(calcularSubtotalItem(item))}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function CardPedidoAdmin({
	pedido,
	statusAtual,
	carregando,
	expandido,
	onAlternarExpansao,
	onAlterarStatus,
	onSalvarStatus,
}: {
	pedido: PedidoAdminLista;
	statusAtual: string;
	carregando: boolean;
	expandido: boolean;
	onAlternarExpansao: () => void;
	onAlterarStatus: (status: string) => void;
	onSalvarStatus: () => void;
}) {
	const subtotalItens = calcularSubtotalPedido(pedido.itens);
	const quantidadeItens = pedido.itens.reduce(
		(total, item) => total + item.quantidade,
		0,
	);

	return (
		<li className='space-y-3 rounded-md border p-3'>
			<div className='flex flex-wrap items-start justify-between gap-2'>
				<div className='space-y-1 text-sm'>
					<p className='font-medium'>
						Pedido #{pedido.id.slice(-6).toUpperCase()} —{" "}
						{formatarStatus(pedido.status)}
					</p>
					<p className='text-muted-foreground'>{formatarData(pedido.createdAt)}</p>
					<p className='text-muted-foreground'>
						Cliente: {pedido.clienteNome ?? "Sem nome"}
					</p>
					<p className='text-muted-foreground'>
						E-mail: {pedido.clienteEmail ?? "Sem e-mail"} | Telefone:{" "}
						{pedido.clienteTelefone ?? "Sem telefone"}
					</p>
					<p className='text-muted-foreground'>
						CPF/CNPJ: {pedido.clienteDocumento || "Nao informado"}
					</p>
					<p className='text-muted-foreground'>
						Endereco: {pedido.clienteEndereco || "Sem endereco"}
					</p>
					<p className='text-muted-foreground'>
						Pagamento: {pedido.pagamentoStatus ?? "PENDENTE"}
					</p>
					<p className='font-medium'>Total: {formatarPreco(pedido.total)}</p>
					<p className='text-muted-foreground'>
						{pedido.itens.length} produto(s) — {quantidadeItens} unidade(s)
					</p>
				</div>
				<Button type='button' variant='outline' size='sm' onClick={onAlternarExpansao}>
					{expandido ? "Ocultar detalhes" : "Ver detalhes"}
				</Button>
			</div>

			{expandido ? (
				<div className='space-y-3 rounded-md bg-muted/30 p-3'>
					<div>
						<p className='mb-2 text-sm font-medium'>Produtos do pedido</p>
						<DetalhesItensPedido itens={pedido.itens} />
					</div>
					<div className='flex flex-wrap gap-4 text-sm'>
						<p>
							<span className='text-muted-foreground'>Subtotal itens:</span>{" "}
							{formatarPreco(subtotalItens)}
						</p>
						<p>
							<span className='text-muted-foreground'>Total pedido:</span>{" "}
							{formatarPreco(pedido.total)}
						</p>
					</div>
					{pedido.observacoesCliente ? (
						<div className='text-sm'>
							<p className='font-medium'>Observacoes</p>
							<p className='whitespace-pre-wrap text-muted-foreground'>
								{pedido.observacoesCliente}
							</p>
						</div>
					) : null}
					{pedido.pagamentoLinkUrl ? (
						<p className='text-sm'>
							<span className='font-medium'>Link de pagamento: </span>
							<a
								href={pedido.pagamentoLinkUrl}
								target='_blank'
								rel='noreferrer'
								className='text-primary underline-offset-4 hover:underline'>
								Abrir checkout
							</a>
						</p>
					) : null}
				</div>
			) : null}

			<div className='flex flex-wrap items-center gap-2 border-t pt-3'>
				<select
					value={statusAtual}
					onChange={(event) => onAlterarStatus(event.target.value)}
					className='h-10 rounded-md border bg-background px-3 text-sm'>
					{STATUS_PEDIDO.map((status) => (
						<option key={status} value={status}>
							{formatarStatus(status)}
						</option>
					))}
				</select>
				<Button type='button' onClick={onSalvarStatus} disabled={carregando}>
					Salvar status
				</Button>
			</div>
		</li>
	);
}

export function ListaPedidosAdmin({
	pedidos,
	statusSelecionado,
	carregando,
	onAlterarStatus,
	onSalvarStatus,
}: ListaPedidosAdminProps) {
	const [pedidoExpandidoId, setPedidoExpandidoId] = useState<string | null>(null);

	if (pedidos.length === 0) {
		return (
			<p className='text-sm text-muted-foreground'>
				Nenhum pedido encontrado para os filtros informados.
			</p>
		);
	}

	return (
		<ul className='space-y-3'>
			{pedidos.map((pedido) => (
				<CardPedidoAdmin
					key={pedido.id}
					pedido={pedido}
					statusAtual={statusSelecionado[pedido.id] ?? pedido.status}
					carregando={carregando}
					expandido={pedidoExpandidoId === pedido.id}
					onAlternarExpansao={() =>
						setPedidoExpandidoId((atual) =>
							atual === pedido.id ? null : pedido.id,
						)
					}
					onAlterarStatus={(status) => onAlterarStatus(pedido.id, status)}
					onSalvarStatus={() => onSalvarStatus(pedido.id)}
				/>
			))}
		</ul>
	);
}
