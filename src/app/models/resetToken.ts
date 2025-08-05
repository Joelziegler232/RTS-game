// src/app/models/resetToken.ts
import { Schema, model, models } from "mongoose";

const ResetTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // El token expira en 1 hora
  },
});

const ResetToken = models.ResetToken || model("ResetToken", ResetTokenSchema);
export default ResetToken;