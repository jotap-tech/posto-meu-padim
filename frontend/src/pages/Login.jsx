import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiLock, FiUser } from "react-icons/fi";
import api from "../services/api";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setErro("");
      setCarregando(true);

      const response = await api.post("/auth/login", {
        usuario,
        senha,
      });

      const { token } = response.data;

      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Usuário ou senha inválidos."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <FiLogIn size={27} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Posto Sistema
          </h1>

          <p className="text-gray-500 mt-2">
            Gestão do posto
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Entrar
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Acesse o sistema para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Usuário */}
            <div>
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Usuário
              </label>

              <div className="relative">
                <FiUser
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>

              <div className="relative">
                <FiLock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">
                  {erro}
                </p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <FiLogIn size={18} />

              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Sistema de gestão do posto
        </p>
      </div>
    </div>
  );
}

export default Login;