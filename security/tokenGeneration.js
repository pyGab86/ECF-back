import jsonwebtoken from 'jsonwebtoken';

const genToken = (userObject) => {
    return jsonwebtoken.sign(userObject, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3600s'})
}
const genRefreshToken = (userObject) => {
    return jsonwebtoken.sign(userObject, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1 days'})
}

export { genToken, genRefreshToken };