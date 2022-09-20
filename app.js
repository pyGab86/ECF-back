import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

// Modules de sécurité
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

// Routes
import login from './routes/login.js'
import refreshToken from './routes/refreshToken.js'
import data from './routes/data.js'
import action from './routes/action.js'

dotenv.config()

const port = process.env.PORT || 8080

const app = express()

// Configuration de sécurité
app.use(helmet())

app.use(cors({
    origin: 'https://ecf-front.herokuapp.com',
    optionsSuccessStatus: 200
}))

const limiter = rateLimit({
    windowMs: 60000,
    max: 30
})

app.use(limiter)

// Dire au serveur d'utiliser du Json
app.use(express.json())

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(bodyParser.json())

app.use('/', login)
app.use('/', refreshToken)
app.use('/', data)
app.use('/', action)

app.listen(port, () => {
    console.log(`L'application tourne sur le port ${ port }`);
});
