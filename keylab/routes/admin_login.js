const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const { User } = require('../models');

const router = express.Router();

router.get('/', isNotLoggedIn, async (req, res, next) => {
    res.render('admin_login');
})

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { admin_id, admin_password } = req.body;
    try {
        const exUser = await User.find({ where: { user_id: admin_id }});
        if(exUser) {
            return res.redirect('/');
        }

        const hash = await bcrypt.hash(admin_password, 12);

        await User.create({
            user_id: admin_id,
            password: hash,
            previlige: 'admin'
        })
        return res.redirect('/');
    }
    catch(error) {
        console.error(error);
        next(error);
    }
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        
        if(!user) {
            req.flash('loginError', info.message);
            return res.redirect('/');
        }

        return req.login(user, (loginError) => {
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

module.exports = router;