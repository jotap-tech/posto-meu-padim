const express = require("express");

const {
  iniciarTurno,
  turnoAtual,
  listarTurnos,
  buscarTurnoPorId,
  fecharTurno,
} = require("../controllers/turnoController");

const protegerRota = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protegerRota);

router.get("/", listarTurnos);
router.get("/atual", turnoAtual);
router.post("/iniciar", iniciarTurno);
router.post("/fechar", fecharTurno);
router.get("/:id", buscarTurnoPorId);

module.exports = router;