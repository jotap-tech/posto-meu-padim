const mongoose = require("mongoose");

const Produto = require("../models/produto");
const Venda = require("../models/venda");

const criarVenda = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { itens } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({
        message: "A venda deve possuir pelo menos um produto",
      });
    }

    session.startTransaction();

    const itensVenda = [];
    let total = 0;

    for (const item of itens) {
      const { produtoId, quantidade } = item;

      if (!produtoId || !quantidade || quantidade < 1) {
        throw new Error("Produto e quantidade são obrigatórios");
      }

      const produto = await Produto.findById(produtoId).session(session);

      if (!produto) {
        throw new Error(`Produto não encontrado: ${produtoId}`);
      }

      if (produto.quantidade < quantidade) {
        throw new Error(
          `Estoque insuficiente para o produto: ${produto.nome}`
        );
      }

      const subtotal = produto.preco * quantidade;

      itensVenda.push({
        produto: produto._id,
        quantidade,
        precoUnitario: produto.preco,
        subtotal,
      });

      total += subtotal;
    }

    for (const item of itensVenda) {
      const produto = await Produto.findById(item.produto).session(session);

      produto.quantidade -= item.quantidade;

      await produto.save({ session });
    }

    const [venda] = await Venda.create(
      [
        {
          itens: itensVenda,
          total,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      message: "Venda realizada com sucesso",
      venda,
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      message: "Erro ao realizar venda",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const listarVendas = async (req, res) => {
  try {
    const vendas = await Venda.find()
      .populate("itens.produto", "nome categoria")
      .sort({ createdAt: -1 });

    return res.status(200).json(vendas);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar vendas",
      error: error.message,
    });
  }
};

module.exports = {
  criarVenda,
  listarVendas,
};