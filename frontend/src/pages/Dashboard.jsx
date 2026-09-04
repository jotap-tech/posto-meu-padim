import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiAlertTriangle,
  FiShoppingCart,
  FiDollarSign,
  FiClock,
  FiPlus,
  FiArrowDown,
  FiArrowUp,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";
import api from "../services/api";
import Toast from "../components/Toast";

function Dashboard() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [toast, setToast] = useState({
    aberto: false,
    tipo: "sucesso",
    mensagem: "",
  });

  useEffect(() => {
    carregarDashboard();
  }, []);

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

  const carregarDashboard = async () => {
    try {
      const [produtosResponse, vendasResponse] =
        await Promise.all([
          api.get("/produtos"),
          api.get("/vendas"),
        ]);

      setProdutos(produtosResponse.data);
      setVendas(vendasResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);

      mostrarToast(
        error.response?.data?.message ||
          "Erro ao carregar dashboard.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const formatarPreco = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  const vendaEhHoje = (data) => {
    const hoje = new Date();
    const dataVenda = new Date(data);

    return (
      dataVenda.getDate() === hoje.getDate() &&
      dataVenda.getMonth() === hoje.getMonth() &&
      dataVenda.getFullYear() === hoje.getFullYear()
    );
  };

  const produtosEstoqueBaixo = produtos.filter(
    (produto) =>
      Number(produto.quantidade || 0) <=
      Number(produto.estoqueMinimo || 0)
  );

  const faturamentoTotal = vendas.reduce(
    (total, venda) =>
      total + Number(venda.total || 0),
    0
  );

  const totalItensVendidos = vendas.reduce(
    (total, venda) =>
      total +
      venda.itens.reduce(
        (subtotal, item) =>
          subtotal + Number(item.quantidade || 0),
        0
      ),
    0
  );

  const vendasHoje = vendas.filter((venda) =>
    vendaEhHoje(venda.createdAt)
  );

  const quantidadeVendasHoje = vendasHoje.length;

  const faturamentoHoje = vendasHoje.reduce(
    (total, venda) =>
      total + Number(venda.total || 0),
    0
  );

  const itensVendidosHoje = vendasHoje.reduce(
    (total, venda) =>
      total +
      venda.itens.reduce(
        (subtotal, item) =>
          subtotal + Number(item.quantidade || 0),
        0
      ),
    0
  );

  const ultimasVendas = vendas.slice(0, 5);

  // =====================================================
  // GRÁFICO - FATURAMENTO DOS ÚLTIMOS 7 DIAS
  // =====================================================

  const gerarDadosGrafico = () => {
    const hoje = new Date();
    const dados = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);

      data.setHours(0, 0, 0, 0);
      data.setDate(data.getDate() - i);

      const vendasDoDia = vendas.filter((venda) => {
        const dataVenda = new Date(venda.createdAt);

        return (
          dataVenda.getDate() === data.getDate() &&
          dataVenda.getMonth() === data.getMonth() &&
          dataVenda.getFullYear() === data.getFullYear()
        );
      });

      const faturamento = vendasDoDia.reduce(
        (total, venda) =>
          total + Number(venda.total || 0),
        0
      );

      dados.push({
        data,
        faturamento,
      });
    }

    return dados;
  };

  const dadosGrafico = gerarDadosGrafico();

  const maiorFaturamento = Math.max(
    ...dadosGrafico.map(
      (item) => item.faturamento
    ),
    1
  );

  const faturamentoUltimos7Dias =
    dadosGrafico.reduce(
      (total, item) =>
        total + item.faturamento,
      0
    );

  const formatarDia = (data) => {
    return data
      .toLocaleDateString("pt-BR", {
        weekday: "short",
      })
      .replace(".", "");
  };

  if (carregando) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Carregando dashboard...
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

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Visão geral do estoque e das vendas
        </p>
      </div>

      {/* =====================================================
          AÇÕES RÁPIDAS
      ===================================================== */}

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Ações rápidas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Nova venda */}
          <button
            onClick={() => navigate("/vendas")}
            className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-green-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <FiShoppingCart size={21} />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Nova venda
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Registrar venda
                </p>
              </div>
            </div>
          </button>

          {/* Entrada */}
          <button
            onClick={() =>
              navigate("/estoque?tipo=entrada")
            }
            className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiArrowDown size={21} />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Entrada no estoque
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Adicionar estoque
                </p>
              </div>
            </div>
          </button>

          {/* Saída */}
          <button
            onClick={() =>
              navigate("/estoque?tipo=saida")
            }
            className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-red-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FiArrowUp size={21} />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Saída no estoque
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Dar baixa no estoque
                </p>
              </div>
            </div>
          </button>

          {/* Novo produto */}
          <button
            onClick={() => navigate("/produtos")}
            className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-purple-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiPlus size={21} />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Novo produto
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Cadastrar produto
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================
          INDICADORES PRINCIPAIS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Vendas hoje */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Vendas hoje
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {quantidadeVendasHoje}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {quantidadeVendasHoje === 1
                  ? "venda realizada hoje"
                  : "vendas realizadas hoje"}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FiShoppingCart size={21} />
            </div>
          </div>
        </div>

        {/* Faturamento hoje */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Faturamento hoje
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatarPreco(faturamentoHoje)}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Total vendido hoje
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FiDollarSign size={21} />
            </div>
          </div>
        </div>

        {/* Estoque baixo */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Estoque baixo
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {produtosEstoqueBaixo.length}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {produtosEstoqueBaixo.length === 0
                  ? "Estoque em dia"
                  : produtosEstoqueBaixo.length === 1
                  ? "produto precisa de atenção"
                  : "produtos precisam de atenção"}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <FiAlertTriangle size={21} />
            </div>
          </div>
        </div>

        {/* Itens vendidos hoje */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Itens vendidos hoje
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {itensVendidosHoje}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Unidades vendidas hoje
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiPackage size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          GRÁFICO + ALERTA DE ESTOQUE
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        {/* Gráfico */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <FiTrendingUp size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Faturamento
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Últimos 7 dias
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                Total no período
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatarPreco(
                  faturamentoUltimos7Dias
                )}
              </p>
            </div>
          </div>

          {/* Área do gráfico */}
          <div className="mt-8">
            <div className="h-56 flex items-end justify-between gap-3 border-b border-gray-200">
              {dadosGrafico.map((item, index) => {
                const hoje =
                  index === dadosGrafico.length - 1;

                const altura =
                  item.faturamento === 0
                    ? 6
                    : Math.max(
                        (item.faturamento /
                          maiorFaturamento) *
                          180,
                        14
                      );

                return (
                  <div
                    key={item.data.toISOString()}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >
                    <div className="relative w-full flex justify-end items-center flex-col group">
                      {/* Tooltip */}
                      {item.faturamento > 0 && (
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap z-10">
                          {formatarPreco(
                            item.faturamento
                          )}
                        </div>
                      )}

                      {/* Barra */}
                      <div
                        className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                          hoje
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-green-200 hover:bg-green-300"
                        }`}
                        style={{
                          height: `${altura}px`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dias */}
            <div className="flex justify-between gap-3 mt-3">
              {dadosGrafico.map((item, index) => {
                const hoje =
                  index === dadosGrafico.length - 1;

                return (
                  <div
                    key={item.data.toISOString()}
                    className={`flex-1 text-center text-xs ${
                      hoje
                        ? "font-semibold text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {hoje
                      ? "Hoje"
                      : formatarDia(item.data)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =====================================================
            ALERTA DE ESTOQUE
        ===================================================== */}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                    produtosEstoqueBaixo.length > 0
                      ? "bg-orange-50 text-orange-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {produtosEstoqueBaixo.length > 0 ? (
                    <FiAlertTriangle size={21} />
                  ) : (
                    <FiPackage size={21} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Alerta de estoque
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Produtos que precisam de atenção
                  </p>
                </div>
              </div>

              <span
                className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                  produtosEstoqueBaixo.length > 0
                    ? "bg-orange-50 text-orange-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {produtosEstoqueBaixo.length}
              </span>
            </div>
          </div>

          {produtosEstoqueBaixo.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <FiPackage size={22} />
              </div>

              <p className="mt-3 font-medium text-gray-900">
                Estoque em dia
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Nenhum produto precisa de reposição.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {produtosEstoqueBaixo
                  .slice(0, 4)
                  .map((produto) => {
                    const estoqueAtual = Number(
                      produto.quantidade || 0
                    );

                    const estoqueMinimo = Number(
                      produto.estoqueMinimo || 0
                    );

                    const semEstoque =
                      estoqueAtual === 0;

                    return (
                      <div
                        key={produto._id}
                        className="px-6 py-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {produto.nome}
                              </p>

                              {semEstoque && (
                                <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                  Sem estoque
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mt-1">
                              Mínimo: {estoqueMinimo}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p
                              className={`text-lg font-bold ${
                                semEstoque
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {estoqueAtual}
                            </p>

                            <p className="text-[11px] text-gray-400">
                              atual
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                {produtosEstoqueBaixo.length > 4 && (
                  <p className="text-xs text-gray-400 mb-3 text-center">
                    +{" "}
                    {produtosEstoqueBaixo.length - 4}{" "}
                    produtos precisam de atenção
                  </p>
                )}

                <button
                  onClick={() =>
                    navigate("/estoque")
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition"
                >
                  Ver estoque
                  <FiArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          RESUMO RÁPIDO
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Faturamento total
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatarPreco(faturamentoTotal)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Desde o início do sistema
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Itens vendidos
          </p>

          <p className="text-2xl font-bold text-blue-600 mt-2">
            {totalItensVendidos}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Desde o início do sistema
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Produtos cadastrados
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {produtos.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Produtos no sistema
          </p>
        </div>
      </div>

      {/* =====================================================
          ÚLTIMAS VENDAS
      ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FiClock size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Últimas vendas
              </h2>

              <p className="text-sm text-gray-500">
                Vendas mais recentes
              </p>
            </div>
          </div>
        </div>

        {ultimasVendas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              Nenhuma venda realizada.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ultimasVendas.map((venda) => {
              const quantidade =
                venda.itens.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantidade || 0
                    ),
                  0
                );

              return (
                <div
                  key={venda._id}
                  className="px-6 py-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Venda com {quantidade}{" "}
                        {quantidade === 1
                          ? "item"
                          : "itens"}
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        {formatarData(
                          venda.createdAt
                        )}
                      </p>
                    </div>

                    <p className="font-semibold text-green-600 whitespace-nowrap">
                      {formatarPreco(venda.total)}
                    </p>
                  </div>

                  <div className="mt-3 space-y-1">
                    {venda.itens.map(
                      (item, index) => (
                        <p
                          key={index}
                          className="text-sm text-gray-500"
                        >
                          {item.quantidade}x{" "}
                          {item.produto?.nome ||
                            "Produto removido"}
                        </p>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;