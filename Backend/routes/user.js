const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

router.post('/register', (req, res) => {
    const { name, email, password, address, phone, role } = req.body
    if (!name || !email || !password) {
        return res.send(result.createResult('Name, email, and password are required'))
    }

    const selectedRole = role || 'Normal'
    const checkSql = 'SELECT id FROM users WHERE email = ?'
    pool.query(checkSql, [email], (err, existingUsers) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        if (existingUsers.length > 0) {
            return res.send(result.createResult('Email already registered'))
        }

        const insertSql = 'INSERT INTO users (name, email, password, address, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
        bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
            if (err) {
                return res.send(result.createResult(err))
            }

            pool.query(insertSql, [name, email, hashedPassword, address, phone, selectedRole], (err, data) => {
                res.send(result.createResult(err, data))
            })
        })
    })
})

router.post('/login', (req, res) => {
    const { email, password } = req.body
    const sql = `SELECT id, name, email, password, address, phone, role FROM users WHERE email = ?`
    pool.query(sql, [email], (err, data) => {
        if (err)
            res.send(result.createResult(err))
        else if (data.length == 0)
            res.send(result.createResult("Invalid Email"))
        else {
            bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
                if (passwordStatus) {
                    const payload = {
                        uid: data[0].id,
                    }
                    const token = jwt.sign(payload, config.SECRET)
                    const user = {
                        token,
                        id: data[0].id,
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

// See all ratings
router.get('/ratings', (req, res) => {
    const { uid } = req.query
    const sql = `SELECT r.id AS rating_id, r.rating_value, s.store_name
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        JOIN users u ON s.owner_id = u.id
        WHERE u.id = ?`
    pool.query(sql, [uid], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Update Normal user's password
router.put('/update-password', (req, res) => {
    const { uid, old_password, new_password } = req.body
    const sql = 'SELECT * FROM users WHERE id = ? AND role = "Normal"'
    pool.query(sql, [uid], (err, data) => {
        if (err)
            res.send(result.createResult(err))
        else if (data.length == 0)
            res.send(result.createResult("User not found"))
        else {
            bcrypt.compare(old_password, data[0].password, (err, passwordStatus) => {
                if (passwordStatus) {
                    bcrypt.hash(new_password, config.SALT_ROUND, (err, hashedPassword) => {
                        if (hashedPassword) {
                            const updateSql = 'UPDATE users SET password = ? WHERE id = ?'
                            pool.query(updateSql, [hashedPassword, uid], (err, updateData) => {
                                    res.send(result.createResult(err, updateData))
                            })
                        } else
                            res.send(result.createResult(err))
                    })
                }
                else
                    res.send(result.createResult('Invalid Old Password'))
            })
        }
    })
})


module.exports = router