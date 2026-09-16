const Turno = require("../models/turno");
const Produto = require("../models/produto");
const Movimentacao = require("../models/movimentacao");
const Venda = require("../models/venda");

const montarConferenciaDoTurno = async (turno, dataFim) => {
  const sales = await Venda.find({
    createdAt: {
      $gte: new Date(turno.abertoEm),
      $lte: new Date(dataFim),
    },
  }).lean();

  const movimentacoes = await Movimentacao.find({
    createdAt: {
      $gte: new Date(turno.abertoEm),
      $lte: new Date(dataFim),
    },
  }).lean();

  const vendasPorProduto = new Map();
  const entradasPorProduto = new Map();
  const saidasPorProduto = new Map();

  sales.forEach((venda) => {
    (venda.itens || []).forEach((item) => {
      const produtoId = String(item.produto || "");
      const quantidade = Number(item.quantidade || 0);

      if (!produtoId || quantidade <= 0) {
        return;
      }

      vendasPorProduto.set(
        produtoId,
        (vendasPorProduto.get(produtoId) || 0) + quantidade
      );
    });
  });

  movimentacoes.forEach((movimentacao) => {
    const produtoId = String(movimentacao.produto || "");
    const quantidade = Number(movimentacao.quantidade || 0);

    if (!produtoId || quantidade <= 0) {
      return;
    }

    if (movimentacao.tipo === "entrada") {
      entradasPorProduto.set(
        produtoId,
        (entradasPorProduto.get(produtoId) || 0) + quantidade
      );
    }

    if (movimentacao.tipo === "saida") {
      saidasPorProduto.set(
        produtoId,
        (saidasPorProduto.get(produtoId) || 0) + quantidade
      );
    }
  });

  const produtosAtuais = await Produto.find().sort({ nome: 1 });
  const produtosAtuaisMap = new Map(
    produtosAtuais.map((produto) => [String(produto._id), produto])
  );

  const snapshotInicialMap = new Map(
    (turno.estoqueInicial || []).map((item) => [
      String(item.produto),
      item,
    ])
  );

  const idsProdutos = new Set([
    ...produtosAtuaisMap.keys(),
    ...snapshotInicialMap.keys(),
  ]);

  const linhasConferencia = [];

  idsProdutos.forEach((produtoId) => {
    const produtoAtual = produtosAtuaisMap.get(produtoId);
    const produtoInicial = snapshotInicialMap.get(produtoId);

    const estoqueInicial = produtoInicial
      ? Number(produtoInicial.quantidade || 0)
      : 0;
    const vendas = vendasPorProduto.get(produtoId) || 0;
    const entradas = entradasPorProduto.get(produtoId) || 0;
    const saidas = saidasPorProduto.get(produtoId) || 0;
    const estoqueAtual = produtoAtual
      ? Number(produtoAtual.quantidade || 0)
      : 0;
    const estoqueEsperado =
      estoqueInicial + entradas - saidas - vendas;
    const diferenca = estoqueAtual - estoqueEsperado;

    linhasConferencia.push({
      produto: produtoAtual?._id || produtoInicial?.produto || produtoId,
      nome: produtoAtual?.nome || produtoInicial?.nome || "Produto removido",
      estoqueInicial,
      vendas,
      entradas,
      saidas,
      estoqueEsperado,
      estoqueAtual,
      diferenca,
    });
  });

  const totalVendas = sales.reduce(
    (total, venda) => total + Number(venda.total || 0),
    0
  );

  const quantidadeItensVendidos = sales.reduce(
    (total, venda) =>
      total +
      (venda.itens || []).reduce(
        (subtotal, item) => subtotal + Number(item.quantidade || 0),
        0
      ),
    0
  );

  const totalEntradas = movimentacoes.reduce(
    (total, movimentacao) =>
      movimentacao.tipo === "entrada"
        ? total + Number(movimentacao.quantidade || 0)
        : total,
    0
  );

  const totalSaidas = movimentacoes.reduce(
    (total, movimentacao) =>
      movimentacao.tipo === "saida"
        ? total + Number(movimentacao.quantidade || 0)
        : total,
    0
  );

  linhasConferencia.sort((a, b) => a.nome.localeCompare(b.nome));

  return {
    linhasConferencia,
    totalVendas,
    quantidadeItensVendidos,
    totalEntradas,
    totalSaidas,
  };
};

