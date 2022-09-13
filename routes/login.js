import express from 'express'
import login from '../controllers/login.js'

const router = express.Router()

router.post('/api/auth/login', (req, res) => {
    login.post(req, res)
})

export default router