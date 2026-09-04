const express = require("express");

const {
  criarVenda,
  listarVendas,
} = require("../controllers/vendaController");

const protegerRota = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protegerRota, criarVenda);
router.get("/", protegerRota, listarVendas);

module.exports = router;