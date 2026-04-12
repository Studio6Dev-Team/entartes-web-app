// src/services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db");

const login = async (codigo_username, pass) => {
  // 1. Procurar o utilizador pelo username
  // incluimos tudo o que precisamos para o token e a resposta
  const utilizador = await db.utilizador.findUnique({
    where: { codigo_username },
    include: {
      tipo_utilizador: true, // para saber o role
      aluno: true,           // para saber se tem coaching (se for aluno)
      coordenadora: true,    // para confirmar se é coordenadora
      docente: true,         // para confirmar se é docente
    },
  });

  // 2. Verificar se o utilizador existe
  // Mesma mensagem para username e password errados — por segurança
  // nunca dizemos qual dos dois está errado
  if (!utilizador) {
    throw new Error("Credenciais inválidas.");
  }

  // 3. Verificar a password
  const passwordCorreta = await bcrypt.compare(pass, utilizador.pass);
  if (!passwordCorreta) {
    throw new Error("Credenciais inválidas.");
  }

  // 4. Construir informação extra consoante o role
  // cada role tem informação relevante diferente
  const role = utilizador.tipo_utilizador?.nome;
  let infoExtra = {};

  if (role === "Aluno" && utilizador.aluno) {
    infoExtra = {
      coaching: utilizador.aluno.coaching, // tem acesso a coaching?
    };
  }

  // 5. Criar o token JWT
  // guardamos o mínimo necessário no token — o resto buscamos à BD quando precisamos
  const token = jwt.sign(
    {
      id_utilizador: utilizador.id_utilizador,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  // 6. Devolver o token e informação básica do utilizador
  return {
    token,
    utilizador: {
      id: utilizador.id_utilizador,
      nome: utilizador.nome,
      apelido: utilizador.apelido,
      email: utilizador.email,
      role,
      ...infoExtra, // adiciona coaching se for aluno
    },
  };
};

module.exports = { login };