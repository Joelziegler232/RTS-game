import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";

// Ruta: POST /api/auth/unlock
export async function POST(request: NextRequest) {
  try {
    // Conectar a la base de datos
    await connect();

    // Obtener el token del cuerpo de la petición
    const { token } = await request.json();

    // Validar que el token venga en la solicitud
    if (!token) {
      return NextResponse.json(
        { error: "Token es obligatorio" },
        { status: 400 }
      );
    }

    // Buscar usuario que tenga ese token y que no haya expirado
    const user = await User.findOne({
      unlockToken: token,
      unlockTokenExpires: { $gt: new Date() }, // Mayor que ahora → aún válido
    });

    // Si no existe o ya expiró
    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    // Desbloquear la cuenta
    user.isLocked = false;
    user.failedLoginAttempts = 0;
    user.unlockToken = null;           // Eliminar token usado
    user.unlockTokenExpires = null;    // Eliminar fecha de expiración
    await user.save();

    // Respuesta exitosa
    return NextResponse.json(
      { message: "Cuenta desbloqueada con éxito" },
      { status: 200 }
    );
  } catch (error: any) {
    // Capturar cualquier error inesperado
    console.error("Error en unlock:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}