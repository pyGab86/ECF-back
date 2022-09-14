import login from "./list/login.js"
import data from "./list/data.js"

const servicesManager = {

    login: async (body) => { return await login(body) },
    data: async (body) => { return await data(body) }

}

export default servicesManager