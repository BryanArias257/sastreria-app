import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { PlusCircle, User } from "lucide-react";

export default function GestorClientes({ onSeleccionarProyecto }) {
  const clientes = useLiveQuery(() => db.clientes.toArray());
  const [nuevoNombre, setNuevoNombre] = useState("");

  const agregarCliente = async () => {
    if (!nuevoNombre.trim()) return;
    await db.clientes.add({
      nombre: nuevoNombre,
      medidas: { cuello: 0, pecho: 0, cintura: 0, cadera: 0 },
      ultimaActualizacion: new Date().toISOString(),
    });
    setNuevoNombre("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 border-b-2 pb-4">Mis Clientes</h2>

      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex gap-4">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del nuevo cliente..."
          className="flex-1 text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none"
        />
        <button
          onClick={agregarCliente}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl min-h-[60px] text-xl font-bold flex items-center gap-2"
        >
          <PlusCircle size={28} />
          <span>Agregar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientes?.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-slate-100 p-4 rounded-full">
                <User size={32} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold">{cliente.nombre}</h3>
            </div>

            <button
              onClick={() => onSeleccionarProyecto(cliente.id)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 p-4 rounded-xl text-lg font-medium transition-colors min-h-[60px]"
            >
              Abrir Perfil y Medidas
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
