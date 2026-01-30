import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.query.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, payload) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token invalid or expired" });
    }

    req.userId = payload.userId;
    next();
  });
};
