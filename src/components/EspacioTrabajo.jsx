import React, { useState, useRef } from "react";
import { Mic, MicOff, Edit3 } from "lucide-react";

export default function EspacioTrabajo({ proyectoId, marcarCambio }) {
  const [notas, setNotas] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);

  // Inicializar Web Speech API
  const iniciarDictado = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("El dictado por voz no está soportado en este navegador.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "es-MX"; // Español
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => setEscuchando(true);

    recognitionRef.current.onresult = (event) => {
      let transcripcionActual = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcripcionActual += event.results[i][0].transcript;
      }
      // Actualizamos las notas, preservando lo que ya estaba escrito
      setNotas((prev) => prev + " " + transcripcionActual);
      marcarCambio();
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Error en dictado:", event.error);
      setEscuchando(false);
    };

    recognitionRef.current.onend = () => setEscuchando(false);

    recognitionRef.current.start();
  };

  const detenerDictado = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setEscuchando(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Panel Izquierdo: Lienzo (Fabric.js + FreeSewing irán aquí) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-gray-200 flex flex-col relative overflow-hidden">
        <div className="bg-slate-100 p-4 border-b-2 border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit3 size={24} />
            <span>Mesa de Dibujo</span>
          </h2>
        </div>

        {/* Placeholder del Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 text-lg">
            El patrón interactivo cargará aquí...
          </p>
        </div>
      </div>

      {/* Panel Derecho: Notas y Dictado */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-4">Notas de Confección</h3>

          <textarea
            value={notas}
            onChange={(e) => {
              setNotas(e.target.value);
              marcarCambio();
            }}
            className="flex-1 w-full p-4 border-2 border-gray-200 rounded-xl resize-none text-lg focus:border-blue-500 outline-none mb-4"
            placeholder="Escribe o dicta las notas para esta prenda..."
          />

          <button
            onPointerDown={iniciarDictado}
            onPointerUp={detenerDictado}
            onPointerLeave={detenerDictado}
            className={`min-h-[80px] rounded-xl flex flex-col items-center justify-center gap-2 text-white font-bold text-lg transition-all ${
              escuchando
                ? "bg-red-500 animate-pulse"
                : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            {escuchando ? <MicOff size={32} /> : <Mic size={32} />}
            <span>
              {escuchando
                ? "Escuchando... (Suelta para detener)"
                : "Mantén presionado para dictar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
