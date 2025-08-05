// src/app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/utils/cloudinary";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();
    const user = await User.findById(params.userId).select("fullname email level obreros");
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();
    const contentType = request.headers.get("content-type");
    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (contentType?.includes("multipart/form-data")) {
      // Manejar actualización de nombre y/o foto de perfil
      const formData = await request.formData();
      const fullname = formData.get("fullname") as string | null;
      const profilePicture = formData.get("profilePicture") as File | null;

      // Actualizar el nombre si se proporciona
      if (fullname) {
        if (fullname.length < 3 || fullname.length > 50) {
          return NextResponse.json({ error: "El nombre debe tener entre 3 y 50 caracteres" }, { status: 400 });
        }
        user.fullname = fullname;
      }

      // Actualizar la foto de perfil si se proporciona
      if (profilePicture) {
        if (profilePicture.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: "La imagen no debe exceder 5MB" }, { status: 400 });
        }
        if (!profilePicture.type.startsWith("image/")) {
          return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
        }
        const profilePictureUrl = await uploadToCloudinary(profilePicture);
        user.profilePicture = profilePictureUrl;
      }
    } else if (contentType?.includes("application/json")) {
      // Manejar eliminación de la foto de perfil
      const body = await request.json();
      if (body.deleteProfilePicture) {
        if (user.profilePicture) {
          // Extraer el public_id de la URL de Cloudinary
          const urlParts = user.profilePicture.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          const folder = 'profile_pictures'; // Ajusta según la carpeta usada en uploadToCloudinary
          await deleteFromCloudinary(`${folder}/${publicId}`);
        }
        user.profilePicture = null;
      }
    } else {
      return NextResponse.json({ error: "Tipo de contenido no soportado" }, { status: 400 });
    }

    // Guardar los cambios
    await user.save();

    // Devolver la respuesta con los datos actualizados
    return NextResponse.json({
      message: user.profilePicture === null ? "Foto de perfil eliminada correctamente" : "Perfil actualizado correctamente",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.fullname,
        profilePicture: user.profilePicture,
        level: user.level,
        obreros: user.obreros,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar el perfil" }, { status: 500 });
  }
}