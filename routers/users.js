const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const router = express.Router();
const User = require('../models/userModel')

router.use(express.json());
router.use(cookieParser());

const secretKey = "my_secret_key";

// Load input validation
const validateRegisterInput = require("../validators/register");
const validateLoginInput = require("../validators/login");



router.route('/register').post((req, res) => {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Validate the request body
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    // Find user with email provided
    User.findOne({ email }).then(user => {
        if (user) {
            // If user exists, return error response
            return res.status(400).json({ email: "Email already exists" });
        }
        else {
            // Create a new user
            const newUser = new User({
                username,
                email,
                password
            });

            // Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;

                    // Save the user to the database
                    newUser.save().then(() => {
                        res.send("User Added....")
                    }).catch((err) => {
                        console.log(err);
                    })
                });
            });
        }
    });
});


router.route('/login').post((req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Get email and password from request body
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }).then(user => {
        // Check if user exists
        if (!user) {
            return res.status(404).json("Email not found");
        }

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched, create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name
                };

                // Sign token with secret key and set expiration time
                jwt.sign(
                    payload,
                    secretKey,
                    {
                        expiresIn: 7890000  // 3 months in seconds
                    },
                    (err, token) => {
                        if (err) throw err;
                        res.cookie('token', token).json({
                            id: user.id,
                            username: user.username
                        });
                    }
                );
            } else {
                return res
                    .status(400)
                    .json("Password Incorrect..");
            }
        });
    });
});


router.route('/profile').get((req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, secretKey, {}, (err, info) => {
        if (err) {
          return res.status(401).json('Invalid or expired token');
        }
        res.json(info);
    });
});


router.route('/logout').post((req, res) => {
    res.clearCookie('token').json('You are logged out.');
});



module.exports = router;