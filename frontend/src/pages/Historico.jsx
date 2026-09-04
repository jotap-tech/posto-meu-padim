import { useEffect, useState } from "react";
import {
  FiClipboard,
  FiArrowDown,
  FiArrowUp,
  FiShoppingCart,
} from "react-icons/fi";
import api from "../services/api";

function Historico() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [vendas, setVendas] = useState([]);

  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const [movimentacoesResponse, vendasResponse] =
        await Promise.all([
          api.get("/movimentacoes"),
          api.get("/vendas"),
        ]);

      setMovimentacoes(movimentacoesResponse.data);
      setVendas(vendasResponse.data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);

      alert(
        error.response?.data?.message ||
          "Erro ao carregar histórico."
      );
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  const formatarPreco = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const movimentacoesFiltradas =
    filtro === "todos"
      ? movimentacoes
      : movimentacoes.filter(
          (movimentacao) =>
            movimentacao.tipo === filtro
        );

  if (carregando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-500">
          Carregando histórico...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Histórico
        </h1>

        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Consulte as movimentações de estoque e vendas realizadas
        </p>
      </div>

      {/* Movimentações de estoque */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiClipboard size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Movimentações de estoque
                </h2>

                <p className="text-sm text-gray-500">
                  Entradas e saídas registradas
                </p>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto">
              <button
                onClick={() => setFiltro("todos")}
                className={`px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filtro === "todos"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => setFiltro("entrada")}
                className={`px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filtro === "entrada"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Entradas
              </button>

              <button
                onClick={() => setFiltro("saida")}
                className={`px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filtro === "saida"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Saídas
              </button>
            </div>
          </div>
        </div>

        {movimentacoesFiltradas.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <FiClipboard
              size={30}
              className="mx-auto text-gray-300 mb-3"
            />

            <p className="text-gray-500">
              Nenhuma movimentação encontrada.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Data
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Produto
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Tipo
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Quantidade
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Fornecedor
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Observação
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {movimentacoesFiltradas.map(
                    (movimentacao) => (
                      <tr
                        key={movimentacao._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-500">
                          {formatarData(
                            movimentacao.createdAt
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {movimentacao.produto?.nome ||
                              "Produto removido"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {movimentacao.produto?.categoria ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {movimentacao.tipo ===
                          "entrada" ? (
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              <FiArrowDown size={13} />
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                              <FiArrowUp size={13} />
                              Saída
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {movimentacao.quantidade}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {movimentacao.fornecedor?.nome ||
                            "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {movimentacao.observacao || "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {movimentacoesFiltradas.map(
                (movimentacao) => {
                  const entrada =
                    movimentacao.tipo === "entrada";

                  return (
                    <div
                      key={movimentacao._id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {movimentacao.produto?.nome ||
                              "Produto removido"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {movimentacao.produto?.categoria ||
                              "-"}
                          </p>
                        </div>

                        {entrada ? (
                          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <FiArrowDown size={13} />
                            Entrada
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <FiArrowUp size={13} />
                            Saída
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-400">
                            Quantidade
                          </p>

                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {movimentacao.quantidade}
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-400">
                            Data
                          </p>

                          <p className="text-sm font-medium text-gray-700 mt-1">
                            {formatarData(
                              movimentacao.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-xs text-gray-400">
                            Fornecedor
                          </p>

                          <p className="text-sm text-gray-700 mt-0.5">
                            {movimentacao.fornecedor?.nome ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Observação
                          </p>

                          <p className="text-sm text-gray-700 mt-0.5 break-words">
                            {movimentacao.observacao ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>

      {/* Vendas */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FiShoppingCart size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Vendas realizadas
              </h2>

              <p className="text-sm text-gray-500">
                Histórico das vendas registradas
              </p>
            </div>
          </div>
        </div>

        {vendas.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <FiShoppingCart
              size={30}
              className="mx-auto text-gray-300 mb-3"
            />

            <p className="text-gray-500">
              Nenhuma venda realizada.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Data
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Produtos
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Quantidade
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vendas.map((venda) => {
                    const quantidadeTotal =
                      venda.itens.reduce(
                        (total, item) =>
                          total + item.quantidade,
                        0
                      );

                    return (
                      <tr
                        key={venda._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-500">
                          {formatarData(
                            venda.createdAt
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {venda.itens.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="text-gray-900"
                                >
                                  <span className="font-medium">
                                    {item.produto?.nome ||
                                      "Produto removido"}
                                  </span>

                                  <span className="text-gray-400 ml-2">
                                    {item.quantidade}x
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {quantidadeTotal}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-600">
                            {formatarPreco(venda.total)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {vendas.map((venda) => {
                const quantidadeTotal =
                  venda.itens.reduce(
                    (total, item) =>
                      total + item.quantidade,
                    0
                  );

                return (
                  <div
                    key={venda._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400">
                          Data da venda
                        </p>

                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {formatarData(
                            venda.createdAt
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="text-lg font-bold text-green-600 mt-1">
                          {formatarPreco(venda.total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">
                          Produtos
                        </p>

                        <p className="text-xs font-medium text-gray-500">
                          {quantidadeTotal}{" "}
                          {quantidadeTotal === 1
                            ? "item"
                            : "itens"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {venda.itens.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {item.produto?.nome ||
                                  "Produto removido"}
                              </span>

                              <span className="shrink-0 text-sm text-gray-500">
                                {item.quantidade}x
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Historico;