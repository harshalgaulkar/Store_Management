const fs = require('fs')
const path = require('path')
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
module.exports = router