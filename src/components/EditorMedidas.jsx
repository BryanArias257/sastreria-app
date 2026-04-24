import { Minus, Plus, Ruler } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

/**
 * COMPONENTE HIJO: ControlMedida
 * Se define fuera del componente principal para evitar que el input pierda el foco
 * cada vez que React vuelve a renderizar el modal.
 */
const ControlMedida = ({ label, campo, valor, onActualizar }) => {
  const valorSeguro = valor || 0;

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex flex-col gap-3">
      <label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">
        {label}
      </label>

      <div className="flex items-center justify-between gap-2">
        {/* Botón de decremento */}
        <button
          onClick={() => onActualizar(campo, valorSeguro - 1)}
          className="p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 text-slate-600 active:scale-90 transition-all shadow-sm"
        >
          <Minus size={20} />
        </button>

        {/* Área de Input Central */}
        <div className="flex flex-1 items-center justify-center gap-1 bg-white border-2 border-slate-200 rounded-xl px-2 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <input
            type="number"
            value={valorSeguro}
            onChange={(e) => onActualizar(campo, e.target.value)}
            className="w-full text-center text-2xl font-black text-slate-800 bg-transparent outline-none p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-400 font-bold text-sm mr-2">cm</span>
        </div>

        {/* Botón de incremento */}
        <button
          onClick={() => onActualizar(campo, valorSeguro + 1)}
          className="p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-200 text-slate-600 active:scale-90 transition-all shadow-sm"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

/**
 * COMPONENTE PRINCIPAL: EditorMedidas
 */
export default function EditorMedidas({ clienteId, alCerrar }) {
  // CONSULTA EN VIVO: Si la base de datos cambia, este componente se actualiza solo.
  const cliente = useLiveQuery(() => db.clientes.get(clienteId), [clienteId]);

  const actualizarMedida = async (campo, valorRecibido) => {
    // Sanitización: Convertimos a número entero y evitamos valores negativos o NaN
    let nuevoValor = parseInt(valorRecibido, 10);
    if (isNaN(nuevoValor)) nuevoValor = 0;
    nuevoValor = Math.max(0, nuevoValor);

    // Creamos una copia de las medidas actuales y actualizamos el campo específico
    const nuevasMedidas = {
      ...cliente.medidas,
      [campo]: nuevoValor,
    };

    // Persistencia en IndexedDB vía Dexie
    await db.clientes.update(clienteId, {
      medidas: nuevasMedidas,
      ultimaActualizacion: new Date().toISOString(),
    });
  };

  // Fallback mientras Dexie recupera el objeto del cliente
  if (!cliente) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ENCABEZADO CON RULER */}
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Ruler size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 leading-none">
                Medidas de {cliente.nombre}
              </h3>
              <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                Ajuste de precisión para el patrón
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all active:scale-95"
          >
            Cerrar
          </button>
        </div>

        {/* GRID DE CONTROLES */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
          <ControlMedida
            label="Cuello"
            campo="cuello"
            valor={cliente.medidas.cuello}
            onActualizar={actualizarMedida}
          />
          <ControlMedida
            label="Pecho / Busto"
            campo="pecho"
            valor={cliente.medidas.pecho}
            onActualizar={actualizarMedida}
          />
          <ControlMedida
            label="Cintura"
            campo="cintura"
            valor={cliente.medidas.cintura}
            onActualizar={actualizarMedida}
          />
          <ControlMedida
            label="Cadera"
            campo="cadera"
            valor={cliente.medidas.cadera}
            onActualizar={actualizarMedida}
          />
          <ControlMedida
            label="Ancho de Hombros"
            campo="hombros"
            valor={cliente.medidas.hombros}
            onActualizar={actualizarMedida}
          />
          <ControlMedida
            label="Largo de Brazo"
            campo="brazo"
            valor={cliente.medidas.brazo}
            onActualizar={actualizarMedida}
          />

          {/* TUS NUEVOS CAMPOS PERSONALIZADOS */}
          <ControlMedida
            label="Puño"
            campo="puño"
            valor={cliente.medidas.puño}
            onActualizar={actualizarMedida}
          />
          <ControlMedida
            label="Tiro"
            campo="tiro"
            valor={cliente.medidas.tiro}
            onActualizar={actualizarMedida}
          />
        </div>

        {/* PIE DE PÁGINA INFORMATIVO */}
        <div className="bg-slate-50 p-4 border-t-2 border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Los cambios se guardan automáticamente en tu dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}
