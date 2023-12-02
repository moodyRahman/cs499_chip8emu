
import { Sequelize, DataTypes } from "sequelize";

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite',
    logging: false
});

export const Score = sequelize.define('Score', {
    // Model attributes are defined here
    name: {
        type: DataTypes.STRING,
    },
    score: {
        type: DataTypes.NUMBER
    },
    game: {
        type: DataTypes.STRING
    }
});

await sequelize.sync()
