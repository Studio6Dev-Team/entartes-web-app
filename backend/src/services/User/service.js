//biblioteca para encriptar password
const bcrypt = require('bcryp');
const userModel = require('backend/src/models/userModel.js');

async function createAccount(username, password, idType){
    const exist = await userModel.findByUsername(username);
    if(exist){
        throw new Error('THIS_USER_ALREADY_EXISTS');
    }

    const hash = await bcrypt.hash(password, 10);
    return userModel.create(username, hash, idType);
}

async function findById(id){
    const user = await userModel.findById(id);
    if(!user){
        throw new Error('USER_NOT_FOUND');
    }
    return user;
}

async function suspenderConta(id) {
    return utilizadorModel.updateEstado(id, false);
}

async function reactivarConta(id) {
    return utilizadorModel.updateEstado(id, true);
}

module.exports = { criarConta, buscarPorId, suspenderConta, reactivarConta };