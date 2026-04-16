
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    disponibilidade: { findFirst: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { checkScheduleConflict } = require('../../../src/services/agendaService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('checkScheduleConflict', () => {

  beforeEach(() => jest.clearAllMocks());

  it('deve retornar false quando não há conflito', async () => {
    prisma.disponibilidade.findFirst.mockResolvedValue(null);

    const result = await checkScheduleConflict(1, '2025-06-10', '10:00', '11:00');
    expect(result).toBe(false);
  });

  it('deve retornar true quando existe conflito', async () => {
    prisma.disponibilidade.findFirst.mockResolvedValue({ id_disponibilidade: 5 });

    const result = await checkScheduleConflict(1, '2025-06-10', '10:00', '11:00');
    expect(result).toBe(true);
  });
});