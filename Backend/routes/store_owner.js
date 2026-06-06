const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

// Store Owner registration route
router.post('/register', (req, res) => {
    const {name, email, password, address, phone} = req.body
    const sql = 'INSERT INTO users (name, email, password, address, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
    bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
        if (hashedPassword) {
            pool.query(sql, [name, email, hashedPassword, address, phone, 'Store Owner'], (err, data) => {
                res.send(result.createResult(err, data))
            })
        } else
            res.send(result.createResult(err))
    })
})

// Store Owner login route
router.post('/login', (req, res) => {
    const { email, password } = req.body
    const sql = `SELECT * FROM users WHERE email = ? AND role = 'Store Owner'`
    pool.query(sql, [email], (err, data) => {
        if (err)
            res.send(result.createResult(err))
        else if (data.length == 0)
            res.send(result.createResult("Invalid Email or Not a Store Owner"))
        else {
            bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
                if (passwordStatus) {
                    const payload = {
                        uid: data[0].id,
                    }
                    const token = jwt.sign(payload, config.SECRET)
                    const user = {
                        token,
                        name: data[0].name,
                        email: data[0].email,
                        address: data[0].address,
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

// Store owner should see their store ratings and reviews
router.get('/ratings', (req, res) => {
    const { uid } = req.query
    const sql = `SELECT s.id AS store_id, s.store_name, r.rating_value, r.created_at
                FROM stores s
                JOIN ratings r ON s.id = r.store_id
                WHERE s.owner_id = ?`
    pool.query(sql, [uid], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Store owner should see average rating of their store
router.get('/ratings/average', (req, res) => {
    const { uid } = req.query
    const sql = `SELECT s.id AS store_id, s.store_name, ROUND(AVG(r.rating_value), 2) AS avg_rating
                FROM stores s
                JOIN ratings r ON s.id = r.store_id
                WHERE s.owner_id = ?
                GROUP BY s.id, s.store_name`
    pool.query(sql, [uid], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

//Store owner should update their password
router.put('/update-password', (req, res) => {
    const { uid, old_password, new_password } = req.body
    const sql = 'SELECT * FROM users WHERE id = ? AND role = "Store Owner"'
    pool.query(sql, [uid], (err, data) => {
        if (err)
            res.send(result.createResult(err))
        else if (data.length == 0)
            res.send(result.createResult("Store Owner not found"))
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