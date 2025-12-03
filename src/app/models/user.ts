import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: [true, "El nombre completo es obligatorio"],
    minlength: [3, "El nombre completo debe tener al menos 3 caracteres"],
    maxlength: [50, "El nombre completo debe tener como máximo 50 caracteres"],
  },

  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio"],
    unique: true,
    match: [/.+@.+\..+/, "El correo electrónico no es válido"],
  },

  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    select: false,
  },

  profilePicture: {
    type: String,
    default: null,
  },

  level: {
    type: Number,
    default: 1,
  },

  failedLoginAttempts: {
    type: Number,
    default: 0,
  },

  isLocked: {
    type: Boolean,
    default: false,
  },

  unlockToken: {
    type: String,
    default: null,
  },

  unlockTokenExpires: {
    type: Date,
    default: null,
  },

}, { timestamps: true });

const User = models.User || model("User", UserSchema);
export default User;
