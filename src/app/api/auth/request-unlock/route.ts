import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Ruta: POST /api/auth/request-unlock
export async function POST(request: NextRequest) {
  try {
    // Conectar a la base de datos
    await connect();

    // Obtener email del cuerpo de la petición
    const { email } = await request.json();

    // Validar que el email exista y tenga formato correcto
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Correo electrónico no válido" },
        { status: 400 }
      );
    }

    // Buscar al usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la cuenta realmente esté bloqueada
    if (!user.isLocked) {
      return NextResponse.json(
        { error: "La cuenta no está bloqueada" },
        { status: 400 }
      );
    }

    // Generar token seguro para desbloquear la cuenta
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar token y fecha de expiración en el usuario
    user.unlockToken = token;
    user.unlockTokenExpires = new Date(Date.now() + 3600 * 1000); // 1 hora
    await user.save();

    // Configurar Nodemailer para enviar correo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Construir enlace para desbloquear la cuenta
    const unlockUrl = `${process.env.NEXTAUTH_URL}/unlock?token=${token}`;

    // Enviar correo con el enlace de desbloqueo
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Desbloquear tu cuenta",
      html: `
        <p>Hola ${user.fullname},</p>
        <p>Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos de inicio de sesión.</p>
        <p>Haz clic en el siguiente enlace para desbloquear tu cuenta:</p>
        <a href="${unlockUrl}">Desbloquear Cuenta</a>
        <p>Este enlace es válido por 1 hora. Si no solicitaste este desbloqueo, ignora este correo.</p>
      `,
    });

    // Respuesta exitosa
    return NextResponse.json(
      { message: "Correo de desbloqueo enviado" },
      { status: 200 }
    );
  } catch (error: any) {
    // Capturar cualquier error inesperado
    console.error("Error en request-unlock:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}