const SETTINGS = {
    tablesModels: {
        utilisateurs: [
            { name: 'id', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: 'PRIMARY KEY' },
            { name: 'nom', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'prenom', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'email', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'hash', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'salt', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'type', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'mdp_mis_a_jour', type: 'INTEGER', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'statut', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined }
        ],
        admins: [
            { name: 'id', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: 'PRIMARY KEY' },
            { name: 'id_utilisateur', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'nom', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'prenom', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'email', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'hash', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'salt', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'mdp_mis_a_jour', type: 'INTEGER', nullOrNot: 'NOT NULL', key: undefined }
        ],
        partenaires: [
            { name: 'id', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: 'PRIMARY KEY' },
            { name: 'id_utilisateur', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'nom', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'prenom', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'email', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'adresse', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'code_postal', type: 'INTEGER', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'ville', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'description', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'statut_acces_donnees', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'hash', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'salt', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'timestamp_creation', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'statut', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined }
        ],
        structures: [
            { name: 'id', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: 'PRIMARY KEY' },
            { name: 'id_partenaire', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'id_utilisateur', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'nom_gerant', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'prenom_gerant', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'email_partenaire', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'email_gerant', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'adresse', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'code_postal', type: 'INTEGER', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'ville', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'description', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'hash', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'salt', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'timestamp_creation', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'statut', type: 'VARCHAR', nullOrNot: 'NOT NULL', key: undefined }
        ],
        permissions: [
            { name: 'id', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: 'PRIMARY KEY' },
            { name: 'id_partenaire', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'id_structure', type: 'BIGSERIAL', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'gestion_planning_team', type: 'BOOLEAN', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'vente_boissons', type: 'BOOLEAN', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'vente_barres', type: 'BOOLEAN', nullOrNot: 'NOT NULL', key: undefined },
            { name: 'emailing', type: 'BOOLEAN', nullOrNot: 'NOT NULL', key: undefined }
        ]
    },
    tablesColumns: {
        utilisateurs: '(nom, prenom, email, hash, salt, type, mdp_mis_a_jour, statut)',
        admins: '(id_utilisateur, nom, prenom, email, hash, salt, mdp_mis_a_jour)',
        partenaires: '(id_utilisateur, nom, prenom, email, adresse, code_postal, ville, description, statut_acces_donnees, hash, salt, timestamp_creation, statut)',
        structures: '(id_partenaire, id_utilisateur, nom_gerant, prenom_gerant, email_partenaire, email_gerant, adresse, code_postal, ville, description, hash, salt, timestamp_creation, statut)',
        permissions: '(id_partenaire, id_structure, gestion_planning_team, vente_boissons, vente_barres, emailing)'
    }
}

export default SETTINGS