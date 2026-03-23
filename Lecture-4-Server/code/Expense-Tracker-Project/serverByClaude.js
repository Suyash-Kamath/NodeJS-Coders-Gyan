import { createServer } from 'node:http'
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const DB_FILE = './db.json'

// Initialize db.json if it doesn't exist
async function initDB() {
    if (!existsSync(DB_FILE)) {
        await fs.writeFile(DB_FILE, JSON.stringify([]))
    }
}

// Read all expenses from db.json
async function readExpenses() {
    const data = await fs.readFile(DB_FILE, 'utf8')
    return JSON.parse(data)
}

// Write expenses to db.json
async function writeExpenses(expenses) {
    await fs.writeFile(DB_FILE, JSON.stringify(expenses, null, 2))
}

// Read request body
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
    console.log(`${req.method} ${req.url}`)

    // CORS headers so frontend can access this API
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }

    try {

        // GET /api/expenses - get all expenses
        if (req.url === '/api/expenses' && req.method === 'GET') {
            const expenses = await readExpenses()

            const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
                expenses,
                total: total.toFixed(2),
                count: expenses.length
            }))
        }

        // POST /api/expenses - create new expense
        else if (req.url === '/api/expenses' && req.method === 'POST') {
            const body = await readBody(req)
            const { name, amount } = JSON.parse(body)

            // Validation
            if (!name || !amount) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Name and amount are required' }))
                return
            }

            if (isNaN(amount) || Number(amount) <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Amount must be a positive number' }))
                return
            }

            const expenses = await readExpenses()

            const newExpense = {
                id: Date.now(),
                name: name.trim(),
                amount: Number(amount),
                date: new Date().toISOString()
            }

            expenses.push(newExpense)
            await writeExpenses(expenses)

            res.writeHead(201, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
                message: 'Expense created successfully',
                expense: newExpense
            }))
        }

        // DELETE /api/expenses/:id - delete an expense
        else if (req.url.startsWith('/api/expenses/') && req.method === 'DELETE') {
            const id = Number(req.url.split('/')[3])

            if (isNaN(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Invalid expense ID' }))
                return
            }

            const expenses = await readExpenses()
            const expenseIndex = expenses.findIndex(e => e.id === id)

            if (expenseIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Expense not found' }))
                return
            }

            const deletedExpense = expenses.splice(expenseIndex, 1)[0]
            await writeExpenses(expenses)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
                message: 'Expense deleted successfully',
                expense: deletedExpense
            }))
        }

        // GET / - serve the frontend HTML
        else if (req.url === '/' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'text/html' })

            const htmlStream = (await import('node:fs')).default.createReadStream('./index.html')
            htmlStream.pipe(res)
        }

        // 404 - route not found
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Route not found' }))
        }

    } catch (error) {
        console.error('Server Error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
    }
})

// Start server
initDB().then(() => {
    server.listen(3000, () => {
        console.log('Expense Tracker Server running on http://localhost:3000')
    })
})