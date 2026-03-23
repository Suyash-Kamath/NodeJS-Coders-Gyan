import { createServer } from "node:http";
import fs from 'node:fs'

const server = createServer(async (req, res) => {
    console.log("Request Received....", req.url, req.method);

    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' })

        // const data =await fs.readFile('./index.html') // poori file server ki memory ke andhar store hota and send karta hai which is very bad..so we use streaming in nodejs
        
        // OLD WAY - manual streaming (verbose)
        // const dataStream = fs.createReadStream('./index.html')
        // dataStream.on('data', (chunk) => {
        //     res.write(chunk)
        // })
        // dataStream.on('end', () => {
        //     res.end()
        // })

        // NEW WAY - pipe (clean, handles backpressure automatically)
        const dataStream = fs.createReadStream('./index.html')
        dataStream.pipe(res)

    } else if (req.url === '/about' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h1>About Page</h1>')

    } else if (req.url === '/contact' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h1>Contact Page</h1>')

    } else if (req.url === '/api/users' && req.method === 'GET') {
        const users = [
            { id: 1, name: 'Rakesh', email: 'rakesh@example.com' },
            { id: 2, name: 'Priya', email: 'priya@example.com' },
            { id: 3, name: 'John', email: 'john@example.com' }
        ]
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(users))

    } else if (req.url === '/api/users' && req.method === 'POST') {
        let buffer = ''

        req.on('data', (chunk) => {
            buffer += chunk.toString()
        })

        req.on('end', () => {
            const newUser = JSON.parse(buffer)
            console.log('New User Created:', newUser)
            res.writeHead(201, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ 
                message: 'User created successfully', 
                user: newUser 
            }))
        })

    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end('<h1>404 - Page Not Found</h1>')
    }
})

server.listen(3000, () => {
    console.log('Server is listening on port 3000')
})