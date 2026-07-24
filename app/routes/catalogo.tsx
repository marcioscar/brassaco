import type { Route } from "./+types/catalogo";
import { useEffect, useState } from "react";
import {
	Link,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "react-router";
import {
	MinusIcon,
	PlusIcon,
	ShoppingCartIcon,
	SlidersHorizontalIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import {
	listarGruposDeProdutos,
	listarProdutosCatalogo,
	listarProdutos,
} from "../models/produtos.server";
import bobinaPicotadaEmpacImagem from "../assets/bobina picotada.png";
import bobinaPicotadaImagem from "../assets/bobina picotada2.jpeg";
import bobinaTubularImagem from "../assets/bobina tubular.png";
import alcoolGelImagem from "../assets/alcool_gel.png";
import alcoolLiquidoImagem from "../assets/alcool_liquido.png";
import assadeiraImagem from "../assets/assadeira.png";
import assaRapidoImagem from "../assets/assa_rapido.png";
import bandejaB1Imagem from "../assets/b1.webp";
import bandejaB2Imagem from "../assets/b2.webp";
import bandejaB3Imagem from "../assets/b3.webp";
import bandejaIsoporB4Imagem from "../assets/b4.webp";
import bolhaBobinaImagem from "../assets/bolha.png";
import borrifadorImagem from "../assets/borrifador.png";
import boleiraTampaAltaImagem from "../assets/boleira.png";
import tampaBaixaImagem from "../assets/tampa_baixa.png";
import bolhaMetroImagem from "../assets/bolha_metro.webp";
import capaChuvaImagem from "../assets/capa.png";
import caixaCorreioImagem from "../assets/caixa_correio.webp";
import caixaDocinhoImagem from "../assets/caixa_docinho.webp";
import caixaPapelaoImagem from "../assets/caixa_papelao.png";
import caixaSalgadoImagem from "../assets/caixa_salgado.webp";
import caixaIsoporImagem from "../assets/caixa isopor.png";
import copoIsoporImagem from "../assets/copo_isopor.webp";
import copo150SupremoImagem from "../assets/copo_150_supremo.png";
import copo50MlImagem from "../assets/copo_50.jpg";
import copo80MlImagem from "../assets/copo_80.jpg";
import embalagemIsoporImagem from "../assets/emb_isopor.webp";
import canudoShakeImagem from "../assets/shake.webp";
import canudoDobravelBioImagem from "../assets/felxivel_bio.webp";
import canudoSacheBio5Imagem from "../assets/canudo_sache_bio_5.png";
import canudoMexedorImagem from "../assets/canudo_mexedor.png";
import colherCafeImagem from "../assets/cafe.jpg";
import colherSobremesaImagem from "../assets/colher_sobremesa.jpg";
import refeicaoImagem from "../assets/refeicao.png";
import talheresImagem from "../assets/talheres copy.png";
import doceQuadradoImagem from "../assets/doce_quadrado.png";
import doceRedondoImagem from "../assets/doce_redondo.png";
import copozam750mlImagem from "../assets/copozam 750 ml.webp";
import envelopeSegurancaImagem from "../assets/envelope seguranca.png";
import copozan180Imagem from "../assets/copozan 180.png";
import copozan250Imagem from "../assets/copozan 250.png";
import freezerImagem from "../assets/freezer.png";
import floraxImagem from "../assets/florax.webp";
import gutilImagem from "../assets/gutil.png";
import garrafaPlasticaImagem from "../assets/garrafa_plastica.jpeg";
import filmePvcImagem from "../assets/pvc.png";
import hamburguerVabeneImagem from "../assets/hamburguer_vabene.webp";
import hotdogVabeneImagem from "../assets/hotdog_vabene.png";
import kitCopozan500mlImagem from "../assets/kit copozan 500ml.webp";
import kitPoteCopozanImagem from "../assets/kit pote copozan.png";
import kitRetangularCopozan250mlImagem from "../assets/kit copozan retangular 250ml.webp";
import embalagemKraftImagem from "../assets/kraft.webp";
import fitaKraftImagem from "../assets/fita_kraft.webp";
import fitaAdesivaPvcImagem from "../assets/fita_pvc.webp";
import fitaCrepeImagem from "../assets/fita_crepe.webp";
import fitaDuplaFaceImagem from "../assets/dupla_face.webp";
import fitaSilverTapeImagem from "../assets/silver_tape.webp";
import fitaBrancaFragilImagem from "../assets/fragil.webp";
import fitaIsolanteImagem from "../assets/isolante.webp";
import fitilhoIntefioImagem from "../assets/fitilho.webp";
import fitilhoBrancoInterfioImagem from "../assets/fitilho_branco.webp";
import fitilhoDecorativoColoridoImagem from "../assets/fitilho_cor.webp";
import feixoMetalicoImagem from "../assets/feixo_metalico.webp";
import feixoPlasticoImagem from "../assets/feixo.webp";
import copoIbizaImagem from "../assets/ibiza.png";
import kraftSosImagem from "../assets/sos.webp";
import sacolaKraftImagem from "../assets/sacola_kraft.webp";
import laCasaPretoImagem from "../assets/la casa preto.jpeg";
import laCasaAzulImagem from "../assets/la casa azul.jpeg";
import marmitexImagem from "../assets/marmitex.png";
import marmitaIsoporCm750Imagem from "../assets/marmita_redona.png";
import marmitaIsoporChOuHImagem from "../assets/marmita_isopor.png";
import copoMilano60MlImagem from "../assets/milano.png";
import nylonImagem from "../assets/nylon.png";
import ombreiraImagem from "../assets/ombreira.webp";
import papelOnduladoImagem from "../assets/ondulado.png";
import peadImagem from "../assets/pead.webp";
import pouchImagem from "../assets/pouch.png";
import pratoIsoporImagem from "../assets/prato_isopor.png";
import sacoBrancoPapelImagem from "../assets/saco_branco_papel.webp";
import sacoPpAdesivadoImagem from "../assets/pp_adesivo.png";
import sacosPlasticosImagem from "../assets/sacos_plasticos.webp";
import sacosPpImagem from "../assets/sacospp.png";
import filmeStrechImagem from "../assets/strech.png";
import vabene15lImagem from "../assets/vabene 15l.png";
import vabene50lImagem from "../assets/vabene 50l.png";
import vabene100lImagem from "../assets/vabene 100l .png";
import vabeneAzul30lImagem from "../assets/vabene azul 30l.png";
import vabenePreto30lImagem from "../assets/vabene preto 30l.png";
import sacoZipImagem from "../assets/zip.png";

const TAMANHO_PAGINA = 24;
const CHAVE_CARRINHO = "bel:carrinho:v1";
const CHAVE_CLIENTE_ID = "bel:cliente-id:v1";

type Produto = Awaited<ReturnType<typeof listarProdutos>>[number];
type Grupo = ReturnType<typeof listarGruposDeProdutos>[number];
type CarrinhoItem = {
	id: string;
	codigo: number;
	descricao: string;
	unidade: string;
	preco: number;
	quantidade: number;
};
type ClienteLogado = {
	id: string;
	nome: string;
	email: string;
	cpf?: string;
	cep?: string;
	telefone: string;
	endereco: string;
	observacoes: string;
};
type PedidoResumo = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	pagamentoStatus?: string;
	pagamentoLinkUrl?: string;
};
type FretePedido = {
	valor: number | null;
	resumo: string;
	observacao: string;
};

type FiltroContagem = {
	nome: string;
	total: number;
};

function normalizarTexto(valor: string) {
	return valor
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

function descricaoTem30Litros(descricaoNormalizada: string) {
	return /\b30\s*(l|lt|litro|litros)\b/.test(descricaoNormalizada);
}

function descricaoTem15Litros(descricaoNormalizada: string) {
	return /\b15\s*(l|lt|litro|litros)\b/.test(descricaoNormalizada);
}

function descricaoTem50Litros(descricaoNormalizada: string) {
	return /\b50\s*(l|lt|litro|litros)\b/.test(descricaoNormalizada);
}

function descricaoTem100Litros(descricaoNormalizada: string) {
	return /\b100\s*(l|lt|litro|litros)\b/.test(descricaoNormalizada);
}

function descricaoTemCopo180(descricaoNormalizada: string) {
	return (
		/\bcopo\s*180\b/.test(descricaoNormalizada) ||
		/\b180\s*ml\b/.test(descricaoNormalizada) ||
		/\b180ml\b/.test(descricaoNormalizada)
	);
}

function descricaoTemCopo180NaDescricao(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bcopo\s*180\b/.test(texto);
}

function descricaoTemCopo250NaDescricao(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bcopo\s*250\b/.test(texto);
}

function descricaoTemCopo250(descricaoNormalizada: string) {
	return (
		/\bcopo\b/.test(descricaoNormalizada) &&
		(/\b250\s*(ml|l)\b/.test(descricaoNormalizada) ||
			/\b250(ml|l)\b/.test(descricaoNormalizada))
	);
}

function descricaoTemPote500ml(descricaoNormalizada: string) {
	return (
		/\bpote\b/.test(descricaoNormalizada) &&
		(/\b500\s*(ml|m)\b/.test(descricaoNormalizada) ||
			/\b500(ml|m)\b/.test(descricaoNormalizada))
	);
}

function descricaoTemPote250ml(descricaoNormalizada: string) {
	return (
		/\bpote\b/.test(descricaoNormalizada) &&
		(/\b250\s*(ml|m)\b/.test(descricaoNormalizada) ||
			/\b250(ml|m)\b/.test(descricaoNormalizada))
	);
}

function descricaoTem750ml(descricaoNormalizada: string) {
	return (
		/\b750\s*(ml|m)\b/.test(descricaoNormalizada) ||
		/\b750(ml|m)\b/.test(descricaoNormalizada)
	);
}

function descricaoTemSacoZip(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bsaco\s*zip\b/.test(texto);
}

function descricaoTemSacoGran(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bsaco\b/.test(texto) && texto.includes("gran");
}

function descricaoTemSacoNylon(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bsaco\s+nylon\b/.test(texto);
}

function descricaoTemSacoPpAdesivado(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("saco pp adesivado");
}

function descricaoTemSan(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bsan\b/.test(texto);
}

function descricaoEhAssarapido(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	const primeiraPalavra = texto.split(" ")[0] ?? "";
	return primeiraPalavra === "assarapido";
}

function descricaoEhBandejaB1(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	return /^bandeja b1(\s|$)/.test(texto);
}

function descricaoEhBandejaB2(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	return /^bandeja b2(\s|$)/.test(texto);
}

function descricaoEhBandejaB3(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	return /^bandeja b3(\s|$)/.test(texto);
}

function descricaoEhBandejaIsoporB4(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	return /^bandeja isopor b4(\s|$)/.test(texto);
}

function descricaoTemCaixaIsopor(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bcaixa\b/.test(texto) && /\bisopor\b/.test(texto);
}

function descricaoTemCopoIsopor(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bcopo\b/.test(texto) && /\bisopor\b/.test(texto);
}

function descricaoEhCopo150Supremo(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo 150 ml") && texto.includes("supremo");
}

function descricaoEhCopoMilano60Ml(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo milano 60 ml");
}

function descricaoTemCopoIbiza(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo ibiza");
}

function descricaoEhCopo50Ml(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo 50 ml");
}

function descricaoEhCopo80Ml(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo 80 ml");
}

function descricaoEhCopo300Supremo(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo 300 ml") && texto.includes("supremo");
}

function descricaoEhCopo500MlSupremo(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo 500 ml") && texto.includes("supremo");
}

function descricaoEhCopo440500Ou550MlTt(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return (
		texto.includes("copo 440 ml tt") ||
		texto.includes("copo 500 ml tt") ||
		texto.includes("copo 550 ml tt")
	);
}

function descricaoEhCopo200Ml(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("copo 200 ml");
}

function descricaoEhCopo150SemSupremo(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	if (texto.includes("supremo")) {
		return false;
	}
	return texto.includes("copo 150 ml");
}

function descricaoEhCopo300330400Ou500Ml(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return (
		texto.includes("copo 300 ml") ||
		texto.includes("copo 330 ml") ||
		texto.includes("copo 400 ml") ||
		texto.includes("copo 500 ml")
	);
}

function descricaoTemEmbalagemIsopor(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bembalagem\b/.test(texto) && /\bisopor\b/.test(texto);
}

function descricaoTemEmbalagemBranca(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("embalagem branca");
}

function descricaoTemEmbalagemKraft(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("embalagem kraft");
}

function descricaoTemKraftSos(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("kraft sos");
}

function descricaoTemSacolaKraft(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("sacola kraft");
}

function descricaoTemFitaKraft(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita kraft");
}

function descricaoEhFitaAdesivaPvc(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita adesiva pvc");
}

function descricaoTemFitaDurex(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita durex");
}

function descricaoTemFitaCrepe(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita crepe");
}

function descricaoTemFitaDuplaFace(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita dupla face");
}

function descricaoTemFitaSilverTape(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita silver tape");
}

function descricaoEhFitaBrancaFragil(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita branca fragil");
}

function descricaoTemFitaIsolante(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fita isolante");
}

function descricaoEhFitilhoIntefio(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fitilho intefio");
}

function descricaoEhFitilhoBrancoInterfio(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fitilho branco interfio");
}

function descricaoEhFitilhoDecorativoColorido(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("fitilho decorativo colorido");
}

function descricaoTemPouch(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("pouch");
}

function descricaoTemPratoIsopor(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bprato\b/.test(texto) && /\bisopor\b/.test(texto);
}

function descricaoEhMarmitaIsoporCm750(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("marmita isopor cm 750");
}

function descricaoEhMarmitaIsoporChOuH(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return (
		texto.includes("marmita isopor ch") ||
		texto.includes("marmita isopor h") ||
		texto.includes("marmita isopor m104")
	);
}

function descricaoTemBoleiraTampaAlta(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	return (
		/^boleira tampa alta(\s|$)/.test(texto) ||
		/^bolo 15 tampa alta(\s|$)/.test(texto) ||
		/^bolo 56 medio tampa alta(\s|$)/.test(texto)
	);
}

function descricaoTemBoleiraTampaBaixa(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ").trim();
	return (
		/^boleira tampa baixa(\s|$)/.test(texto) ||
		/^bolo 15 tampa baixa(\s|$)/.test(texto)
	);
}

function descricaoEhDoceQuadrado(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("doce quadrado");
}

function descricaoEhDoceRedondo(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("doce redondo");
}

function descricaoContemGarrafaPlastica(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("garrafa plastica");
}

function descricaoContemGuardanapoFlorax(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("guardanapo") && texto.includes("florax");
}

function descricaoContemMax(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return /\bmax\b/.test(texto);
}

function descricaoContemRefeicao(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("refeicao");
}

function descricaoContemMetalizado(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("metalizado");
}

function descricaoEhFeixoPlastico(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("feixo plastico");
}

function descricaoContemGutil(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("gutil");
}

function descricaoEhFilmePvcSemGutil(descricaoNormalizada: string) {
	const texto = descricaoNormalizada.replace(/\s+/g, " ");
	return texto.includes("filme pvc") && !texto.includes("gutil");
}

function marcaEhEmpac(marca?: string | null) {
	return normalizarTexto(marca ?? "").includes("empac");
}

function obterImagemProduto(descricao: string, marca?: string | null) {
	const descricaoNormalizada = normalizarTexto(descricao);
	if (
		descricaoNormalizada.includes("bobina serrilhada") &&
		marcaEhEmpac(marca)
	) {
		return bobinaPicotadaEmpacImagem;
	}
	if (descricaoNormalizada.includes("bobina picotada")) {
		return bobinaPicotadaImagem;
	}
	if (
		descricaoNormalizada.includes("bobina tubular") ||
		descricaoNormalizada.includes("bobina laminada") ||
		/\bbobina tub\b/.test(descricaoNormalizada)
	) {
		return bobinaTubularImagem;
	}
	if (descricaoNormalizada.includes("envelope seguranca")) {
		return envelopeSegurancaImagem;
	}
	if (descricaoNormalizada.includes("alcool gel")) {
		return alcoolGelImagem;
	}
	if (descricaoNormalizada.includes("alcool liquido")) {
		return alcoolLiquidoImagem;
	}
	if (
		descricaoEhAssarapido(descricaoNormalizada)
	) {
		return assaRapidoImagem;
	}
	if (descricaoNormalizada.includes("assadeira")) {
		return assadeiraImagem;
	}
	if (descricaoEhBandejaB1(descricaoNormalizada)) {
		return bandejaB1Imagem;
	}
	if (descricaoEhBandejaB2(descricaoNormalizada)) {
		return bandejaB2Imagem;
	}
	if (descricaoEhBandejaB3(descricaoNormalizada)) {
		return bandejaB3Imagem;
	}
	if (descricaoEhBandejaIsoporB4(descricaoNormalizada)) {
		return bandejaIsoporB4Imagem;
	}
	if (descricaoTemBoleiraTampaAlta(descricaoNormalizada)) {
		return boleiraTampaAltaImagem;
	}
	if (descricaoTemBoleiraTampaBaixa(descricaoNormalizada)) {
		return tampaBaixaImagem;
	}
	if (
		descricaoNormalizada.includes("borrifador") ||
		descricaoNormalizada.includes("borriffador")
	) {
		return borrifadorImagem;
	}
	if (descricaoEhDoceQuadrado(descricaoNormalizada)) {
		return doceQuadradoImagem;
	}
	if (descricaoEhDoceRedondo(descricaoNormalizada)) {
		return doceRedondoImagem;
	}
	if (descricaoContemGarrafaPlastica(descricaoNormalizada)) {
		return garrafaPlasticaImagem;
	}
	if (descricaoContemGuardanapoFlorax(descricaoNormalizada)) {
		return floraxImagem;
	}
	if (descricaoNormalizada.includes("caixa correio")) {
		return caixaCorreioImagem;
	}
	if (descricaoNormalizada.includes("caixa docinho")) {
		return caixaDocinhoImagem;
	}
	if (
		descricaoNormalizada.includes("caixa papelao box") ||
		descricaoNormalizada.includes("caixa cv") ||
		descricaoNormalizada.includes("caixa delivery")
	) {
		return caixaPapelaoImagem;
	}
	if (/^caixa salgado m(\s|$)/.test(descricaoNormalizada.replace(/\s+/g, " ").trim())) {
		return caixaSalgadoImagem;
	}
	if (descricaoTemCaixaIsopor(descricaoNormalizada)) {
		return caixaIsoporImagem;
	}
	if (descricaoTemCopoIsopor(descricaoNormalizada)) {
		return copoIsoporImagem;
	}
	if (descricaoEhCopoMilano60Ml(descricaoNormalizada)) {
		return copoMilano60MlImagem;
	}
	if (descricaoTemCopoIbiza(descricaoNormalizada)) {
		return copoIbizaImagem;
	}
	if (descricaoEhCopo50Ml(descricaoNormalizada)) {
		return copo50MlImagem;
	}
	if (descricaoEhCopo80Ml(descricaoNormalizada)) {
		return copo80MlImagem;
	}
	if (descricaoEhCopo150Supremo(descricaoNormalizada)) {
		return copo150SupremoImagem;
	}
	if (descricaoEhCopo300Supremo(descricaoNormalizada)) {
		return copo150SupremoImagem;
	}
	if (descricaoEhCopo500MlSupremo(descricaoNormalizada)) {
		return copo150SupremoImagem;
	}
	if (descricaoEhCopo440500Ou550MlTt(descricaoNormalizada)) {
		return copo150SupremoImagem;
	}
	if (descricaoEhCopo200Ml(descricaoNormalizada)) {
		return copo150SupremoImagem;
	}
	if (descricaoEhCopo150SemSupremo(descricaoNormalizada)) {
		return copozan180Imagem;
	}
	if (descricaoTemCopo180NaDescricao(descricaoNormalizada)) {
		return copozan180Imagem;
	}
	if (descricaoTemCopo250NaDescricao(descricaoNormalizada)) {
		return copozan250Imagem;
	}
	if (descricaoEhCopo300330400Ou500Ml(descricaoNormalizada)) {
		return copozan250Imagem;
	}
	if (descricaoTemEmbalagemIsopor(descricaoNormalizada)) {
		return embalagemIsoporImagem;
	}
	if (descricaoTemEmbalagemBranca(descricaoNormalizada)) {
		return sacoBrancoPapelImagem;
	}
	if (descricaoTemEmbalagemKraft(descricaoNormalizada)) {
		return embalagemKraftImagem;
	}
	if (descricaoTemKraftSos(descricaoNormalizada)) {
		return kraftSosImagem;
	}
	if (descricaoTemSacolaKraft(descricaoNormalizada)) {
		return sacolaKraftImagem;
	}
	if (descricaoTemFitaKraft(descricaoNormalizada)) {
		return fitaKraftImagem;
	}
	if (descricaoEhFitaAdesivaPvc(descricaoNormalizada)) {
		return fitaAdesivaPvcImagem;
	}
	if (descricaoTemFitaDurex(descricaoNormalizada)) {
		return fitaAdesivaPvcImagem;
	}
	if (descricaoTemFitaCrepe(descricaoNormalizada)) {
		return fitaCrepeImagem;
	}
	if (descricaoTemFitaDuplaFace(descricaoNormalizada)) {
		return fitaDuplaFaceImagem;
	}
	if (descricaoTemFitaSilverTape(descricaoNormalizada)) {
		return fitaSilverTapeImagem;
	}
	if (descricaoEhFitaBrancaFragil(descricaoNormalizada)) {
		return fitaBrancaFragilImagem;
	}
	if (descricaoTemFitaIsolante(descricaoNormalizada)) {
		return fitaIsolanteImagem;
	}
	if (descricaoEhFitilhoBrancoInterfio(descricaoNormalizada)) {
		return fitilhoBrancoInterfioImagem;
	}
	if (descricaoEhFitilhoDecorativoColorido(descricaoNormalizada)) {
		return fitilhoDecorativoColoridoImagem;
	}
	if (descricaoEhFitilhoIntefio(descricaoNormalizada)) {
		return fitilhoIntefioImagem;
	}
	if (descricaoTemPouch(descricaoNormalizada)) {
		return pouchImagem;
	}
	if (descricaoTemPratoIsopor(descricaoNormalizada)) {
		return pratoIsoporImagem;
	}
	if (descricaoEhMarmitaIsoporCm750(descricaoNormalizada)) {
		return marmitaIsoporCm750Imagem;
	}
	if (descricaoEhMarmitaIsoporChOuH(descricaoNormalizada)) {
		return marmitaIsoporChOuHImagem;
	}
	if (descricaoNormalizada.includes("canudo 8 mm shake")) {
		return canudoShakeImagem;
	}
	if (descricaoNormalizada.includes("canudo dobravel bio")) {
		return canudoDobravelBioImagem;
	}
	if (descricaoNormalizada.includes("canudo sache bio 5 mm")) {
		return canudoSacheBio5Imagem;
	}
	if (descricaoNormalizada.includes("canudo mexedor")) {
		return canudoMexedorImagem;
	}
	if (descricaoNormalizada.includes("colher cafe")) {
		return colherCafeImagem;
	}
	if (descricaoNormalizada.includes("colher sobremesa")) {
		return colherSobremesaImagem;
	}
	if (descricaoContemRefeicao(descricaoNormalizada)) {
		return refeicaoImagem;
	}
	if (descricaoContemMax(descricaoNormalizada)) {
		return talheresImagem;
	}
	if (descricaoNormalizada.includes("capa de chuva longa")) {
		return capaChuvaImagem;
	}
	if (descricaoNormalizada.includes("filme strech")) {
		return filmeStrechImagem;
	}
	if (descricaoContemGutil(descricaoNormalizada)) {
		return gutilImagem;
	}
	if (descricaoEhFilmePvcSemGutil(descricaoNormalizada)) {
		return filmePvcImagem;
	}
	if (descricaoEhFeixoPlastico(descricaoNormalizada)) {
		return feixoPlasticoImagem;
	}
	if (descricaoContemMetalizado(descricaoNormalizada)) {
		return feixoMetalicoImagem;
	}
	if (descricaoNormalizada.includes("papel ondulado")) {
		return papelOnduladoImagem;
	}
	if (descricaoNormalizada.includes("bolha bobina")) {
		return bolhaBobinaImagem;
	}
	if (descricaoNormalizada.includes("plastico bolha metro")) {
		return bolhaMetroImagem;
	}
	if (descricaoTemSacoZip(descricaoNormalizada)) {
		return sacoZipImagem;
	}
	if (descricaoTemSacoGran(descricaoNormalizada)) {
		return sacosPlasticosImagem;
	}
	if (descricaoTemSacoNylon(descricaoNormalizada)) {
		return nylonImagem;
	}
	if (descricaoTemSacoPpAdesivado(descricaoNormalizada)) {
		return sacoPpAdesivadoImagem;
	}
	if (descricaoTemSan(descricaoNormalizada)) {
		return peadImagem;
	}
	if (descricaoNormalizada.includes("ombreira")) {
		return ombreiraImagem;
	}
	if (descricaoNormalizada.includes("sppn")) {
		return sacosPpImagem;
	}
	if (
		(descricaoNormalizada.includes("copozan") ||
			descricaoNormalizada.includes("copozam")) &&
		descricaoTem750ml(descricaoNormalizada)
	) {
		return copozam750mlImagem;
	}
	if (
		(descricaoNormalizada.includes("copozan") ||
			descricaoNormalizada.includes("copozam")) &&
		descricaoNormalizada.includes("kit") &&
		descricaoTemPote250ml(descricaoNormalizada) &&
		(descricaoNormalizada.includes("retang") ||
			descricaoNormalizada.includes("retangular"))
	) {
		return kitRetangularCopozan250mlImagem;
	}
	if (
		(descricaoNormalizada.includes("copozan") ||
			descricaoNormalizada.includes("copozam")) &&
		descricaoNormalizada.includes("kit") &&
		descricaoTemPote500ml(descricaoNormalizada) &&
		(descricaoNormalizada.includes("retang") ||
			descricaoNormalizada.includes("retangular"))
	) {
		return kitCopozan500mlImagem;
	}
	if (
		(descricaoNormalizada.includes("copozan") ||
			descricaoNormalizada.includes("copozam")) &&
		descricaoNormalizada.includes("kit") &&
		descricaoNormalizada.includes("pote") &&
		descricaoNormalizada.includes("redondo")
	) {
		return kitPoteCopozanImagem;
	}
	if (
		(descricaoNormalizada.includes("copozan") ||
			descricaoNormalizada.includes("copozam")) &&
		descricaoTemCopo250(descricaoNormalizada)
	) {
		return copozan250Imagem;
	}
	if (
		(descricaoNormalizada.includes("copozan") ||
			descricaoNormalizada.includes("copozam")) &&
		descricaoTemCopo180(descricaoNormalizada)
	) {
		return copozan180Imagem;
	}
	if (
		descricaoNormalizada.includes("freezer") &&
		descricaoNormalizada.includes("vabene")
	) {
		return freezerImagem;
	}
	if (
		descricaoNormalizada.includes("marmitex") &&
		descricaoNormalizada.includes("vabene")
	) {
		return marmitexImagem;
	}
	if (
		(descricaoNormalizada.includes("hamburguer") ||
			descricaoNormalizada.includes("hamburger")) &&
		descricaoNormalizada.includes("vabene")
	) {
		return hamburguerVabeneImagem;
	}
	if (
		(descricaoNormalizada.includes("hotdog") ||
			descricaoNormalizada.includes("hot dog")) &&
		descricaoNormalizada.includes("vabene")
	) {
		return hotdogVabeneImagem;
	}
	if (
		descricaoNormalizada.includes("vabene") &&
		descricaoTem100Litros(descricaoNormalizada)
	) {
		return vabene100lImagem;
	}
	if (
		descricaoNormalizada.includes("vabene") &&
		descricaoTem15Litros(descricaoNormalizada)
	) {
		return vabene15lImagem;
	}
	if (
		(descricaoNormalizada.includes("vabene") ||
			descricaoNormalizada.includes("vaben")) &&
		descricaoTem50Litros(descricaoNormalizada)
	) {
		return vabene50lImagem;
	}
	if (
		descricaoNormalizada.includes("vabene") &&
		descricaoNormalizada.includes("azul") &&
		descricaoTem30Litros(descricaoNormalizada)
	) {
		return vabeneAzul30lImagem;
	}
	if (
		descricaoNormalizada.includes("vabene") &&
		descricaoNormalizada.includes("preto") &&
		descricaoTem30Litros(descricaoNormalizada)
	) {
		return vabenePreto30lImagem;
	}
	if (
		descricaoNormalizada.includes("la casa") &&
		descricaoNormalizada.includes("preto")
	) {
		return laCasaPretoImagem;
	}
	if (descricaoNormalizada.includes("la casa")) {
		return laCasaAzulImagem;
	}

	return null;
}

function filtrarProdutosDoGrupo(
	produtos: Produto[],
	grupoSelecionado: Grupo | null,
) {
	if (!grupoSelecionado) {
		return produtos;
	}

	const categoriasSelecionadas = new Set(
		(grupoSelecionado.categoriasOriginais ?? []).map((categoria) =>
			normalizarTexto(categoria),
		),
	);
	const deveFiltrarPorCategoria = categoriasSelecionadas.size > 0;

	return produtos.filter((produto) => {
		if (!deveFiltrarPorCategoria) {
			return grupoSelecionado.codigosOriginais.includes(produto.grupo);
		}

		const categoriaDoProduto = produto.nomeGrupo?.trim();
		if (!categoriaDoProduto) {
			return grupoSelecionado.codigosOriginais.includes(produto.grupo);
		}

		return categoriasSelecionadas.has(normalizarTexto(categoriaDoProduto));
	});
}

function construirContagens(
	produtos: Produto[],
	extrair: (produto: Produto) => string,
): FiltroContagem[] {
	const acumulador = new Map<string, number>();
	for (const produto of produtos) {
		const chave = extrair(produto).trim();
		if (!chave) {
			continue;
		}
		acumulador.set(chave, (acumulador.get(chave) ?? 0) + 1);
	}

	return [...acumulador.entries()]
		.map(([nome, total]) => ({ nome, total }))
		.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function extrairTipo(produto: Produto) {
	return produto.nomeGrupo?.trim() || `Grupo ${produto.grupo}`;
}

function extrairMarca(produto: Produto) {
	return produto.fornecedor?.trim() || "Sem marca";
}

function filtrarPorBusca(produtos: Produto[], busca: string) {
	const termo = normalizarTexto(busca);
	if (!termo) {
		return produtos;
	}

	return produtos.filter((produto) =>
		normalizarTexto(produto.descricao).includes(termo),
	);
}

function filtrarPorTipo(produtos: Produto[], tipo: string) {
	if (!tipo.trim()) {
		return produtos;
	}
	return produtos.filter((produto) => extrairTipo(produto) === tipo.trim());
}

function possuiClienteLogadoValido(
	cliente: ClienteLogado | null,
): cliente is ClienteLogado {
	if (!cliente?.id) {
		return false;
	}

	return Boolean(
		cliente.nome.trim() &&
		cliente.email.trim() &&
		cliente.telefone.trim() &&
		cliente.endereco.trim(),
	);
}

async function requisitarCliente(payload: unknown) {
	const resposta = await fetch("/api/cliente", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const dados = (await resposta.json()) as {
		cliente?: ClienteLogado | null;
		ok?: boolean;
		erro?: string;
	};

	return { resposta, dados };
}

async function requisitarPedido(payload: unknown) {
	const resposta = await fetch("/api/pedido", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const dados = (await resposta.json()) as {
		pedido?: PedidoResumo;
		pedidos?: PedidoResumo[];
		checkoutUrl?: string;
		checkoutPendente?: boolean;
		mensagemCliente?: string;
		erro?: string;
	};

	return { resposta, dados };
}

function obterMensagemDeErroPedido(dados: { erro?: string }): string {
	const mensagem = dados.erro?.trim();
	if (mensagem) {
		return mensagem;
	}

	return "Nao foi possivel registrar o pedido. Tente novamente.";
}

function obterMensagemDeErroInesperado(error: unknown): string {
	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	return "Nao foi possivel registrar o pedido por falha de conexao.";
}

function criarMensagemPedidoForaDoDf(mensagemCliente?: string) {
	const mensagem = mensagemCliente?.trim();
	if (mensagem) {
		return mensagem;
	}

	return "Pedido registrado com frete pendente. Em breve enviaremos o valor do frete, o total final e o link de pagamento.";
}

function normalizarCep(cep: string) {
	return cep.replace(/\D/g, "");
}

function cepEhDoDistritoFederal(cep: string) {
	const cepNormalizado = normalizarCep(cep);
	if (cepNormalizado.length !== 8) {
		return false;
	}

	const prefixo = Number(cepNormalizado.slice(0, 2));
	return prefixo >= 70 && prefixo <= 73;
}

function calcularFretePedido(
	totalCarrinho: number,
	cepDoCliente?: string,
): FretePedido {
	if (!cepEhDoDistritoFederal(cepDoCliente ?? "")) {
		return {
			valor: null,
			resumo: "Frete a informar (fora do DF)",
			observacao: "Frete: valor a informar posteriormente (fora do DF).",
		};
	}

	if (totalCarrinho >= 100) {
		return {
			valor: 0,
			resumo: "Frete gratis (DF para pedidos acima de R$ 100,00)",
			observacao: "Frete: gratis (DF, pedido acima de R$ 100,00).",
		};
	}

	return {
		valor: 30,
		resumo: "Frete R$ 30,00 (DF para pedidos abaixo de R$ 100,00)",
		observacao: "Frete: R$ 30,00 (DF, pedido abaixo de R$ 100,00).",
	};
}

function calcularTotalComFrete(totalCarrinho: number, frete: FretePedido) {
	if (frete.valor === null) {
		return totalCarrinho;
	}

	return totalCarrinho + frete.valor;
}

function formatarPreco(preco: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(preco);
}

function listarValoresQuery(searchParams: URLSearchParams, chave: string) {
	return Array.from(
		new Set(
			searchParams
				.getAll(chave)
				.map((item) => item.trim())
				.filter(Boolean),
		),
	);
}

function preencherValoresMultiplos(
	params: URLSearchParams,
	chave: string,
	valores: string[],
) {
	params.delete(chave);
	for (const valor of valores) {
		params.append(chave, valor);
	}
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const grupoParam = url.searchParams.get("grupo")?.trim() ?? "";
	const tiposSelecionados = listarValoresQuery(url.searchParams, "tipo");
	const buscaParam = url.searchParams.get("busca")?.trim() ?? "";
	const paginaParam = Number(url.searchParams.get("pagina") ?? "1");
	const pagina =
		Number.isFinite(paginaParam) && paginaParam > 0 ? paginaParam : 1;

	const produtos = await listarProdutos();
	const grupos = listarGruposDeProdutos(produtos);
	const grupoSelecionado =
		grupos.find(
			(grupo) => normalizarTexto(grupo.nome) === normalizarTexto(grupoParam),
		) ?? null;

	const produtosDoGrupo = filtrarProdutosDoGrupo(produtos, grupoSelecionado);
	const tiposDisponiveis = construirContagens(produtosDoGrupo, extrairTipo);
	const { produtos: produtosPaginados, totalProdutos } =
		await listarProdutosCatalogo({
			grupoSelecionado,
			busca: buscaParam,
			tiposSelecionados,
			marcasSelecionadas: [],
			faixasSelecionadas: [],
			pagina,
			tamanhoPagina: TAMANHO_PAGINA,
		});
	const totalPaginas = Math.max(1, Math.ceil(totalProdutos / TAMANHO_PAGINA));
	const paginaAtual = Math.min(pagina, totalPaginas);

	return {
		grupos,
		grupoSelecionado: grupoSelecionado?.nome ?? "",
		tiposDisponiveis,
		filtros: {
			busca: buscaParam,
			tipos: tiposSelecionados,
			pagina: paginaAtual,
		},
		totalProdutos,
		totalPaginas,
		produtos: produtosPaginados.map((produto) => ({
			id: produto.id,
			codigo: produto.codigo,
			descricao: produto.descricao,
			preco: produto.preco,
			unidade: produto.unidade,
			marca: extrairMarca(produto),
			tipo: extrairTipo(produto),
		})),
	};
}

function montarBusca(
	searchParams: URLSearchParams,
	alteracoes: Record<string, string | number | null>,
) {
	const params = new URLSearchParams(searchParams);
	for (const [chave, valor] of Object.entries(alteracoes)) {
		if (valor === null || valor === "") {
			params.delete(chave);
		} else {
			params.set(chave, String(valor));
		}
	}
	return `?${params.toString()}`;
}

function montarBuscaMulti(
	searchParams: URLSearchParams,
	alteracoes: Record<string, string[]>,
) {
	const params = new URLSearchParams(searchParams);
	for (const [chave, valores] of Object.entries(alteracoes)) {
		preencherValoresMultiplos(params, chave, valores);
	}
	return `?${params.toString()}`;
}

function alternarValorMulti(
	searchParams: URLSearchParams,
	chave: string,
	valor: string,
) {
	const atuais = listarValoresQuery(searchParams, chave);
	const existe = atuais.includes(valor);
	const atualizados = existe
		? atuais.filter((item) => item !== valor)
		: [...atuais, valor];

	const params = new URLSearchParams(searchParams);
	preencherValoresMultiplos(params, chave, atualizados);
	params.set("pagina", "1");
	return `?${params.toString()}`;
}

function NavbarCatalogo({
	valorBusca,
	aoAlterarBusca,
	aoBuscar,
	totalItensCarrinho,
	aoAbrirCarrinho,
}: {
	valorBusca: string;
	aoAlterarBusca: (valor: string) => void;
	aoBuscar: () => void;
	totalItensCarrinho: number;
	aoAbrirCarrinho: () => void;
}) {
	return (
		<header className='fixed inset-x-0 top-0 z-50 border-b bg-background/90 backdrop-blur'>
			<div className='mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 md:h-16 md:flex-row md:items-center md:gap-4 md:py-0'>
				<Link
					to='/'
					className='inline-flex shrink-0 items-center p-1'
					aria-label='Ir para inicio'>
					<img src='/logo_bel.svg' alt='BEL' className='h-8 w-auto' />
				</Link>
				<form
					className='min-w-0 w-full md:flex-1'
					onSubmit={(event) => {
						event.preventDefault();
						aoBuscar();
					}}>
					<Input
						value={valorBusca}
						onChange={(event) => aoAlterarBusca(event.target.value)}
						placeholder='Buscar em todos os produtos...'
					/>
				</form>
				<div className='flex items-center gap-2 self-end md:self-auto'>
					<Link
						to='/'
						className='inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted'>
						Inicio
					</Link>
					<Button
						type='button'
						variant='outline'
						className='relative inline-flex size-9 items-center justify-center rounded-md border hover:bg-muted'
						aria-label='Abrir carrinho'
						onClick={aoAbrirCarrinho}>
						<ShoppingCartIcon />
						{totalItensCarrinho > 0 ? (
							<span className='absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground'>
								{totalItensCarrinho}
							</span>
						) : null}
					</Button>
				</div>
			</div>
		</header>
	);
}

type DadosCatalogo = Awaited<ReturnType<typeof loader>>;

type PainelFiltrosCatalogoProps = {
	data: DadosCatalogo;
	searchParams: URLSearchParams;
	aoSelecionarFiltro?: () => void;
};

function construirLinkDeGrupo(
	searchParams: URLSearchParams,
	nomeGrupo: string,
) {
	const params = new URLSearchParams(searchParams);
	params.set("grupo", nomeGrupo);
	params.delete("busca");
	preencherValoresMultiplos(params, "tipo", []);
	params.set("pagina", "1");
	return `?${params.toString()}`;
}

function PainelFiltrosCatalogo({
	data,
	searchParams,
	aoSelecionarFiltro,
}: PainelFiltrosCatalogoProps) {
	return (
		<div className='flex flex-col gap-3'>
			<Card>
				<CardContent className='flex flex-col gap-2 p-3'>
					<p className='text-sm font-medium'>Filtrar por departamento</p>
					{data.grupos.map((grupo) => (
						<Link
							key={grupo.codigo}
							to={construirLinkDeGrupo(searchParams, grupo.nome)}
							onClick={aoSelecionarFiltro}
							className='block text-sm text-muted-foreground hover:text-foreground'>
							{grupo.nome} ({grupo.totalProdutos})
						</Link>
					))}
				</CardContent>
			</Card>
			<Card>
				<CardContent className='flex flex-col gap-2 p-3'>
					<div className='flex items-center justify-between'>
						<p className='text-sm font-medium'>Filtrar por tipo</p>
						<Link
							to={montarBuscaMulti(searchParams, { tipo: [] })}
							onClick={aoSelecionarFiltro}
							className='text-xs text-muted-foreground hover:text-foreground'>
							Limpar
						</Link>
					</div>
					{data.tiposDisponiveis.map((tipo) => (
						<Link
							key={tipo.nome}
							to={alternarValorMulti(searchParams, "tipo", tipo.nome)}
							onClick={aoSelecionarFiltro}
							className={`block text-sm hover:text-foreground ${
								data.filtros.tipos.includes(tipo.nome)
									? "font-medium text-foreground"
									: "text-muted-foreground"
							}`}>
							{tipo.nome} ({tipo.total})
						</Link>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

function limitarQuantidadeMinima(quantidade: number) {
	return Math.max(1, Math.floor(Number.isFinite(quantidade) ? quantidade : 1));
}

function carregarCarrinhoDoStorage() {
	if (typeof window === "undefined") {
		return {} as Record<string, CarrinhoItem>;
	}

	try {
		const carrinhoSerializado = window.localStorage.getItem(CHAVE_CARRINHO);
		if (!carrinhoSerializado) {
			return {};
		}
		return JSON.parse(carrinhoSerializado) as Record<string, CarrinhoItem>;
	} catch {
		window.localStorage.removeItem(CHAVE_CARRINHO);
		return {};
	}
}

function calcularTotalItensCarrinho(carrinho: Record<string, CarrinhoItem>) {
	return Object.values(carrinho).reduce(
		(total, item) => total + limitarQuantidadeMinima(item.quantidade),
		0,
	);
}

function salvarCarrinhoNoStorage(carrinho: Record<string, CarrinhoItem>) {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function montarItemDeCarrinho(
	produto: DadosCatalogo["produtos"][number],
	quantidade: number,
): CarrinhoItem {
	return {
		id: produto.id,
		codigo: produto.codigo,
		descricao: produto.descricao,
		unidade: produto.unidade,
		preco: produto.preco,
		quantidade,
	};
}

function somarProdutoNoCarrinho(
	carrinhoAtual: Record<string, CarrinhoItem>,
	produto: DadosCatalogo["produtos"][number],
	quantidade: number,
) {
	const itemExistente = carrinhoAtual[produto.id];
	if (!itemExistente) {
		return {
			...carrinhoAtual,
			[produto.id]: montarItemDeCarrinho(produto, quantidade),
		};
	}

	return {
		...carrinhoAtual,
		[produto.id]: {
			...itemExistente,
			quantidade: itemExistente.quantidade + quantidade,
		},
	};
}

type ControlesQuantidadeProps = {
	quantidade: number;
	aoDiminuir: () => void;
	aoAumentar: () => void;
};

function ControlesQuantidade({
	quantidade,
	aoDiminuir,
	aoAumentar,
}: ControlesQuantidadeProps) {
	return (
		<div className='flex items-center gap-2'>
			<Button
				type='button'
				variant='outline'
				size='icon-xs'
				onClick={aoDiminuir}
				disabled={quantidade <= 1}
				aria-label='Diminuir quantidade'>
				<MinusIcon />
			</Button>
			<span className='w-8 text-center text-sm font-medium'>{quantidade}</span>
			<Button
				type='button'
				variant='outline'
				size='icon-xs'
				onClick={aoAumentar}
				aria-label='Aumentar quantidade'>
				<PlusIcon />
			</Button>
		</div>
	);
}

type ListaCarrinhoCatalogoProps = {
	itens: CarrinhoItem[];
	aoRemoverItem: (idDoProduto: string) => void;
};

function ListaCarrinhoCatalogo({
	itens,
	aoRemoverItem,
}: ListaCarrinhoCatalogoProps) {
	if (itens.length === 0) {
		return (
			<p className='text-sm text-muted-foreground'>Seu carrinho esta vazio.</p>
		);
	}

	return (
		<ul className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
			{itens.map((item) => (
				<li
					key={item.id}
					className='flex items-center gap-2 rounded-md border p-2'>
					<div className='min-w-0 flex-1'>
						<p className='truncate text-sm font-medium'>{item.descricao}</p>
						<p className='text-xs text-muted-foreground'>
							{item.quantidade} x {formatarPreco(item.preco)} / {item.unidade}
						</p>
					</div>
					<Button
						type='button'
						variant='ghost'
						size='xs'
						onClick={() => aoRemoverItem(item.id)}>
						Remover
					</Button>
				</li>
			))}
		</ul>
	);
}

export default function Catalogo() {
	const data = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [buscaNavbar, setBuscaNavbar] = useState(data.filtros.busca);
	const [filtrosMobileAbertos, setFiltrosMobileAbertos] = useState(false);
	const [quantidadesPorProduto, setQuantidadesPorProduto] = useState<
		Record<string, number>
	>({});
	const [carrinho, setCarrinho] = useState<Record<string, CarrinhoItem>>(() =>
		carregarCarrinhoDoStorage(),
	);
	const [carrinhoAberto, setCarrinhoAberto] = useState(false);
	const [clienteLogado, setClienteLogado] = useState<ClienteLogado | null>(
		null,
	);
	const [estaCriandoPedido, setEstaCriandoPedido] = useState(false);
	const [erroPedido, setErroPedido] = useState("");
	const [mensagemPedido, setMensagemPedido] = useState("");
	const [estaRevisandoPedido, setEstaRevisandoPedido] = useState(false);
	const totalItensCarrinho = calcularTotalItensCarrinho(carrinho);
	const itensDoCarrinho = Object.values(carrinho);
	const totalCarrinho = itensDoCarrinho.reduce(
		(total, item) => total + item.preco * item.quantidade,
		0,
	);
	const fretePedido = calcularFretePedido(totalCarrinho, clienteLogado?.cep);
	const totalComFrete = calcularTotalComFrete(totalCarrinho, fretePedido);

	useEffect(() => {
		salvarCarrinhoNoStorage(carrinho);
	}, [carrinho]);

	useEffect(() => {
		const sincronizarCarrinho = () => {
			setCarrinho(carregarCarrinhoDoStorage());
		};

		window.addEventListener("storage", sincronizarCarrinho);
		window.addEventListener("focus", sincronizarCarrinho);
		return () => {
			window.removeEventListener("storage", sincronizarCarrinho);
			window.removeEventListener("focus", sincronizarCarrinho);
		};
	}, []);

	useEffect(() => {
		const clienteId = window.localStorage.getItem(CHAVE_CLIENTE_ID);
		if (!clienteId) {
			return;
		}

		async function carregarClienteSalvo() {
			try {
				const { resposta, dados } = await requisitarCliente({
					intent: "login_por_id",
					id: clienteId,
				});
				if (
					!resposta.ok ||
					!dados.cliente ||
					!possuiClienteLogadoValido(dados.cliente)
				) {
					window.localStorage.removeItem(CHAVE_CLIENTE_ID);
					return;
				}

				setClienteLogado(dados.cliente);
			} catch {
				window.localStorage.removeItem(CHAVE_CLIENTE_ID);
			}
		}

		carregarClienteSalvo();
	}, []);

	function buscarPelaNavbar() {
		const termo = buscaNavbar.trim();
		if (!termo) {
			navigate("/catalogo");
			return;
		}
		navigate(`/catalogo?busca=${encodeURIComponent(termo)}`);
	}

	function alterarQuantidadeDoProduto(
		idProduto: string,
		proximaQuantidade: number,
	) {
		setQuantidadesPorProduto((atual) => ({
			...atual,
			[idProduto]: limitarQuantidadeMinima(proximaQuantidade),
		}));
	}

	function adicionarProdutoAoCarrinho(
		produto: DadosCatalogo["produtos"][number],
	) {
		const quantidadeSelecionada = limitarQuantidadeMinima(
			quantidadesPorProduto[produto.id] ?? 1,
		);
		setCarrinho((carrinhoAtual) =>
			somarProdutoNoCarrinho(carrinhoAtual, produto, quantidadeSelecionada),
		);
	}

	function removerItemDoCarrinho(idDoProduto: string) {
		setCarrinho((carrinhoAtual) => {
			const item = carrinhoAtual[idDoProduto];
			if (!item) {
				return carrinhoAtual;
			}

			if (item.quantidade > 1) {
				return {
					...carrinhoAtual,
					[idDoProduto]: { ...item, quantidade: item.quantidade - 1 },
				};
			}

			const { [idDoProduto]: _removido, ...restante } = carrinhoAtual;
			return restante;
		});
	}

	function limparCarrinho() {
		setCarrinho({});
	}

	function iniciarRevisaoDoPedido() {
		if (itensDoCarrinho.length === 0) {
			return;
		}

		if (!possuiClienteLogadoValido(clienteLogado)) {
			setCarrinhoAberto(false);
			navigate("/conta?next=checkout");
			return;
		}

		setErroPedido("");
		setMensagemPedido("");
		setEstaRevisandoPedido(true);
	}

	function criarObservacoesComFrete(
		observacoesCliente: string,
		freteAtual: FretePedido,
	) {
		return [observacoesCliente.trim(), freteAtual.observacao]
			.filter(Boolean)
			.join(" | ");
	}

	async function finalizarPedido() {
		if (
			itensDoCarrinho.length === 0 ||
			!possuiClienteLogadoValido(clienteLogado)
		) {
			return;
		}

		const observacoesComFrete = criarObservacoesComFrete(
			clienteLogado.observacoes,
			fretePedido,
		);

		setErroPedido("");
		setMensagemPedido("");
		setEstaCriandoPedido(true);

		try {
			const precisaCheckout = fretePedido.valor !== null;
			const { resposta, dados } = await requisitarPedido({
				intent: "criar",
				clienteId: clienteLogado.id,
				clienteNome: clienteLogado.nome,
				clienteEmail: clienteLogado.email,
				clienteTelefone: clienteLogado.telefone,
				clienteEndereco: clienteLogado.endereco,
				clienteCpf: clienteLogado.cpf,
				observacoesCliente: observacoesComFrete,
				criarCheckout: precisaCheckout,
				itens: itensDoCarrinho,
				total: totalComFrete,
			});
			if (!resposta.ok || !dados.pedido) {
				setErroPedido(obterMensagemDeErroPedido(dados));
				return;
			}

			limparCarrinho();
			setEstaRevisandoPedido(false);

			if (!precisaCheckout || dados.checkoutPendente) {
				setMensagemPedido(criarMensagemPedidoForaDoDf(dados.mensagemCliente));
				return;
			}

			if (!dados.checkoutUrl) {
				setErroPedido("Pedido registrado, mas sem link de pagamento.");
				return;
			}

			setCarrinhoAberto(false);
			window.open(dados.checkoutUrl, "_blank", "noopener,noreferrer");
		} catch (error) {
			setErroPedido(obterMensagemDeErroInesperado(error));
		} finally {
			setEstaCriandoPedido(false);
		}
	}

	return (
		<div className='min-h-screen'>
			<NavbarCatalogo
				valorBusca={buscaNavbar}
				aoAlterarBusca={setBuscaNavbar}
				aoBuscar={buscarPelaNavbar}
				totalItensCarrinho={totalItensCarrinho}
				aoAbrirCarrinho={() => setCarrinhoAberto(true)}
			/>
			<div className='mx-auto w-full max-w-7xl px-4 pb-8 pt-40 sm:pt-20'>
				<div className='mb-4 flex items-start justify-between gap-3'>
					<div>
						<h1 className='text-3xl font-semibold'>Embalagens</h1>
						<p className='text-sm text-muted-foreground'>
							{data.grupoSelecionado
								? `Grupo selecionado: ${data.grupoSelecionado}`
								: "Selecione um grupo para filtrar o catalogo"}
						</p>
					</div>
					<Sheet
						open={filtrosMobileAbertos}
						onOpenChange={setFiltrosMobileAbertos}>
						<SheetTrigger
							render={
								<Button variant='outline' className='md:hidden'>
									<SlidersHorizontalIcon data-icon='inline-start' />
								</Button>
							}>
							Filtros
						</SheetTrigger>
						<SheetContent side='left' className='w-[86vw] p-0'>
							<SheetHeader>
								<SheetTitle>Filtros do catalogo</SheetTitle>
								<SheetDescription>
									Selecione departamento e tipo para refinar os produtos.
								</SheetDescription>
							</SheetHeader>
							<div className='overflow-y-auto px-4 pb-4'>
								<PainelFiltrosCatalogo
									data={data}
									searchParams={searchParams}
									aoSelecionarFiltro={() => setFiltrosMobileAbertos(false)}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</div>

				<div className='grid gap-4 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]'>
					<aside className='hidden md:block'>
						<PainelFiltrosCatalogo data={data} searchParams={searchParams} />
					</aside>

					<section className='space-y-4'>
						<form method='get' className='rounded-md border p-3'>
							<input type='hidden' name='grupo' value={data.grupoSelecionado} />
							{data.filtros.tipos.map((tipo) => (
								<input key={tipo} type='hidden' name='tipo' value={tipo} />
							))}
							<input type='hidden' name='pagina' value='1' />
							<Input
								name='busca'
								defaultValue={data.filtros.busca}
								placeholder='Buscar por nome do produto'
							/>
						</form>

						<div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
							{data.produtos.map((produto) => {
								const imagemProduto = obterImagemProduto(
									produto.descricao,
									produto.marca,
								);

								return (
									<Card key={produto.id}>
										<CardContent className='flex h-full flex-col gap-2 p-3'>
											{imagemProduto ? (
												<img
													src={imagemProduto}
													alt={produto.descricao}
													className='h-36 w-full rounded-md bg-white p-1 object-contain'
												/>
											) : null}
											<p className='line-clamp-2 text-sm font-medium'>
												{produto.descricao}
											</p>
											<p className='text-xs text-muted-foreground'>
												{produto.tipo} - {produto.marca}
											</p>
											<p className='text-lg font-semibold'>
												{formatarPreco(produto.preco)}
											</p>
											<p className='text-xs text-muted-foreground'>
												por {produto.unidade}
											</p>
											<div className='mt-auto flex items-center justify-between rounded-md border p-2'>
												<span className='text-xs font-medium'>Quantidade</span>
												<ControlesQuantidade
													quantidade={quantidadesPorProduto[produto.id] ?? 1}
													aoDiminuir={() =>
														alterarQuantidadeDoProduto(
															produto.id,
															(quantidadesPorProduto[produto.id] ?? 1) - 1,
														)
													}
													aoAumentar={() =>
														alterarQuantidadeDoProduto(
															produto.id,
															(quantidadesPorProduto[produto.id] ?? 1) + 1,
														)
													}
												/>
											</div>
											<Button
												type='button'
												onClick={() => adicionarProdutoAoCarrinho(produto)}>
												<ShoppingCartIcon data-icon='inline-start' />
												Adicionar ao carrinho
											</Button>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{data.produtos.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								Nenhum produto encontrado com os filtros aplicados.
							</p>
						) : null}

						<div className='flex items-center justify-between rounded-md border p-3 text-sm'>
							<p>
								Total: {data.totalProdutos} produto(s) - Pagina{" "}
								{data.filtros.pagina} de {data.totalPaginas}
							</p>
							<div className='flex gap-2'>
								{data.filtros.pagina <= 1 ? (
									<span className='inline-flex h-8 items-center rounded-md border px-3 text-sm text-muted-foreground'>
										Anterior
									</span>
								) : (
									<Link
										to={montarBusca(searchParams, {
											pagina: data.filtros.pagina - 1,
										})}
										className='inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted'>
										Anterior
									</Link>
								)}
								{data.filtros.pagina >= data.totalPaginas ? (
									<span className='inline-flex h-8 items-center rounded-md border px-3 text-sm text-muted-foreground'>
										Proximo
									</span>
								) : (
									<Link
										to={montarBusca(searchParams, {
											pagina: data.filtros.pagina + 1,
										})}
										className='inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted'>
										Proximo
									</Link>
								)}
							</div>
						</div>
					</section>
				</div>
			</div>
			<Dialog
				open={carrinhoAberto}
				onOpenChange={(aberto) => {
					setCarrinhoAberto(aberto);
					if (!aberto) {
						setEstaRevisandoPedido(false);
						setMensagemPedido("");
					}
				}}>
				<DialogContent className='sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>
							{estaRevisandoPedido ? "Revisao do pedido" : "Carrinho"}
						</DialogTitle>
						<DialogDescription>
							{estaRevisandoPedido
								? "Revise os itens e o frete antes de confirmar."
								: "Confira os itens adicionados antes de finalizar."}
						</DialogDescription>
					</DialogHeader>
					{clienteLogado ? (
						<div className='rounded-md border p-3 text-sm'>
							<p className='font-medium'>{clienteLogado.nome}</p>
							<p className='text-muted-foreground'>{clienteLogado.email}</p>
							<p className='text-muted-foreground'>{clienteLogado.telefone}</p>
							<p className='text-muted-foreground'>{clienteLogado.endereco}</p>
						</div>
					) : (
						<p className='text-sm text-muted-foreground'>
							Faca login com e-mail e senha ou cadastre seus dados para concluir
							o pedido.
						</p>
					)}
					{estaRevisandoPedido ? (
						<div className='space-y-3 rounded-md border p-3 text-sm'>
							<p className='font-medium'>Resumo para confirmacao</p>
							<ul className='space-y-1 text-muted-foreground'>
								{itensDoCarrinho.map((item) => (
									<li key={item.id}>
										{item.quantidade}x {item.descricao} (
										{formatarPreco(item.preco)} / {item.unidade})
									</li>
								))}
							</ul>
							<div className='space-y-1 border-t pt-2 text-sm'>
								<p>Subtotal: {formatarPreco(totalCarrinho)}</p>
								<p>
									Frete:{" "}
									{fretePedido.valor === null
										? "A informar"
										: formatarPreco(fretePedido.valor)}
								</p>
								<p className='text-xs text-muted-foreground'>
									{fretePedido.resumo}
								</p>
								<p className='font-medium'>
									Total para registro: {formatarPreco(totalComFrete)}
								</p>
							</div>
						</div>
					) : (
						<ListaCarrinhoCatalogo
							itens={itensDoCarrinho}
							aoRemoverItem={removerItemDoCarrinho}
						/>
					)}
					{erroPedido ? (
						<p className='text-sm text-destructive'>{erroPedido}</p>
					) : null}
					{mensagemPedido ? (
						<p className='text-sm text-emerald-700'>{mensagemPedido}</p>
					) : null}
					<DialogFooter>
						<div className='mr-auto text-sm font-medium'>
							Total: {formatarPreco(totalComFrete)}
						</div>
						{estaRevisandoPedido ? (
							<Button
								type='button'
								variant='outline'
								onClick={() => setEstaRevisandoPedido(false)}>
								Voltar ao carrinho
							</Button>
						) : (
							<Button type='button' variant='outline' onClick={limparCarrinho}>
								Limpar carrinho
							</Button>
						)}
						<Button
							type='button'
							onClick={
								estaRevisandoPedido ? finalizarPedido : iniciarRevisaoDoPedido
							}
							disabled={itensDoCarrinho.length === 0 || estaCriandoPedido}>
							{estaCriandoPedido
								? "Registrando pedido..."
								: estaRevisandoPedido
									? "Confirmar pedido"
									: "Revisar pedido"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
