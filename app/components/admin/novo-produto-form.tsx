import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export type OpcaoGrupoAdmin = {
	grupo: number;
	nomeGrupo: string;
};

export type NovoProdutoAdmin = {
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	grupo: number;
	nomeGrupo: string;
	fornecedor?: string;
	ativo: boolean;
};

type NovoProdutoFormProps = {
	grupos: OpcaoGrupoAdmin[];
	unidades: string[];
	proximoCodigo: number;
	carregando: boolean;
	onCriarProduto: (produto: NovoProdutoAdmin) => Promise<boolean>;
};

const FORMULARIO_VAZIO = {
	codigo: "",
	descricao: "",
	unidade: "",
	preco: "",
	chaveGrupo: "",
	fornecedor: "",
	ativo: true,
};

/** Chave unica do <select>, ja que grupo e nomeGrupo formam o par. */
function montarChaveGrupo(opcao: OpcaoGrupoAdmin) {
	return `${opcao.grupo}|${opcao.nomeGrupo}`;
}

function normalizarPrecoDigitado(valor: string) {
	return Number(valor.replace(",", ".").trim());
}

export function NovoProdutoForm({
	grupos,
	unidades,
	proximoCodigo,
	carregando,
	onCriarProduto,
}: NovoProdutoFormProps) {
	const [aberto, setAberto] = useState(false);
	const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
	const [erroLocal, setErroLocal] = useState("");

	// Enquanto o form estiver fechado, acompanha o proximo codigo vindo do servidor.
	useEffect(() => {
		if (!aberto) {
			setFormulario((atual) => ({ ...atual, codigo: String(proximoCodigo) }));
		}
	}, [aberto, proximoCodigo]);

	function alterarCampo(campo: keyof typeof FORMULARIO_VAZIO, valor: string | boolean) {
		setFormulario((atual) => ({ ...atual, [campo]: valor }));
	}

	function fechar() {
		setAberto(false);
		setErroLocal("");
		setFormulario({ ...FORMULARIO_VAZIO, codigo: String(proximoCodigo) });
	}

	async function enviar() {
		const codigo = Number(formulario.codigo.trim());
		const descricao = formulario.descricao.trim();
		const unidade = formulario.unidade.trim();
		const preco = normalizarPrecoDigitado(formulario.preco);
		const opcaoGrupo = grupos.find(
			(item) => montarChaveGrupo(item) === formulario.chaveGrupo,
		);

		if (!Number.isInteger(codigo) || codigo <= 0) {
			setErroLocal("Informe um codigo inteiro maior que zero.");
			return;
		}
		if (!descricao) {
			setErroLocal("Informe a descricao do produto.");
			return;
		}
		if (!unidade) {
			setErroLocal("Informe a unidade do produto.");
			return;
		}
		if (!Number.isFinite(preco) || preco < 0) {
			setErroLocal("Informe um preco valido.");
			return;
		}
		if (!opcaoGrupo) {
			setErroLocal("Selecione o grupo do produto.");
			return;
		}

		setErroLocal("");
		const criado = await onCriarProduto({
			codigo,
			descricao,
			unidade,
			preco,
			grupo: opcaoGrupo.grupo,
			nomeGrupo: opcaoGrupo.nomeGrupo,
			fornecedor: formulario.fornecedor.trim() || undefined,
			ativo: formulario.ativo,
		});

		if (criado) {
			fechar();
		}
	}

	if (!aberto) {
		return (
			<Button type='button' onClick={() => setAberto(true)} disabled={carregando}>
				<Plus className='mr-1 h-4 w-4' />
				Novo produto
			</Button>
		);
	}

	return (
		<div className='space-y-3 rounded-md border p-3'>
			<p className='text-sm font-medium'>Cadastrar produto</p>
			<div className='grid gap-2 sm:grid-cols-2'>
				<label className='space-y-1'>
					<span className='text-xs text-muted-foreground'>Codigo</span>
					<Input
						value={formulario.codigo}
						onChange={(event) =>
							alterarCampo("codigo", event.target.value.replace(/\D/g, ""))
						}
						placeholder='Codigo'
						inputMode='numeric'
					/>
				</label>
				<label className='space-y-1'>
					<span className='text-xs text-muted-foreground'>Unidade</span>
					<Input
						value={formulario.unidade}
						onChange={(event) =>
							alterarCampo("unidade", event.target.value.toUpperCase())
						}
						placeholder='UN, PCT, CX...'
						list='unidades-produto'
					/>
					<datalist id='unidades-produto'>
						{unidades.map((unidade) => (
							<option key={unidade} value={unidade} />
						))}
					</datalist>
				</label>
				<label className='space-y-1 sm:col-span-2'>
					<span className='text-xs text-muted-foreground'>Descricao</span>
					<Input
						value={formulario.descricao}
						onChange={(event) => alterarCampo("descricao", event.target.value)}
						placeholder='Descricao que aparece no catalogo'
					/>
				</label>
				<label className='space-y-1'>
					<span className='text-xs text-muted-foreground'>Grupo</span>
					<select
						value={formulario.chaveGrupo}
						onChange={(event) => alterarCampo("chaveGrupo", event.target.value)}
						className='h-10 w-full rounded-md border bg-background px-3 text-sm'>
						<option value=''>Selecione o grupo</option>
						{grupos.map((opcao) => (
							<option key={montarChaveGrupo(opcao)} value={montarChaveGrupo(opcao)}>
								{opcao.nomeGrupo} (grupo {opcao.grupo})
							</option>
						))}
					</select>
				</label>
				<label className='space-y-1'>
					<span className='text-xs text-muted-foreground'>Preco</span>
					<Input
						value={formulario.preco}
						onChange={(event) =>
							alterarCampo("preco", event.target.value.replace(/[^\d,.]/g, ""))
						}
						placeholder='Ex.: 12,90'
						inputMode='decimal'
					/>
				</label>
				<label className='space-y-1'>
					<span className='text-xs text-muted-foreground'>Fornecedor (opcional)</span>
					<Input
						value={formulario.fornecedor}
						onChange={(event) => alterarCampo("fornecedor", event.target.value)}
						placeholder='Marca / fornecedor'
					/>
				</label>
				<label className='flex items-center gap-2 self-end pb-2 text-sm'>
					<input
						type='checkbox'
						checked={formulario.ativo}
						onChange={(event) => alterarCampo("ativo", event.target.checked)}
					/>
					Ativo no catalogo
				</label>
			</div>

			{erroLocal ? <p className='text-sm text-destructive'>{erroLocal}</p> : null}

			<p className='text-xs text-muted-foreground'>
				A imagem do produto e escolhida pela descricao no catalogo. Sem uma
				correspondencia conhecida, o produto aparece com a imagem padrao.
			</p>

			<div className='flex flex-wrap gap-2'>
				<Button
					type='button'
					onClick={() => {
						void enviar();
					}}
					disabled={carregando}>
					{carregando ? "Salvando..." : "Salvar produto"}
				</Button>
				<Button type='button' variant='outline' onClick={fechar} disabled={carregando}>
					Cancelar
				</Button>
			</div>
		</div>
	);
}
