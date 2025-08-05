import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { token } = await request.json();

    // Validar entrada
    if (!token) {
      return NextResponse.json({ error: "Token es obligatorio" }, { status: 400 });
    }

    // Buscar usuario con el token de desbloqueo
    const user = await User.findOne({
      unlockToken: token,
      unlockTokenExpires: { $gt: new Date() }, // Verifica que el token no haya expirado
    });

    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    // Desbloquear cuenta
    user.isLocked = false;
    user.failedLoginAttempts = 0;
    user.unlockToken = null;
    user.unlockTokenExpires = null;
    await user.save();

    return NextResponse.json({ message: "Cuenta desbloqueada con éxito" }, { status: 200 });
  } catch (error: any) {
    console.error("Error en unlock:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}