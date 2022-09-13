import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

// Routes
import login from './routes/login.js'

dotenv.config()

const port = process.env.PORT || 8080

const app = express()

// Configuration de sécurité


// Dire au serveur d'utiliser du Json
app.use(express.json())

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(bodyParser.json())

// Autoriser les CORS requests
app.use(cors())

app.use('/', login)

app.listen(port, () => {
    console.log(`Application tourne sur port ${ port }`);
});
