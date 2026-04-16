
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    utilizador: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { login } = require('../../../src/services/authService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Necessário para jwt.sign funcionar nos testes
process.env.JWT_SECRET = 'test_secret';

describe('authService.login', () => {

  beforeEach(() => jest.clearAllMocks());

  it('deve lançar erro se o utilizador não existir', async () => {
    prisma.utilizador.findUnique.mockResolvedValue(null);

    await expect(login('user_inexistente', 'qualquer'))
      .rejects
      .toThrow('Credenciais inválidas.');
  });

  it('deve lançar erro se a password estiver errada', async () => {
    prisma.utilizador.findUnique.mockResolvedValue({
      id_utilizador: 1,
      codigo_username: 'jsilva',
      password: await bcrypt.hash('password_correta', 10),
      id_tipo: 3,
      nome: 'João',
    });

    await expect(login('jsilva', 'password_errada'))
      .rejects
      .toThrow('Credenciais inválidas.');
  });

  it('deve retornar token e user em caso de sucesso', async () => {
    const hashedPw = await bcrypt.hash('password123', 10);
    prisma.utilizador.findUnique.mockResolvedValue({
      id_utilizador: 1,
      codigo_username: 'jsilva',
      password: hashedPw,
      id_tipo: 3,
      nome: 'João',
    });

    const result = await login('jsilva', 'password123');

    expect(result).toHaveProperty('token');
    expect(result.user.nome).toBe('João');
    expect(result.user.role).toBe(3);
  });
});