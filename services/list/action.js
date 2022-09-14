import db from "../../DB.js";
import { encrypt } from "../../security/passwordManagement.js";

const action = async (body) => {

    console.log(body.action)

    switch (body.action) {

        // Partenaire = utilisateur
        // on créé donc un utilisateur, puis un partenaire, puis ses permissions
        case 'add_partenaire':

            const userPassword = Math.random().toString(36).split('.')[1]
            const encryptedPassword = await encrypt(userPassword)

            const creationUtilisateur = await db.insert('utilisateurs', [
                body.utilisateur.nom, body.utilisateur.prenom, body.utilisateur.email, encryptedPassword.hash, encryptedPassword.salt,
                'partenaire', 0, 'inactif'
            ])

            if (creationUtilisateur.success) {
                const timestamp = new Date().getTime().toString()
                const creationPartenaire = await db.insert('partenaires', [
                    creationUtilisateur.id, body.utilisateur.nom, body.utilisateur.prenom, body.utilisateur.email,
                    body.utilisateur.adresse, body.utilisateur.code_postal, body.utilisateur.ville, body.utilisateur.description,
                    'à confirmer', encryptedPassword.hash, encryptedPassword.salt, timestamp, 'inactif'
                ])

                if (creationPartenaire.success) {

                    const creationPermissions = await db.insert('permissions', [
                        creationPartenaire.id, -1, body.utilisateur.planning, body.utilisateur.boissons, body.utilisateur.barres,
                        body.utilisateur.emailing
                    ])

                    if (creationPermissions.success) {
                        return { success: true }
                    } else {
                        return { success: false, reason: 'could not create permissions of partner' }
                    }
                } else {
                    console.log(creationPartenaire)
                    return { success: false, reason: 'could not create partner' }
                }
            } else {
                return { success: false, reason: 'could not create user' }
            }
        default:
            return { success: false }
    }

}

export default action