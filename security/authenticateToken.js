import jsonwebtoken from 'jsonwebtoken';


const authenticateToken = (req) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return false;
    }

    return jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        if (err) {
            return false;
        }

        if (req.body.uid != undefined && req.body.type != undefined) {
            if (req.body.uid != user.email || req.body.type != user.type) {
                return false;
            }
        } else if (req.params.uid != undefined) {
            if (req.params.uid.slice(1) != user.email || req.params.slice(1) != user.type) {
                return false;
            }
        }

        req.user = user;
        return true
    });

}

const authenticateRefreshToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.send({ success: false, reason: 'could not find token' })
    }

    return jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {

        if (err) {
            res.send({ success: false, reason: 'could not verify token' })
        }

        if (req.body.uid != undefined && req.body.type != undefined) {
            if (req.body.uid != user.email || req.body.type != user.type) {
                res.send({ success: false, reason: 'could not verify token' });
            }
        } else if (req.params.uid != undefined) {
            if (req.params.uid.slice(1) != user.email || req.params.slice(1) != user.type) {
                res.send({ success: false, reason: 'could not verify token' })
            }
        }

        req.user = user;
        next()
    });
}

export { authenticateToken, authenticateRefreshToken };