const settings = require('./settings'),
    start = require('./start'),
    cancel = require('./cancel'),
    roomExit = require('./exit'),
    roomJoin = require('./join'),
    misc_ = require('./misc'),
    help = require('./help')

module.exports = {
    settings,
    start,
    cancel,
    join: roomJoin,
    exit: roomExit,
    rooms: misc_.rooms,
    list: misc_.list,
    donate: misc_.donate,
    help
}