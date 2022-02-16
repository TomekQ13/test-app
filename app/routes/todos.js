const express = require('express')
const router = express.Router()
const client = require('../db')
const { v4: uuidv4 } = require('uuid');
const checkAuthenticated= require('../auth')

router.get('/', checkAuthenticated, async (_req, res) => {
    let todos
    try {
        todos = await client.query('select id, text, done from todos')
    } catch (e) {
        console.error(e)
    }
    todos_todo = todos.rows.filter(todo => todo.done === false)
    todos_done = todos.rows.filter(todo => todo.done === true)

    res.render('index', {todos_todo: todos_todo, todos_done: todos_done})
})

router.post('/', async (req, res) => {
    let response
    try {
        response  = await client.query('insert into todos (id, text) values ($1, $2)', [uuidv4(), req.body.text])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

router.put('/:id', async(req, res) => {
    try {
        await client.query('update todos set done = true where id = $1', [req.params.id])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

router.delete('/:id', async (req, res) => {
    try {
        await client.query('delete from todos where id = $1', [req.params.id])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

module.exports = router