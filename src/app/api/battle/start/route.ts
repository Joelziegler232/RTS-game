import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import UserInstance from "@/app/models/instance";
import User from "@/app/models/user";

// Calcula el poder total de un ejército (soldados × base + bonus por nivel)
function calcPower(soldiers: number, level: number) {
  return soldiers * (10 + (level || 1) * 2);
}

// Calcula el nuevo Elo de ganador y perdedor (sistema clásico ELO con K=32)
function calculateNewElo(winnerElo: number, loserElo: number, K = 32) {
  const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWin));
  const newLoserElo = Math.round(loserElo + K * (0 - (1 - expectedWin)));
  return { winner: newWinnerElo, loser: newLoserElo };
}

// Sincroniza la lista de unidades con la cantidad real de soldados
function syncUnitsWithSoldiers(instance: any) {
  if (!instance.units) instance.units = [];

  // Mantiene solo unidades válidas que no sean soldados
  const validNonSoldiers = (instance.units || [])
    .filter((u: any) => u.type !== "soldier")
    .filter((u: any) => u.id && u.position && typeof u.position.x === "number" && typeof u.position.y === "number");

  const remaining = instance.population?.soldiers || 0;
  const newSoldiers = [];

  // Crea soldados nuevos con posición aleatoria cerca del centro
  for (let i = 0; i < remaining; i++) {
    newSoldiers.push({
      id: `soldier_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`,
      type: "soldier",
      position: { x: 48 + Math.floor(Math.random() * 6), y: 48 + Math.floor(Math.random() * 6) },
      status: "idle"
    });
  }

  instance.units = [...validNonSoldiers, ...newSoldiers];
}

// Ruta: POST /api/battle/start
export async function POST(request: NextRequest) {
  try {
    await connect();
    const { attackerId, defenderId, troops } = await request.json();

    // Validación básica de datos
    if (!attackerId || !defenderId || !troops?.soldiers || troops.soldiers <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Cargar atacante, defensor y perfil del atacante en paralelo
    const [attacker, defender, attackerProfile] = await Promise.all([
      UserInstance.findOne({ userId: attackerId }),
      UserInstance.findOne({ userId: defenderId }),
      User.findById(attackerId),
    ]);

    if (!attacker || !defender) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    // Valores por defecto seguros
    attacker.population ||= { villagers: 0, soldiers: 0, maxPopulation: 10 };
    defender.population ||= { villagers: 0, soldiers: 0, maxPopulation: 10 };
    attacker.resources ||= [];
    defender.resources ||= [];
    attacker.units ||= [];
    defender.units ||= [];

    attacker.elo ||= 1200;
    defender.elo ||= 1200;
    attacker.trophies ||= 0;
    defender.trophies ||= 0;
    attacker.totalBattles ||= 0;
    defender.totalBattles ||= 0;
    attacker.victories ||= 0;

    // Determinar cuántos soldados realmente se envían (no más de los que tiene)
    const attackerSoldiersSent = Math.min(attacker.population.soldiers, troops.soldiers);
    const defenderSoldiers = defender.population.soldiers;

    if (attackerSoldiersSent === 0) {
      return NextResponse.json({ error: "No tienes soldados" }, { status: 400 });
    }

    // Calcular poder y decidir ganador
    const attackerPower = calcPower(attackerSoldiersSent, attacker.level || 1);
    const defenderPower = calcPower(defenderSoldiers, defender.level || 1);
    const attackerWins = attackerPower > defenderPower;

    // Calcular bajas (20% si ganas, 80% si pierdes)
    const attackerLosses = Math.round(attackerSoldiersSent * (attackerWins ? 0.2 : 0.8));
    const defenderLosses = Math.round(defenderSoldiers * (attackerWins ? 0.8 : 0.2));

    // Aplicar bajas
    attacker.population.soldiers = Math.max(0, attacker.population.soldiers - attackerLosses);
    defender.population.soldiers = Math.max(0, defender.population.soldiers - defenderLosses);

    // Regenerar unidades soldado en el mapa
    syncUnitsWithSoldiers(attacker);
    syncUnitsWithSoldiers(defender);

    // === SAQUEO (solo si el atacante gana) ===
    const loot: any = { gold: 0, food: 0, lumber: 0, stone: 0, money: 0 };
    if (attackerWins) {
      for (const resource of defender.resources) {
        const stolen = Math.floor(resource.amount * 0.15);
        if (stolen > 0) {
          resource.amount -= stolen;
          resource.markModified("amount");

          const attackerRes = attacker.resources.find((r: any) => r.resource === resource.resource);
          if (attackerRes) {
            attackerRes.amount += stolen;
            attackerRes.markModified("amount");
          } else {
            attacker.resources.push({ resource: resource.resource, amount: stolen });
          }

          loot[resource.resource] = (loot[resource.resource] || 0) + stolen;
        }
      }
    }

    // === ELO Y TROFEOS ===
    const { winner, loser } = calculateNewElo(attacker.elo, defender.elo);
    if (attackerWins) {
      attacker.elo = winner;
      defender.elo = loser;
      attacker.trophies += 25;
      defender.trophies = Math.max(0, defender.trophies - 20);
      attacker.victories += 1;
    } else {
      attacker.elo = loser;
      defender.elo = winner;
      attacker.trophies = Math.max(0, attacker.trophies - 20);
      defender.trophies += 25;
    }

    attacker.totalBattles += 1;
    defender.totalBattles += 1;

    // Nombre bonito del atacante para el reporte
    const attackerName =
      attackerProfile?.name ||
      attackerProfile?.fullname ||
      attackerProfile?.email?.split("@")[0] ||
      "Guerrero Anónimo";

    // === REPORTE PARA EL DEFENSOR ===
    const battleReport = {
      attackerId,
      attackerName,
      timestamp: new Date(),
      attackerWins,
      losses: defenderLosses,
      stolenResources: attackerWins
        ? { gold: loot.gold || 0, food: loot.food || 0, lumber: loot.lumber || 0, stone: loot.stone || 0 }
        : { gold: 0, food: 0, lumber: 0, stone: 0 },
      attackerTroopsSent: attackerSoldiersSent,
      defenderTroops: defenderSoldiers,
    };

    if (!defender.battleReports) defender.battleReports = [];
    defender.battleReports.unshift(battleReport);
    if (defender.battleReports.length > 20) defender.battleReports = defender.battleReports.slice(0, 20);

    // Necesario para que Mongoose detecte cambios en arrays y objetos anidados
    defender.markModified('battleReports');
    defender.markModified('resources');

    // Guardar ambos jugadores
    await Promise.all([attacker.save(), defender.save()]);

    // Respuesta al atacante con el resultado de la batalla
    const report = {
      attackerWins,
      attacker: {
        losses: attackerLosses,
        remaining: attacker.population.soldiers,
        elo: attacker.elo,
        trophies: attacker.trophies,
      },
      defender: {
        losses: defenderLosses,
        remaining: defender.population.soldiers,
        elo: defender.elo,
        trophies: defender.trophies,
      },
      loot,
    };

    return NextResponse.json({ report }, { status: 200 });
  } catch (err: any) {
    console.error("ERROR EN BATALLA:", err.message);
    return NextResponse.json({ error: "Error interno", details: err.message }, { status: 500 });
  }
}