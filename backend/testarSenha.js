require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Usuario = require("./models/usuario");

const testar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Servidor:", mongoose.connection.host);
    console.log("Banco:", mongoose.connection.name);

    const usuario = await Usuario.findOne({
      usuario: "admin",
    });

    if (!usuario) {
      console.log("❌ Usuário admin NÃO encontrado");
      return;
    }

    console.log("✅ Usuário encontrado:", usuario.usuario);

    const resultado = await bcrypt.compare(
      "123456",
      usuario.senha
    );

    console.log(
      "Senha 123456 corresponde ao hash?",
      resultado
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("Erro:", error.message);
  }
};

testar();