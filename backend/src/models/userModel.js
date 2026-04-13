const prisma = require("backend/src/config/db.js");

async function findByUsername(username){
    return prisma.user.findUnique({
        where: { Username_Code: username }
    });
}

async function findById(id){
    return prisma.user.findUnique({
        where: { User_Id: id},
        select: {User_Id: true, Username_Code: true, ID_Type: true}
    });
}

async function create(username, passwordHash, idType){
    return prisma.user.create({
        data: {
            Username_Code: username,
            password_hash: passwordHash,
            Id_Type: idType
        }
    });
}

async function stateUpdate(id, active){
    return prisma.user.update({
        where: { User_Id: id },
        data: { active: active}
    });
}

module.exports = {findByUsername, findById, create, stateUpdate};