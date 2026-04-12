// src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const autenticar = (req, res, next) => {
  // Nota: já não é async — não vai à BD!
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Apenas verifica o token — o role já está lá dentro
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos só o que está no token
    req.user = {
      id_utilizador: payload.id_utilizador,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};


module.exports = { autenticar };
