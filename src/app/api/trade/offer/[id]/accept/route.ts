// src/app/api/trade/offer/[id]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import TradeOffer from "@/app/models/tradeOffer";
import UserInstance from "@/app/models/instance";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const offer = await TradeOffer.findById(params.id)
    .populate('fromUser', 'fullname')
    .populate('toUser', 'fullname');

  if (!offer) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  if (offer.toUser._id.toString() !== token.sub) return NextResponse.json({ error: "No eres el destinatario" }, { status: 403 });
  if (offer.status !== 'pending') return NextResponse.json({ error: "Oferta ya procesada" }, { status: 400 });

  const fromInstance = await UserInstance.findOne({ userId: offer.fromUser._id });
  const toInstance = await UserInstance.findOne({ userId: offer.toUser._id });
  if (!fromInstance || !toInstance) return NextResponse.json({ error: "Instancia no encontrada" }, { status: 404 });

  const getRes = (inst: any, res: string) => inst.resources.find((r: any) => r.resource === res)?.amount || 0;
  const setRes = (inst: any, res: string, amount: number) => {
    const r = inst.resources.find((r: any) => r.resource === res);
    if (r) r.amount = Math.max(0, amount);
  };

  // Verificar recursos del oferente
  for (const [key, val] of offer.fromResources) {
    if (getRes(fromInstance, key) < Number(val)) {
      offer.status = 'rejected';
      await offer.save();
      return NextResponse.json({ error: `${offer.fromUser.fullname} no tiene suficiente ${key}` }, { status: 400 });
    }
  }

  // Transferir oferta → destinatario
  for (const [key, val] of offer.fromResources) {
    setRes(fromInstance, key, getRes(fromInstance, key) - Number(val));
    setRes(toInstance, key, getRes(toInstance, key) + Number(val));
  }

  // Transferir pedido → oferente
  for (const [key, val] of offer.toResources) {
    const current = getRes(toInstance, key);
    if (current < Number(val)) {
      offer.status = 'rejected';
      await offer.save();
      return NextResponse.json({ error: `No tienes suficiente ${key}` }, { status: 400 });
    }
    setRes(toInstance, key, current - Number(val));
    setRes(fromInstance, key, getRes(fromInstance, key) + Number(val));
  }

  offer.status = 'accepted';
  await Promise.all([offer.save(), fromInstance.save(), toInstance.save()]);

  return NextResponse.json({ message: "Intercambio aceptado", offer });
}