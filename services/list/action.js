import db from "../../DB.js";
import { encrypt } from "../../security/passwordManagement.js";

// Pas besoin de vérifier les user input : les inserts sont des requêtes préparées et
// validées ou non par pg
const action = async (body) => {

    const timestamp = new Date().getTime().toString()

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
                        // retourne l'objet créé pour affichage
                        return { success: true }
                    } else {
                        console.log(creationPermissions)
                        return { success: false, reason: 'could not create permissions of partner' }
                    }
                } else {
                    console.log(creationPartenaire)
                    return { success: false, reason: 'could not create partner' }
                }
            } else {
                return { success: false, reason: 'could not create user' }
            }
        
        // Structure = utilisateur -> partenaire
        // On créé donc un utilisateur puis la structure puis ses permissions
        case 'add_structure':

            const userPassword_ = Math.random().toString(36).split('.')[1]
            const encryptedPassword_ = await encrypt(userPassword_)

            const structureUser = await db.insert('utilisateurs', [
                body.structure.nom_gerant, body.structure.prenom_gerant, body.structure.email_gerant, encryptedPassword_.hash, encryptedPassword_.salt,
                'structure', 0, 'inactif'
            ])

            if (structureUser.success) {
                console.log('création utilisateur:', structureUser)
                const creationStructure = await db.insert('structures', [
                    body.structure.id_partenaire, structureUser.id, body.structure.nom_gerant, 
                    body.structure.prenom_gerant, body.structure.email_partenaire, body.structure.email_gerant, 
                    body.structure.adresse, body.structure.code_postal, body.structure.ville, body.structure.description, 
                    encryptedPassword_.hash, encryptedPassword_.salt, timestamp, 'inactif'
                ], false)

                console.log('création structure:', creationStructure)
    
                if (creationStructure.success) {

                    const permissionsStructure = await db.insert('permissions', [
                        -1, creationStructure.id, body.structure.planning, body.structure.boissons, body.structure.barres,
                        body.structure.emailing
                    ], true)

                    console.log('création permissions:', permissionsStructure)

                    if (permissionsStructure.success) {
                        return { success: true }
                    } else {
                        console.log(permissionsStructure)
                        return { success: false, reason: 'could not create permissions of structure' }
                    }
                } else {
                    return { success: false, reason: 'could not create structure' }
                }
            } else {
                return { success: false, reason: 'could not create user' }
            }

        default:
            return { success: false }
    }

}

export default action