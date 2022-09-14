import db from "../../DB.js";

const data = async (body) => {

    switch (body.requested) {

        case 'partenaires':
            return db.read('partenaires', undefined, undefined)
                .then(res => { return { success: true, data: res.res.rows } })
                .catch(err => { return { success: false, error: err } })

        case 'structures':
            return db.read('structures', undefined, undefined)
                .then(res => { return { success: true, data: res.res.rows } })
                .catch(err => { return { success: false, error: err } })
        
        default:
            return { success: false, reason: 'unknown data request' }
    }

}

export default data