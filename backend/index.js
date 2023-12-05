
import express from "express";
import { router } from "./routes/index.js";
import cors from "cors";
import { readdir, readFile } from "fs/promises"
import 'dotenv/config'
import metadata from "./assets/metadata.js";
import { Score } from "./models/scores.js";


const app = express()
const port = process.env.PORT
app.use(cors())
app.use(express.json());

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
                        "mapping": [],
                        "timing": {
                            "ticks_per_interval": 12,
                            "time_between_intervals_ms": 8,
                            "display_rerender_threshold": 12
                        },
                        "description": "No description available"
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


app.get("/highscores", async (req, res) => {
    res.send(await Score.findAll({
        attributes: ["name", "game", "score"],
        order: [
            ["score", "DESC"]
        ]
    }))
})

app.post("/highscores", async (req, res) => {

    if (await Score.findOne({ where: { name: req.body.name, game: req.body.game } })) {
        console.log("found a matching name")
        await Score.update({ score: req.body.score }, {
            where: { name: req.body.name, game: req.body.game }
        })
    }
    else {
        console.log("no matching name")
        await Score.create(req.body)
    }

    res.send({
        "status": "done"
    })
})

app.get('/', (req, res) => {
    res.send('backend online')
})


app.use(router)


app.listen(port, () => {
    console.log(`app online at http://localhost:${port}`)
})
