import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import TradeOffer from "@/app/models/tradeOffer";
import User from "@/app/models/user";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  await connect();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  
  const { toUsername, offer, request } = await req.json();

  const toUser = await User.findOne({ fullname: new RegExp(`^${toUsername}$`, 'i') });
  if (!toUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (toUser._id.toString() === token.sub) {
    return NextResponse.json({ error: "No te puedes ofrecer a ti mismo" }, { status: 400 });
  }

  const newOffer = new TradeOffer({
    fromUser: token.sub,                         
    toUser: toUser._id,                               
    fromResources: new Map(Object.entries(offer)),    
    toResources: new Map(Object.entries(request)),    
  });

  await newOffer.save();

  return NextResponse.json(
    { message: "Oferta enviada", offer: newOffer },
    { status: 201 }
  );
}