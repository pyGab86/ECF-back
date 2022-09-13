import login from '../services/login.js';

const controller = {

    post: async (req, res) => {

        try {
            const response = await login(req.body);
            res.send(response)
        } catch (error) {
            res.status(401)
            res.send('Unauthorized request')
            console.log(error)
        }
    }
}

export default controller;