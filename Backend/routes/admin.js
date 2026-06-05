const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

// Admin registration route
router.post('/register', (req, res) => {
    const {name, email, password, address, phone} = req.body
    const sql = 'INSERT INTO users (name, email, password, address, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
    bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
        if (hashedPassword) {
            pool.query(sql, [name, email, hashedPassword, address, phone, 'Admin'], (err, data) => {
                res.send(result.createResult(err, data))
            })
        } else
            res.send(result.createResult(err))
    })
})

// Admin login route
router.post('/login', (req, res) => {
    const { email, password } = req.body
    const sql = `SELECT * FROM users WHERE email = ? AND role = 'Admin'`
    pool.query(sql, [email], (err, data) => {
        if (err)
            res.send(result.createResult(err))
        else if (data.length == 0)
            res.send(result.createResult("Invalid Email or Not an Admin"))
        else {
            bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
                if (passwordStatus) {
                    const payload = {
                        uid: data[0].uid,
                    }
                    const token = jwt.sign(payload, config.SECRET)
                    const user = {
                        token,
                        name: data[0].name,
                        email: data[0].email,
                        address: data[0].address,
                        phone: data[0].phone,
                        role: data[0].role
                    }
                    res.send(result.createResult(null, user))
                }
                else              
                    res.send(result.createResult('Invalid Password'))
            })
        }
    })
})
module.exports = router