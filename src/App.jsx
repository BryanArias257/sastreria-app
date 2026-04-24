import { useState, useEffect } from "react";
import { Users, Scissors, RotateCcw, CheckCircle } from "lucide-react";
import GestorClientes from "./components/GestorClientes";
import EspacioTrabajo from "./components/EspacioTrabajo";

export default function App() {
  const [vistaActual, setVistaActual] = useState("clientes"); // 'clientes' o 'proyecto'
  const [proyectoActivo, setProyectoActivo] = useState(null);
  const [guardado, setGuardado] = useState(true);

  // Fake auto-save listener for the global indicator
  useEffect(() => {
    const timer = setTimeout(() => setGuardado(true), 1000);
    return () => clearTimeout(timer);
  }, [guardado]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Barra de Navegación Lateral (Tablet Landscape) / Superior (Portrait) */}
      <nav className="bg-slate-800 text-white md:w-1/4 lg:w-1/5 w-full flex md:flex-col justify-between p-4 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-8 hidden md:block">Mi Taller</h1>

          <div className="flex md:flex-col gap-4">
            <button
              onClick={() => setVistaActual("clientes")}
              className={`flex items-center gap-3 p-4 rounded-xl min-h-[60px] text-lg font-medium transition-colors ${vistaActual === "clientes" ? "bg-blue-600" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <Users size={28} />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => setVistaActual("proyecto")}
              className={`flex items-center gap-3 p-4 rounded-xl min-h-[60px] text-lg font-medium transition-colors ${vistaActual === "proyecto" ? "bg-blue-600" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <Scissors size={28} />
              <span>Taller</span>
            </button>
          </div>
        </div>

        {/* Global Actions - Failsafes */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="flex items-center gap-2 text-green-400 p-2">
            <CheckCircle size={24} />
            <span className="text-sm">
              {guardado ? "Guardado automático" : "Guardando..."}
            </span>
          </div>
          <button className="flex items-center justify-center gap-2 bg-amber-500 text-slate-900 p-4 rounded-xl min-h-[60px] font-bold text-lg">
            <RotateCcw size={24} />
            <span>Deshacer Todo</span>
          </button>
        </div>
      </nav>

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto p-6">
        {vistaActual === "clientes" ? (
          <GestorClientes
            onSeleccionarProyecto={(id) => {
              setProyectoActivo(id);
              setVistaActual("proyecto");
            }}
          />
        ) : (
          <EspacioTrabajo
            proyectoId={proyectoActivo}
            marcarCambio={() => setGuardado(false)}
          />
        )}
      </main>
    </div>
  );
}
