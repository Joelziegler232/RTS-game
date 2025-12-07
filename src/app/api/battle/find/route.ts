import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import UserInstance from "@/app/models/instance";
import User from "@/app/models/user";

const ELO_RANGE = 300;

export async function POST(request: NextRequest) {
  try {
    await connect();

    const { userId } = await request.json();
    const lastEnemyId = request.headers.get("x-last-enemy-id");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const player = await UserInstance.findOne({ userId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const playerElo = player.elo || 1200;
    const playerSoldiers = player.population?.soldiers || 0;

    if (playerSoldiers <= 0) {
      return NextResponse.json({ error: "No tienes soldados" }, { status: 400 });
    }

   const excludeIds = [userId];

if (lastEnemyId) {
  excludeIds.push(lastEnemyId);
}

const query: any = {
  userId: { $nin: excludeIds },   
  "population.soldiers": { $gt: 0 },
  elo: {
    $gte: playerElo - ELO_RANGE,
    $lte: playerElo + ELO_RANGE,
  },
};


    const enemies = await UserInstance.find(query).limit(30);

    if (enemies.length === 0) {
      return NextResponse.json(
        { error: "No hay oponentes disponibles en este momento" },
        { status: 200 }
      );
    }


   const enemiesWithNames = await Promise.all(
  enemies.map(async (enemy) => {
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

    // Elegir el más cercano en ELO
    const bestEnemy = enemiesWithNames.reduce((best, curr) => {
      const diffBest = Math.abs((best.elo || 1200) - playerElo);
      const diffCurr = Math.abs((curr.elo || 1200) - playerElo);
      return diffCurr < diffBest ? curr : best;
    });

    return NextResponse.json({
      enemy: {
        userId: bestEnemy.userId,
        name: bestEnemy.displayName,
        soldiers: bestEnemy.population.soldiers,
        level: bestEnemy.level || 1,
        elo: bestEnemy.elo || 1200,
      },
    });

  } catch (err) {
    console.error("ERROR EN FIND BATTLE:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
