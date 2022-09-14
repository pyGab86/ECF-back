import { genToken } from "../security/tokenGeneration.js";

const controller = {
    
    post: (req, res) => {
        console.log('refresh controller')
        try {
            res.send({
                success: true,
                token: genToken({
                    email: req.body.uid, password: req.body.password, type: req.body.type
                })
            });
        } catch (error) {
            console.log(error)
            res.send({success: false, reason: error})
        }
    }
}

export default controller;