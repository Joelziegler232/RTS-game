import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import TradeOffer from "@/app/models/tradeOffer";
import { getToken } from "next-auth/jwt";

// Forzar que esta ruta siempre se ejecute en el servidor (nunca cacheada)
export const dynamic = 'force-dynamic';

// Ruta: GET /api/trade/offers → Obtiene todas las ofertas pendientes del usuario (enviadas y recibidas)
export async function GET(req: NextRequest) {
  // Conectar a la base de datos
  await connect();

  // Verificar que el usuario esté autenticado
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Buscar todas las ofertas pendientes donde el usuario es remitente o destinatario
  const offers = await TradeOffer.find({
    $or: [
      { fromUser: token.sub },  // Ofertas que ENVÍO yo
      { toUser: token.sub }     // Ofertas que RECIBÍ yo
    ],
    status: 'pending'           // Solo las que aún no fueron aceptadas/rechazadas
  })
    .populate('fromUser', 'fullname profilePicture')  // Traer nombre y foto del que envía
    .populate('toUser', 'fullname profilePicture')    // Traer nombre y foto del que recibe
    .sort({ createdAt: -1 });                         // Más recientes primero

  // Devolver todas las ofertas
  return NextResponse.json(offers);
}