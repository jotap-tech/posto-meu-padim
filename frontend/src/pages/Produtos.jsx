import { useEffect, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import api from "../services/api";
import Toast from "../components/Toast";

function Produtos() {
  const [toast, setToast] = useState({
    aberto: false,
    tipo: "sucesso",
    mensagem: "",
  });

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const categorias = [
    "Bebidas",
    "Alimentos",
    "Doces",
    "Salgadinhos",
    "Higiene",
    "Automotivo",
    "Lubrificantes",
    "Limpeza",
    "Outros",
  ];

  const [formulario, setFormulario] = useState({
    nome: "",
    categoria: "",
    quantidade: "",
    estoqueMinimo: "",
    preco: "",
  });

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({
      aberto: true,
      tipo,
      mensagem,
    });

    setTimeout(() => {
      setToast({
        aberto: false,
        tipo: "sucesso",
        mensagem: "",
      });
    }, 3000);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get("/produtos");

      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);

      mostrarToast(
        error.response?.data?.message ||
          "Erro ao carregar produtos.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const abrirCadastro = () => {
    setProdutoSelecionado(null);

    setFormulario({
      nome: "",
      categoria: "",
      quantidade: "",
      estoqueMinimo: "",
      preco: "",
    });

    setModalAberto(true);
  };

  const abrirEdicao = (produto) => {
    setProdutoSelecionado(produto);

    setFormulario({
      nome: produto.nome,
      categoria: produto.categoria,
      quantidade: produto.quantidade,
      estoqueMinimo: produto.estoqueMinimo,
      preco: produto.preco,
    });

    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setProdutoSelecionado(null);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    try {
      const dados = {
        nome: formulario.nome,
        categoria: formulario.categoria,
        quantidade: Number(formulario.quantidade),
        estoqueMinimo: Number(formulario.estoqueMinimo),
        preco: Number(formulario.preco),
      };

      if (produtoSelecionado) {
        await api.put(
          `/produtos/${produtoSelecionado._id}`,
          dados
        );

        mostrarToast("Produto atualizado com sucesso!");
      } else {
        await api.post("/produtos", dados);

        mostrarToast("Produto cadastrado com sucesso!");
      }

      fecharModal();

      await carregarProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      mostrarToast(
        error.response?.data?.message ||
          "Erro ao salvar produto.",
        "erro"
      );
    }
  };

  const abrirExclusao = (produto) => {
    setProdutoSelecionado(produto);
    setModalExcluir(true);
  };

  const fecharExclusao = () => {
    setModalExcluir(false);
    setProdutoSelecionado(null);
  };

  const excluirProduto = async () => {
    try {
      await api.delete(
        `/produtos/${produtoSelecionado._id}`
      );

      fecharExclusao();

      await carregarProdutos();

      mostrarToast("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      mostrarToast(
        error.response?.data?.message ||
          "Erro ao excluir produto.",
        "erro"
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Produtos
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Gerencie os produtos do posto
          </p>
        </div>

        <button
          onClick={abrirCadastro}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <FiPlus size={18} />
          Novo produto
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <FiSearch
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-gray-500">
            Carregando produtos...
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          <>
            {/* Tabela - computador */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Produto
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Categoria
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Estoque
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Mínimo
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Preço
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {produtosFiltrados.map((produto) => {
                    const estoqueBaixo =
                      produto.quantidade <=
                      produto.estoqueMinimo;

                    return (
                      <tr
                        key={produto._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {produto.nome}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {produto.categoria}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={
                              estoqueBaixo
                                ? "font-semibold text-orange-600"
                                : "font-medium text-gray-900"
                            }
                          >
                            {produto.quantidade}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {produto.estoqueMinimo}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          R${" "}
                          {Number(produto.preco)
                            .toFixed(2)
                            .replace(".", ",")}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                abrirEdicao(produto)
                              }
                              className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                              title="Editar produto"
                            >
                              <FiEdit2 size={17} />
                            </button>

                            <button
                              onClick={() =>
                                abrirExclusao(produto)
                              }
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                              title="Excluir produto"
                            >
                              <FiTrash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards - celular */}
            <div className="md:hidden divide-y divide-gray-100">
              {produtosFiltrados.map((produto) => {
                const estoqueBaixo =
                  produto.quantidade <=
                  produto.estoqueMinimo;

                return (
                  <div
                    key={produto._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {produto.nome}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {produto.categoria}
                        </p>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() =>
                            abrirEdicao(produto)
                          }
                          className="p-2.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          title="Editar produto"
                        >
                          <FiEdit2 size={17} />
                        </button>

                        <button
                          onClick={() =>
                            abrirExclusao(produto)
                          }
                          className="p-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Excluir produto"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          Estoque
                        </p>

                        <p
                          className={`mt-1 font-semibold ${
                            estoqueBaixo
                              ? "text-orange-600"
                              : "text-gray-900"
                          }`}
                        >
                          {produto.quantidade}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Mínimo
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {produto.estoqueMinimo}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Preço
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          R${" "}
                          {Number(produto.preco)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal cadastrar / editar */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg overflow-y-auto rounded-none sm:rounded-xl bg-white shadow-xl">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-gray-200 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {produtoSelecionado
                    ? "Editar produto"
                    : "Novo produto"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {produtoSelecionado
                    ? "Atualize os dados do produto"
                    : "Cadastre um novo produto no estoque"}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Formulário */}
            <form
              onSubmit={salvarProduto}
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nome do produto
                </label>

                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={handleChange}
                  placeholder="Ex: Coca-Cola 350ml"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Categoria
                </label>

                <select
                  name="categoria"
                  value={formulario.categoria}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quantidade
                  </label>

                  <input
                    type="number"
                    name="quantidade"
                    value={formulario.quantidade}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Estoque mínimo
                  </label>

                  <input
                    type="number"
                    name="estoqueMinimo"
                    value={formulario.estoqueMinimo}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Preço de venda
                </label>

                <input
                  type="number"
                  name="preco"
                  value={formulario.preco}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  {produtoSelecionado
                    ? "Salvar alterações"
                    : "Cadastrar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {modalExcluir && produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Excluir produto?
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Tem certeza que deseja excluir{" "}
                <span className="font-medium text-gray-700">
                  {produtoSelecionado.nome}
                </span>
                ? Essa ação não poderá ser desfeita.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={fecharExclusao}
                  className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={excluirProduto}
                  className="w-full sm:w-auto rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 transition"
                >
                  Excluir produto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        aberto={toast.aberto}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
      />
    </div>
  );
}

export default Produtos;