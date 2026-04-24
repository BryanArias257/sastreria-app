import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Edit3, PenTool, Eraser, Undo2 } from "lucide-react";
import * as fabric from "fabric"; // Make sure fabric is installed
import { db } from "../db";

export default function EspacioTrabajo({ proyectoId, marcarCambio }) {
  // Voice-to-text state
  const [notas, setNotas] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);

  // Canvas and Tool State
  const canvasRef = useRef(null);
  const fabricInstancia = useRef(null);
  const historialCanvas = useRef([]);
  const [herramientaActiva, setHerramientaActiva] = useState("lapiz");

  // 1. Database Sync Functions
  const cargarDesdeBD = async (canvas) => {
    if (!proyectoId) return;
    const proyecto = await db.proyectos.get(proyectoId);
    if (proyecto && proyecto.estadoCanvas) {
      canvas.loadFromJSON(proyecto.estadoCanvas, () => {
        canvas.renderAll();
        // Set initial history state
        historialCanvas.current = [JSON.stringify(canvas)];
      });
    }
    if (proyecto && proyecto.notas) {
      setNotas(proyecto.notas);
    }
  };

  const guardarEnBD = async (canvas) => {
    if (!proyectoId) return;
    await db.proyectos.put({
      id: proyectoId,
      estadoCanvas: JSON.stringify(canvas),
      notas: notas,
      ultimaActualizacion: new Date().toISOString(),
    });
  };

  // 2. Initialize Canvas (Runs once when component mounts)
  useEffect(() => {
    // We wait a tiny bit to ensure the container div has fully rendered its width/height
    const initCanvas = setTimeout(() => {
      const container = document.getElementById("canvas-container");

      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: "#f8fafc", // Tailwind slate-50
      });

      // Configure default brush
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#1e293b"; // Tailwind slate-800
      canvas.freeDrawingBrush.width = 3;

      // Save to history on every stroke
      canvas.on("path:created", () => {
        historialCanvas.current.push(JSON.stringify(canvas));
        guardarEnBD(canvas);
        marcarCambio();
      });

      fabricInstancia.current = canvas;
      cargarDesdeBD(canvas);
    }, 100);

    return () => {
      clearTimeout(initCanvas);
      if (fabricInstancia.current) {
        fabricInstancia.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]); // Re-run if the project ID changes

  // 3. Canvas Tools
  const activarLapiz = () => {
    setHerramientaActiva("lapiz");
    fabricInstancia.current.isDrawingMode = true;
    fabricInstancia.current.freeDrawingBrush.color = "#1e293b"; // Dark color
    fabricInstancia.current.freeDrawingBrush.width = 3;
  };

  const activarBorrador = () => {
    setHerramientaActiva("borrador");
    fabricInstancia.current.isDrawingMode = true;
    // MVP "Eraser": draw over with background color (thick line)
    fabricInstancia.current.freeDrawingBrush.color = "#f8fafc";
    fabricInstancia.current.freeDrawingBrush.width = 20;
  };

  const deshacer = () => {
    if (historialCanvas.current.length > 1) {
      // Remove current state
      historialCanvas.current.pop();
      // Get previous state
      const estadoAnterior =
        historialCanvas.current[historialCanvas.current.length - 1];

      fabricInstancia.current.loadFromJSON(estadoAnterior, () => {
        fabricInstancia.current.renderAll();
        guardarEnBD(fabricInstancia.current);
        marcarCambio();
      });
    } else if (historialCanvas.current.length === 1) {
      // Clear to blank
      historialCanvas.current = [];
      fabricInstancia.current.clear();
      fabricInstancia.current.backgroundColor = "#f8fafc";
      fabricInstancia.current.renderAll();
      guardarEnBD(fabricInstancia.current);
      marcarCambio();
    }
  };

  // 4. Voice to Text (Unchanged from previous version)
  const iniciarDictado = () => {
    /* ... (Same as before) ... */
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
    recognitionRef.current.lang = "es-MX";
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onstart = () => setEscuchando(true);
    recognitionRef.current.onresult = (event) => {
      let transcripcionActual = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcripcionActual += event.results[i][0].transcript;
      }
      const nuevasNotas = notas + " " + transcripcionActual;
      setNotas(nuevasNotas);
      guardarEnBD(fabricInstancia.current);
      marcarCambio();
    };
    recognitionRef.current.onerror = () => setEscuchando(false);
    recognitionRef.current.onend = () => setEscuchando(false);
    recognitionRef.current.start();
  };

  const detenerDictado = () => {
    /* ... (Same as before) ... */
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setEscuchando(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Panel Izquierdo: Lienzo de Dibujo */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-gray-200 flex flex-col relative overflow-hidden">
        {/* Barra de Herramientas del Canvas */}
        <div className="bg-slate-100 p-4 border-b-2 border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit3 size={24} />
            <span>Mesa de Dibujo</span>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={deshacer}
              className="p-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Deshacer"
            >
              <Undo2 size={24} className="text-slate-700" />
            </button>
            <div className="w-px bg-slate-300 mx-2"></div>
            <button
              onClick={activarLapiz}
              className={`p-3 border-2 rounded-lg transition-colors flex items-center gap-2 ${herramientaActiva === "lapiz" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300 text-slate-700"}`}
            >
              <PenTool size={24} />
              <span className="font-bold hidden md:inline">Lápiz</span>
            </button>
            <button
              onClick={activarBorrador}
              className={`p-3 border-2 rounded-lg transition-colors flex items-center gap-2 ${herramientaActiva === "borrador" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300 text-slate-700"}`}
            >
              <Eraser size={24} />
              <span className="font-bold hidden md:inline">Borrador</span>
            </button>
          </div>
        </div>

        {/* Contenedor del Canvas */}
        <div
          id="canvas-container"
          className="flex-1 w-full h-full cursor-crosshair"
        >
          <canvas ref={canvasRef} />
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
              guardarEnBD(fabricInstancia.current);
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
              {escuchando ? "Escuchando..." : "Mantén presionado para dictar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
