const Produto = require("../models/produto");

const criarProduto = async (req, res) => {
  try {
    const { nome, categoria, quantidade, estoqueMinimo, preco } = req.body;

    const produto = await Produto.create({
      nome,
      categoria,
      quantidade,
      estoqueMinimo,
      preco,
    });

    return res.status(201).json(produto);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar produto",
      error: error.message,
    });
  }
};

const listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find();

    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar produtos",
      error: error.message,
    });
  }
};

const buscarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    return res.status(200).json(produto);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar produto",
      error: error.message,
    });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await Produto.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    return res.status(200).json(produto);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar produto",
      error: error.message,
    });
  }
};

const excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await Produto.findByIdAndDelete(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    return res.status(200).json({
      message: "Produto excluído com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao excluir produto",
      error: error.message,
    });
  }
};

const listarEstoqueBaixo = async (req, res) => {
  try {
    const produtos = await Produto.find({
      $expr: {
        $lte: ["$quantidade", "$estoqueMinimo"],
      },
    });

    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar produtos com estoque baixo",
      error: error.message,
    });
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  excluirProduto,
  listarEstoqueBaixo,
};