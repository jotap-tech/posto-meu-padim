const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
    },

    quantidade: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    estoqueMinimo: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    preco: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Produto = mongoose.model("Produto", produtoSchema);

module.exports = Produto;