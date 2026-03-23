import { createServer } from 'node:http'
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

const DB_FILE = './db.json'

async function initDB() {
    if (!existsSync(DB_FILE)) {
        await fs.writeFile(DB_FILE, JSON.stringify([]))
    }
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let buffer = ''
        req.on('data', (chunk) => {
            buffer += chunk.toString()
        })
        req.on('end', () => {
            resolve(buffer)
        })
        req.on('error', (error) => {
            reject(error)
        })
    })
}

const server = createServer(async (req, res) => {
    try {
        if (req.url === '/expenses' && req.method === 'POST') {
            const body = await readBody(req)
            let expense

            try {
                expense = JSON.parse(body)
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }))
                return
            }

            const fileData = await fs.readFile(DB_FILE, 'utf8')
            const db = fileData ? JSON.parse(fileData) : []

            db.push(expense)
            await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2))

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Expense added' }))
        } else if (req.url === '/expenses' && req.method === 'GET') {
            const data = await fs.readFile(DB_FILE, 'utf8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(data)
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Route not found' }))
        }
    } catch (error) {
        console.error('Server Error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
    }
})

initDB().then(() => {
    server.listen(3000, () => {
        console.log('Expense Tracker Server running on http://localhost:3000')
    })
})
