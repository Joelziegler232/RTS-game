// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import ResetToken from "@/app/models/resetToken";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { token, password } = await request.json();

    // Validar entrada
    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son obligatorios" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Buscar token
    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    // Buscar usuario
    const user = await User.findById(resetToken.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Eliminar token usado
    await ResetToken.deleteOne({ token });

    return NextResponse.json({ message: "Contraseña restablecida con éxito" }, { status: 200 });
  } catch (error: any) {
    console.error("Error en reset-password:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}