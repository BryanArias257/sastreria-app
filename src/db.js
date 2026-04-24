import Dexie from "dexie";

export const db = new Dexie("SastreriasDB");

db.version(1).stores({
  clientes: "++id, nombre, ultimaActualizacion",
  // Añadimos nombreProyecto como índice para facilitar búsquedas
  proyectos:
    "++id, clienteId, nombreProyecto, notas, estadoCanvas, ultimaActualizacion, *nombreProyecto",
});
