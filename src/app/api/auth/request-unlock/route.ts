import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { email } = await request.json();

    // Validar correo
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico no válido" }, { status: 400 });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (!user.isLocked) {
      return NextResponse.json({ error: "La cuenta no está bloqueada" }, { status: 400 });
    }

    // Generar token de desbloqueo
    const token = crypto.randomBytes(32).toString("hex");
    user.unlockToken = token;
    user.unlockTokenExpires = new Date(Date.now() + 3600 * 1000); // Expira en 1 hora
    await user.save();

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Enviar correo con enlace de desbloqueo
    const unlockUrl = `${process.env.NEXTAUTH_URL}/unlock?token=${token}`;
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

    return NextResponse.json({ message: "Correo de desbloqueo enviado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error en request-unlock:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}