const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
})

// Instance methods

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    // Return the document except the password and sessions (these shouldn't be made available)
    return _.omit(userObject, ['password', 'sessions']);
}

userSchema.methods.generateAccessAuthToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        // Create the JSON Web Token and return that
        jwt.sign(
            {
                _id: user._id.toHexString()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10s"
            },
            (err, token) => {
                if (!err) {
                    resolve(token);
                } else {
                    // There is an error
                    reject();
                }
            }
        )
    });
}

userSchema.methods.generateRefreshAuthToken = function () {
    return new Promise((resolve, reject) => {
        // Create a random 64 byte hex string
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // No error
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    });
}

userSchema.methods.createSession = function () {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        // saved session successfully
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    });
}

// Model methods
userSchema.statics.getJWTSecret = () => {
    return process.env.JWT_SECRET;
}


userSchema.statics.findByIdAndToken = function (_id, token) {
    // Find a user by id and token
    // Used in auth middleware (verifySession)

    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    });
}

userSchema.statics.findByCredentials = function (email, password) {
    let user = this;

    return user.findOne({ email }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
}

userSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // Refresh token has not expired
        return false;
    } else {
        // Refresh token has expired
        return true;
    }
};

// Middleware
// Before a user document is saved, this code runs
userSchema.pre('save', function (next) {
    let user = this;
    let costFactor = 10;

    if (user.isModified('password')) {
        // User password has been modified
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});


// Helper methods
let saveSessionToDatabase = (user, refreshToken) => {
    // Save the session to the database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt });

        user.save().then(() => {
            // saved session successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    });
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;

    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', userSchema);

module.exports = { User }