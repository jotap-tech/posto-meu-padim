const Fornecedor = require("../models/fornecedor");

const criarFornecedor = async (req, res) => {
  try {
    const { nome, telefone, email, observacao } = req.body;

    const fornecedor = await Fornecedor.create({
      nome,
      telefone,
      email,
      observacao,
    });

    return res.status(201).json(fornecedor);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar fornecedor",
      error: error.message,
    });
  }
};

const listarFornecedores = async (req, res) => {
  try {
    const fornecedores = await Fornecedor.find();

    return res.status(200).json(fornecedores);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar fornecedores",
      error: error.message,
    });
  }
};

const buscarFornecedor = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findById(id);

    if (!fornecedor) {
      return res.status(404).json({
        message: "Fornecedor não encontrado",
      });
    }

    return res.status(200).json(fornecedor);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar fornecedor",
      error: error.message,
    });
  }
};

const atualizarFornecedor = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!fornecedor) {
      return res.status(404).json({
        message: "Fornecedor não encontrado",
      });
    }

    return res.status(200).json(fornecedor);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar fornecedor",
      error: error.message,
    });
  }
};

const excluirFornecedor = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findByIdAndDelete(id);

    if (!fornecedor) {
      return res.status(404).json({
        message: "Fornecedor não encontrado",
      });
    }

    return res.status(200).json({
      message: "Fornecedor excluído com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao excluir fornecedor",
      error: error.message,
    });
  }
};

module.exports = {
  criarFornecedor,
  listarFornecedores,
  buscarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
};