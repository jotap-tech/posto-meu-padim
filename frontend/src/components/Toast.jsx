function Toast({ aberto, tipo = "sucesso", mensagem }) {
  if (!aberto) {
    return null;
  }

  const estilos = {
    sucesso: {
      container: "bg-green-50 border-green-200",
      texto: "text-green-700",
    },

    erro: {
      container: "bg-red-50 border-red-200",
      texto: "text-red-700",
    },
  };

  const estiloAtual = estilos[tipo] || estilos.sucesso;

  return (
    <div className="fixed top-5 right-5 z-[100]">
      <div
        className={`min-w-[300px] max-w-md rounded-lg border px-4 py-3 shadow-lg ${estiloAtual.container}`}
      >
        <p className={`text-sm font-medium ${estiloAtual.texto}`}>
          {mensagem}
        </p>
      </div>
    </div>
  );
}

export default Toast;