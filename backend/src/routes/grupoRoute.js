const express = require("express");
const router = express.Router();
const grupoController = require("../controllers/grupoController");
const { autenticar } = require("../middlewares/auth");
const { checkCoordenadora } = require("../middlewares/roleCheck");

router.post("/eventos/:id_evento/grupos", autenticar, checkCoordenadora, grupoController.criarGrupo);
router.get("/eventos/:id_evento/grupos", autenticar, grupoController.listarGruposDoEvento);

router.post("/grupos/:id_grupo/alunos/:id_aluno", autenticar, checkCoordenadora, grupoController.adicionarAlunoAoGrupo);
router.post("/grupos/:id_grupo/docentes/:id_docente", autenticar, checkCoordenadora, grupoController.adicionarDocenteAoGrupo);

router.delete("/grupos/:id_grupo/alunos/:id_aluno", autenticar, checkCoordenadora, grupoController.removerAlunoDoGrupo);
router.delete("/grupos/:id_grupo/docentes/:id_docente", autenticar, checkCoordenadora, grupoController.removerDocenteDoGrupo);
router.put("/grupos/:id_grupo", autenticar, checkCoordenadora, grupoController.editarGrupo);
router.delete("/grupos/:id_grupo", autenticar, checkCoordenadora, grupoController.eliminarGrupo);

module.exports = router;