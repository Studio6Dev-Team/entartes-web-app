// src/middlewares/roleCheck.js
const checkCoordenadora = (req, res, next) => {
  // Já não vai à BD — usa só o que está em req.user
  if (req.user.role !== "Coordenadora") {
    return res.status(403).json({
      error: "Acesso negado. Apenas Coordenadoras podem realizar esta ação.",
    });
  }

  next();
};



module.exports = { checkCoordenadora };