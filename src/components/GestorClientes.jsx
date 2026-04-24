import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { PlusCircle, User, Trash2, ChevronRight, Ruler } from "lucide-react";
import EditorMedidas from "./EditorMedidas";

export default function GestorClientes({ onSeleccionarProyecto }) {
  // 1. SELECTORES DE DATOS (DEXIE)
  const clientes = useLiveQuery(() => db.clientes.toArray());

  // 2. ESTADOS LOCALES
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);

  // 3. LÓGICA DE NEGOCIO
  const agregarCliente = async () => {
    if (!nuevoNombre.trim()) return;

    try {
      await db.clientes.add({
        nombre: nuevoNombre,
        medidas: {
          cuello: 38, // Medidas estándar iniciales (promedio)
          pecho: 95,
          cintura: 85,
          cadera: 100,
          hombros: 45,
          brazo: 60,
          puño: 20,
          tiro: 100,
        },
        ultimaActualizacion: new Date().toISOString(),
      });
      setNuevoNombre("");
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  const eliminarCliente = async (id, e) => {
    e.stopPropagation(); // Evita que se abra el proyecto al intentar borrar
    if (window.confirm("¿Estás segura de eliminar este perfil de cliente?")) {
      await db.clientes.delete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* MODAL DE EDICIÓN (Se muestra solo si hay un cliente seleccionado) */}
      {clienteEnEdicion && (
        <EditorMedidas
          cliente={clienteEnEdicion}
          alCerrar={() => setClienteEnEdicion(null)}
        />
      )}

      {/* CABECERA */}
      <header className="mb-8 border-b-2 border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">Mis Clientes</h2>
        <p className="text-gray-500 mt-2 text-lg">
          Gestiona perfiles y medidas precisas.
        </p>
      </header>

      {/* FORMULARIO DE ALTA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 border-2 border-slate-100">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del nuevo cliente..."
          className="flex-1 text-xl p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
        />
        <button
          onClick={agregarCliente}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl min-h-[60px] text-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <PlusCircle size={28} />
          <span>Nuevo Perfil</span>
        </button>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientes?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
            <p className="text-slate-400 text-xl font-medium">
              No hay clientes registrados aún.
            </p>
          </div>
        )}

        {clientes?.map((cliente) => (
          <div
            key={cliente.id}
            className="group bg-white rounded-3xl shadow-sm border-2 border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
          >
            {/* ZONA SUPERIOR: Navegación al taller */}
            <div
              onClick={() => onSeleccionarProyecto(cliente.id)}
              className="p-6 cursor-pointer flex items-center justify-between flex-1 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="bg-slate-100 p-4 rounded-2xl text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">
                    {cliente.nombre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                      Listo para diseñar
                    </p>
                  </div>
                </div>
              </div>
              <ChevronRight
                size={28}
                className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
              />
            </div>

            {/* ZONA INFERIOR: Acciones de gestión */}
            <div className="bg-slate-50/80 p-4 flex gap-3 border-t-2 border-slate-100">
              <button
                onClick={() => setClienteEnEdicion(cliente)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 py-3 rounded-2xl text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all active:scale-95 shadow-sm"
              >
                <Ruler size={20} />
                <span>Medidas</span>
              </button>

              <button
                onClick={(e) => eliminarCliente(cliente.id, e)}
                className="p-4 bg-white border-2 border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 rounded-2xl transition-all active:scale-90"
                title="Eliminar Perfil"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
