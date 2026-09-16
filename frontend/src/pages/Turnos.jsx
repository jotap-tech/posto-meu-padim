import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiDollarSign,
  FiPackage,
  FiPrinter,
  FiShoppingCart,
  FiUser,
  FiX,
} from "react-icons/fi";
import api from "../services/api";
import Toast from "../components/Toast";

function Turnos() {
  const [turnoAtual, setTurnoAtual] = useState(null);
  const [turnosFechados, setTurnosFechados] = useState([]);
  const [turnoExibido, setTurnoExibido] = useState(null);
  const [nomeTurno, setNomeTurno] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [executando, setExecutando] = useState(false);
  const [toast, setToast] = useState({
    aberto: false,
    tipo: "sucesso",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ aberto: true, tipo, mensagem });

    setTimeout(() => {
      setToast({ aberto: false, tipo: "sucesso", mensagem: "" });
    }, 3000);
  };

  const formatarData = (valor) => {
    if (!valor) return "-";

    return new Date(valor).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getUsuarioLogado = () => {
    const token = localStorage.getItem("token");

    if (!token) return "Funcionário";

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      return decoded.usuario || "Funcionário";
    } catch {
      return "Funcionário";
    }
  };

  const carregarTurnos = async () => {
    try {
      const [turnoAtualResponse, turnosFechadosResponse] = await Promise.all([
        api.get("/turnos/atual"),
        api.get("/turnos"),
      ]);

      setTurnoAtual(turnoAtualResponse.data?.turno || null);
      setTurnosFechados(turnosFechadosResponse.data?.turnos || []);
      setTurnoExibido(null);
    } catch (error) {
      console.error("Erro ao carregar turnos:", error);
      mostrarToast(
        error.response?.data?.message || "Erro ao carregar turnos.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTurnos();
  }, []);

  const iniciarTurno = async () => {
    try {
      setExecutando(true);
      await api.post("/turnos/iniciar", {
        nome: nomeTurno.trim(),
      });
      setNomeTurno("");
      await carregarTurnos();
      mostrarToast("Turno iniciado com sucesso.");
    } catch (error) {
      console.error("Erro ao iniciar turno:", error);
      mostrarToast(
        error.response?.data?.message || "Erro ao iniciar turno.",
        "erro"
      );
    } finally {
      setExecutando(false);
    }
  };

  const fecharTurno = async () => {
    try {
      setExecutando(true);
      setConfirmacaoAberta(false);

      const response = await api.post("/turnos/fechar");
      const turnoFechado = response.data?.turno || null;

      if (turnoFechado) {
        setTurnoExibido(turnoFechado);
      }

      await carregarTurnos();
      mostrarToast("Turno fechado com sucesso.");
    } catch (error) {
      console.error("Erro ao fechar turno:", error);
      mostrarToast(
        error.response?.data?.message || "Erro ao fechar turno.",
        "erro"
      );
    } finally {
      setExecutando(false);
    }
  };

  const mostrarConferencia = (turno) => {
    setTurnoExibido(turno);
  };

  const voltarParaControle = () => {
    setTurnoExibido(null);
    carregarTurnos();
  };

  const conferencia = useMemo(() => {
    if (!turnoExibido) return [];
    return turnoExibido.conferencia || [];
  }, [turnoExibido]);

  const formatarDiferenca = (valor) => {
    if (valor === 0) {
      return { texto: "0", classe: "text-gray-700" };
    }

    if (valor > 0) {
      return { texto: `+${valor} sobra`, classe: "text-emerald-700 font-semibold" };
    }

    return { texto: `${valor} falta`, classe: "text-red-700 font-semibold" };
  };

  const nomeTurnoRelatorio = turnoExibido?.nome || "Turno sem nome";

  if (carregando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-500">Carregando turnos...</p>
      </div>
    );
  }

  if (turnoExibido) {
    return (
      <div className="turno-report-page">
        <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} />

        <div className="print-report-screen p-4 sm:p-6 lg:p-8">
          <div className="no-print mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={voltarParaControle}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FiPrinter size={18} />
            Imprimir relatório
          </button>
          </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Conferência do Turno</h1>
            <p className="mt-1 text-sm text-gray-500">Relatório gerado ao fechamento do turno</p>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Nome do turno</p>
            <p className="mt-2 text-lg font-bold text-gray-900">{nomeTurnoRelatorio}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Funcionário</p>
              <p className="mt-2 text-base font-semibold text-gray-900">{turnoExibido.funcionario || getUsuarioLogado()}</p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Abertura</p>
              <p className="mt-2 text-base font-semibold text-gray-900">{formatarData(turnoExibido.abertoEm)}</p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Fechamento</p>
              <p className="mt-2 text-base font-semibold text-gray-900">{formatarData(turnoExibido.fechadoEm)}</p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
              <p className="mt-2 text-base font-semibold text-gray-900">Fechado</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 mb-6">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total vendido</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{formatarMoeda(turnoExibido.resumo?.totalVendas || 0)}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Itens vendidos</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{turnoExibido.resumo?.quantidadeItensVendidos || 0}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Entradas</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{turnoExibido.resumo?.totalEntradas || 0}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Saídas</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{turnoExibido.resumo?.totalSaidas || 0}</p>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto print-conferencia-tabela">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Produto</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Inicial</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Vendas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Entradas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Saídas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Esperado</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Atual</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Diferença</th>
                </tr>
              </thead>

              <tbody>
                {conferencia.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Nenhuma conferência disponível.</td>
                  </tr>
                ) : (
                  conferencia.map((item) => {
                    const diferenca = formatarDiferenca(item.diferenca);

                    return (
                      <tr key={`${item.produto}-${item.nome}`} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-gray-900 font-medium">{item.nome}</td>
                        <td className="px-4 py-3 text-gray-700">{item.estoqueInicial}</td>
                        <td className="px-4 py-3 text-gray-700">{item.vendas}</td>
                        <td className="px-4 py-3 text-gray-700">{item.entradas}</td>
                        <td className="px-4 py-3 text-gray-700">{item.saidas}</td>
                        <td className="px-4 py-3 text-gray-700">{item.estoqueEsperado}</td>
                        <td className="px-4 py-3 text-gray-700">{item.estoqueAtual}</td>
                        <td className={`px-4 py-3 ${diferenca.classe}`}>{diferenca.texto}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 print-conferencia-cards">
            {conferencia.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                Nenhuma conferência disponível.
              </div>
            ) : (
              conferencia.map((item) => {
                const diferenca = formatarDiferenca(item.diferenca);

                return (
                  <div key={`${item.produto}-${item.nome}`} className="rounded-xl border border-gray-200 p-4 print-card-item">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="text-base font-bold text-gray-900">{item.nome}</p>
                      <span className={`text-sm ${diferenca.classe}`}>{diferenca.texto}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500">Inicial</p><p className="font-semibold text-gray-900">{item.estoqueInicial}</p></div>
                      <div><p className="text-gray-500">Vendas</p><p className="font-semibold text-gray-900">{item.vendas}</p></div>
                      <div><p className="text-gray-500">Entradas</p><p className="font-semibold text-gray-900">{item.entradas}</p></div>
                      <div><p className="text-gray-500">Saídas</p><p className="font-semibold text-gray-900">{item.saidas}</p></div>
                      <div><p className="text-gray-500">Esperado</p><p className="font-semibold text-gray-900">{item.estoqueEsperado}</p></div>
                      <div><p className="text-gray-500">Atual</p><p className="font-semibold text-gray-900">{item.estoqueAtual}</p></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="print-assinatura mt-8 border-t border-gray-200 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">Responsável</p>
                <div className="mt-3 h-8 border-b border-gray-400"></div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">Data</p>
                <div className="mt-3 h-8 border-b border-gray-400"></div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">Assinatura</p>
                <div className="mt-3 h-8 border-b border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <section className="relatorio-termico" aria-label="Relatório térmico da conferência de turno">
          <header className="relatorio-termico-cabecalho">
            <h1>POSTO MEU PADIM</h1>
            <h2>CONFERÊNCIA DE TURNO</h2>
          </header>

          <div className="relatorio-termico-dados">
            <p><strong>Turno:</strong> {nomeTurnoRelatorio}</p>
            <p><strong>Funcionário:</strong> {turnoExibido.funcionario || getUsuarioLogado()}</p>
            <p><strong>Abertura:</strong> {formatarData(turnoExibido.abertoEm)}</p>
            <p><strong>Fechamento:</strong> {formatarData(turnoExibido.fechadoEm)}</p>
          </div>

          <div className="relatorio-termico-separador" />

          <table className="relatorio-termico-tabela">
            <colgroup>
              <col className="relatorio-termico-coluna-produto" />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">PRODUTO</th>
                <th scope="col">INI</th>
                <th scope="col">ENT</th>
                <th scope="col">SAI</th>
                <th scope="col">FIM</th>
              </tr>
            </thead>
            <tbody>
              {conferencia.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum produto</td>
                </tr>
              ) : (
                conferencia.map((item) => (
                  <tr key={`termico-${item.produto}-${item.nome}`}>
                    <td title={item.nome}>{item.nome}</td>
                    <td>{item.estoqueInicial}</td>
                    <td>{item.entradas}</td>
                    <td>{Number(item.vendas || 0) + Number(item.saidas || 0)}</td>
                    <td>{item.estoqueAtual}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="relatorio-termico-separador" />

          <footer className="relatorio-termico-assinatura">
            <p>Responsável:</p>
            <div className="relatorio-termico-linha" />
            <p>Assinatura:</p>
            <div className="relatorio-termico-linha" />
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Turno</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe o turno atual e a conferência de estoque.</p>
        </div>
      </div>

      {!turnoAtual ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Nenhum turno aberto.</h2>
          <p className="mt-2 text-sm text-gray-500">Inicie um novo turno para começar a conferência de estoque.</p>

          <div className="mt-5">
            <label htmlFor="nome-turno" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do turno
            </label>
            <input
              id="nome-turno"
              type="text"
              value={nomeTurno}
              onChange={(e) => setNomeTurno(e.target.value)}
              placeholder="Ex: Turno da manhã"
              className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={iniciarTurno}
            disabled={executando}
            className="mt-6 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {executando ? "Iniciando..." : "Iniciar turno"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <FiClock size={16} />
                  Turno em andamento
                </div>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">{turnoAtual.nome || "Turno sem nome"}</h2>
                <p className="mt-2 text-sm text-gray-500">Funcionário: {turnoAtual.funcionario || getUsuarioLogado()}</p>
                <p className="mt-1 text-sm text-gray-500">Início: {formatarData(turnoAtual.abertoEm)}</p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmacaoAberta(true)}
                disabled={executando}
                className="inline-flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-300"
              >
                {executando ? "Processando..." : "Fechar turno"}
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiPackage size={16} />
                  Produtos
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900">{turnoAtual.estoqueInicial?.length || 0}</p>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiShoppingCart size={16} />
                  Itens vendidos
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900">{turnoAtual.resumo?.quantidadeItensVendidos || 0}</p>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiDollarSign size={16} />
                  Valor vendido
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900">{formatarMoeda(turnoAtual.resumo?.totalVendas || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de turnos</h2>
        </div>

        {turnosFechados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum turno fechado registrado.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {turnosFechados.map((turno) => (
              <button
                key={turno._id}
                type="button"
                onClick={() => mostrarConferencia(turno)}
                className="w-full text-left p-4 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{turno.nome || "Turno sem nome"}</p>
                    <p className="text-sm text-gray-500">{turno.funcionario || "Funcionário"}</p>
                    <p className="text-sm text-gray-500">{formatarData(turno.abertoEm)} até {formatarData(turno.fechadoEm)}</p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{formatarMoeda(turno.resumo?.totalVendas || 0)}</span>
                    <span className="mx-2">•</span>
                    {turno.resumo?.quantidadeItensVendidos || 0} itens
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {confirmacaoAberta && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tem certeza que deseja fechar o turno?</h3>
                <p className="mt-2 text-sm text-gray-500">O fechamento irá gerar a conferência do estoque e não altera o saldo real dos produtos.</p>
              </div>

              <button type="button" onClick={() => setConfirmacaoAberta(false)} className="p-2 text-gray-400 hover:text-gray-700">
                <FiX size={18} />
              </button>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" onClick={() => setConfirmacaoAberta(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>

              <button type="button" onClick={fecharTurno} disabled={executando} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300">
                {executando ? "Fechando..." : "Fechar turno"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Turnos;
