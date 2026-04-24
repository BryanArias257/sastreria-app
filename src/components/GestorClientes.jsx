import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { PlusCircle, User, Trash2, ChevronRight } from "lucide-react";

export default function GestorClientes({ onSeleccionarProyecto }) {
  // Obtenemos los clientes de la base de datos local
  const clientes = useLiveQuery(() => db.clientes.toArray());
  const [nuevoNombre, setNuevoNombre] = useState("");

  const agregarCliente = async () => {
    if (!nuevoNombre.trim()) return;

    try {
      await db.clientes.add({
        nombre: nuevoNombre,
        // Inicializamos con las medidas base que FreeSewing suele pedir
        medidas: {
          cuello: 0,
          pecho: 0,
          cintura: 0,
          cadera: 0,
          hombros: 0,
          brazo: 0,
        },
        ultimaActualizacion: new Date().toISOString(),
      });
      setNuevoNombre("");
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  const eliminarCliente = async (id, e) => {
    // Detenemos la propagación para que no se abra el proyecto al hacer clic en borrar
    e.stopPropagation();
    if (window.confirm("¿Estás segura de eliminar este perfil de cliente?")) {
      await db.clientes.delete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 border-b-2 border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Mis Clientes</h2>
        <p className="text-gray-500 mt-2 text-lg">
          Gestiona los perfiles y medidas de tus clientes aquí.
        </p>
      </header>

      {/* Formulario de Entrada */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 border-2 border-slate-100">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del nuevo cliente..."
          className="flex-1 text-xl p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
        <button
          onClick={agregarCliente}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl min-h-[60px] text-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
        >
          <PlusCircle size={28} />
          <span>Agregar Cliente</span>
        </button>
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientes?.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <p className="text-gray-400 text-xl italic">
              Aún no has agregado ningún cliente.
            </p>
          </div>
        )}

        {clientes?.map((cliente) => (
          <div
            key={cliente.id}
            onClick={() => onSeleccionarProyecto(cliente.id)}
            className="group bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {cliente.nombre}
                </h3>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                  ID: #{cliente.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => eliminarCliente(cliente.id, e)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Eliminar Cliente"
              >
                <Trash2 size={24} />
              </button>
              <ChevronRight
                size={28}
                className="text-gray-300 group-hover:text-blue-500 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
