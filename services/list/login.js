import { genToken, genRefreshToken } from "../../security/tokenGeneration.js"
import { checkPassword } from "../../security/passwordManagement.js"
import db from "../../DB.js"

// Logique du login :
// - Un admin peut se connecter si ses identifiants sont bons.
// - un partenaire/structure peut se connecter si ses ids sont bons et que son statut est actif
// - Si un partenaire/structure se login, on le spécifie au front pour qu'il n'affiche pas les écrans
// et options d'admins. On spécifie aussi si l'utilisateur a besoin de reset son mdp pour que le front affiche
// la modale de changement de mdp

const login = async (body) => {

    const password = body.password
    const email = body.email

    console.log(body)

    return db.read('utilisateurs', undefined, { where: 'WHERE email = $1', values: [email] }, false)
    .then(async (res) => {
        if (res.success) {
            const user = res.res.rows[0]
            const correctIds = await checkPassword(password, user.hash, user.salt)

            console.log(correctIds)

            if (correctIds) {

                // Générer une token et refresh token
                const token = genToken({ email, password, type: user.type })
                const refresh = genRefreshToken({ email, password, type: user.type })

                console.log(token)

                if (user.type === 'admin') {
                    return {
                        success: true,
                        needsNewPassword: false,
                        type: 'admin',
                        token,
                        refresh
                    }
                } else {
                    if (user.statut === "actif") {

                        if (user.type === 'partenaire') {
                            let id = await db.read('partenaires', ['id'], { where: `WHERE email = $1`, values: [user.email] })
                            id = parseInt(id.res.rows[0].id)
                            return {
                                success: true,
                                needsNewPassword: user.mdp_mis_a_jour === 0 ? true : false,
                                type: user.type,
                                token,
                                refresh,
                                id
                            }
                        } else {
                            let id = await db.read('structures', ['id'], { where: `WHERE email_gerant = $1`, values: [user.email] })
                            id = parseInt(id.res.rows[0].id)
                            return {
                                success: true,
                                needsNewPassword: user.mdp_mis_a_jour === 0 ? true : false,
                                type: user.type,
                                token,
                                refresh,
                                id
                            }
                        }
                        
                    } else {
                        return {
                            success: false
                        }
                    }
                }

            } else {
                return {
                    success: false
                }
            }

        } else {
            return {
                success: false
            }
        }
    })
    .catch(err => console.log(err))


}

export default login