const authService = require("../services/authService");

const login = async (req, res) => {
  // req.body é o que o utilizador enviou no corpo do pedido
  const { codigo_username, pass } = req.body;

  // Verificar se os campos foram enviados
  if (!codigo_username || !pass) {
    return res.status(400).json({ 
      error: "Username e password são obrigatórios." 
    });
  }

  try {
    const resultado = await authService.login(codigo_username, pass);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

module.exports = { login };