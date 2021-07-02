import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import User from '../models/User';
import { getToken } from '../authentication';

const router = express.Router();

router.post('/register', async (req, res, next) => {
    if(!req.body.username || !req.body.password)
        res.status(400);
    try {
        const newUser = await User.register(User.build({ username : req.body.username, balance: mongoose.Types.Decimal128.fromString('0') }), req.body.password);
        await newUser.save();
        passport.authenticate('local')(req, res, () => {
            res.status(201);
            res.json({success:true, status:"Registration Successful!"});
        });
    }
    catch (err) {
        res.status(400);
        res.json({success:false, status:"Registration Failed!"});
    }
});

router.post('/login', async (req,res,next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err)
            next(err);
        if(!user) {
            res.status(401);
            res.json({success: false, status:"unable to log in", err:info});
        }
        req.logIn(user, err => {
            if(err)
                next(err);
            const token = getToken({_id: req.user?._id});
            res.status(200);
            res.json({success:true, status:'Login Successful', token:token});
        })
    })
});

export default router;