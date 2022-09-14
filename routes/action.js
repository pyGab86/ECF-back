import express from 'express'
import globalMiddleware from '../security/globalMiddleware.js'
import action from '../controllers/action.js'

const router = express.Router()

router.post('/api/action', globalMiddleware, (req, res) => {
    action.post(req, res)
})

export default router