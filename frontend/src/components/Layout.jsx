import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiRefreshCw,
  FiShoppingCart,
  FiClipboard,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

import logo from "../../public/logopng.png";

function Layout() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: FiGrid },
    { name: "Produtos", path: "/produtos", icon: FiPackage },
    { name: "Estoque", path: "/estoque", icon: FiRefreshCw },
    { name: "Vendas", path: "/vendas", icon: FiShoppingCart },
    { name: "Histórico", path: "/historico", icon: FiClipboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {menuAberto && (
        <div
          onClick={fecharMenu}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          inset-y-0 left-0
          z-50
          w-64
          bg-white
          border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300
          ${menuAberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <img
            src={logo}
            alt="Logo do posto"
            className="w-12 h-12 object-contain"
          />

          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">
              Posto Sistema
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Gestão do posto
            </p>
          </div>

          {/* Fechar menu no celular */}
          <button
            onClick={fecharMenu}
            className="ml-auto md:hidden text-gray-500 hover:text-gray-900"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={fecharMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Sair */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <FiLogOut size={19} />

            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {/* Header mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden">
          <button
            onClick={() => setMenuAberto(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiMenu size={24} />
          </button>

          <div className="flex items-center ml-3">
            <img
              src={logo}
              alt="Logo do posto"
              className="w-9 h-9 object-contain"
            />

            <div className="ml-2">
              <h1 className="text-sm font-bold text-gray-900">
                Posto Sistema
              </h1>

              <p className="text-[10px] text-gray-500">
                Gestão do posto
              </p>
            </div>
          </div>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;