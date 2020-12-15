const User= require('../models/User');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');
const {jwtSecret}= require('../src/config')
const {UserInputError} = require('apollo-server');
const {validateRegisterInput, validateLoginInput} = require('../utilities/validators');

function generateToken(user){
    return  jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username   
       },jwtSecret);
}


module.exports={
    Mutation: {

        async login(parent, {email, password}){
            const {errors, valid}= validateLoginInput(email,password)
            const user = await User.findOne({email});
            if(!valid){
                throw new UserInputError('Errors', {errors});
            }
            if(!user){
                errors.general= 'user not found'
                throw new UserInputError('user not found',{errors})
            }

            const match = await bcrypt.compare(password,user.password);
            if(!match){
                errors.general= 'Wrong credentials'
                throw new UserInputError('Wrong credentials',{errors})
            }
            const token= generateToken(user)
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },








       async register(parent,{registerInput:{username, email, password, confirmPassword}},context,info){
            //validation


            const {valid,errors} = validateRegisterInput(username, email, password, confirmPassword)
            if(!valid){
                throw new UserInputError('Error',{errors})
            }
            const user= await User.findOne({email});
            if(user){
                throw new UserInputError('user is already taken',{
                    errors:{
                      email: 'this email already exist'  
                    }
                })
            }
            password= await bcrypt.hash(password,12);
            const newUser= new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });
            const res = await newUser.save();
            const token= generateToken(res)
            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}