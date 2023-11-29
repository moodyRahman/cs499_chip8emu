
import express from "express";
import { router } from "./routes/index.js";
import cors from "cors";
import { readdir, readFile } from "fs/promises"
import 'dotenv/config'
import metadata from "./assets/metadata.js";

const app = express()
const port = process.env.PORT
app.use(cors())
app.use((req, res, next) => {
    console.log(`${req.method} for ${req.url}`);
    next()
})

app.use("/assets", express.static("./assets"))

app.get("/meta_assets/:rom", async (req, res) => {
    console.log(req.params.rom)
    try {
        const rom = await readFile(`./assets/roms/${req.params.rom}`)

        res.send(
            {
                meta: {
                    status: (metadata[req.params.rom] ? 1 : 0),
                    data: (metadata[req.params.rom] ? metadata[req.params.rom] : {
                        "mapping": [
                            {
                                "keyboard": "a",
                                "chip8_input": "f",
                                "description": "whatever"
                            },
                            {
                                "keyboard": "a",
                                "chip8_input": "f",
                                "description": "whatever"
                            }
                        ],
                        "timing": {
                            "ticks_per_interval": 12,
                            "time_between_intervals_ms": 8,
                            "display_rerender_threshold": 12
                        }
                    })

                },
                rom: Buffer.from(rom.buffer).toString("base64")
            }
        )
    } catch (error) {
        res.status = 404;
        return res.send({
            meta: {
                status: 0,
                data: {}
            },
            rom: ""
        })
    }

    // res.send(
    //     Object.assign(metadata[req.params.rom], { rom: Buffer.from(rom.buffer).toString("base64") })
    // )

})

app.get("/assets_data", async (req, res) => {
    const data = await readdir("./assets/roms")
    res.send(data)
})

app.get('/', (req, res) => {
    res.send('backend online')
})


app.use(router)


app.listen(port, () => {
    console.log(`app online at http://localhost:${port}`)
})
