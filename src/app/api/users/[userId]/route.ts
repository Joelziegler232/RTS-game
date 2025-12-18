import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import User from "@/app/models/user";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/utils/cloudinary";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connect();

    const user = await User.findById(params.userId)
      .select("fullname email level obreros profilePicture");

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

    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";

    // actualizar datos del usuario con form data desde panel.tsx
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const fullname = formData.get("fullname") as string | null;
      const profilePicture = formData.get("profilePicture") as File | null;
      
      if (fullname && fullname.trim() !== user.fullname) {
        const newName = fullname.trim();

        if (newName.length < 3 || newName.length > 20) {
          return NextResponse.json(
            { error: "El nombre debe tener entre 3 y 20 caracteres" },
            { status: 400 }
          );
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(newName)) {
          return NextResponse.json(
            { error: "Solo letras, números y guiones bajos" },
            { status: 400 }
          );
        }

        // Verificar que nadie más tenga ese nombre
        const nameExists = await User.findOne({
          fullname: { $regex: `^${newName}$`, $options: "i" },
          _id: { $ne: user._id }
        });

        if (nameExists) {
          return NextResponse.json(
            { error: "Este nombre ya está tomado" },
            { status: 400 }
          );
        }

        user.fullname = newName;
      }

      // Subir nueva foto de perfil
      if (profilePicture && profilePicture.size > 0) {
        // Validar tamaño y tipo
        if (profilePicture.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: "La imagen no debe exceder 5MB" }, { status: 400 });
        }
        if (!profilePicture.type.startsWith("image/")) {
          return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
        }

        // Borrar foto anterior si existe
        if (user.profilePicture) {
          try {
            const urlParts = user.profilePicture.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            await deleteFromCloudinary(`profile_pictures/${publicId}`);
          } catch (err) {
            console.warn("No se pudo borrar la foto anterior");
          }
        }

        // Subir nueva foto
        const newUrl = await uploadToCloudinary(profilePicture);
        user.profilePicture = newUrl;
      }
    }

    // === 2) ELIMINAR FOTO DE PERFIL (JSON) ===
    else if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.deleteProfilePicture && user.profilePicture) {
        try {
          const urlParts = user.profilePicture.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          await deleteFromCloudinary(`profile_pictures/${publicId}`);
        } catch (err) {
          console.warn("Error borrando de Cloudinary");
        }
        user.profilePicture = null;
      }
    }

    // Guardar cambios
    await user.save();

    // Respuesta exitosa
    return NextResponse.json({
      message: "¡Perfil actualizado con éxito!",
      user: {
        id: user._id.toString(),
        name: user.fullname,
        email: user.email,
        profilePicture: user.profilePicture,
        level: user.level || 1,
        obreros: user.obreros || 0,
      },
    });

  } catch (error: any) {
    console.error("Error crítico en PATCH usuario:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}