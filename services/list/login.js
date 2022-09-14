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

    return db.read('utilisateurs', undefined, { where: { string: 'WHERE email = $1', values: [email] } }, false)
    .then(async (res) => {
        if (res.success) {
            const user = res.res.rows[0]
            const correctIds = await checkPassword(password, user.hash, user.salt)
            
            if (correctIds) {

                // Générer une token et refresh token
                const token = genToken({ email, password, type: user.type })
                const refresh = genRefreshToken({ email, password, type: user.type })

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
                        return {
                            success: true,
                            needsNewPassword: user.mdp_mis_a_jour,
                            type: user.type,
                            token,
                            refresh
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