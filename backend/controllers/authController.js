const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

const login = async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({
        message: "Usuário e senha são obrigatórios",
      });
    }

    const usuarioEncontrado = await Usuario.findOne({ usuario });

    if (!usuarioEncontrado) {
      return res.status(401).json({
        message: "Usuário ou senha inválidos",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuarioEncontrado.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        message: "Usuário ou senha inválidos",
      });
    }

    const token = jwt.sign(
      {
        id: usuarioEncontrado._id,
        usuario: usuarioEncontrado.usuario,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao realizar login",
      error: error.message,
    });
  }
};

// DIAGNÓSTICO TEMPORÁRIO
const testeLogin = async (req, res) => {
  try {
    const mongoose = require("mongoose");

    const usuario = await Usuario.findOne({
      usuario: "admin",
    });

    return res.status(200).json({
      encontrado: !!usuario,
      senhaCorreta: usuario
        ? await bcrypt.compare("123456", usuario.senha)
        : false,
      banco: mongoose.connection.name,
      servidor: mongoose.connection.host,
    });
  } catch (error) {
    return res.status(500).json({
      erro: error.message,
    });
  }
};

module.exports = {
  login,
  testeLogin,
};