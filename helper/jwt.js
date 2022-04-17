const expressJwt = require('express-jwt');

function authJwt(){
    const api = process.env.API_URL;
    const secret=process.env.JWT_SECRET;
    return expressJwt({
        secret,
        algorithms:['HS256'],
        isRevoked:isRevoked
    }).unless({
        path:[
            //only allow get and options for product, cannot post product without auth :]
            //     &&
            // regex expression to only allow particular get methods to work without auth, for getting featured product count
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

async function isRevoked(req,payload,done){
    if(!payload.isAdmin){
        //reject the token if not admin
        done(null,true)
    }
    done();
}

module.exports=authJwt;