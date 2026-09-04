const Produto = require("../models/produto");
const Movimentacao = require("../models/movimentacao");

const entradaEstoque = async (req, res) => {
  try {
    const {
      produtoId,
      quantidade,
      observacao,
    } = req.body;

    const produto = await Produto.findById(produtoId);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    if (!quantidade || quantidade < 1) {
      return res.status(400).json({
        message: "A quantidade deve ser maior que zero",
      });
    }

    produto.quantidade += quantidade;

    await produto.save();

    const movimentacao = await Movimentacao.create({
      produto: produtoId,
      tipo: "entrada",
      quantidade,
      observacao,
    });

    return res.status(201).json({
      message: "Entrada de estoque realizada com sucesso",
      produto,
      movimentacao,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao realizar entrada de estoque",
      error: error.message,
    });
  }
};

const saidaEstoque = async (req, res) => {
  try {
    const { produtoId, quantidade, observacao } = req.body;

    const produto = await Produto.findById(produtoId);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    if (!quantidade || quantidade < 1) {
      return res.status(400).json({
        message: "A quantidade deve ser maior que zero",
      });
    }

    if (produto.quantidade < quantidade) {
      return res.status(400).json({
        message: "Estoque insuficiente",
      });
    }

    produto.quantidade -= quantidade;

    await produto.save();

    const movimentacao = await Movimentacao.create({
      produto: produtoId,
      tipo: "saida",
      quantidade,
      observacao,
    });

    return res.status(201).json({
      message: "Saída de estoque realizada com sucesso",
      produto,
      movimentacao,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao realizar saída de estoque",
      error: error.message,
    });
  }
};

const listarMovimentacoes = async (req, res) => {
  try {
    const movimentacoes = await Movimentacao.find()
      .populate("produto", "nome categoria")
      .sort({ createdAt: -1 });

    return res.status(200).json(movimentacoes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar movimentações",
      error: error.message,
    });
  }
};

module.exports = {
  entradaEstoque,
  saidaEstoque,
  listarMovimentacoes,
};