import Dexie from "dexie";

export const db = new Dexie("SastreriasDB");

// Define the schema. ++id means auto-incrementing primary key.
db.version(1).stores({
  clientes: "++id, nombre, ultimaActualizacion",
  proyectos:
    "++id, clienteId, nombreProyecto, notas, estadoCanvas, ultimaActualizacion",
});
