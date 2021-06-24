import Link from "next/link";

const Navbar = () => {
  return (
    <nav className=" bg-gray-300 w-full flex  justify-between items-center mx-auto px-8 h-20 fixed">
      <img className="w-40" src="/logo.svg" />
      <Link href="/">
        <a>
          <button className="bg-red-600 px-3 py-2 font-normal text-white inline-flex items-center space-x-2 rounded">
            <img className="w-4" src="/voltar.svg" />
            <span>Voltar</span>
          </button>
        </a>
      </Link>
    </nav>
  );
};

export default Navbar;
