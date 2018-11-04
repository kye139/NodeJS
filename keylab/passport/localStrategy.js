const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'admin_id',
        passwordField: 'admin_password'
    }, async (user_id, password, done) => {
        try {
            const exUser = await User.find({ where: { user_id }});
            if(exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if(result) {
                    done(null, exUser);
                }
                else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.'});
                }
            }
            else {
                done(null, false, { message: '아이디가 일치하지 않습니다.'});
            }
        }
        catch(error) {
            console.error(error);
            next(error);
        }
    }));
};