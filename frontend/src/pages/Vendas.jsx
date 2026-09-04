import { useEffect, useState } from "react";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiCheck,
  FiX,
  FiSearch,
} from "react-icons/fi";
import api from "../services/api";
import Toast from "../components/Toast";

function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  const [busca, setBusca] = useState("");
  const [buscaFocada, setBuscaFocada] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [quantidade, setQuantidade] = useState(1);

  const [carregando, setCarregando] = useState(true);
  const [finalizando, setFinalizando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);

  const [toast, setToast] = useState({
    aberto: false,
    tipo: "sucesso",
    mensagem: "",
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const mostrarToast = (
    mensagem,
    tipo = "sucesso"
  ) => {
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

  const carregarProdutos = async () => {
    try {
      const response = await api.get("/produtos");

      setProdutos(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar produtos:",
        error
      );

      mostrarToast(
        error.response?.data?.message ||
          "Erro ao carregar produtos.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const produtosFiltrados = produtos
    .filter(
      (produto) =>
        produto.quantidade > 0 &&
        produto.nome
          .toLowerCase()
          .includes(busca.toLowerCase())
    )
    .slice(0, 5);

  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setBusca("");
    setBuscaFocada(false);
    setQuantidade(1);
  };

  const limparProdutoSelecionado = () => {
    setProdutoSelecionado(null);
    setQuantidade(1);
    setBusca("");
    setBuscaFocada(false);
  };

  const adicionarProduto = () => {
    if (!produtoSelecionado) {
      mostrarToast(
        "Selecione um produto.",
        "erro"
      );
      return;
    }

    if (
      !quantidade ||
      Number(quantidade) < 1
    ) {
      mostrarToast(
        "Informe uma quantidade válida.",
        "erro"
      );
      return;
    }

    const itemExistente = carrinho.find(
      (item) =>
        item.produtoId ===
        produtoSelecionado._id
    );

    const quantidadeAtual = itemExistente
      ? itemExistente.quantidade
      : 0;

    const novaQuantidade =
      quantidadeAtual + Number(quantidade);

    if (
      novaQuantidade >
      produtoSelecionado.quantidade
    ) {
      mostrarToast(
        `Estoque insuficiente. Disponível: ${produtoSelecionado.quantidade}.`,
        "erro"
      );
      return;
    }

    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.produtoId ===
          produtoSelecionado._id
            ? {
                ...item,
                quantidade: novaQuantidade,
                subtotal:
                  novaQuantidade *
                  produtoSelecionado.preco,
              }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          produtoId:
            produtoSelecionado._id,
          nome: produtoSelecionado.nome,
          preco: produtoSelecionado.preco,
          quantidade: Number(quantidade),
          subtotal:
            Number(quantidade) *
            produtoSelecionado.preco,
        },
      ]);
    }

    limparProdutoSelecionado();
  };

  const aumentarQuantidadeSelecionada = () => {
    if (!produtoSelecionado) {
      return;
    }

    if (
      Number(quantidade) >=
      produtoSelecionado.quantidade
    ) {
      return;
    }

    setQuantidade(
      (valor) => Number(valor || 0) + 1
    );
  };

  const diminuirQuantidadeSelecionada = () => {
    setQuantidade((valor) => {
      const novaQuantidade =
        Number(valor || 1) - 1;

      return novaQuantidade < 1
        ? 1
        : novaQuantidade;
    });
  };

  const alterarQuantidadeSelecionada = (e) => {
    const valor = e.target.value;

    if (valor === "") {
      setQuantidade("");
      return;
    }

    const numero = Number(valor);

    if (numero < 1) {
      return;
    }

    if (
      produtoSelecionado &&
      numero > produtoSelecionado.quantidade
    ) {
      setQuantidade(
        produtoSelecionado.quantidade
      );
      return;
    }

    setQuantidade(numero);
  };

  const aumentarQuantidade = (produtoId) => {
    const produto = produtos.find(
      (item) => item._id === produtoId
    );

    const item = carrinho.find(
      (item) => item.produtoId === produtoId
    );

    if (!produto || !item) {
      return;
    }

    if (
      item.quantidade >= produto.quantidade
    ) {
      mostrarToast(
        "Não há mais unidades disponíveis em estoque.",
        "erro"
      );
      return;
    }

    setCarrinho(
      carrinho.map((item) =>
        item.produtoId === produtoId
          ? {
              ...item,
              quantidade:
                item.quantidade + 1,
              subtotal:
                (item.quantidade + 1) *
                item.preco,
            }
          : item
      )
    );
  };

  const diminuirQuantidade = (produtoId) => {
    const item = carrinho.find(
      (item) => item.produtoId === produtoId
    );

    if (!item) {
      return;
    }

    if (item.quantidade === 1) {
      removerProduto(produtoId);
      return;
    }

    setCarrinho(
      carrinho.map((item) =>
        item.produtoId === produtoId
          ? {
              ...item,
              quantidade:
                item.quantidade - 1,
              subtotal:
                (item.quantidade - 1) *
                item.preco,
            }
          : item
      )
    );
  };

  const removerProduto = (produtoId) => {
    setCarrinho(
      carrinho.filter(
        (item) =>
          item.produtoId !== produtoId
      )
    );
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  const calcularTotal = () => {
    return carrinho.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );
  };

  const calcularQuantidadeItens = () => {
    return carrinho.reduce(
      (total, item) =>
        total + item.quantidade,
      0
    );
  };

  const formatarPreco = (valor) => {
    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      mostrarToast(
        "Adicione pelo menos um produto à venda.",
        "erro"
      );
      return;
    }

    try {
      setFinalizando(true);

      const itens = carrinho.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
      }));

      await api.post("/vendas", {
        itens,
      });

      setModalAberto(false);
      setCarrinho([]);
      limparProdutoSelecionado();

      await carregarProdutos();

      mostrarToast(
        "Venda realizada com sucesso!"
      );
    } catch (error) {
      console.error(
        "Erro ao realizar venda:",
        error
      );

      mostrarToast(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Erro ao realizar venda.",
        "erro"
      );
    } finally {
      setFinalizando(false);
    }
  };

  if (carregando) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Carregando produtos...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Toast
        aberto={toast.aberto}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
      />

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Vendas
        </h1>

        <p className="mt-1 text-gray-500">
          Registre as vendas e dê baixa automaticamente no estoque
        </p>
      </div>

      {/* Área principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adicionar produto */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiShoppingCart size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Adicionar produto
              </h2>

              <p className="text-sm text-gray-500">
                Pesquise e selecione um produto
              </p>
            </div>
          </div>

          {/* Busca */}
          {!produtoSelecionado ? (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto
              </label>

              <div className="relative">
                <FiSearch
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                  onFocus={() =>
                    setBuscaFocada(true)
                  }
                  onBlur={() => {
                    setTimeout(() => {
                      setBuscaFocada(false);
                    }, 150);
                  }}
                  placeholder="Digite o nome do produto..."
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Lista de produtos */}
              {buscaFocada && (
                <div className="absolute left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {busca.trim() === ""
                        ? "Produtos disponíveis"
                        : "Resultados"}
                    </p>
                  </div>

                  {produtosFiltrados.length ===
                  0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      Nenhum produto encontrado.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {produtosFiltrados.map(
                        (produto) => (
                          <button
                            key={produto._id}
                            type="button"
                            onClick={() =>
                              selecionarProduto(
                                produto
                              )
                            }
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {produto.nome}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {produto.categoria}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatarPreco(
                                  produto.preco
                                )}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                Estoque:{" "}
                                {
                                  produto.quantidade
                                }
                              </p>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto selecionado
              </label>

              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {produtoSelecionado.nome}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatarPreco(
                        produtoSelecionado.preco
                      )}{" "}
                      • Estoque:{" "}
                      {
                        produtoSelecionado.quantidade
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      limparProdutoSelecionado
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 transition"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade
            </label>

            <div className="flex items-center max-w-xs">
              <button
                type="button"
                onClick={
                  diminuirQuantidadeSelecionada
                }
                disabled={
                  Number(quantidade) <= 1
                }
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-l-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FiMinus size={18} />
              </button>

              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={
                  alterarQuantidadeSelecionada
                }
                className="w-full h-12 border-y border-gray-300 px-3 text-center text-base font-semibold text-gray-900 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={
                  aumentarQuantidadeSelecionada
                }
                disabled={
                  !produtoSelecionado ||
                  Number(quantidade) >=
                    produtoSelecionado.quantidade
                }
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FiPlus size={18} />
              </button>
            </div>
          </div>

          {/* Adicionar */}
          <button
            onClick={adicionarProduto}
            disabled={!produtoSelecionado}
            className="mt-5 flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <FiPlus size={18} />
            Adicionar ao carrinho
          </button>
        </div>

        {/* Resumo */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900">
            Resumo da venda
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Produtos
              </span>

              <span className="font-medium text-gray-900">
                {carrinho.length}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Quantidade
              </span>

              <span className="font-medium text-gray-900">
                {calcularQuantidadeItens()}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-5 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                Total
              </span>

              <span className="text-2xl font-bold text-gray-900">
                {formatarPreco(
                  calcularTotal()
                )}
              </span>
            </div>
          </div>

          <button
            onClick={() => setModalAberto(true)}
            disabled={carrinho.length === 0}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <FiCheck size={18} />
            Finalizar venda
          </button>

          {carrinho.length > 0 && (
            <button
              onClick={limparCarrinho}
              className="mt-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Limpar carrinho
            </button>
          )}
        </div>
      </div>

      {/* Carrinho */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrinho
          </h2>
        </div>

        {carrinho.length === 0 ? (
          <div className="p-10 text-center">
            <FiShoppingCart
              size={30}
              className="mx-auto text-gray-300 mb-3"
            />

            <p className="text-gray-500">
              Nenhum produto adicionado à venda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-4 font-medium text-gray-500">
                    Produto
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-500">
                    Preço
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-500">
                    Quantidade
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-500">
                    Subtotal
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-500">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {carrinho.map((item) => (
                  <tr
                    key={item.produtoId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.nome}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {formatarPreco(item.preco)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            diminuirQuantidade(
                              item.produtoId
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <FiMinus size={14} />
                        </button>

                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantidade}
                        </span>

                        <button
                          onClick={() =>
                            aumentarQuantidade(
                              item.produtoId
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatarPreco(
                        item.subtotal
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          removerProduto(
                            item.produtoId
                          )
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirmar venda
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Confira os dados antes de finalizar.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalAberto(false)
                }
                disabled={finalizando}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
              >
                <FiX size={21} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {carrinho.map((item) => (
                  <div
                    key={item.produtoId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.nome}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.quantidade} x{" "}
                        {formatarPreco(
                          item.preco
                        )}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-gray-900">
                      {formatarPreco(
                        item.subtotal
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-5 pt-5 flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  Total
                </span>

                <span className="text-xl font-bold text-gray-900">
                  {formatarPreco(
                    calcularTotal()
                  )}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    setModalAberto(false)
                  }
                  disabled={finalizando}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={finalizarVenda}
                  disabled={finalizando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:bg-gray-300"
                >
                  <FiCheck size={17} />

                  {finalizando
                    ? "Finalizando..."
                    : "Confirmar venda"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendas;