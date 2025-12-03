import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import UserInstance from "@/app/models/instance";
import { uploadToCloudinary } from "@/app/utils/cloudinary";
import bcrypt from "bcryptjs";
import { generateMap } from "@/app/api/mapController";

// Ruta: POST /api/auth/signup
export async function POST(request: NextRequest) {
  try {
    // Conectar a la base de datos
    await connect();

    // Obtener datos del formulario
    const formData = await request.formData();
    const fullname = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    // Validar campos obligatorios
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido" }, { status: 400 });
    }

    // Validar longitud del nombre
    if (fullname.length < 3 || fullname.length > 50) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 3 y 50 caracteres" },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar que el nombre no esté tomado (case insensitive)
    const nameExists = await User.findOne({
      fullname: { $regex: `^${fullname.trim()}$`, $options: "i" },
    });

    if (nameExists) {
      return NextResponse.json(
        { error: "Este nombre ya existe. ¡Elige otro!" },
        { status: 400 }
      );
    }

    // Subir foto de perfil a Cloudinary (si se envió)
    let profilePictureUrl = null;
    if (profilePicture) {
      profilePictureUrl = await uploadToCloudinary(profilePicture);
    }

    // Hashear contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      level: 1,
      obreros: 0,
    });
    await user.save();

    // Generar mapa 100x100 para el nuevo jugador
    const mapGrid = generateMap(100);
    console.log("Mapa generado para el usuario:", mapGrid[0]);

    // Verificar distribución de terrenos (útil para debugging)
    const terrainCounts = mapGrid.flat().reduce((acc, terrain) => {
      acc[terrain] = (acc[terrain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("Distribución de terrenos en signup:", terrainCounts);

    // Recursos iniciales del jugador
    const initialResources = [
      { resource: "gold", amount: 0 },
      { resource: "money", amount: 5000 },
      { resource: "food", amount: 200 },
      { resource: "lumber", amount: 0 },
      { resource: "stone", amount: 0 },
    ];

    // Crear instancia inicial del juego (sin ayuntamiento aún)
    const userInstance = new UserInstance({
      userId: user._id,
      location: { x: 0, y: 0 },
      resources: initialResources,
      buildings: [],
      units: [],
      aumentadores: [],
      map: {
        grid: mapGrid,
        createdAt: new Date(),
      },
      population: { villagers: 0, maxPopulation: 5 },
      level: 1,
    });
    await userInstance.save();

    console.log("Instancia de usuario guardada con mapa, primera fila:", userInstance.map.grid[0]);

    // Registro exitoso
    return NextResponse.json({ email: user.email }, { status: 201 });
  } catch (error: any) {
    // Capturar cualquier error
    console.error("Error en el registro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}