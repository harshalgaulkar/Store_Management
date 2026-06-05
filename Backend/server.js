const express = require('express')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.json())

// Importing routes
const userRoutes = require('./routes/user')
const storeOwnerRoutes = require('./routes/store_owner')
const adminRoutes = require('./routes/admin')
const storeRoutes = require('./routes/store')
const ratingsRoutes = require('./routes/ratings')

// Using routes
app.use('/api/users', userRoutes)
app.use('/api/store-owners', storeOwnerRoutes)
app.use('/api/admins', adminRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/ratings', ratingsRoutes)


app.listen(4000, 'localhost',() => {
    console.log('Server started at port 4000')
})