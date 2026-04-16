

const jwt = require('jsonwebtoken');
const tokenValidation = require('../../../src/middlewares/authMiddleware');

process.env.JWT_SECRET = 'test_secret';

// Helpers para simular req/res/next do Express
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('tokenValidation middleware', () => {

  it('deve retornar 401 se não houver token', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    tokenValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 403 com token inválido', () => {
    const req = { headers: { authorization: 'Bearer token_invalido' } };
    const res = mockRes();
    const next = jest.fn();

    tokenValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e popular req.user com token válido', () => {
    const payload = { id: 1, role: 3 };
    const token = jwt.sign(payload, 'test_secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    tokenValidation(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(1);
    expect(req.user.role).toBe(3);
  });
});