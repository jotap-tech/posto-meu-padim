const mongoose = require("mongoose");

const estoqueSnapshotSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: true,
    },

    nome: {
      type: String,
      required: true,
    },

    quantidade: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const conferenciaItemSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: true,
    },

    nome: {
      type: String,
      required: true,
    },

    estoqueInicial: {
      type: Number,
      default: 0,
    },

    vendas: {
      type: Number,
      default: 0,
    },

    entradas: {
      type: Number,
      default: 0,
    },

    saidas: {
      type: Number,
      default: 0,
    },

    estoqueEsperado: {
      type: Number,
      default: 0,
    },

    estoqueAtual: {
      type: Number,
      default: 0,
    },

    diferenca: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const turnoSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["aberto", "fechado"],
      default: "aberto",
    },

    abertoEm: {
      type: Date,
      default: Date.now,
    },

    fechadoEm: {
      type: Date,
      default: null,
    },

    nome: {
      type: String,
      trim: true,
      default: "",
    },

    funcionario: {
      type: String,
      required: true,
    },

    estoqueInicial: {
      type: [estoqueSnapshotSchema],
      default: [],
    },

    estoqueFinal: {
      type: [estoqueSnapshotSchema],
      default: [],
    },

    conferencia: {
      type: [conferenciaItemSchema],
      default: [],
    },

    resumo: {
      totalVendas: {
        type: Number,
        default: 0,
      },

      quantidadeItensVendidos: {
        type: Number,
        default: 0,
      },

      totalEntradas: {
        type: Number,
        default: 0,
      },

      totalSaidas: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Turno", turnoSchema);