const iniciarTurno = async (req, res) => {
  try {
    const turnoAberto = await Turno.findOne({
      status: "aberto",
    }).sort({ abertoEm: -1 });

    if (turnoAberto) {
      return res.status(400).json({
        message: "Já existe um turno aberto.",
        turno: turnoAberto,
      });
    }

    const produtos = await Produto.find().sort({ nome: 1 });

    if (produtos.length === 0) {
      return res.status(400).json({
        message: "Não é possível iniciar um turno sem produtos cadastrados.",
      });
    }

    const estoqueInicial = produtos.map((produto) => ({
      produto: produto._id,
      nome: produto.nome,
      quantidade: produto.quantidade,
    }));

    const funcionario = typeof req.body?.funcionario === "string"
      ? req.body.funcionario.trim()
      : "";

    if (!funcionario) {
      return res.status(400).json({
        message: "Informe o nome do funcionário.",
      });
    }

    const turno = await Turno.create({
      status: "aberto",
      nome: "",
      funcionario,
      abertoEm: new Date(),
      estoqueInicial,
    });

    return res.status(201).json({
      message: "Turno iniciado com sucesso.",
      turno,
    });
  } catch (error) {
    console.error("Erro ao iniciar turno:", error);

    return res.status(500).json({
      message: "Erro ao iniciar turno.",
      error: error.message,
    });
  }
};

const turnoAtual = async (req, res) => {
  try {
    const turno = await Turno.findOne({
      status: "aberto",
    }).sort({ abertoEm: -1 });

    if (!turno) {
      return res.status(200).json({
        turno: null,
      });
    }

    const conferenciaAtual = await montarConferenciaDoTurno(turno, new Date());
    const turnoAtualizado = turno.toObject();

    turnoAtualizado.resumo = {
      totalVendas: conferenciaAtual.totalVendas,
      quantidadeItensVendidos: conferenciaAtual.quantidadeItensVendidos,
      totalEntradas: conferenciaAtual.totalEntradas,
      totalSaidas: conferenciaAtual.totalSaidas,
    };

    return res.status(200).json({
      turno: turnoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao buscar turno:", error);

    return res.status(500).json({
      message: "Erro ao buscar turno.",
      error: error.message,
    });
  }
};

const listarTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find({
      status: "fechado",
    }).sort({ fechadoEm: -1, abertoEm: -1 });

    return res.status(200).json({
      turnos,
    });
  } catch (error) {
    console.error("Erro ao listar turnos:", error);

    return res.status(500).json({
      message: "Erro ao listar turnos.",
      error: error.message,
    });
  }
};

const buscarTurnoPorId = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id);

    if (!turno) {
      return res.status(404).json({
        message: "Turno não encontrado.",
      });
    }

    return res.status(200).json({
      turno,
    });
  } catch (error) {
    console.error("Erro ao buscar turno por ID:", error);

    return res.status(500).json({
      message: "Erro ao buscar turno.",
      error: error.message,
    });
  }
};

const fecharTurno = async (req, res) => {
  try {
    const turno = await Turno.findOne({
      status: "aberto",
    }).sort({ abertoEm: -1 });

    if (!turno) {
      return res.status(400).json({
        message: "Não existe um turno aberto.",
      });
    }

    const dataFim = new Date();
    const conferencia = await montarConferenciaDoTurno(turno, dataFim);

    const produtosAtuais = await Produto.find().sort({ nome: 1 });
    const estoqueFinal = produtosAtuais.map((produto) => ({
      produto: produto._id,
      nome: produto.nome,
      quantidade: produto.quantidade,
    }));

    const estoqueInicialMap = new Map(
      (turno.estoqueInicial || []).map((item) => [
        String(item.produto),
        item,
      ])
    );

    const produtosRemovidos = (turno.estoqueInicial || []).filter(
      (item) =>
        !estoqueFinal.some(
          (produto) =>
            String(produto.produto) === String(item.produto)
        )
    );

    produtosRemovidos.forEach((produtoRemovido) => {
      estoqueFinal.push({
        produto: produtoRemovido.produto,
        nome: produtoRemovido.nome,
        quantidade: 0,
      });
    });

    turno.estoqueFinal = estoqueFinal;
    turno.conferencia = conferencia.linhasConferencia.map((item) => ({
      produto: item.produto,
      nome: item.nome,
      estoqueInicial: item.estoqueInicial,
      vendas: item.vendas,
      entradas: item.entradas,
      saidas: item.saidas,
      estoqueEsperado: item.estoqueEsperado,
      estoqueAtual: item.estoqueAtual,
      diferenca: item.diferenca,
    }));

    turno.resumo = {
      totalVendas: conferencia.totalVendas,
      quantidadeItensVendidos: conferencia.quantidadeItensVendidos,
      totalEntradas: conferencia.totalEntradas,
      totalSaidas: conferencia.totalSaidas,
    };

    turno.status = "fechado";
    turno.fechadoEm = dataFim;

    await turno.save();

    return res.status(200).json({
      message: "Turno fechado com sucesso.",
      turno,
      conferencia: turno.conferencia,
    });
  } catch (error) {
    console.error("Erro ao fechar turno:", error);

    return res.status(500).json({
      message: "Erro ao fechar turno.",
      error: error.message,
    });
  }
};

module.exports = {
  iniciarTurno,
  turnoAtual,
  listarTurnos,
  buscarTurnoPorId,
  fecharTurno,
};