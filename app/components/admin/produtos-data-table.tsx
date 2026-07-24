import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
	type PaginationState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export type ProdutoAdmin = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	grupo: number;
	nomeGrupo?: string;
	ativo: boolean;
};

type ProdutosDataTableProps = {
	produtos: ProdutoAdmin[];
	precoEditado: Record<string, string>;
	ativoEditado: Record<string, boolean>;
	carregando: boolean;
	onAtualizarPreco: (produtoId: string, valor: string) => void;
	onAtualizarAtivo: (produtoId: string, ativo: boolean) => void;
	onSalvarProduto: (produtoId: string) => void;
	onSalvarProdutosFiltrados: (produtoIds: string[]) => void;
};

function normalizarTexto(valor: string) {
	return valor
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

function filtrarProdutos(
	produtos: ProdutoAdmin[],
	buscaTexto: string,
	buscaCodigo: string,
	buscaPreco: string,
) {
	const texto = normalizarTexto(buscaTexto);
	const codigo = buscaCodigo.replace(/\D/g, "");
	const preco = buscaPreco.replace(",", ".").trim();

	return produtos.filter((produto) => {
		const correspondeCodigo = !codigo
			? true
			: String(produto.codigo).includes(codigo);
		if (!correspondeCodigo) {
			return false;
		}

		if (preco) {
			const precoProduto = produto.preco.toFixed(2);
			if (!precoProduto.includes(preco)) {
				return false;
			}
		}
		if (!texto) {
			return true;
		}

		const descricao = normalizarTexto(produto.descricao);
		const grupo = normalizarTexto(produto.nomeGrupo ?? "");
		return descricao.includes(texto) || grupo.includes(texto);
	});
}

function CelulaPreco({
	produtoId,
	valorReferencia,
	onAtualizarPreco,
}: {
	produtoId: string;
	valorReferencia: string;
	onAtualizarPreco: (produtoId: string, valor: string) => void;
}) {
	const [valor, setValor] = useState(valorReferencia);
	const editandoRef = useRef(false);

	useEffect(() => {
		if (editandoRef.current) {
			return;
		}
		setValor(valorReferencia);
	}, [valorReferencia, produtoId]);

	return (
		<Input
			value={valor}
			onFocus={() => {
				editandoRef.current = true;
			}}
			onBlur={() => {
				editandoRef.current = false;
			}}
			onChange={(event) => {
				const novoValor = event.target.value;
				setValor(novoValor);
				onAtualizarPreco(produtoId, novoValor);
			}}
			className='h-8 w-28'
			inputMode='decimal'
		/>
	);
}

function CelulaAtivo({
	produtoId,
	ativoReferencia,
	onAtualizarAtivo,
}: {
	produtoId: string;
	ativoReferencia: boolean;
	onAtualizarAtivo: (produtoId: string, ativo: boolean) => void;
}) {
	const [ativo, setAtivo] = useState(ativoReferencia);

	useEffect(() => {
		setAtivo(ativoReferencia);
	}, [ativoReferencia, produtoId]);

	return (
		<label className='flex items-center gap-1 text-xs'>
			<input
				type='checkbox'
				checked={ativo}
				onChange={(event) => {
					const novoAtivo = event.target.checked;
					setAtivo(novoAtivo);
					onAtualizarAtivo(produtoId, novoAtivo);
				}}
			/>
			Ativo
		</label>
	);
}

export function ProdutosDataTable({
	produtos,
	precoEditado,
	ativoEditado,
	carregando,
	onAtualizarPreco,
	onAtualizarAtivo,
	onSalvarProduto,
	onSalvarProdutosFiltrados,
}: ProdutosDataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [buscaTexto, setBuscaTexto] = useState("");
	const [buscaCodigo, setBuscaCodigo] = useState("");
	const [buscaPreco, setBuscaPreco] = useState("");
	const [precoEmLote, setPrecoEmLote] = useState("");

	const precoEditadoRef = useRef(precoEditado);
	precoEditadoRef.current = precoEditado;

	const ativoEditadoRef = useRef(ativoEditado);
	ativoEditadoRef.current = ativoEditado;

	const onAtualizarPrecoRef = useRef(onAtualizarPreco);
	onAtualizarPrecoRef.current = onAtualizarPreco;

	const onAtualizarAtivoRef = useRef(onAtualizarAtivo);
	onAtualizarAtivoRef.current = onAtualizarAtivo;

	const onSalvarProdutoRef = useRef(onSalvarProduto);
	onSalvarProdutoRef.current = onSalvarProduto;

	const produtosFiltrados = useMemo(
		() => filtrarProdutos(produtos, buscaTexto, buscaCodigo, buscaPreco),
		[produtos, buscaTexto, buscaCodigo, buscaPreco],
	);

	const columns = useMemo<ColumnDef<ProdutoAdmin>[]>(
		() => [
			{
				accessorKey: "codigo",
				header: ({ column }) => (
					<Button
						variant='ghost'
						size='sm'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
						Codigo
						<ArrowUpDown className='ml-1 h-3.5 w-3.5' />
					</Button>
				),
			},
			{
				accessorKey: "descricao",
				header: ({ column }) => (
					<Button
						variant='ghost'
						size='sm'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
						Descricao
						<ArrowUpDown className='ml-1 h-3.5 w-3.5' />
					</Button>
				),
				cell: ({ row }) => (
					<div className='min-w-0'>
						<p className='truncate font-medium'>{row.original.descricao}</p>
						<p className='text-xs text-muted-foreground'>
							{row.original.nomeGrupo ?? `Grupo ${row.original.grupo}`}
						</p>
					</div>
				),
			},
			{
				id: "preco",
				header: "Preco",
				cell: ({ row }) => {
					const produtoId = row.original.id;
					const valorReferencia =
						precoEditadoRef.current[produtoId] ?? String(row.original.preco);

					return (
						<CelulaPreco
							produtoId={produtoId}
							valorReferencia={valorReferencia}
							onAtualizarPreco={(id, valor) =>
								onAtualizarPrecoRef.current(id, valor)
							}
						/>
					);
				},
			},
			{
				id: "ativo",
				header: "Ativo",
				cell: ({ row }) => {
					const produtoId = row.original.id;
					const ativoReferencia =
						ativoEditadoRef.current[produtoId] ?? row.original.ativo;

					return (
						<CelulaAtivo
							produtoId={produtoId}
							ativoReferencia={ativoReferencia}
							onAtualizarAtivo={(id, ativo) =>
								onAtualizarAtivoRef.current(id, ativo)
							}
						/>
					);
				},
			},
			{
				id: "acoes",
				header: "Acoes",
				cell: ({ row }) => (
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={() => onSalvarProdutoRef.current(row.original.id)}
						disabled={carregando}>
						Salvar
					</Button>
				),
			},
		],
		[carregando],
	);

	const table = useReactTable({
		data: produtosFiltrados,
		columns,
		getRowId: (produto) => produto.id,
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: { sorting, pagination },
	});

	function aplicarPrecoNosFiltrados() {
		const valor = precoEmLote.trim();
		if (!valor) {
			return;
		}

		for (const produto of produtosFiltrados) {
			onAtualizarPreco(produto.id, valor);
		}
	}

	function salvarProdutosFiltrados() {
		onSalvarProdutosFiltrados(produtosFiltrados.map((produto) => produto.id));
	}

	return (
		<div className='space-y-3 rounded-md border p-3'>
			<p className='text-sm font-medium'>Gestao de produtos</p>
			<div className='grid gap-2 sm:grid-cols-3'>
				<Input
					value={buscaTexto}
					onChange={(event) => setBuscaTexto(event.target.value)}
					placeholder='Buscar por descricao ou grupo'
				/>
				<Input
					value={buscaCodigo}
					onChange={(event) => setBuscaCodigo(event.target.value.replace(/\D/g, ""))}
					placeholder='Buscar por codigo'
					inputMode='numeric'
				/>
				<Input
					value={buscaPreco}
					onChange={(event) =>
						setBuscaPreco(event.target.value.replace(/[^\d,.-]/g, ""))
					}
					placeholder='Buscar por preco (ex.: 12,90)'
					inputMode='decimal'
				/>
			</div>
			<div className='grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto]'>
				<Input
					value={precoEmLote}
					onChange={(event) =>
						setPrecoEmLote(event.target.value.replace(/[^\d,.-]/g, ""))
					}
					placeholder='Preco para todos os filtrados (ex.: 9,90)'
					inputMode='decimal'
				/>
				<Button
					type='button'
					variant='outline'
					onClick={aplicarPrecoNosFiltrados}
					disabled={carregando || !precoEmLote.trim() || produtosFiltrados.length === 0}>
					Aplicar nos filtrados
				</Button>
				<Button
					type='button'
					onClick={salvarProdutosFiltrados}
					disabled={carregando || produtosFiltrados.length === 0}>
					Salvar filtrados
				</Button>
			</div>

			<div className='overflow-hidden rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.original.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={`${row.original.id}-${cell.column.id}`}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className='text-center'>
									Nenhum produto encontrado para os filtros informados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className='flex flex-wrap items-center justify-between gap-2'>
				<div className='text-xs text-muted-foreground'>
					Mostrando {table.getRowModel().rows.length} de {produtosFiltrados.length}{" "}
					produtos
				</div>
				<div className='flex items-center gap-2'>
					<select
						value={String(table.getState().pagination.pageSize)}
						onChange={(event) => table.setPageSize(Number(event.target.value))}
						className='h-8 rounded-md border bg-background px-2 text-xs'>
						<option value='10'>10 / pagina</option>
						<option value='20'>20 / pagina</option>
						<option value='50'>50 / pagina</option>
					</select>
					<span className='text-xs text-muted-foreground'>
						Pagina {table.getState().pagination.pageIndex + 1} de{" "}
						{Math.max(1, table.getPageCount())}
					</span>
				</div>
			</div>
			<div className='flex items-center justify-end gap-2'>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}>
					Anterior
				</Button>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}>
					Proximo
				</Button>
			</div>
		</div>
	);
}
