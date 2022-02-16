const client = require('./db')

async function checkAuthenticated(req, res, next) {
    // request comes without the sessionId
    if (!req.signedCookies['sessionId']) return res.redirect('/login')

    const dbSessionId = await client.query(
        'select 1 from session_ids where id = $1 and valid_to >= now()',
        [req.signedCookies['sessionId']])
    if (dbSessionId) {
        return next()
    } else {
        return res.redirect('/login')
    }
}



module.exports = checkAuthenticated