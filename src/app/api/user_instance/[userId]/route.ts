// src/app/api/user_instance/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import UserInstance from "@/app/models/instance";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();
    const instance = await UserInstance.findOne({ userId: params.userId });
    if (!instance) {
      return NextResponse.json({ error: "Instancia no encontrada" }, { status: 404 });
    }
    return NextResponse.json(instance);
  } catch (error: any) {
    console.error("Error al obtener instancia:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();
    const { resource, amount, building } = await request.json();

    if (resource && amount !== undefined) {
      const instance = await UserInstance.findOneAndUpdate(
        { userId: params.userId, "resources.resource": resource },
        { $set: { "resources.$.amount": amount } },
        { new: true }
      );
      if (!instance) {
        return NextResponse.json({ error: "Instancia o recurso no encontrado" }, { status: 404 });
      }
      return NextResponse.json(instance);
    } else if (building) {
      const instance = await UserInstance.findOneAndUpdate(
        { userId: params.userId },
        { $push: { buildings: building } },
        { new: true }
      );
      if (!instance) {
        return NextResponse.json({ error: "Instancia no encontrada" }, { status: 404 });
      }
      return NextResponse.json(instance);
    }
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error al actualizar instancia:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}