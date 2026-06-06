const config = {
    SALT_ROUND: parseInt(process.env.SALT_ROUND) || 10,
    SECRET: process.env.JWT_SECRET || 'dbwqondewu9bbfsdcdbcknsubdfisbczjvcwuecuivjsdcbjhdhcdw'
}

module.exports = config