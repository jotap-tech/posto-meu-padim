const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const produtoRoutes = require("./routes/produtoRoutes");
const movimentacaoRoutes = require("./routes/movimentacaoRoutes");
const authRoutes = require("./routes/authRoutes");
const protegerRota = require("./middleware/authMiddleware");
const fornecedorRoutes = require("./routes/fornecedorRoutes");
const vendaRoutes = require("./routes/vendaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

mongoose.connection.on("connected", () => {
  console.log("Banco usado pelo servidor:", mongoose.connection.name);
});


app.use("/api/produtos", produtoRoutes);
app.use("/api/movimentacoes", movimentacaoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/vendas", vendaRoutes);

app.get("/api/teste-protegido", protegerRota, (req, res) => {
  res.json({
    message: "Você está autenticado!",
    usuario: req.usuario,
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "API do Posto funcionando!"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});