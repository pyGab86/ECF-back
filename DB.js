import pkg from 'pg'
import dotenv from 'dotenv'
import SETTINGS from './SETTINGS.js'
import { encrypt } from './security/passwordManagement.js'

const { Client } = pkg
dotenv.config()

// Pour se prémunir des injections SQL, on utilise uniquement des prepared statements
// qui permettent de controller les requêtes SQL, contrairement à un modèle où l'on concatènerait
// les valeurs dans une seul et même chaîne de charactères.
class DB {

    constructor () {
        this.client = new Client({
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DB,
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
            ssl: { rejectUnauthorized: false }
        })

        this.tables = ['utilisateurs', 'admins', 'partenaires', 'structures', 'permissions']

        this.client.connect()
        .then(res => {
            console.log(`-- ${new Date().toLocaleString()} :: CONNEXION DB ETABLIE`)
            // Quand le serveur s'initialise, on vérifie que les tables existent. Si non, on utilise la fonction create() pour
            // générer les tables. Cela devrait les créer uniquement lors du premier démarage sur le serveur ou bien en changeant de serveur
            // A noter que si l'on recréer les tables sur un nouveau serveur, on peut toujours importer la bdd déjà existante depuis le serveur précédent
            this.tablesModels = SETTINGS.tablesModels

            this.tables.forEach(async (table) => {
                const response = await this.read(table, undefined, undefined ) /*{ where: { field: 'name', compare: '=', value: 'Didier' } }*/
                if (!response.success && response.reason === 'parserOpenTable') {
                    const createRes = await this.create(table, this.tablesModels[table])
                    
                    if (createRes.success && table === 'admins') {
                        const hashSalt = await encrypt(process.env.DEFAULT_ADMIN_MDP)
                        this.insert('utilisateurs', ['Admin', 'adminus', process.env.DEFAULT_ADMIN_EMAIL, hashSalt.hash, hashSalt.salt, 'admin', 1, 'actif'])
                        .then(res => {
                            this.insert('admins', [res.id, 'Admin', 'adminus', process.env.DEFAULT_ADMIN_EMAIL, hashSalt.hash, hashSalt.salt, 1])
                        })
                        .catch(err => { process.exit() })
                    }
                }
            })
        })
        .catch(err => {
            console.log(`-- ${new Date().toLocaleString()} :: ERREUR CONNEXION DB : ${err}`)
        })
    }

    // Ici, pas de requête préparée, mais on vérifie la requête avant de l'envoyer
    create = async (tableName, columns, verbose=false) => {

        if (this.tables.includes(tableName)) { 
            let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`
            columns.forEach((column, index) => {
                query += `${column.name} ${column.type} ${column.nullOrNot} ${typeof(column.key) != 'undefined' ? column.key : ''}`
                // Get ridd of the white-spaces before commas
                if (typeof(column.key) == 'undefined') {
                    query = query.slice(0, query.length-1)
                }
                if (index < columns.length-1) { 
                    query += ', '
                } else {
                    query += ')'
                }
            })

            // Requête non préparée : prévenir les injections SQL
            if (query.includes(';') || query.includes('=') || query.includes(' OR ') 
                || query.includes(' or ') || query.includes('DROP TABLE') || query.includes('drop table')) {
                return { success: false, reason: 'SQL INJECTION ATTEMPT' }
            }

            query += ';'

            if (verbose) {
                console.log(query)
            }

            let response = await this.client.query(query)

            if (typeof response.severity === 'string') {
                return { success: false, error: response.routine }
            } else {
                return { success: true }
            }

        } else {
            return { success: false, reason: 'unknown table' }
        }
    }

    // Lire une table - avec une requête préparée
    // les filtres sont un objet. Le where en est un lui aussi, et peut-être une array ou une map.
    read = async (tableName, columns=undefined, filters=undefined, verbose=false) => {

        if (this.tables.includes(tableName)) {

            let queryText = 'SELECT'
            const queryValues = []
            
            if (typeof columns === "undefined" || columns.length === 0) {
                queryText += ' *'
            } else {
                for (let i = 0; i < columns.length; i++) {
                    queryText += ` ${columns[i]}`
                    if (i + 1 < columns.length) {
                        queryText += ', '
                    }
                }
            }

            queryText += ` FROM ${tableName}`

            if (typeof filters === 'object') {
                if (typeof filters.where === 'string') {
                    queryText += ` ${filters.where}`
                }

                if (typeof filters.values === 'object') {
                    for (let i = 0; i < filters.values.length; i++) {
                        queryValues.push(filters.values[i])
                    }
                }
            }

            if (verbose) {
                console.log(queryText, queryValues)
            }

            return this.client.query({
                text: queryText,
                values: queryValues
            })
            .then(res => {
                return { success: true, res }
            })
            .catch(err => {
                return { success: false, reason: err.routine }
            })
        
        } else {
            return { success: false, reason: `unknown table ${tableName}` }
        }

    }

    // On insert une ligne dans une table. Pour gagner en simplicité et en performance, 
    // on charge les colonnes depuis les settings pour ne pas avoir à les reconstruire
    insert = async (tableName, values, verbose=false) => {
        if (this.tables.includes(tableName)) {

            let queryText = `INSERT INTO ${tableName} ${SETTINGS.tablesColumns[tableName]} VALUES(`
            const queryValues = []

            for (let i = 0; i < values.length; i++) {
                queryText += `$${queryValues.length +1}`
                queryValues.push(values[i])

                if (i + 1 === values.length) {
                    queryText += ')'
                } else {
                    queryText += ', '
                }
            }

            queryText += ' RETURNING *'

            if (verbose) {
                console.log(queryText, queryValues)
            }
            
            return this.client.query({
                text: queryText,
                values: queryValues
            })
            .then(res => { return { success: true, id: parseInt(res.rows[0].id) } })
            .catch(err => { return { success: false, reason: err } })

        } else {
            return { success: false }
        }
    }

    // Modifier une ligne (une ou plusieurs colonnes) dans une table
    // C'est le service appellant cette fonction qui spécifira conditionnellement
    // les colonnes et les values à modifier. Pareil pour le where
    edit = async (tableName, columns, values, where, verbose=false) => {

        if (this.tables.includes(tableName)) {
            
            let queryText = `UPDATE ${tableName} SET `
            const queryValues = []

            for (let i = 0; i < columns.length; i++) {
                queryText += `${columns[i]} = $${i+1}`
                queryValues.push(values[i])

                if (i+1 < columns.length) {
                    queryText += ', '
                }
            }

            queryText += ` ${where}`

            if (verbose) {
                console.log(queryText, queryValues)
            }

            return this.client.query({
                text: queryText,
                values: queryValues
            })
            .then(res => { return { success: true }})
            .catch(err => { return { success: false, reason: err }})

        } else {
            return { success: false, reason: 'unknown tableName' }
        }

    }

}

const db = new DB()
export default db