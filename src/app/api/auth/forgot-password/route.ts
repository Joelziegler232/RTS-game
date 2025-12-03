import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import ResetToken from "@/app/models/resetToken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Ruta: POST /api/auth/forgot-password
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

    // Generar token seguro y único para restablecer contraseña
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar token en la colección ResetToken (expira en 1 hora por defecto del modelo)
    await ResetToken.create({
      userId: user._id,
      token,
    });

    // Configurar el envío de correo con Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Construir enlace de restablecimiento
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Enviar correo con el enlace
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

    // Respuesta exitosa
    return NextResponse.json(
      { message: "Correo de restablecimiento enviado" },
      { status: 200 }
    );
  } catch (error: any) {
    // Capturar cualquier error inesperado
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}