
import express from "express";

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('backend online')
})

app.listen(port, () => {
    console.log(`app online at http://localhost:3000`)
})