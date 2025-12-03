import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/app/libs/mongodb';
import UserInstance from '@/app/models/instance';
import User from '@/app/models/user';
import { generateMap } from '../../mapController';
import { structuresForBackend } from '@/app/edificios/utils/StructuresData';
import { v4 as uuidv4 } from 'uuid';


// ============================================================
// GET → Obtiene la instancia completa del jugador
// ============================================================
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();
    const instance = await UserInstance.findOne({ userId: params.userId });

    if (!instance) {
      return NextResponse.json({ error: 'Instancia no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      ...instance.toObject(),
      map: instance.map || { grid: [], createdAt: new Date() },
    });

  } catch (error: any) {
    console.error('GET ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// POST → Crea una nueva instancia (solo la primera vez)
// ============================================================
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();
    const body = await request.json();

    // Evitar crear dos veces
    const exists = await UserInstance.findOne({ userId: params.userId });
    if (exists) {
      return NextResponse.json({ error: 'Instancia ya existe' }, { status: 400 });
    }

    const newInstance = new UserInstance({
      userId: params.userId,
      buildings: [],
      resources: body.resources || [
        { resource: 'gold', amount: 500 },
        { resource: 'money', amount: 5000 },
        { resource: 'food', amount: 200 },
        { resource: 'lumber', amount: 200 },
        { resource: 'stone', amount: 50 },
      ],
      population: body.population || { villagers: 0, maxPopulation: 0 },
      map: { grid: generateMap(100), createdAt: new Date() },
      units: [],
      aumentadores: [],
      location: { x: 0, y: 0 },
      level: 1,
    });

    await newInstance.save();
    return NextResponse.json(newInstance, { status: 201 });

  } catch (error: any) {
    console.error('POST ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// PATCH → Actualiza la instancia (edificios, recursos, unidades, etc.)
// ============================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connect();
    const body = await request.json();

    const instance = await UserInstance.findOne({ userId: params.userId });
    if (!instance) {
      return NextResponse.json({ error: 'Instancia no encontrada' }, { status: 404 });
    }

    // Inicializar population de forma segura
    if (!instance.population) {
      instance.population = { villagers: 0, soldiers: 0, maxPopulation: 0 };
    }
    const pop = instance.population;
    pop.villagers ||= 0;
    pop.soldiers ||= 0;
    pop.maxPopulation ||= 0;

    const update: any = {};
    const arrayFilters: any[] = [];

    // 1) CONSTRUIR EDIFICIO
    if (body.building) {
      const structure = structuresForBackend.find((s) => s.type === body.building.type);
      if (!structure) return NextResponse.json({ error: 'Edificio no válido' }, { status: 400 });
      if (instance.level < structure.desbloqueo)
        return NextResponse.json({ error: `Requiere nivel ${structure.desbloqueo}` }, { status: 400 });
      if (body.building.type === 'ayuntamiento' && instance.buildings.some((b: any) => b.type === 'ayuntamiento'))
        return NextResponse.json({ error: 'Ya existe un ayuntamiento' }, { status: 400 });

      // Descontar recursos del costo
      const newResources = (instance.resources || []).map((r: any) => ({ ...r }));
      for (const [res, cost] of Object.entries(structure.cost)) {
        const found = newResources.find((x: any) => x.resource === res);
        if (found) found.amount -= Number(cost);
      }
      update.$set = { ...(update.$set || {}), resources: newResources };
      instance.resources = newResources;

      // Agregar edificio
      update.$push = { ...(update.$push || {}), buildings: body.building };
      instance.buildings.push(body.building);

      // Casa → +5 población máxima
      if (body.building.type === 'house') {
        const newMaxPop = (instance.population?.maxPopulation || 0) + 5;
        update.$set = { ...(update.$set || {}), 'population.maxPopulation': newMaxPop };
        if (instance.population) instance.population.maxPopulation = newMaxPop;
      }
    }

    // 2) ACTUALIZAR RECURSOS MANUALMENTE
    if (body.resources) {
      const newResources = [...instance.resources];
      for (const r of body.resources) {
        const found = newResources.find((x) => x.resource === r.resource);
        if (found) found.amount = Number(r.amount);
      }
      update.$set = { ...update.$set, resources: newResources };
    }

    // 3) CREAR UNIDADES (aldeanos, etc.)
    if (body.units) {
      const unitsArray = Array.isArray(body.units) ? body.units : [body.units];
      const preparedUnits = unitsArray.map((u: any) => ({
        ...u,
        id: u.id || uuidv4(),
        position: u.position || { x: 0, y: 0 },
        type: u.type,
      }));

      const villagersToAdd = unitsArray.filter((u: any) => u.type === 'villager').length;

      update.$push = { ...(update.$push || {}), units: { $each: preparedUnits } };
      if (villagersToAdd > 0) {
        update.$inc = { ...(update.$inc || {}), 'population.villagers': villagersToAdd };
      }
    }

    // 4) CONVERTIR ALDEANOS → SOLDADOS
    if (body.soldier) {
      const soldiersArray = Array.isArray(body.soldier) ? body.soldier : [body.soldier];
      const decrease = soldiersArray.length;

      update.$push = { ...(update.$push || {}), units: { $each: soldiersArray } };
      update.$inc = { ...(update.$inc || {}), 'population.villagers': -decrease };
      pop.villagers = Math.max(0, pop.villagers - decrease);
    }

    // 5) ELIMINAR ALDEANOS
    if (body.removeVillager) {
      const removeCount = Number(body.removeVillager) || 0;
      update.$inc = { ...(update.$inc || {}), 'population.villagers': -removeCount };
      pop.villagers = Math.max(0, pop.villagers - removeCount);
    }

    // 6) ASIGNAR ALDEANO A EDIFICIO
    if (body.assignVillager) {
      const { id } = body.assignVillager;
      const building = instance.buildings.find((b: any) => b.id === id);
      if (!building) return NextResponse.json({ error: 'Building not found' }, { status: 400 });
      if ((building.obreros || 0) >= (building.maxObreros || 999))
        return NextResponse.json({ error: 'Max workers reached' }, { status: 400 });
      if (pop.villagers <= 0) return NextResponse.json({ error: 'No villagers available' }, { status: 400 });

      arrayFilters.push({ 'elem.id': id });
      update.$inc = { ...(update.$inc || {}), 'buildings.$[elem].obreros': 1, 'population.villagers': -1 };
    }

    // 7) QUITAR ALDEANO DE EDIFICIO
    if (body.removeVillagerFromBuilding) {
      const { id } = body.removeVillagerFromBuilding;
      const building = instance.buildings.find((b: any) => b.id === id);
      if (!building) return NextResponse.json({ error: 'Building not found' }, { status: 400 });
      if ((building.obreros || 0) <= 0) return NextResponse.json({ error: 'No villagers assigned' }, { status: 400 });

      arrayFilters.push({ 'elem.id': id });
      update.$inc = { ...(update.$inc || {}), 'buildings.$[elem].obreros': -1, 'population.villagers': 1 };
    }

    // 8) ENTRENAR SOLDADO EN CUARTEL
    if (body.addSoldier) {
      const soldier = body.addSoldier;

      if ((instance.population.villagers || 0) <= 0) {
        return NextResponse.json({ error: "No hay aldeanos disponibles" }, { status: 400 });
      }

      instance.population.villagers -= 1;
      instance.population.soldiers = (instance.population.soldiers || 0) + 1;

      instance.units.push({
        id: soldier.id,
        type: "soldier",
        position: soldier.position,
        status: soldier.status || "idle",
      });

      const foodResource = instance.resources.find((r: any) => r.resource === "food");
      if (foodResource) {
        foodResource.amount = Math.max(0, foodResource.amount - 30);
      }

      update.$set = {
        ...update.$set,
        "population.villagers": instance.population.villagers,
        "population.soldiers": instance.population.soldiers,
        resources: instance.resources,
      };
      update.$push = { ...update.$push, units: soldier };
    }

    // 9) CALCULAR NIVEL AUTOMÁTICO
    const buildingTypes = instance.buildings.map((b: any) => b.type);
    let newLevel = instance.level || 1;

    if (newLevel === 1 && buildingTypes.includes('ayuntamiento')) newLevel = 2;
    if (newLevel === 2 && buildingTypes.includes('mill') && buildingTypes.includes('lumber') && buildingTypes.includes('house')) newLevel = 3;
    if (newLevel === 3 && buildingTypes.includes('stone_mine') && buildingTypes.includes('gold_mine') && buildingTypes.includes('barracks')) newLevel = 4;

    if (newLevel !== instance.level) {
      update.$set = { ...(update.$set || {}), level: newLevel };
      instance.level = newLevel;
      await User.findByIdAndUpdate(params.userId, { level: newLevel }).catch(console.error);
    }

    // 10) APLICAR UPDATE Y DEVOLVER INSTANCIA ACTUALIZADA
    const updateOptions: any = {};
    if (arrayFilters.length > 0) updateOptions.arrayFilters = arrayFilters;

    await UserInstance.updateOne(
      { userId: params.userId },
      update,
      updateOptions
    );

    const updatedInstance = await UserInstance.findOne({ userId: params.userId });
    if (!updatedInstance) {
      return NextResponse.json({ error: 'Instancia no encontrada después de update' }, { status: 404 });
    }

    return NextResponse.json(updatedInstance);
  } catch (error: any) {
    console.error('PATCH ERROR:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}