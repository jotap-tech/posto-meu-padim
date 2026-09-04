const mongoose = require("mongoose");

const itemVendaSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: true,
    },

    quantidade: {
      type: Number,
      required: true,
      min: 1,
    },

    precoUnitario: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const vendaSchema = new mongoose.Schema(
  {
    itens: {
      type: [itemVendaSchema],
      required: true,
      validate: {
        validator: (itens) => itens.length > 0,
        message: "A venda deve possuir pelo menos um produto",
      },
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Venda = mongoose.model("Venda", vendaSchema);

module.exports = Venda;