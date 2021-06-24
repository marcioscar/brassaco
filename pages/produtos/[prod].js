import Head from "next/head";
import { grupos } from "../../data/menu.json";
import useSWR from "swr";
import api from "../../utils/api";
import Navbar from "../../components/navbar";
import { useState } from "react";
// const Prod = ({ prod }) => {
//   const { name, price, photoPath, group } = produtos.find(
//     (produto) => produto.slug === prod
//   );
// const Prod = ({ prod }) => {
//   const { name, price, photoPath, group } = produtos.find(
//     (produto) => produto.group === prod
//   );

const Prod = ({ prod }) => {
  //usar awt
  const { data, error } = useSWR(`/api/grupos/${prod}`, api);
  const [search, setSearch] = useState("");

  if (error) return <div className="text-red-600">failed to load </div>;
  if (!data)
    return (
      <div className="inline-flex items-center bg-white leading-none text-purple-600 rounded-full p-2 shadow text-teal text-sm">
        <span className="inline-flex bg-indigo-600 text-white rounded-full h-6 px-3 justify-center items-center">
          Carregando
        </span>
      </div>
    );

  const grupoFilter = data.data.filter((product) =>
    product.DESCRICAO.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Head>
        <title>Brassaco </title>
      </Head>
      <Navbar />

      <div className="overflow-x-auto pt-24">
        <div className=" ml-2 md:ml-40 mr-2 flex items-center mt-1 mb-1">
          <svg
            className="w-4 h-4 fill-current text-gray-500 ml-4 z-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="black"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder="Procurar"
            className="w-full md:w-80  -ml-8 pl-10 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="min-w-screen min-h-screen flex justify-center font-sans overflow-hidden">
          <div className="w-full lg:w-5/6">
            <div className="bg-white shadow-md rounded my-2">
              <table className=" w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-blue-700 uppercase text-sm leading-normal">
                    <th className="py-2 pl-1 text-center">Cod</th>
                    <th className="py-2 px-1 text-center">Descrição</th>
                    <th className="py-2 px-1 text-right">preço</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {grupoFilter.map(({ CODPRODUTO, DESCRICAO, PRECO }) => (
                    <tr
                      key={CODPRODUTO}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-2 font-thin pr-1 text-center whitespace-nowrap">
                        {CODPRODUTO}
                      </td>
                      <td className="py-2 text-left ">{DESCRICAO}</td>
                      <td className="py-2 pr-1 text-right whitespace-nowrap font-medium">
                        {PRECO}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prod;

//busca dados em tempo de build
export async function getStaticProps({ params }) {
  return { props: { ...params } };
}

//especificar as rotas dinamicas para pre-renderizaçào baseado em dados
export async function getStaticPaths() {
  return {
    //paths: produtos.map(({ slug }) => `/produtos/${slug}`),
    paths: grupos.map(({ group }) => `/produtos/${group}`),
    fallback: false,
  };
}
