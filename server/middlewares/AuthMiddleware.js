import jwt from "jsonwebtoken";
import redis from "../config/redis.js";
import { RedisKeys } from "../utils/redisKeys.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.query.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.jti) {
      const isBlacklisted = await redis.get(
        RedisKeys.tokenBlacklist(decoded.jti),
      );
      if (isBlacklisted) {
        return res.status(401).json({ message: "Unauthorized: Token revoked" });
      }
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token invalid or expired" });
  }
};
