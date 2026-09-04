import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiX,
  FiAlertTriangle,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
import api from "../services/api";
import Toast from "../components/Toast";

function Estoque() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] =
    useState("entrada");

  const [formulario, setFormulario] = useState({
    produto: "",
    quantidade: 1,
    observacao: "",
  });

  const [toast, setToast] = useState({
    aberto: false,
    tipo: "sucesso",
    mensagem: "",
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

  useEffect(() => {
    const tipo = searchParams.get("tipo");

    if (tipo === "entrada" || tipo === "saida") {
      abrirModal(tipo);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

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

  const abrirModal = (tipo, produtoId = "") => {
    setTipoMovimentacao(tipo);

    setFormulario({
      produto: produtoId,
      quantidade: 1,
      observacao: "",
    });

    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);

    setFormulario({
      produto: "",
      quantidade: 1,
      observacao: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const produtoSelecionado = produtos.find(
    (produto) => produto._id === formulario.produto
  );

  const produtosEstoqueBaixo = produtos
    .filter(
      (produto) =>
        produto.quantidade <= produto.estoqueMinimo
    )
    .sort((a, b) => {
      if (a.quantidade === 0 && b.quantidade !== 0) {
        return -1;
      }

      if (a.quantidade !== 0 && b.quantidade === 0) {
        return 1;
      }

      const percentualA =
        a.estoqueMinimo > 0
          ? a.quantidade / a.estoqueMinimo
          : 0;

      const percentualB =
        b.estoqueMinimo > 0
          ? b.quantidade / b.estoqueMinimo
          : 0;

      return percentualA - percentualB;
    });

  const aumentarQuantidade = () => {
    const quantidadeAtual = Number(
      formulario.quantidade || 0
    );

    if (
      tipoMovimentacao === "saida" &&
      produtoSelecionado &&
      quantidadeAtual >= produtoSelecionado.quantidade
    ) {
      return;
    }

    setFormulario({
      ...formulario,
      quantidade: quantidadeAtual + 1,
    });
  };

  const diminuirQuantidade = () => {
    const quantidadeAtual = Number(
      formulario.quantidade || 1
    );

    if (quantidadeAtual <= 1) {
      return;
    }

    setFormulario({
      ...formulario,
      quantidade: quantidadeAtual - 1,
    });
  };

  const alterarQuantidadeDigitada = (e) => {
    const valor = e.target.value;

    if (valor === "") {
      setFormulario({
        ...formulario,
        quantidade: "",
      });

      return;
    }

    const numero = Number(valor);

    if (numero < 1) {
      return;
    }

    if (
      tipoMovimentacao === "saida" &&
      produtoSelecionado &&
      numero > produtoSelecionado.quantidade
    ) {
      setFormulario({
        ...formulario,
        quantidade: produtoSelecionado.quantidade,
      });

      return;
    }

    setFormulario({
      ...formulario,
      quantidade: numero,
    });
  };

  const registrarMovimentacao = async (e) => {
    e.preventDefault();

    const quantidade = Number(formulario.quantidade);

    if (!formulario.produto) {
      mostrarToast("Selecione um produto.", "erro");
      return;
    }

    if (!quantidade || quantidade < 1) {
      mostrarToast(
        "Informe uma quantidade válida.",
        "erro"
      );
      return;
    }

    if (
      tipoMovimentacao === "saida" &&
      produtoSelecionado &&
      quantidade > produtoSelecionado.quantidade
    ) {
      mostrarToast(
        `Estoque insuficiente. Disponível: ${produtoSelecionado.quantidade}.`,
        "erro"
      );
      return;
    }

    try {
      const rota =
        tipoMovimentacao === "entrada"
          ? "/movimentacoes/entrada"
          : "/movimentacoes/saida";

      await api.post(rota, {
        produtoId: formulario.produto,
        quantidade,
        observacao: formulario.observacao,
      });

      fecharModal();

      await carregarProdutos();

      mostrarToast(
        tipoMovimentacao === "entrada"
          ? "Entrada registrada com sucesso!"
          : "Saída registrada com sucesso!"
      );
    } catch (error) {
      console.error(
        "Erro ao registrar movimentação:",
        error
      );

      mostrarToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erro ao registrar movimentação.",
        "erro"
      );
    }
  };

  if (carregando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-500">
          Carregando estoque...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toast
        aberto={toast.aberto}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
      />

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Estoque
        </h1>

        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Controle as entradas, saídas e quantidades dos produtos
        </p>
      </div>

      {/* ALERTA DE ESTOQUE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                produtosEstoqueBaixo.length > 0
                  ? "bg-orange-50 text-orange-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {produtosEstoqueBaixo.length > 0 ? (
                <FiAlertTriangle size={20} />
              ) : (
                <FiCheck size={20} />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">
                Alerta de estoque
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {produtosEstoqueBaixo.length > 0
                  ? `${produtosEstoqueBaixo.length} ${
                      produtosEstoqueBaixo.length === 1
                        ? "produto precisa"
                        : "produtos precisam"
                    } de atenção`
                  : "Todos os produtos estão com estoque normal"}
              </p>
            </div>
          </div>

          {produtosEstoqueBaixo.length > 0 && (
            <span className="inline-flex self-start sm:self-auto items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              {produtosEstoqueBaixo.length} alerta
              {produtosEstoqueBaixo.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {produtosEstoqueBaixo.length === 0 ? (
          <div className="px-4 sm:px-6 py-6">
            <div className="flex items-center gap-3">
              <FiCheck
                size={20}
                className="text-green-600 shrink-0"
              />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Estoque em dia
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Nenhum produto está abaixo ou no estoque mínimo.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {produtosEstoqueBaixo
              .slice(0, 5)
              .map((produto) => {
                const semEstoque =
                  produto.quantidade === 0;

                const faltando = Math.max(
                  produto.estoqueMinimo -
                    produto.quantidade,
                  0
                );

                return (
                  <div
                    key={produto._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                          semEstoque
                            ? "bg-red-50 text-red-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        <FiAlertTriangle size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {produto.nome}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {semEstoque
                            ? "Produto sem estoque"
                            : `Faltam ${faltando} ${
                                faltando === 1
                                  ? "unidade"
                                  : "unidades"
                              } para atingir o mínimo`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400">
                          Atual
                        </p>

                        <p
                          className={`text-sm font-bold ${
                            semEstoque
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {produto.quantidade}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400">
                          Mínimo
                        </p>

                        <p className="text-sm font-semibold text-gray-700">
                          {produto.estoqueMinimo}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          abrirModal(
                            "entrada",
                            produto._id
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
                      >
                        <FiPlus size={15} />
                        <span className="hidden xs:inline">
                          Repor
                        </span>
                        <span className="xs:hidden">
                          +
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}

            {produtosEstoqueBaixo.length > 5 && (
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    const elemento =
                      document.getElementById(
                        "estoque-atual"
                      );

                    elemento?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  Ver todos os produtos
                  <FiArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <button
          onClick={() => abrirModal("entrada")}
          className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 text-left hover:border-green-300 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition">
              <FiPlus size={24} />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Entrada de estoque
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Adicionar produtos ao estoque
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => abrirModal("saida")}
          className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 text-left hover:border-red-300 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition">
              <FiMinus size={24} />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Saída de estoque
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Retirar produtos do estoque
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Produtos
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {produtos.length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Itens em estoque
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {produtos.reduce(
              (total, produto) =>
                total +
                Number(produto.quantidade || 0),
              0
            )}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Estoque baixo
          </p>

          <p className="text-2xl font-bold text-orange-600 mt-1">
            {produtosEstoqueBaixo.length}
          </p>
        </div>
      </div>

      {/* Estoque atual */}
      <div
        id="estoque-atual"
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FiRefreshCw size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Estoque atual
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Quantidade disponível de cada produto
            </p>
          </div>
        </div>

        {produtos.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <FiRefreshCw
              size={30}
              className="mx-auto text-gray-300 mb-3"
            />

            <p className="font-medium text-gray-700">
              Nenhum produto cadastrado
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Cadastre um produto para começar a controlar o estoque.
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
                      Produto
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Categoria
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Estoque atual
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Estoque mínimo
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Situação
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => {
                    const estoqueBaixo =
                      produto.quantidade <=
                      produto.estoqueMinimo;

                    const semEstoque =
                      produto.quantidade === 0;

                    return (
                      <tr
                        key={produto._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {produto.nome}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {produto.categoria}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              semEstoque
                                ? "text-red-600"
                                : estoqueBaixo
                                ? "text-orange-600"
                                : "text-gray-900"
                            }`}
                          >
                            {produto.quantidade}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {produto.estoqueMinimo}
                        </td>

                        <td className="px-6 py-4">
                          {semEstoque ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                              <FiAlertTriangle size={13} />
                              Sem estoque
                            </span>
                          ) : estoqueBaixo ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                              <FiAlertTriangle size={13} />
                              Estoque baixo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                              <FiCheck size={13} />
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {produtos.map((produto) => {
                const estoqueBaixo =
                  produto.quantidade <=
                  produto.estoqueMinimo;

                const semEstoque =
                  produto.quantidade === 0;

                return (
                  <div
                    key={produto._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {produto.nome}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {produto.categoria}
                        </p>
                      </div>

                      {semEstoque ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                          <FiAlertTriangle size={12} />
                          Sem estoque
                        </span>
                      ) : estoqueBaixo ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600">
                          <FiAlertTriangle size={12} />
                          Baixo
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-600">
                          <FiCheck size={12} />
                          Normal
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-400">
                          Estoque atual
                        </p>

                        <p
                          className={`text-lg font-bold mt-1 ${
                            semEstoque
                              ? "text-red-600"
                              : estoqueBaixo
                              ? "text-orange-600"
                              : "text-gray-900"
                          }`}
                        >
                          {produto.quantidade}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-400">
                          Estoque mínimo
                        </p>

                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {produto.estoqueMinimo}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          abrirModal(
                            "entrada",
                            produto._id
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition"
                      >
                        <FiPlus size={16} />
                        Entrada
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          abrirModal(
                            "saida",
                            produto._id
                          )
                        }
                        disabled={produto.quantidade === 0}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <FiMinus size={16} />
                        Saída
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-4">
          <div className="w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Cabeçalho */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white p-4 sm:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                    tipoMovimentacao === "entrada"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {tipoMovimentacao === "entrada" ? (
                    <FiPlus size={20} />
                  ) : (
                    <FiMinus size={20} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {tipoMovimentacao === "entrada"
                      ? "Entrada de estoque"
                      : "Saída de estoque"}
                  </h2>

                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {tipoMovimentacao === "entrada"
                      ? "Adicione produtos ao estoque"
                      : "Retire produtos do estoque"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <FiX size={21} />
              </button>
            </div>

            {/* Formulário */}
            <form
              onSubmit={registrarMovimentacao}
              className="p-4 sm:p-6 space-y-5"
            >
              {/* Produto */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Produto
                </label>

                <select
                  name="produto"
                  value={formulario.produto}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Selecione um produto
                  </option>

                  {produtos.map((produto) => (
                    <option
                      key={produto._id}
                      value={produto._id}
                    >
                      {produto.nome} — estoque:{" "}
                      {produto.quantidade}
                    </option>
                  ))}
                </select>

                {produtoSelecionado && (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-sm text-gray-500">
                      Estoque atual
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {produtoSelecionado.quantidade}{" "}
                      unidades
                    </span>
                  </div>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Quantidade
                </label>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={diminuirQuantidade}
                    disabled={
                      Number(formulario.quantidade) <= 1
                    }
                    className="w-12 h-12 shrink-0 flex items-center justify-center rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <FiMinus size={18} />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={formulario.quantidade}
                    onChange={alterarQuantidadeDigitada}
                    required
                    className="w-full h-12 border-y border-gray-300 px-4 text-center text-base font-semibold text-gray-900 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={aumentarQuantidade}
                    disabled={
                      tipoMovimentacao === "saida" &&
                      produtoSelecionado &&
                      Number(formulario.quantidade) >=
                        produtoSelecionado.quantidade
                    }
                    className="w-12 h-12 shrink-0 flex items-center justify-center rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>

                {tipoMovimentacao === "saida" &&
                  produtoSelecionado && (
                    <p className="mt-2 text-xs text-gray-500">
                      Máximo disponível:{" "}
                      <span className="font-medium text-gray-700">
                        {produtoSelecionado.quantidade}
                      </span>
                    </p>
                  )}
              </div>

              {/* Observação */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Observação
                  <span className="font-normal text-gray-400">
                    {" "}
                    (opcional)
                  </span>
                </label>

                <textarea
                  name="observacao"
                  value={formulario.observacao}
                  onChange={handleChange}
                  placeholder={
                    tipoMovimentacao === "entrada"
                      ? "Ex: Reposição de mercadoria"
                      : "Ex: Produto danificado, perda, ajuste..."
                  }
                  rows="3"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 sm:px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium text-white transition ${
                    tipoMovimentacao === "entrada"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {tipoMovimentacao === "entrada"
                    ? "Confirmar entrada"
                    : "Confirmar saída"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;