import { Minus, Plus, Ruler } from "lucide-react";
import { db } from "../db";

// 1. COMPONENTE DE CONTROL ACTUALIZADO
const ControlMedida = ({ label, campo, valor, onActualizar }) => {
  // Aseguramos que si el valor es undefined/null, se muestre 0
  const valorSeguro = valor || 0;

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex flex-col gap-3">
      <label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">
        {label}
      </label>
      <div className="flex items-center justify-between gap-2">
        {/* Botón Menos */}
        <button
          onClick={() => onActualizar(campo, valorSeguro - 1)}
          className="p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-red-50 text-slate-600 active:scale-90 transition-all"
        >
          <Minus size={20} />
        </button>

        {/* INPUT DE NÚMERO (Editable por teclado) */}
        <div className="flex flex-1 items-center justify-center gap-1 bg-white border-2 border-slate-200 rounded-xl px-2 focus-within:border-blue-500 transition-colors">
          <input
            type="number"
            value={valorSeguro}
            onChange={(e) => onActualizar(campo, e.target.value)}
            className="w-full text-center text-2xl font-black text-slate-800 bg-transparent outline-none p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-400 font-bold text-sm mr-2">cm</span>
        </div>

        {/* Botón Más */}
        <button
          onClick={() => onActualizar(campo, valorSeguro + 1)}
          className="p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-green-50 text-slate-600 active:scale-90 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default function EditorMedidas({ cliente, alCerrar }) {
  const actualizarMedida = async (campo, valorRecibido) => {
    // 2. SANITIZACIÓN: Convertimos el input (string) a número
    let nuevoValor = parseInt(valorRecibido, 10);

    // Evitamos NaN si el usuario borra todo el input
    if (isNaN(nuevoValor)) nuevoValor = 0;

    // Mantenemos valores positivos
    nuevoValor = Math.max(0, nuevoValor);

    // 3. ACTUALIZACIÓN DINÁMICA
    const nuevasMedidas = {
      ...cliente.medidas,
      [campo]: nuevoValor,
    };

    await db.clientes.update(cliente.id, {
      medidas: nuevasMedidas,
      ultimaActualizacion: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Ruler size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Medidas de {cliente.nombre}
              </h3>
              <p className="text-sm text-slate-400">
                Ajusta los centímetros para el patrón
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {/* Seccionamos las medidas para claridad visual */}
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

          {/* TUS NUEVOS CAMPOS */}
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
      </div>
    </div>
  );
}
