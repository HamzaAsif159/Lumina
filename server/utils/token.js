import jwt from "jsonwebtoken";

export const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  user.refreshToken.push({ token: refreshToken, createdAt: new Date() });
  await user.save();

  return { accessToken, refreshToken };
};
