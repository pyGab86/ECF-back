import servicesManager from "../services/servicesManager.js"

const controller = {
    
    post: async (req, res) => {

        try {
            const response = await servicesManager.action(req.body)
            res.send(response)
        } catch (err) {
            res.send({ success: false, reason: err })
        }
    }
}

export default controller