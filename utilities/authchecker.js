const jwt= require('jsonwebtoken');
const {jwtSecret} = require('../src/config');
const {AuthenticationError}= require('apollo-server')


module.exports =(context)=>{

    const authHeader = context.req.headers.authorization;
    if(authHeader){
        const token = authHeader.split('Bearer ')[1];
        if(token){
            try{
                const user= jwt.verify(token, jwtSecret);
                return user;
            }catch(err){
                throw new AuthenticationError('invalid token')
            }
        }
        throw new Error('token bad format')
    }

    throw new Error('auth header must be provided')
    
}