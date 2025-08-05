// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import ResetToken from "@/app/models/resetToken";
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

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    await ResetToken.create({
      userId: user._id,
      token,
    });

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Enviar correo con enlace de restablecimiento
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Restablecer tu contraseña",
      html: `
        <p>Hola ${user.fullname},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
        <a href="${resetUrl}">Restablecer Contraseña</a>
        <p>Este enlace es válido por 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
      `,
    });

    return NextResponse.json({ message: "Correo de restablecimiento enviado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}