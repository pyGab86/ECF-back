import jsonwebtoken from 'jsonwebtoken';


const authenticateToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.send({success: false, reason: 'invalid-token'});
    }

    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        if (err) {
            return res.send({success: false, reason: 'invalid-token'});
        }

        // Make sure that user can not simply change the local storage uid
        // to access content that he is not invited to or not allowed to see
        // by comparing the requesting uid to the one in the token. 
        if (req.body.uid != undefined) {
            if (req.body.uid != user.uid) {
                return res.send({success: false, reason: 'unauthorized user'});
            }
        } else if (req.params.uid != undefined) {
            if (req.params.uid.slice(1) != user.uid) {
                return res.send({success: false, reason: 'unauthorized user'});
            }
        }

        req.user = user;
        next();

    });

}

const authenticateRefreshToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.send({success: false, reason: 'invalid-token'});
    }

    jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {

        if (err) {
            return res.send({success: false, reason: 'invalid-token'});
        }

        if (req.body.uid != undefined) {
            if (req.body.uid != user.uid) {
                return res.send({success: false, reason: 'unauthorized user'});
            }
        } else if (req.params.uid != undefined) {
            if (req.params.uid.slice(1) != user.uid) {
                return res.send({success: false, reason: 'unauthorized user'});
            }
        }

        req.user = user;
        next();

    });
}

export { authenticateToken, authenticateRefreshToken };