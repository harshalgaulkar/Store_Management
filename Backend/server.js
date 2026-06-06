const express = require('express')
const cors = require('cors')


const app = express()
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
}))
app.use(express.json())

// Importing routes
const userRoutes = require('./routes/user')
const storeOwnerRoutes = require('./routes/store_owner')
const adminRoutes = require('./routes/admin')
const storeRoutes = require('./routes/store')
const ratingsRoutes = require('./routes/ratings')

// Using routes
app.use('/users', userRoutes)
app.use('/store-owners', storeOwnerRoutes)
app.use('/admins', adminRoutes)
app.use('/stores', storeRoutes)
app.use('/ratings', ratingsRoutes)


const port = process.env.PORT || 4000
app.listen(port, '0.0.0.0', () => {
    console.log(`Server started at port ${port}`)
})