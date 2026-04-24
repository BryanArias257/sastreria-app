import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Edit3,
  PenTool,
  Eraser,
  Undo2,
  RotateCcw,
} from "lucide-react";
import * as fabric from "fabric";
import { db } from "../db";

export default function EspacioTrabajo({ proyectoId, marcarCambio }) {
  const [notas, setNotas] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);

  const canvasRef = useRef(null);
  const fabricInstancia = useRef(null);
  const [herramientaActiva, setHerramientaActiva] = useState("lapiz");

  // Pilas de historial (Refs para velocidad)
  const stackUndo = useRef([]);
  const stackRedo = useRef([]);

  // ESTADO ESPEJO: Para que los botones se activen/desactiven correctamente
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const actualizarEstadoBotones = () => {
    setCanUndo(stackUndo.current.length > 1);
    setCanRedo(stackRedo.current.length > 0);
  };

  const guardarEnBD = async (canvas) => {
    if (!proyectoId) return;
    await db.proyectos.update(proyectoId, {
      estadoCanvas: JSON.stringify(canvas),
      notas: notas,
      ultimaActualizacion: new Date().toISOString(),
    });
  };

  useEffect(() => {
    const initCanvas = setTimeout(async () => {
      const container = document.getElementById("canvas-container");
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: "#f8fafc",
      });

      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#1e293b";
      canvas.freeDrawingBrush.width = 3;

      // Al terminar un trazo
      canvas.on("path:created", () => {
        stackUndo.current.push(JSON.stringify(canvas));
        stackRedo.current = []; // Limpiar redo al dibujar algo nuevo
        actualizarEstadoBotones();
        guardarEnBD(canvas);
        marcarCambio();
      });

      fabricInstancia.current = canvas;

      const proyecto = await db.proyectos.get(proyectoId);
      if (proyecto && proyecto.estadoCanvas) {
        canvas.loadFromJSON(proyecto.estadoCanvas, () => {
          canvas.renderAll();
          stackUndo.current = [JSON.stringify(canvas)];
          actualizarEstadoBotones();
        });
      } else {
        stackUndo.current = [JSON.stringify(canvas)];
        actualizarEstadoBotones();
      }
    }, 100);

    return () => {
      clearTimeout(initCanvas);
      if (fabricInstancia.current) fabricInstancia.current.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  const deshacer = () => {
    if (stackUndo.current.length > 1) {
      const canvas = fabricInstancia.current;
      const estadoActual = stackUndo.current.pop();
      stackRedo.current.push(estadoActual);

      const estadoAnterior = stackUndo.current[stackUndo.current.length - 1];

      canvas.clear();
      canvas.loadFromJSON(estadoAnterior, () => {
        canvas.backgroundColor = "#f8fafc";
        canvas.renderAll();
        actualizarEstadoBotones();
        guardarEnBD(canvas);
        marcarCambio();
      });
    }
  };

  const rehacer = () => {
    if (stackRedo.current.length > 0) {
      const canvas = fabricInstancia.current;
      const estadoARecuperar = stackRedo.current.pop();
      stackUndo.current.push(estadoARecuperar);

      canvas.clear();
      canvas.loadFromJSON(estadoARecuperar, () => {
        canvas.backgroundColor = "#f8fafc";
        canvas.renderAll();
        actualizarEstadoBotones();
        guardarEnBD(canvas);
        marcarCambio();
      });
    }
  };

  const reiniciarCanvas = async () => {
    if (!window.confirm("¿Estás segura de que quieres borrar todo el dibujo?"))
      return;

    const canvas = fabricInstancia.current;
    canvas.clear();
    canvas.backgroundColor = "#f8fafc";
    canvas.renderAll();

    stackUndo.current = [JSON.stringify(canvas)];
    stackRedo.current = [];
    actualizarEstadoBotones();

    await db.proyectos.update(proyectoId, {
      estadoCanvas: JSON.stringify(canvas),
      ultimaActualizacion: new Date().toISOString(),
    });
    marcarCambio();
  };

  const activarLapiz = () => {
    setHerramientaActiva("lapiz");
    fabricInstancia.current.isDrawingMode = true;
    fabricInstancia.current.freeDrawingBrush.color = "#1e293b";
    fabricInstancia.current.freeDrawingBrush.width = 3;
  };

  const activarBorrador = () => {
    setHerramientaActiva("borrador");
    fabricInstancia.current.isDrawingMode = true;
    fabricInstancia.current.freeDrawingBrush.color = "#f8fafc";
    fabricInstancia.current.freeDrawingBrush.width = 20;
  };

  // Dictado (simplificado para el ejemplo)
  const iniciarDictado = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "es-MX";
    recognitionRef.current.onstart = () => setEscuchando(true);
    recognitionRef.current.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setNotas((prev) => prev + " " + text);
      marcarCambio();
    };
    recognitionRef.current.onend = () => setEscuchando(false);
    recognitionRef.current.start();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-gray-200 flex flex-col relative overflow-hidden">
        <div className="bg-slate-100 p-4 border-b-2 border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit3 size={24} /> <span>Mesa de Dibujo</span>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={deshacer}
              disabled={!canUndo}
              className="p-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-opacity"
            >
              <Undo2 size={24} className="text-slate-700" />
            </button>
            <button
              onClick={rehacer}
              disabled={!canRedo}
              className="p-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-opacity"
            >
              <Undo2
                size={24}
                className="text-slate-700 transform scale-x-[-1]"
              />
            </button>

            <div className="w-px bg-slate-300 mx-2"></div>

            <button
              onClick={activarLapiz}
              className={`p-3 border-2 rounded-lg flex items-center gap-2 ${herramientaActiva === "lapiz" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300"}`}
            >
              <PenTool size={24} />{" "}
              <span className="font-bold hidden md:inline">Lápiz</span>
            </button>
            <button
              onClick={activarBorrador}
              className={`p-3 border-2 rounded-lg flex items-center gap-2 ${herramientaActiva === "borrador" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300"}`}
            >
              <Eraser size={24} />{" "}
              <span className="font-bold hidden md:inline">Borrador</span>
            </button>
          </div>
        </div>

        <div id="canvas-container" className="flex-1 w-full h-full">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="lg:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-4">Notas de Confección</h3>
          <textarea
            value={notas}
            onChange={(e) => {
              setNotas(e.target.value);
              marcarCambio();
            }}
            className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-lg outline-none mb-4"
            placeholder="Dicta o escribe notas..."
          />
          <button
            onPointerDown={iniciarDictado}
            onPointerUp={() => recognitionRef.current?.stop()}
            className={`min-h-[80px] rounded-xl flex flex-col items-center justify-center gap-2 text-white font-bold ${escuchando ? "bg-red-500 animate-pulse" : "bg-blue-600"}`}
          >
            {escuchando ? <MicOff size={32} /> : <Mic size={32} />}
            <span>{escuchando ? "Escuchando..." : "Mantén para dictar"}</span>
          </button>
        </div>

        <button
          onClick={reiniciarCanvas}
          className="w-full min-h-[60px] flex items-center justify-center gap-2 bg-amber-100 text-amber-900 rounded-xl border-2 border-amber-300 font-bold"
        >
          <RotateCcw size={24} /> Reiniciar Lienzo
        </button>
      </div>
    </div>
  );
}
