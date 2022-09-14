import SETTINGS from "../SETTINGS.js"
import { authenticateToken } from "./authenticateToken.js"

// Au login, on génère la token avec l'email, le mdp et le type d'utilisateur (admin, partenaire ou structure)
// Ainsi, en authentifiant la token, on peut vérifier de quel type d'utilisateur il s'agit
// et vérifier que l'utilisateur a bien le droit d'utiliser une route, sans faire d'appel à la bdd.
// Chaque requête est accompagnée (dans le body) d'un type d'action à effectuer via cette route.
// Si l'action n'existe pas dans les permissions de l'utilisateur, on retourne une erreur
const globalMiddleware = async (req, res, next) => {

    const isTokenValid = authenticateToken(req)

    if (isTokenValid) {
        if (req.user.type != 'admin') {
            const routePermissions = SETTINGS.permissionsRoutes[req.route.path][req.user.type]

            if (typeof routePermissions === "undefined") {
                res.send({ success: false, reason: 'missing permissions' })
            } else {
                if (routePermissions.includes(req.body.requested)) {
                    console.log(routePermissions, 'next()')
                    next()
                } else {
                    res.send({ success: false, reason: 'missing permissions' })
                }
            }

        } else {
            next()
        }
    } else {
        res.send({ success: false, reason: 'invalid token' })
    }

}

export default globalMiddleware