import Head from "next/head";
import Link from "next/link";
import { grupos } from "../data/menu.json";
import Navbar from "../components/navbar";

const Home = () => {
  return (
    <>
      <Head>
        <title>Brassaco Embalagens</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="container mx-auto px-2 bg-gray-50">
        <Head>
          <title>Brassaco - Lista de preços</title>
        </Head>

        <div className="grid lg:grid-cols-3 gap-2 pt-24">
          {grupos.map(({ slug, group, name, photoPath, description }) => (
            <div
              className=" bg-white rounded overflow-hidden shadow-xl flex items-center p-3"
              key={slug}
            >
              <Link href={`/produtos/${group}`}>
                <a>
                  <img
                    className="w-20"
                    src={photoPath}
                    alt="Placeholder image"
                  />
                </a>
              </Link>
              <Link href={`/produtos/${group}`}>
                <a>
                  <div className="m-4">
                    <span className="font-bold text-xl text-blue-600">
                      {name}
                    </span>
                    <span className="block text-gray-500 text-sm">
                      {description}
                    </span>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
