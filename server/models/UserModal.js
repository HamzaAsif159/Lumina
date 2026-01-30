import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  image: { type: String },
  refreshToken: [
    {
      token: { type: String },
      createdAt: { type: String },
    },
  ],
  mfa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String },
    primaryMethod: {
      type: String,
      enum: ["none", "totp", "email", "sms"],
      default: "none",
    },
    backupCodes: [String],
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await genSalt();
  this.password = await hash(this.password, salt);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
