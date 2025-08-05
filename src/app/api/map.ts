// app/api/map.ts
import { NextResponse } from "next/server";
import { createMap, getMaps } from "./mapController";

// Ruta para generar un nuevo mapa
export async function POST() {
  try {
    const map = await createMap();
    return NextResponse.json(map);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Un error desconocido ocurrió" }, { status: 500 });
    }
  }
}

// Ruta para obtener todos los mapas
export async function GET() {
    try {
      const maps = await getMaps();
      console.log("Maps retrieved:", maps); // Asegúrate de que este log muestre los mapas
      return NextResponse.json(maps);
    } catch (error: unknown) {
      console.error("Error retrieving maps:", error);
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: "Un error desconocido ocurrió" }, { status: 500 });
      }
    }
  }
