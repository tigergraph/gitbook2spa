const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000
const sourcePath = path.join(__dirname, '../dist')
app.use(express.static('.'));

app.use(`/`, (req, res) => {
    res.sendFile(`${sourcePath}/index.html`)
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))