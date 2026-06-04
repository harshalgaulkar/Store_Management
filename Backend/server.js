const express = require('express')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.json())

app.listen(4000, 'localhost',() => {
    console.log('Server started at port 4000')
})