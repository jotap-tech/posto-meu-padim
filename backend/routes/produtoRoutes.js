const express = require("express");

const protegerRota = require("../middleware/authMiddleware");

const {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  excluirProduto,
  listarEstoqueBaixo,
} = require("../controllers/produtoController");

const router = express.Router();

router.post("/", protegerRota, criarProduto);

router.get("/", protegerRota, listarProdutos);

router.get("/estoque-baixo", protegerRota, listarEstoqueBaixo);

router.get("/:id", protegerRota, buscarProduto);

router.put("/:id", protegerRota, atualizarProduto);

router.delete("/:id", protegerRota, excluirProduto);

module.exports = router;