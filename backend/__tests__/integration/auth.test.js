
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    utilizador: { findUnique: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../server'); // exportar app do server.js (ver nota abaixo)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

process.env.JWT_SECRET = 'test_secret';

describe('POST /api/auth/login', () => {

  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 401 com credenciais erradas', async () => {
    prisma.utilizador.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ codigo_username: 'naoexiste', password: '123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciais inválidas.');
  });

  it('deve retornar 200 e token com credenciais válidas', async () => {
    const hashedPw = await bcrypt.hash('pass123', 10);
    prisma.utilizador.findUnique.mockResolvedValue({
      id_utilizador: 1,
      codigo_username: 'coord1',
      password: hashedPw,
      id_tipo: 1,
      nome: 'Ana',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ codigo_username: 'coord1', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.nome).toBe('Ana');
  });
});