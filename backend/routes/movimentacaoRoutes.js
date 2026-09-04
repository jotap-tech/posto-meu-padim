const express = require("express");
const protegerRota = require("../middleware/authMiddleware");

const {
  entradaEstoque,
  saidaEstoque,
  listarMovimentacoes,
} = require("../controllers/movimentacaoController");

const router = express.Router();

router.post("/entrada", protegerRota, entradaEstoque);
router.post("/saida", protegerRota, saidaEstoque);
router.get("/", protegerRota, listarMovimentacoes);



module.exports = router;