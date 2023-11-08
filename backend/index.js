
import express from "express";
import { router } from "./routes/index.js";
import cors from "cors";

import { readdir } from "fs/promises"

const app = express()
const port = 3000
app.use(cors())

// http://localhost:3000/assets/roms/a.png
app.use("/assets", express.static("./assets"))

app.get("/assets_data", async (req, res) => {
    const data = await readdir("./assets/roms")
    res.send(data)
})

app.get('/', (req, res) => {
    res.send('backend online')
})


app.use(router)


app.listen(port, () => {
    console.log(`app online at http://localhost:3000`)
})
