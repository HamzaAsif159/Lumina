import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateTokens = async (user) => {
  const tokenId = crypto.randomUUID();

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      jti: tokenId,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      jti: tokenId,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  user.refreshToken.push({ token: refreshToken, createdAt: new Date() });
  await user.save();

  return { accessToken, refreshToken };
};
