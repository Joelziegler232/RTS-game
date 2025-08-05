// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import UserInstance from "@/app/models/instance";
import { uploadToCloudinary } from "@/app/utils/cloudinary";
import bcrypt from "bcryptjs";
import { structuresForBackend } from "@/app/edificios/utils/StructuresData";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const formData = await request.formData();
    const fullname = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    // Validaciones
    if (!fullname || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido" }, { status: 400 });
    }
    if (fullname.length < 3 || fullname.length > 50) {
      return NextResponse.json({ error: "El nombre debe tener entre 3 y 50 caracteres" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    // Subir imagen a Cloudinary si existe
    let profilePictureUrl = null;
    if (profilePicture) {
      profilePictureUrl = await uploadToCloudinary(profilePicture);
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      level: 1,
      obreros: 3,
    });
    await user.save();

    // Crear instancia inicial con ayuntamiento y recursos
    const ayuntamiento = structuresForBackend.find((s) => s.type === "ayuntamiento");
    if (!ayuntamiento) {
      throw new Error("Estructura de ayuntamiento no encontrada");
    }
    const initialResources = [
      { resource: "money", amount: 5000 },
      { resource: "wood", amount: 0 },
      { resource: "gold", amount: 0 },
      { resource: "stone", amount: 0 },
    ];
    const userInstance = new UserInstance({
      userId: user._id,
      location: { x: 50, y: 50 },
      resources: initialResources,
      buildings: [{ ...ayuntamiento, id: 0, position: { x: 50, y: 50 } }],
      units: [],
      aumentadores: [],
    });
    await userInstance.save();

    return NextResponse.json({ email: user.email }, { status: 201 });
  } catch (error: any) {
    console.error("Error en el registro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}