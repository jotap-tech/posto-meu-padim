const express = require("express");

const {
  criarFornecedor,
  listarFornecedores,
  buscarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
} = require("../controllers/fornecedorController");

const protegerRota = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protegerRota, criarFornecedor);
router.get("/", protegerRota, listarFornecedores);
router.get("/:id", protegerRota, buscarFornecedor);
router.put("/:id", protegerRota, atualizarFornecedor);
router.delete("/:id", protegerRota, excluirFornecedor);

module.exports = router;