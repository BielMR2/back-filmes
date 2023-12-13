const { hash, compare } = require("bcryptjs")
const knex = require("../database")
const AppError = require("../utils/AppError")

class UsersController{
    async create(request, response){
        const { name, email, password } = request.body

        const checkUserExists = await knex("users").where({ email })
        if(checkUserExists.length > 0){
            throw new AppError("Este e-mail já está em uso.")
        }

        const encryptedPassword = await hash(password, 8)

        await knex("users").insert({
            name,
            email, 
            password:encryptedPassword,
            avatar: null
        })

        return response.json()
    }
    async update(request, response){
        const { name, email, password, oldpassword } = request.body
        const id = request.user.id

        const [user] = await knex("users").where({ id })

        if(!user){
            throw new AppError("Usuário não encontrado.")
        }

        const [userWithUpdatedEmail] = await knex("users").where({ email })

        if(userWithUpdatedEmail && userWithUpdatedEmail.id != id){
            throw new AppError("Este e-mail já está em uso.")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if(password && !oldpassword){
            throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
        }

        if(password && oldpassword){
            const checkOldPassword = await compare(oldpassword, user.password)

            if(!checkOldPassword){
                throw new AppError("A senha antiga não confere")
            }

            user.password = await hash(password, 8)
        }

        await knex("users")
        .where({ id })
        .update({
            name: user.name,
            email: user.email,
            password: user.password,
            updated_at: knex.fn.now()
        })

        return response.status(200).json()
    }
    async delete(request, response){
        const id = request.user.id

        const [user] = await knex("users").where({ id })

        await knex("users")
        .where({ id:user.id })
        .del()

        response.json()
    }
}

module.exports = UsersController