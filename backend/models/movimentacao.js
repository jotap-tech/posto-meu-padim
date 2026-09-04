const mongoose = require("mongoose");

const movimentacaoSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: true,
    },
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
    },

    tipo: {
      type: String,
      enum: ["entrada", "saida"],
      required: true,
    },

    quantidade: {
      type: Number,
      required: true,
      min: 1,
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

const Movimentacao = mongoose.model(
  "Movimentacao",
  movimentacaoSchema
);

module.exports = Movimentacao;