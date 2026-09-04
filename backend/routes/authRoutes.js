const express = require("express");

const {
  login,
  testeLogin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);

// DIAGNÓSTICO TEMPORÁRIO
router.get("/teste-login", testeLogin);

module.exports = router;