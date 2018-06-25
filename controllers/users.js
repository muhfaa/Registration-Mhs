const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('../configuration')
const mongoose = require('mongoose');
const User = require('../models/user');

signToken = user => {
    return JWT.sign({
        iss: 'Test',
        sub: user.id,
        iat: new Date().getTime(), // current time
        exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day
    }, JWT_SECRET);
}

module.exports = {
    signUp: async(req, res, next) => {
        const {email, password, name, majors, photos} = req.value.body;
        
        // check id there is a user with the same email
        const foundUser = await User.findOne({"local.email":email});
        if (foundUser) { 
            return res.status(403).send({error: 'Email already in use'})
        }

        // create a new user
        const newUser = new User({ 
            method: "local",
            local: {
                id: new mongoose.Types.ObjectId(),
                email: email, 
                password: password,
                name: name,
                majors: majors,
                photos: photos
            }
        });
        await newUser.save();

        //  Generate token
        const token = signToken(newUser);
        
        // Respond with token
        res.status(200).json({ token, newUser: newUser.local});
    },
    
    signIn: async(req, res, next) => {
        // generate token
        const token = signToken(req.user);
        res.status(200).json({token});
    },

    googleOAuth: async (req, res, next) => {
        // generate token
        console.log('req.user', req.user);
        const token = signToken(req.user);
        res.status(200).json({ token });
    },

    secret: async(req, res, next) => {
        console.log('I manage to get here!');
        res.json({ secret: "get resource"});
    },

    allUser: async (req, res, next) => {
        User.find()
            .exec()
            .then(docs => {
                res.status(200).json({docs})
            })
    },

    deleteUser: async (req, res, next) => {
        User.find({id:req.body.userId})
        .then(users => {
                console.log(users);
                if(users.length !== 0) {
                    users.remove({id: req.body.userId})
                        .then(docs => {
                            res.status(200).json({
                                message:"User Deleted"
                            })
                        })
                } else {
                    res.status(400).json({
                        message:"User has been deleted"
                    })
                }
            })
    },

    // userById: async (req, res, next) => {
    //     User.findById(req.params.userId)
    //         .exec()
    //         .then(users => {
    //             if(!users){
    //                 return res.status(500).json({
    //                     message:"User not found"
    //                 })
    //             }
    //             res.status(200).send(users)
    //         })
    //         .catch(error => {
    //             res.status(500).send(error)
    //         })
    // }
}