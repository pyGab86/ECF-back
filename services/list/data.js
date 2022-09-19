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
            
        // Récupérer les infos d'un partenaire
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

        // Récupérer les infos partenaire (en tant que partenaire)
        case 'self-partenaire':
                return db.read('partenaires', ['id', 'prenom', 'nom', 'email', 'adresse', 'code_postal', 'ville', 
                'description', 'statut_acces_donnees', 'timestamp_creation', 'statut'],
                { where: `WHERE email = $1`, values: [body.options.email] }, true
            )
            .then(res => {
                return { success: true, data: res.res.rows }
            })
            .catch(err => {
                return { success: false, error: err }
            })

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

            } else {
                return { success: false, reason: 'wrong options passed' }
            }

        // Récupérer les structures (en tant que structure)
        case 'self-structures':
            const columns_ = ['id', 'id_partenaire', 'id_utilisateur', 'nom_gerant', 'prenom_gerant',
            'email_partenaire', 'email_gerant', 'adresse', 'code_postal', 'ville', 'description',
            'timestamp_creation', 'statut']

            return db.read('structures', columns_, { where: `WHERE email_partenaire = $1`, values: [body.options.email] }, true)
                .then(res => { return { success: true, data: res.res.rows } })
                .catch(err => { return { success: false, error: err } })


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

        // Récupération des permissions pour un user de type partenaire ou structure
        case 'self-permissions':
            if ((typeof body.options.id === 'number' && body.options.of === 'partenaire') 
                || (typeof body.options.id === 'number' && body.options.of === 'structure')) {
                return db.read('permissions', undefined, { where: `WHERE id_${body.options.of} = $1`, values: [body.options.id] }, true)
                    .then(res => { return { success: true, data: res.res.rows }})
                    .catch(err => { return { success: false, error: err } })
            } else {
                return { success: false, reason: 'wrong options passed' }
            }
        
        // Faire un search sur les partenaires et structures par le nom
        case 'search':
            console.log(body)
            const partenairesSearch = await db.read('partenaires',
                ['nom', 'prenom', 'email', 'id', 'ville'], 
                { where: 
                    `WHERE nom LIKE '${body.options.name}%'`
                },
                true
            )

            const structuresSearch = await db.read('structures',
                ['nom_gerant', 'prenom_gerant', 'email_gerant', 'id', 'ville'], 
                { where: 
                    `WHERE nom_gerant LIKE '${body.options.name}%'`
                },
                true
            )

            if (partenairesSearch.success && structuresSearch.success) {
                return {
                    success: true,
                    data: {
                        partenaires: partenairesSearch.res.rows,
                        structures: structuresSearch.res.rows
                    }
                }
            } else {
                if (!partenairesSearch.success && !structuresSearch.success) {
                    return { success: false, reason: 'could not make research' }
                } else if (partenairesSearch.success) {
                    return {
                        success: true,
                        partenaires: partenairesSearch.res.rows,
                        structures: 'error'
                    }
                } else {
                    return {
                        success: true,
                        partenaires: 'error',
                        structures: structuresSearch.res.rows
                    }
                }
            }

        // Uniquement pour les partenaires connectés.
        // Ils ne peuvent rechercher que des structures leur appartenant
        case 'search-structures':

            const structuresSearch_ = await db.read('structures',
                ['nom_gerant', 'prenom_gerant', 'email_gerant', 'id', 'ville'], 
                { where: 
                    `WHERE nom_gerant LIKE '${body.options.name}%'
                    AND email_partenaire = ${body.options.email}`
                },
                true
            )

            if (structuresSearch_.success) {
                return {
                    success: true,
                    data: {
                        structures: structuresSearch_.res.rows
                    }
                }
            } else {
                return { success: false, reason: 'could not make research' }
            }

        default:
            return { success: false, reason: 'unknown data request' }
    }

}

export default data