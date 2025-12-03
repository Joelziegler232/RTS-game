import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import TradeOffer from "@/app/models/tradeOffer";
import User from "@/app/models/user";
import { getToken } from "next-auth/jwt";

// Ruta: POST /api/trade/offer → Crear una nueva oferta de intercambio
export async function POST(req: NextRequest) {
  // Conectar a la base de datos
  await connect();

  // Verificar autenticación con JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Obtener datos de la oferta
  const { toUsername, offer, request } = await req.json();

  // Buscar al usuario destinatario (búsqueda case-insensitive por nombre exacto)
  const toUser = await User.findOne({ fullname: new RegExp(`^${toUsername}$`, 'i') });
  if (!toUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // No permitir ofertas a uno mismo
  if (toUser._id.toString() === token.sub) {
    return NextResponse.json({ error: "No te puedes ofrecer a ti mismo" }, { status: 400 });
  }

  // Crear la nueva oferta de comercio
  const newOffer = new TradeOffer({
    fromUser: token.sub,                              // ID del que envía la oferta
    toUser: toUser._id,                               // ID del que recibe la oferta
    fromResources: new Map(Object.entries(offer)),    // Recursos que OFRECE (ej: { food: 100 })
    toResources: new Map(Object.entries(request)),    // Recursos que PIDE a cambio (ej: { lumber: 50 })
  });

  // Guardar en la base de datos
  await newOffer.save();

  // Respuesta exitosa
  return NextResponse.json(
    { message: "Oferta enviada", offer: newOffer },
    { status: 201 }
  );
}