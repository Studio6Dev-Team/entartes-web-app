const { db } = require("../config/db");

const criarEvento = async (dados, id_coordenadora) => {
  const { nome, descricao, data_de_realizacao } = dados;

  // Validação dos campos obrigatórios
  if (!nome || nome.trim() === "") {
    throw new Error("O nome do evento é obrigatório.");
  }

  // Verificamos que a coordenadora existe na tabela coordenadora
  const coordenadora = await db.coordenadora.findUnique({
    where: { id_utilizador: id_coordenadora },
  });

  if (!coordenadora) {
    throw new Error("Coordenadora não encontrada.");
  }

  // Transação: cria o evento e a ligação coordenadora_evento juntos
  // Se um falhar, o outro também reverte — ficamos sempre num estado consistente
  const resultado = await db.$transaction(async (tx) => {
    // Passo 1: criar o evento
    const evento = await tx.evento.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ?? null,
        data_de_realizacao: data_de_realizacao
          ? new Date(data_de_realizacao)
          : null,
      },
    });

    // Passo 2: ligar a coordenadora ao evento na tabela intermédia
    await tx.coordenadora_evento.create({
      data: {
        id_utilizador: id_coordenadora,
        id_evento: evento.id_evento,
      },
    });

    return evento;
  });

  return resultado;
};


const listarEventos = async () => {
  return await db.evento.findMany({
    include: {
      coordenadora_evento: {
        include: {
          coordenadora: {
            include: {
             
              utilizador: {
                select: {
                  nome: true,
                  apelido: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { data_de_realizacao: "asc" },
  });
};

const buscarEventoPorId = async (id_evento) => {
  const evento = await db.evento.findUnique({
    where: { id_evento: parseInt(id_evento) },
    include: {
      coordenadora_evento: {
        include: {
          coordenadora: {
            include: {
              utilizador: {
                select: { nome: true, apelido: true },
              },
            },
          },
        },
      },
      grupo:  {
    include: {
    aluno_grupo: { include: { aluno: { include: { utilizador: { select: { nome: true, apelido: true } } } } } },
    docente_grupo: { include: { docente: { include: { utilizador: { select: { nome: true, apelido: true } } } } } },
  },
  orderBy: { hora_atuacao: "asc" },
},
    evento_aluno: {
  include: {
    aluno: {
      include: {
        utilizador: { select: { nome: true, apelido: true } },
      },
    },
  },
},
    },
  });

  if (!evento) {
    throw new Error("Evento não encontrado.");
  }

  return evento;
};

const adicionarParticipante = async (id_evento, id_utilizador, tipo) => {
  // 1. Verificar se o evento existe
  const evento = await db.evento.findUnique({
    where: { id_evento: parseInt(id_evento) },
  });

  if (!evento) {
    throw new Error("Evento não encontrado.");
  }

  // 2. Consoante o tipo, verificar se existe e adicionar à tabela correta
  if (tipo === "aluno") {
    // Verificar se o utilizador é de facto um aluno
    const aluno = await db.aluno.findUnique({
      where: { id_utilizador: parseInt(id_utilizador) },
    });

    if (!aluno) {
      throw new Error("Aluno não encontrado.");
    }

    // Verificar se já está no evento para não duplicar
    const jaExiste = await db.evento_aluno.findUnique({
      where: {
        id_evento_id_utilizador: {
          id_evento: parseInt(id_evento),
          id_utilizador: parseInt(id_utilizador),
        },
      },
    });

    if (jaExiste) {
      throw new Error("Este aluno já está no evento.");
    }

    // Adicionar à tabela evento_aluno
    await db.evento_aluno.create({
      data: {
        id_evento: parseInt(id_evento),
        id_utilizador: parseInt(id_utilizador),
      },
    });

  } else if (tipo === "docente") {
    // Verificar se o utilizador é de facto um docente
    const docente = await db.docente.findUnique({
      where: { id_utilizador: parseInt(id_utilizador) },
    });

    if (!docente) {
      throw new Error("Docente não encontrado.");
    }

    // Verificar se já está no evento para não duplicar
    const jaExiste = await db.evento_docente.findUnique({
      where: {
        id_evento_id_docente: {
          id_evento: parseInt(id_evento),
          id_docente: parseInt(id_utilizador),
        },
      },
    });

    if (jaExiste) {
      throw new Error("Este docente já está no evento.");
    }

    // Adicionar à tabela evento_docente
    await db.evento_docente.create({
      data: {
        id_evento: parseInt(id_evento),
        id_docente: parseInt(id_utilizador),
      },
    });

  } else {
    throw new Error("Tipo inválido. Use 'aluno' ou 'docente'.");
  }

  return { mensagem: "Participante adicionado com sucesso." };
};

const listarParticipantes = async (id_evento) => {
  // Verificar se o evento existe
  const evento = await db.evento.findUnique({
    where: { id_evento: parseInt(id_evento) },
  });

  if (!evento) {
    throw new Error("Evento não encontrado.");
  }

  // Buscar alunos do evento
  const alunosEvento = await db.evento_aluno.findMany({
    where: { id_evento: parseInt(id_evento) },
    include: {
      aluno: {
        include: {
          utilizador: {
            select: { nome: true, apelido: true, email: true },
          },
        },
      },
    },
  });

  // Buscar docentes do evento
  const docentesEvento = await db.evento_docente.findMany({
    where: { id_evento: parseInt(id_evento) },
    include: {
      docente: {
        include: {
          utilizador: {
            select: { nome: true, apelido: true, email: true },
          },
        },
      },
    },
  });

  // Juntar tudo numa lista com o tipo identificado
  
  const alunos = alunosEvento.map((ea) => ({
    id_utilizador: ea.aluno.id_utilizador,
    nome: ea.aluno.utilizador.nome,
    apelido: ea.aluno.utilizador.apelido,
    email: ea.aluno.utilizador.email,
    tipo: "Aluno",
    coaching: ea.aluno.coaching, 
  }));

  const docentes = docentesEvento.map((ed) => ({
    id_utilizador: ed.docente.id_utilizador,
    nome: ed.docente.utilizador.nome,
    apelido: ed.docente.utilizador.apelido,
    email: ed.docente.utilizador.email,
    tipo: "Docente",
  }));

  // Devolvemos os dois grupos separados mas na mesma resposta
  return {
    total: alunos.length + docentes.length,
    alunos,
    docentes,
  };
};

module.exports = {
  criarEvento,
  listarEventos,
  buscarEventoPorId,
  adicionarParticipante,
  listarParticipantes,
};
