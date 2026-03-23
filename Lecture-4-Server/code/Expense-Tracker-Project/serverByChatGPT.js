import http from 'node:http'
import fs from 'node:fs/promises'

const PORT = 3000
const DB_FILE = './db.json'

// 📌 Read DB
async function readDB() {
    const data = await fs.readFile(DB_FILE, 'utf-8')
    return JSON.parse(data)
}

// 📌 Write DB
async function writeDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2))
}

// 📌 Add Expense
async function addExpense(expense) {
    const db = await readDB()
    db.expenses.push(expense)
    await writeDB(db)
    return expense
}

// 📌 Get All Expenses
async function getExpenses() {
    const db = await readDB()
    return db.expenses
}

// 📌 Create Server
const server = http.createServer(async (req, res) => {

    // ➤ GET all expenses
    if (req.method === 'GET' && req.url === '/expenses') {
        const data = await getExpenses()

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(data))
    }

    // ➤ ADD expense
    else if (req.method === 'POST' && req.url === '/expenses') {
        let body = ''

        req.on('data', chunk => {
            body += chunk
        })

        req.on('end', async () => {
            const { title, amount } = JSON.parse(body)

            const newExpense = {
                id: Date.now(),
                title,
                amount
            }

            const saved = await addExpense(newExpense)

            res.writeHead(201, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(saved))
        })
    }

    else {
        res.writeHead(404)
        res.end('Route not found')
    }
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})