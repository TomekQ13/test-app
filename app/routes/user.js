const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const client = require('../db')
const { v4: uuidv4 } = require('uuid')
const config = require('../config')
const {authenticateSession} = require('../session')

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/login', async (req, res) => {
    console.log('here')
    let resp = await client.query(
        'select id, password, username from users where username = $1',
        [req.body.username]
    )

    if (resp.rows.length === 0) {
        return res.redirect('/login')
    }

    const existingUser = resp.rows[0]
    const compare = await bcrypt.compare(req.body.password, existingUser.password)
    if (!compare) {
        return res.redirect('/login')
    } 
    req.authenticateSession = authenticateSession
    req.authenticateSession(existingUser.id)
    return res.redirect('/')
})


router.post('/register', async (req, res) => {
    let user
    try {
        user = await client.query('select 1 from users where username = $1', [req.body.username])
    } catch (e) {
        console.error(e)
    }
    // if user alrady exists with this username
    if (user.rows.length > 0) return res.redirect('/register')

    // if password is too short
    if (req.body.password.length < config.minPasswordLength) return res.redirect('/register')  
    
    // if username is too short
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