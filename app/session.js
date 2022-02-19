const client = require("./db")
const { v4: uuidv4 } = require('uuid')
const config = require('./config')

async function issueSessionId() {
    console.log('issuing new session_id')
    const sessionId = uuidv4()
    let currentTime = new Date()
    currentTime.setSeconds(currentTime.getSeconds() + config.cookieAgeInSeconds)

    try {
        await client.query(
            'insert into session_ids (id, valid_to) values ($1, $2)', 
            [sessionId, currentTime]
        )
    } catch (e) {
        console.error(e)
    }
    this.cookie('sessionId', sessionId, {maxAge: 1000 * config.cookieAgeInSeconds, httpOnly: true, signed: true})
    console.log('session id issued')
}

function session() {
    // this middleware must be before checking if the session is authenticated
    return async (req, res, next) => {
        req.session = {}
        res.issueSessionId = issueSessionId
        // if request comes without a sessionId cookie
        if (!req.signedCookies['sessionId']) {
            await res.issueSessionId()
            return next()
        }
        const session = await client.query(
            'select id, params, user_id from session_ids where id = $1 and valid_to >= now()',
            [req.signedCookies['sessionId']]
        )

        // session does not exist or is past the valid to date
        if (!session.rows.length === 0) {
            await res.issueSessionId()
            return next()
        }
        req.session = session.rows[0]
        console.log(req.session)
        next()
    }
}

async function authenticateSession(userId) {
    // check for session object
    if (this.session === undefined) return console.error('session is required for session authentication')

    this.session.user_id = userId
    try {
        await client.query(
            'update session_ids set user_id = $1 where id = $2',
            [userId, this.session.id]
        )
    } catch(e) {
        console.error(e)
    }
    console.log('session authenticated')

}

module.exports = {session, authenticateSession}