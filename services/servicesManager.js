import login from "./list/login.js"
import data from "./list/data.js"
import action from "./list/action.js"

const servicesManager = {

    login: async (body) => { return await login(body) },
    data: async (body) => { return await data(body) },
    action: async (body) => { return await action(body) }

}

export default servicesManager