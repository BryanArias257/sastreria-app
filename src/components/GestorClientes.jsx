import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { PlusCircle, User, Trash2, ChevronRight, Ruler } from "lucide-react";
import EditorMedidas from "./EditorMedidas";

export default function GestorClientes({ onSeleccionarProyecto }) {
  // 1. SELECTOR REACTIVO (Actualiza la UI automáticamente cuando la DB cambia)
  const clientes = useLiveQuery(() => db.clientes.toArray());

  // 2. ESTADOS LOCALES
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [clienteIdEnEdicion, setClienteIdEnEdicion] = useState(null);

  // 3. FUNCIONES DE BASE DE DATOS
  const agregarCliente = async () => {
    if (!nuevoNombre.trim()) return;

    try {
      await db.clientes.add({
        nombre: nuevoNombre,
        medidas: {
          cuello: 38,
          pecho: 95,
          cintura: 85,
          cadera: 100,
          hombros: 45,
          brazo: 60,
          puño: 20, // Nuevos campos inicializados
          tiro: 100,
        },
        ultimaActualizacion: new Date().toISOString(),
      });
      setNuevoNombre("");
    } catch (error) {
      console.error("Error al crear cliente:", error);
    }
  };

  const eliminarCliente = async (id, e) => {
    e.stopPropagation(); // Evita navegar al taller al intentar borrar
    if (
      window.confirm("¿Estás segura de eliminar permanentemente este perfil?")
    ) {
      await db.clientes.delete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-0">
      {/* MODAL DE EDICIÓN (Se abre solo si hay un ID seleccionado) */}
      {clienteIdEnEdicion && (
        <EditorMedidas
          clienteId={clienteIdEnEdicion}
          alCerrar={() => setClienteIdEnEdicion(null)}
        />
      )}

      {/* CABECERA PRINCIPAL */}
      <header className="mb-10 border-b-2 border-slate-200 pb-6">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">
          Mis Clientes
        </h2>
        <p className="text-slate-500 mt-2 text-lg font-medium">
          Selecciona un perfil para diseñar o ajusta sus medidas.
        </p>
      </header>

      {/* BARRA DE ALTA RÁPIDA */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-10 flex flex-col md:flex-row gap-4 border-2 border-slate-100 ring-8 ring-slate-50/50">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del nuevo cliente..."
          className="flex-1 text-xl p-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
        />
        <button
          onClick={agregarCliente}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl min-h-[64px] text-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <PlusCircle size={28} />
          <span>Crear Perfil</span>
        </button>
      </div>

      {/* GRID DE TARJETAS DE CLIENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {!clientes ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-400 font-bold italic">
              Cargando taller...
            </p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-400 text-2xl font-bold italic">
              Tu libreta de clientes está vacía.
            </p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="group bg-white rounded-[2rem] shadow-sm border-2 border-slate-100 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
            >
              {/* ACCESO AL TALLER (Área principal) */}
              <div
                onClick={() => onSeleccionarProyecto(cliente.id)}
                className="p-8 cursor-pointer flex items-center justify-between flex-1 bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-slate-100 p-5 rounded-3xl text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <User size={36} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 leading-tight">
                      {cliente.nombre}
                    </h3>
                    <p className="text-xs text-blue-500 font-black uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Mesa de Trabajo →
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={32}
                  className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-2 transition-all"
                />
              </div>

              {/* BARRA DE ACCIONES (Medidas y Borrado) */}
              <div className="bg-slate-50/50 p-5 flex gap-4 border-t-2 border-slate-50">
                <button
                  onClick={() => setClienteIdEnEdicion(cliente.id)}
                  className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 rounded-2xl text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all active:scale-95 shadow-sm"
                >
                  <Ruler size={24} />
                  <span className="text-lg">Medidas</span>
                </button>

                <button
                  onClick={(e) => eliminarCliente(cliente.id, e)}
                  className="p-4 bg-white border-2 border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 rounded-2xl transition-all active:scale-90"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
