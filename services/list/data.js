import db from "../../DB.js";

const data = async (body) => {

    switch (body.requested) {

        // Récupérer les partenaires
        case 'partenaires':
            // On ne retourne pas toutes les colonnes de la ligne par sécurité
            return db.read('partenaires', ['id', 'prenom', 'nom', 'email', 'adresse', 'code_postal', 'ville', 
                'description', 'statut_acces_donnees', 'timestamp_creation', 'statut'], undefined, false)
                .then(res => { return { success: true, data: res.res.rows } })
                .catch(err => { return { success: false, error: err } })

        // Récupérer toutes les infos d'un partenaire (dont ses permissions)
        case 'partenaire':
            // Vérifier que l'id est bien un numbre pour éviter une injection sql
            if (typeof body.options.id === 'number') {
                // On ne retourne pas toutes les colonnes de la ligne par sécurité
                return db.read('partenaires', ['id', 'prenom', 'nom', 'email', 'adresse', 'code_postal', 'ville', 
                    'description', 'statut_acces_donnees', 'timestamp_creation', 'statut'], 
                    { where: `WHERE id = ${body.options.id}` }, false)
                    .then(res => { return { success: true, data: res.res.rows } })
                    .catch(err => { return { success: false, error: err } })
            } else {
                return { success: false, reason: 'wrong options passed' }
            }            

        // Récupérer les structures
        case 'structures':
            // Plusieurs types de recherches de structure sont possibles:
            // - les structures d'un partenaire (from: 'partenaire', id)
            // - les structures lors d'une recherche via barre (from: 'search') (par admin ou partenaire)
            // On ne retourne pas toutes les colonnes de la ligne par sécurité
            const columns = ['id', 'id_partenaire', 'id_utilisateur', 'nom_gerant', 'prenom_gerant',
            'email_partenaire', 'email_gerant', 'adresse', 'code_postal', 'ville', 'description',
            'timestamp_creation', 'statut']

            if (body.options.from === 'partenaire' && typeof body.options.id === 'number') {
                return db.read('structures', columns, { where: `WHERE id_partenaire = ${body.options.id}` }, false)
                .then(res => { return { success: true, data: res.res.rows } })
                .catch(err => { return { success: false, error: err } })

            } else if (body.options.from === 'search') {
                return db.read('structures', columns, undefined, false)
                .then(res => { return { success: true, data: res.res.rows } })
                .catch(err => { return { success: false, error: err } })

            } else {
                return { success: false, reason: 'wrong options passed' }
            }

        // Récupérer les infos d'une structure en particulier (avec ses permissions)
        case 'structure':
            // On ne retourne pas toutes les colonnes de la ligne par sécurité
            if (typeof body.options.id === 'number') {
                return db.read('structures', undefined, { where: `WHERE id = ${body.options.id}`})
                    .then(res => { return { success: true, data: res.res.rows } })
                    .catch(err => { return { success: false, error: err } })
            } else {
                return { success: false, reason: 'wrong options passed' }
            }

        // Récupération des permissions partenaire ou structure
        case 'permissions':
            // Récupérer les permissions d'un partenaire ou d'une structure
            if ((typeof body.options.id === 'number' && body.options.of === 'partenaire') || (typeof body.options.id === 'number' && body.options.of === 'structure')) {
                return db.read('permissions', undefined, { where: `WHERE id_${body.options.of} = ${body.options.id}` })
                    .then(res => { return { success: true, data: res.res.rows }})
                    .catch(err => { return { success: false, error: err } })
            } else {
                return { success: false, reason: 'wrong options passed' }
            }
        
        default:
            return { success: false, reason: 'unknown data request' }
    }

}

export default data