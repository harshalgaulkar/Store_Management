const express = require('express')
const multer = require('multer')

const result = require('../utils/result')
const pool = require('../utils/db')

const router = express.Router()

// Add a new store
router.post('/add', (req, res) => {
    const { owner_id, store_name, store_email, store_address } = req.body
    const sql = 'INSERT INTO stores (owner_id, store_name, store_email, store_address) VALUES (?, ?, ?, ?)'
    pool.query(sql, [owner_id, store_name, store_email, store_address], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get all stores
router.get('/all', (req, res) => {
    const sql = 'SELECT * FROM stores'
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get store by ID
router.get('/:id', (req, res) => {
    const { id } = req.params
    const sql = 'SELECT * FROM stores WHERE store_id = ?'
    pool.query(sql, [id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Update store details
router.put('/update/:id', (req, res) => {
    const { id } = req.params
    const { store_name, store_email, store_address } = req.body
    const sql = 'UPDATE stores SET store_name = ?, store_email = ?, store_address = ? WHERE store_id = ?'
    pool.query(sql, [store_name, store_email, store_address, id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Delete a store
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params
    const sql = 'DELETE FROM stores WHERE store_id = ?'
    pool.query(sql, [id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Get count of store ratings
router.get('/ratings/count', (req, res) => {
    const sql = `SELECT r.store_id,s.store_name,COUNT(*) AS rating_count,
        ROUND(AVG(r.rating_value), 2) AS avg_rating
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        GROUP BY r.store_id, s.store_name
        ORDER BY s.store_name;`;
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

//List of store ratings
router.get('/ratings/list', (req, res) => {
    const sql = `SELECT s.store_id, s.store_name, r.rating_value, r.review_text, r.created_at
                FROM stores s
                JOIN ratings r ON s.store_id = r.store_id`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})


//Search by name and address
router.get('/search', (req, res) => {
    const { query } = req.query
    const sql = `SELECT * FROM stores WHERE store_name LIKE ? OR store_address LIKE ?`
    const searchQuery = `%${query}%`
    pool.query(sql, [searchQuery, searchQuery], (err, data) => {
        res.send(result.createResult(err, data))
    })
})


module.exports = router