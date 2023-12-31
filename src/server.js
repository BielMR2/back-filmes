require("express-async-errors")
const database = require("./database/create_db")
const AppError = require("./utils/AppError")
const uploadConfig = require('./Config/uploads')

const express = require("express")

const routes = require("./routes")

const app = express()
var cors = require('cors')

app.use(cors())
app.use(express.json())

app.use("/files", express.static(uploadConfig.UPLOAD_FOLDER))

app.use(routes)

database()

app.use((error, request, response, next) => {
    if(error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    console.error(error)

    return response.status(500).json({
        status: "error",
        message: "Internal server error"
    })
    
})


const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))