import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import TradeOffer from "@/app/models/tradeOffer";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const offer = await TradeOffer.findById(params.id);
  if (!offer) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  if (offer.toUser.toString() !== token.sub) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  offer.status = 'rejected';
  await offer.save();

  return NextResponse.json({ message: "Oferta rechazada" });
}