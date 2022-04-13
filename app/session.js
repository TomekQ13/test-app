const client = require("./db")
const { v4: uuidv4 } = require('uuid')
const config = require('./config')

async function createSession(sessionId, validTo) {
    let resp;
    try {
        resp = await client.query(
            `insert into session_ids (id, valid_to)
            values ($1, $2)`, 
            [sessionId, validTo]
        )
    } catch (e) {
        console.error(e)
    }
    return resp
}

async function getSession(cookieId) {
    let session
    try {
        session = await client.query(
            'select id, params, user_id from session_ids where id = $1 and valid_to >= now()',
            [cookieId]
        )
    } catch (e) {
        console.error(e)
        return undefined
    }
    if (session.rowCount === 1) return session.rows[0]
    return undefined
}


async function issueSessionId() {
    console.log('issuing new session_id')
    const sessionId = uuidv4()
    let currentTime = new Date()
    currentTime.setSeconds(currentTime.getSeconds() + config.cookieAgeInSeconds)

    createSession(sessionId, currentTime)
    this.cookie('sessionId', sessionId, {maxAge: 1000 * config.cookieAgeInSeconds, httpOnly: true, signed: true})
    console.log('session id issued')
}

function session() {
    // this middleware must be before checking if the session is authenticated
    return async (req, res, next) => {
        req.session = {}
        // res.issueSessionId = issueSessionId
        const session = await getSession(req.signedCookies['sessionId'])
        // if request comes without a sessionId cookie or session does not exist or is past the valid to date
        if (session === undefined || req.signedCookies['sessionId'] === undefined) {
            await issueSessionId.call(res)
            // await res.issueSessionId()
            return next()
        }
        req.session = session
        return next()
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