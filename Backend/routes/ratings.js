const express = require('express')

const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Submit a new rating for a store
router.post('/add', (req, res) => {
    const { user_id, store_id, rating_value, review_text } = req.body
    
    // Check if user already rated this store
    const checkSql = 'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?'
    pool.query(checkSql, [user_id, store_id], (err, data) => {
        if (err) {
            res.send(result.createResult(err))
        } else if (data.length > 0) {
            res.send(result.createResult('User has already rated this store'))
        } else {
            // Insert new rating
            const sql = 'INSERT INTO ratings (user_id, store_id, rating_value, review_text) VALUES (?, ?, ?, ?)'
            pool.query(sql, [user_id, store_id, rating_value, review_text], (err, data) => {
                res.send(result.createResult(err, data))
            })
        }
    })
})

// Update/modify an existing rating
router.put('/update/:rating_id', (req, res) => {
    const { rating_id } = req.params
    const { rating_value, review_text } = req.body
    
    const sql = 'UPDATE ratings SET rating_value = ?, review_text = ? WHERE rating_id = ?'
    pool.query(sql, [rating_value, review_text, rating_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get ratings submitted by a specific user
router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params
    
    const sql = `SELECT r.rating_id, r.rating_value, r.review_text, r.created_at, 
                s.store_id, s.store_name, s.store_address
                FROM ratings r
                JOIN stores s ON r.store_id = s.store_id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC`
    pool.query(sql, [user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get ratings for a specific store
router.get('/store/:store_id', (req, res) => {
    const { store_id } = req.params
    
    const sql = `SELECT r.rating_id, r.rating_value, r.review_text, r.created_at,
                u.uid, u.name, u.email
                FROM ratings r
                JOIN users u ON r.user_id = u.uid
                WHERE r.store_id = ?
                ORDER BY r.created_at DESC`
    pool.query(sql, [store_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get average rating for a store
router.get('/store/:store_id/average', (req, res) => {
    const { store_id } = req.params
    
    const sql = `SELECT s.store_id, s.store_name, 
                ROUND(AVG(r.rating_value), 2) AS average_rating,
                COUNT(r.rating_id) AS total_ratings
                FROM ratings r
                JOIN stores s ON r.store_id = s.store_id
                WHERE r.store_id = ?
                GROUP BY s.store_id, s.store_name`
    pool.query(sql, [store_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get all ratings with optional filters
router.get('/list', (req, res) => {
    const { store_id, user_id, min_rating, max_rating } = req.query
    
    let sql = `SELECT r.rating_id, r.rating_value, r.review_text, r.created_at,
                u.name, u.email, s.store_name, s.store_address
                FROM ratings r
                JOIN users u ON r.user_id = u.uid
                JOIN stores s ON r.store_id = s.store_id
                WHERE 1=1`
    let params = []
    
    if (store_id) {
        sql += ' AND r.store_id = ?'
        params.push(store_id)
    }
    if (user_id) {
        sql += ' AND r.user_id = ?'
        params.push(user_id)
    }
    if (min_rating) {
        sql += ' AND r.rating_value >= ?'
        params.push(min_rating)
    }
    if (max_rating) {
        sql += ' AND r.rating_value <= ?'
        params.push(max_rating)
    }
    
    sql += ' ORDER BY r.created_at DESC'
    
    pool.query(sql, params, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Delete a rating
router.delete('/delete/:rating_id', (req, res) => {
    const { rating_id } = req.params
    
    const sql = 'DELETE FROM ratings WHERE rating_id = ?'
    pool.query(sql, [rating_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

module.exports = router
