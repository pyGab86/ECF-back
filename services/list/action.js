import db from "../../DB.js";
import { encrypt } from "../../security/passwordManagement.js";
import sendEmail from "../email.js";

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
                        // Envoyer un email automatique
                        sendEmail(body.utilisateur.email, 'creation', '', {
                            toCreate: 'partenaire',
                            nom: body.utilisateur.nom,
                            prenom: body.utilisateur.prenom,
                            email: body.utilisateur.email,
                            password: userPassword
                        })
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

                const creationStructure = await db.insert('structures', [
                    body.structure.id_partenaire, structureUser.id, body.structure.nom_gerant, 
                    body.structure.prenom_gerant, body.structure.email_partenaire, body.structure.email_gerant, 
                    body.structure.adresse, body.structure.code_postal, body.structure.ville, body.structure.description, 
                    encryptedPassword_.hash, encryptedPassword_.salt, timestamp, 'inactif'
                ], false)
    
                if (creationStructure.success) {

                    const permissionsStructure = await db.insert('permissions', [
                        -1, creationStructure.id, body.structure.planning, body.structure.boissons, body.structure.barres,
                        body.structure.emailing
                    ], false)

                    if (permissionsStructure.success) {
                        // Envoyer un email automatique
                        sendEmail(body.utilisateur.email_gerant, 'creation', '', {
                            toCreate: 'structure',
                            nom: body.utilisateur.nom_gerant,
                            prenom: body.utilisateur.prenom_gerant,
                            email: body.utilisateur.email_gerant,
                            password: userPassword_
                        })
                        return { success: true }
                    } else {
                        return { success: false, reason: 'could not create permissions of structure' }
                    }
                } else {
                    return { success: false, reason: 'could not create structure' }
                }
            } else {
                return { success: false, reason: 'could not create user' }
            }

        // Modifier une permission (partenaire ou structure)
        // On note qu'une permission partenaire est une permission globale.
        // Donc si on modifie une permission partenaire, toutes les structures de ce partenaire
        // Doivent avoir la permission réglée sur la même valeur globale
        case 'change_permission':
            
            if (body.options.of === 'partenaire' || body.options.of === 'structure') {
                if (body.options.permission === 'gestion_planning_team' ||
                    body.options.permission === 'vente_boissons' ||
                    body.options.permission === 'vente_barres' ||
                    body.options.permission === 'emailing'
                ) {
                    if (typeof body.options.current === 'boolean' && typeof body.options.id === 'number') {
                        if (body.options.of === 'structure') {

                            const editPermission = await db.edit('permissions', 
                                [body.options.permission], [body.options.current],
                                `WHERE id_structure = ${body.options.id}`
                            )

                            if (editPermission.success) {
                                setTimeout(() => {
                                    sendEmail(body.options.email, 'permission', '', {
                                        permissionType: 'de structure',
                                        permission: body.options.permission,
                                        permissionStatus: body.options.current,
                                        nom: body.options.nom,
                                        prenom: body.options.prenom,
                                        email: body.options.email
                                    })
                                }, 200)
                            }

                            return { success: editPermission.success }

                        } else {
                            // 1. Changer la permission globale
                            // 2. Récupérer les ids de toutes les structures du partenaire
                            // 3. Pour chacune de ces structures, changer la permission.
                            const globalRes = await db.edit('permissions',
                                [body.options.permission], [body.options.current],
                                `WHERE id_partenaire = ${body.options.id}`, true
                            )

                            if (globalRes.success) {

                                setTimeout(() => {
                                    sendEmail(body.options.email, 'permission', '', {
                                        permissionType: 'globales de partenaire',
                                        permission: body.options.permission,
                                        permissionStatus: body.options.current,
                                        nom: body.options.nom,
                                        prenom: body.options.prenom,
                                        email: body.options.email
                                    })
                                }, 200)

                                const partenaireStructures = await db.read('structures', undefined,
                                    { where: `WHERE id_partenaire = ${body.options.id}`}
                                )

                                if (partenaireStructures.success) {
                                    let successCount = 0
                                    let failCount = 0
                                    for (let i = 0; i < partenaireStructures.res.rows.length; i++) {
                                        const structure = partenaireStructures.res.rows[i]
                                        const structureId = structure.id
                                        const structurePermissionEdit = await db.edit(
                                            'permissions', [body.options.permission], [body.options.current],
                                            `WHERE id_structure = ${structureId}`
                                        )

                                        // Notifier toutes les structures du changement de permisison 
                                        // induit par une modification de permission globale (permission partenaire)
                                        setTimeout(() => {
                                            sendEmail(structure.email_gerant, 'permission', '', {
                                                permissionType: 'de structure suite à une modification de permission globale du partenaire',
                                                permission: body.options.permission,
                                                permissionStatus: body.options.current,
                                                nom: structure.nom_gerant,
                                                prenom: structure.prenom_gerant,
                                                email: structure.email_gerant
                                            })
                                        }, 200)

                                        if (structurePermissionEdit.success) {
                                            successCount++
                                        } else {
                                            failCount++
                                        }
                                    }

                                    if (failCount === 0) {
                                        return { success: true }
                                    } else {
                                        if (successCount === 0) {
                                            return { success: false, reason: 'could not update strutures permissions from global' }
                                        } else {
                                            return { success: true }
                                        }
                                    }
                                    
                                } else {
                                    return { success: false, reason: 'could not get structures of partner' }
                                }

                            } else {
                                return { success: false, reason: 'could not change global permission' }
                            }
                        }

                    } else {
                        return { success: false, reason: 'wrong options passed' }
                    }
                } else {
                    return { success: false, reason: 'wrong options passed' }
                }
            } else {
                return { success: false, reason: 'wrong options passed' }
            }

        // Modifier statut partenaire ou structure
        case 'change_statut':
            if (body.options.of === 'partenaire' || body.options.of === 'structure') {

                if (typeof body.options.id === 'number'){

                    let newStatus = 'actif'
                    if (body.options.current === 'actif') {
                        newStatus = 'inactif'
                    }
                    
                    const editRes = await db.edit(
                        `${body.options.of}s`,
                        ['statut'], [newStatus],
                        `WHERE id = ${body.options.id}`, true
                    )

                    if (editRes.success) {

                        // Changer le statut de l'utilisateur également (utilisé pour le login)
                        // 1. Récupérer id_utilisateur (table partenaires ou structure)
                        // 2. Faire un update du statut de utilisateur avec where id = id_utilisateur
                        const table = `${body.options.of}s`

                        const idPertanireRes = await db.read(table, ['id_utilisateur'], {
                            where: `WHERE id = ${body.options.id}`
                        }, true)

                        if (idPertanireRes.success) {
                            const idUtilisateur = idPertanireRes.res.rows[0].id_utilisateur

                            const updateUser = await db.edit('utilisateurs', ['statut'], [newStatus],
                                `WHERE id = ${idUtilisateur}`, true
                            )

                            if (updateUser.success) {
                                setTimeout(() => {
                                    sendEmail(body.options.email, 'statut', '', {
                                        nom: body.options.nom,
                                        prenom: body.options.prenom,
                                        newStatus: body.options.current === 'actif' ? 'désactivé' : 'activé'
                                    })
                                }, 200);
        
                                return { success: true, newStatus }

                            } else {

                                // En cas d'erreur, revenir à l'ancienne valeur
                                db.edit(
                                    `${body.options.of}s`,
                                    ['statut'], [newStatus === 'actif' ? 'inactif' : 'actif'],
                                    `WHERE id = ${body.options.id}`, true
                                )
                                return { success: false, reason: 'could not change statut' }
                            }

                        } else {

                            // En cas d'erreur, revenir à l'ancienne valeur
                            db.edit(
                                `${body.options.of}s`,
                                ['statut'], [newStatus === 'actif' ? 'inactif' : 'actif'],
                                `WHERE id = ${body.options.id}`, true
                            )
                            return { success: false, reason: 'could not change statut' }
                        }

                    } else {
                        return { success: false, reason: 'could not change statut' }
                    }

                } else {
                    return { success: false, reason: 'wrong options passed' }
                }

            } else {
                return { success: false, reason: 'wrong options passed' }
            }

        // Changer mot de passe (partenaire / structure)
        case 'change_password':
            
            // If partenaire : changer mdp partenaire ET utilisateur
            // if structure : changer mdp structure ET utilisateur
            // On génère un nouveau hash, salt et règle mdp_mis_a_jour sur 1

            const newHashSalt = await encrypt(body.options.password)

            let whereColumn = 'email'
            if (body.userData.type === 'structure') {
                whereColumn = 'email_gerant'
            }

            const user = await db.read(`${body.userData.type}s`, undefined, {
                where: `WHERE ${whereColumn} = $1`, values: [body.userData.email]
            }, true)

            const userId = user.res.rows[0].id_utilisateur

            const userupdate = await db.edit(
                'utilisateurs',
                ['hash', 'salt', 'mdp_mis_a_jour'],
                [newHashSalt.hash, newHashSalt.salt, 1],
                `WHERE id = ${userId}`
            )

            const originUpdate = await db.edit(
                `${body.userData.type}s`,
                ['hash', 'salt'],
                [newHashSalt.hash, newHashSalt.salt],
                `WHERE id_utilisateur = ${userId}`
            )

            if (userupdate.success) {
                return { success: true, type: body.userData.type, password:body.options.password }
            } else {
                return { success: false }
            }
            
        
        default:
            return { success: false }
    }

}

export default action