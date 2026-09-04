require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Usuario = require("./models/usuario");

const criarUsuario = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const senhaHash = await bcrypt.hash("123456", 10);

    await Usuario.deleteMany({
      usuario: "admin",
    });

    await Usuario.create({
      usuario: "admin",
      senha: senhaHash,
    });

    console.log("Usuário admin criado com sucesso!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Erro ao criar usuário:", error.message);
  }
};

criarUsuario();