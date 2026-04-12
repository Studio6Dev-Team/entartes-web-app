const express = require("express");
const router = express.Router();
const { autenticar } = require("../middlewares/auth");
const { checkCoordenadora } = require("../middlewares/roleCheck");
const {
  criarEvento,
  listarEventos,
  buscarEventoPorId,
  adicionarParticipante,
  listarParticipantes,
} = require("../controllers/eventoController");

// Qualquer autenticado pode ver eventos
router.get("/", autenticar, listarEventos);
router.get("/:id", autenticar, buscarEventoPorId);

// Só coordenadora pode criar e gerir
//router.post("/", autenticar, checkCoordenadora, criarEvento);
router.post("/", checkCoordenadora, criarEvento);
router.post("/:id/participantes", autenticar, checkCoordenadora, adicionarParticipante);
router.get("/:id/participantes", autenticar, listarParticipantes);

module.exports = router;
