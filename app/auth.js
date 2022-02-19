function checkAuthenticated() {
    return (req, res, next) => {
        console.log('checking auth')
        // this middleware must be after issuing session id
        if (!req.session) return console.error('req.session is required before checking authentication')

        // session is not authenticated
        if (!req.session.user_id) return res.redirect('/login')

        next()
    }
}

function checkNotAuthenticated(redirectRoute) {
    return (req, res, next) => {
        // this middleware must be after issuing session id
        if (!req.session) return console.error('req.session is required before checking authentication')

        // session is authenticated
        if (req.session.user_id) return res.redirect(redirectRoute)

        next()
    }
}

module.exports = {checkAuthenticated, checkNotAuthenticated}