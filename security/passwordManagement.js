import { passwordHash, passwordVerify } from 'nodejs-password';


const encrypt = async (password) => {

    // Generer un 'salt' et un hash depuis le mdp
    const salt = Math.random().toString(36).substr(2, 10);
    const hash = await passwordHash(password, salt);
    return { hash, salt }

}


const checkPassword = (password, hash, salt) => {
    return passwordVerify(password, hash, salt)
}



/* Vérifier que le mdp est assez fort
    - au moins 8 charactères
    - au moins 1 nombre
    - au moins une minuscule
    - au moins une majuscule
*/
const checkStrength = (password) => {

    const regexMin8Max50 = /(?=.{8,50})/
    const regex1Upper = /(?=.*[A-Z])/
    const regex1Lower = /(?=.*[a-z])/
    const regex1Number = /(?=.*[0-9])/

    if (regexMin8Max50.test(password) && regex1Upper.test(password) && regex1Lower.test(password) && regex1Number.test(password)) {
        return true
    } else {
        return false
    }
}

export { encrypt, checkPassword, checkStrength };