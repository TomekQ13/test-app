const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const client = require('../db')
const { v4: uuidv4 } = require('uuid')
const config = require('../config')

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

async function issueSessionId(res, userId) {
    const sessionId = uuidv4()
    let currentTime = new Date()
    currentTime.setSeconds(currentTime.getSeconds() + config.cookieAgeInSeconds)

    try {
        await client.query(
            'insert into session_ids (id, valid_to, user_id) values ($1, $2, $3)', 
            [sessionId, currentTime, userId]
        )
    } catch (e) {
        console.error(e)
    }
    res.cookie('sessionId', sessionId, {maxAge: 1000 * config.cookieAgeInSeconds, httpOnly: true, signed: true})
}


router.post('/login', async (req, res) => {
    let resp = await client.query(
        'select id, password, username from users where username = $1',
        [req.body.username]
    )    
    if (!resp.rows.length === 0) {
        return res.redirect('/login')
    }

    const existingUser = resp.rows[0]
    const compare = bcrypt.compare(req.body.password, existingUser.password)
    if (compare) {
        await issueSessionId(res, existingUser.id)
        return res.redirect('/')
    } 
    return res.redirect('/login')
})


router.post('/register', async (req, res) => {
    const user = await client.query('select 1 from users where username = $1', [req.body.username])
    // if user alrady exists with this username
    if (user.rows.length > 0) return res.redirect('/register')           

    // if password is too short
    if (req.body.password.length < config.minPasswordLength) return res.redirect('/register')  
    
    // if password is too short
    if (req.body.username.length < config.minUsernameLength) return res.redirect('/register')  

    // if repeated password do not match
    if (req.body.password != req.body.repeat_password) return res.redirect('/register')

    console.log('check fine')
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        await client.query(
            'insert into users (id, username, password) values ($1, $2, $3)',
            [uuidv4(), req.body.username, hashedPassword]
        )
    } catch (e) {
        console.error(e)
        return res.redirect('/register')
    }
    res.redirect('login')

})

module.exports = router