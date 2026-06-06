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


// Count of users
router.get('/users/count', (req, res) => {
    const sql = `SELECT COUNT(*) AS userCount FROM users WHERE role = 'Normal'`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data ? data[0] : null))
    })
})

// Count of stores
router.get('/stores/count', (req, res) => {
    const sql = `SELECT COUNT(*) AS storeCount FROM stores`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data ? data[0] : null))
    })
})

// Count of ratings
router.get('/ratings/count', (req, res) => {
    const sql = `SELECT COUNT(*) AS ratingCount FROM ratings`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data ? data[0] : null))
    })
})

// Count of users who given ratings
router.get('/users/ratings/count', (req, res) => {
    const sql = `SELECT COUNT(DISTINCT user_id) AS userRatingCount FROM ratings`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data ? data[0] : null))
    })
})

// Get All Users (Normal, Admin, Store Owner) with average rating if Store Owner
router.get('/users/all', (req, res) => {
    const sql = `SELECT u.id AS uid, u.name, u.email, u.address, u.phone, u.role,
                 ROUND(AVG(r.rating_value), 2) AS avg_rating
                 FROM users u
                 LEFT JOIN stores s ON u.id = s.owner_id
                 LEFT JOIN ratings r ON s.id = r.store_id
                 GROUP BY u.id`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get All Stores with average rating
router.get('/stores/all', (req, res) => {
    const sql = `SELECT s.id AS store_id, s.store_name, s.store_email, s.store_address,
                 ROUND(AVG(r.rating_value), 2) AS avg_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 GROUP BY s.id`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})


module.exports = router