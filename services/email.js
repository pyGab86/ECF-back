import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const sendEmail = async (destination, subject, message, infos=undefined) => {

    let html
    switch (subject) {
        case 'creation':
            html = `
                <h1>Votre espace ${infos.toCreate}</h1>
                <p>${infos.nom} ${infos.prenom}, nous venons de créer votre espace ${infos.toCreate}.
                Pour vous y <a href="${process.env.APP_DOMAIN}">connecter</a>, veuillez utiliser
                les identifiants suivants :</p>
                <ul>
                    <li>Votre email : ${infos.email}</li>
                    <li>Votre mot de passe : ${infos.password}</li>
                </ul>
                <p>Veuillez noter qu'il vous sera  demandé de saisir un nouveau mot de passe lors de votre première connexion.</p>
                <p>Bien à vous</p>
            `
                
            break

        case 'permission':
            html = `
                <h1>
                    Modification de vos permissions ${infos.permissionType}
                </h1>
                <p>
                    ${infos.nom} ${infos.prenom}, Nous souhaitons vous informer d'un changement de permission
                    sur votre compte. La permission ${infos.permission} est maintenant ${infos.permissionStatus}.
                </p>
                <p>
                    Bien à vous
                </p>
                `
            break

        case 'statut':
            html = `
                <h1>Changement de votre statut</h1>
                <p>
                    ${infos.nom} ${infos.prenom}, Nous souhaitons vous informer du changement de statut
                    de votre compte. Votre compte est ${infos.newStatus}
                </p>
                <p>
                    Bien à vous
                </p>
            `

        default:
            html = `<h1>Hello World</h1>`
    }

    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.eu',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: destination,
        subject: subject,
        text: message,
        html
    };
    
    transporter.sendMail(mailOptions)
    
}

export default sendEmail