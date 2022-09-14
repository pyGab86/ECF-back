import express from 'express'
import globalMiddleware from '../security/globalMiddleware.js'
import data from '../controllers/data.js'

const router = express.Router()

// Route de récupération de données
router.post('/api/data', globalMiddleware, (req, res) => {
    data.post(req, res)
})

export default router