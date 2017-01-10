/**
 * Created by Rogiel on 11/14/16.
 */

let Sequelize = require('sequelize');

let sequelize = new Sequelize('sqlite3', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'database/Bot.db'
});

module.exports = {
    sequelize: sequelize
};