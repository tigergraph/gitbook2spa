const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 4000
const distPath = '../dist';
app.use(express.static(distPath));

app.use(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, `${distPath}/index.html`));
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
