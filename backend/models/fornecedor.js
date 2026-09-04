const mongoose = require("mongoose");

const fornecedorSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    telefone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    observacao: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Fornecedor = mongoose.model("Fornecedor", fornecedorSchema);

module.exports = Fornecedor;