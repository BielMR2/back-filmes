const knex = require("../database")
const AppError = require("../utils/AppError")

class NotesController {
    async create(request, response){
        const { title, description, rating, tags } = request.body
        const user_id = request.user.id

        const [user] = await knex("users").where({ id:user_id })

        if(!user){
            throw new AppError("Usuário não encontrado.")
        }

        if(!title){
            throw new AppError("Insira um título")
        }

        if(rating < 0 || rating > 5 || rating % 1 !== 0){
            throw new AppError("A nota precisa ser entre 0 á 5, e ser um número inteiro")
        }


        const [ note_id ] = await knex("notes").insert({
            title, 
            description,
            rating,
            user_id
        })

        if(tags.length > 0){
            const tagsInsert = tags.map(name => {
                return {
                    note_id,
                    name,
                    user_id
                }
            });
    
            await knex("tags").insert(tagsInsert)
        }
        
        return response.json()
    }
    async show(request, response){
        const { id } = request.params

        const note = await knex("notes").where({ id }).first()
        const tags = await knex("tags").where({ note_id:id }).orderBy("name")

        return response.json({
            ...note,
            tags
        })
    }
    async index(request, response){
        const { title, tags } = request.query
        const user_id = request.user.id

        let notes

        if (tags){
            const filterTags = tags.split(",").map(tag => tag.trim())

            notes = await knex("tags")
                .select([
                    "notes.id",
                    "notes.title",
                    "notes.user_id",
                ])             
                .where("notes.user_id", user_id)
                .whereLike("notes.title", `%${title}%`)
                .whereIn("name", filterTags) 
                .innerJoin("notes", "notes.id", "tags.note_id")
                .groupBy("notes.id")
                .orderBy("notes.title")

        } else{
            notes = await knex("notes")
            .where({ user_id })
            .whereLike("title", `%${title}%`)
            .orderBy("notes.id", "desc")
        }

        const userTags = await knex("tags").where({ user_id });
        const notesWithTags = notes.map(note => {
            const noteTags = userTags.filter(tag => tag.note_id === note.id)

            return {
                ...note,
                tags: noteTags
            }
        })
        

        return response.json(notesWithTags)
    }
    async delete(request, response){
        const { id } = request.params

        await knex("notes")
        .where({ id })
        .del()

        response.json()
    }
}

module.exports = NotesController