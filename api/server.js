// See https://github.com/typicode/json-server#module
const jsonServer = require('json-server')
const fs = require('fs')
const path = require('path')

const server = jsonServer.create()
const filePath = path.join('db.json')
const data = fs.readFileSync(filePath, "utf-8")
const db = JSON.parse(data)
const router = jsonServer.router(db)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/api/*': '/$1?_save=true',
}))

// Middleware to save changes to db.json
server.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
        try {
            fs.writeFileSync(filePath, JSON.stringify(router.db.getState(), null, 2));
        } catch (error) {
            console.error('Error saving changes to db.json:', error);
            return res.status(500).send('Error saving changes to db.json');
        }
    }
    next();
});

server.use(router)
server.listen(3001, () => {
    console.log('JSON Server is running')
})

// Export the Server API
module.exports = server
