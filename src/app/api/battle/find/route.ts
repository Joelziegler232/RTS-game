import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import UserInstance from "@/app/models/instance";
import User from "@/app/models/user";

// Rango de Elo permitido para buscar rivales (±300)
const ELO_RANGE = 300;

// Ruta: POST /api/battle/find
export async function POST(request: NextRequest) {
  try {
    // Conectar a la base de datos
    await connect();

    // Obtener ID del jugador que busca batalla
    const { userId } = await request.json();

    // Buscar la instancia del jugador actual
    const player = await UserInstance.findOne({ userId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Obtener Elo y cantidad de soldados del jugador
    const playerElo = player.elo || 1200;
    const playerSoldiers = player.population?.soldiers || 0;

    // Verificar que tenga al menos 1 soldado
    if (playerSoldiers <= 0) {
      return NextResponse.json({ error: "No tienes soldados" }, { status: 400 });
    }

    // Buscar hasta 30 posibles enemigos con:
    // - No sea el mismo usuario
    // - Tenga soldados
    // - Elo dentro del rango ±300
    const enemies = await UserInstance.find({
      userId: { $ne: userId },
      "population.soldiers": { $gt: 0 },
      elo: { $gte: playerElo - ELO_RANGE, $lte: playerElo + ELO_RANGE },
    }).limit(30);

    // Si no hay nadie disponible
    if (enemies.length === 0) {
      return NextResponse.json(
        { error: "No hay oponentes disponibles en este momento" },
        { status: 200 }
      );
    }

    // Añadir nombre real del jugador a cada enemigo
    const enemiesWithNames = await Promise.all(
      enemies.map(async (enemy: any) => {
        const user = await User.findById(enemy.userId)
          .select("fullname name username")
          .lean() as { fullname?: string; name?: string; username?: string } | null;

        return {
          ...enemy.toObject(),
          displayName:
            user?.fullname ||
            user?.name ||
            user?.username ||
            "Guerrero Desconocido",
        };
      })
    );

    // Elegir al enemigo con Elo más cercano
    const bestEnemy = enemiesWithNames.reduce((best: any, curr: any) => {
      const diffBest = Math.abs((best.elo || 1200) - playerElo);
      const diffCurr = Math.abs((curr.elo || 1200) - playerElo);
      return diffCurr < diffBest ? curr : best;
    });

    // Devolver solo la información necesaria del rival
    return NextResponse.json({
      enemy: {
        userId: bestEnemy.userId,
        name: bestEnemy.displayName,
        soldiers: bestEnemy.population.soldiers,
        level: bestEnemy.level || 1,
        elo: bestEnemy.elo || 1200,
      },
    });
  } catch (err: any) {
    // Capturar cualquier error inesperado
    console.error("ERROR EN FIND BATTLE:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}