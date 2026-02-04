import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../validators/auth.validation.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.parse(req.body);

    const exists = await User.findOne({ email: parsed.email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const user = await User.create({
      name: parsed.name.trim(),
      email: parsed.email.toLowerCase().trim(),
      passwordHash,
    });

    const token = signToken(user._id);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await User.findOne({ email: parsed.email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
