import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')

const PORT = process.env.PORT || 3000

function computeCPUUsage(oldCPUs, newCPUs) {
  return newCPUs.map((cpu, i) => {
    const oldTimes = oldCPUs[i].times
    const newTimes = cpu.times

    const oldTotal = Object.values(oldTimes).reduce((a, b) => a + b, 0)
    const newTotal = Object.values(newTimes).reduce((a, b) => a + b, 0)

    const idle = newTimes.idle - oldTimes.idle
    const total = newTotal - oldTotal
    const used = total - idle

    const percent = total === 0 ? 0 : (100 * used) / total

    return {
      core: i,
      usage: Number(percent.toFixed(1))
    }
  })
}

function getMemoryUsage() {
  const usedBytes = os.totalmem() - os.freemem()
  const totalBytes = os.totalmem()
  const usedGB = usedBytes / (1024 * 1024 * 1024)
  const totalGB = totalBytes / (1024 * 1024 * 1024)
  const percent = totalBytes === 0 ? 0 : (100 * usedBytes) / totalBytes

  return {
    usedGB: Number(usedGB.toFixed(2)),
    totalGB: Number(totalGB.toFixed(2)),
    percent: Number(percent.toFixed(1))
  }
}

function getLoadAverage() {
  const [one, five, fifteen] = os.loadavg()
  return {
    one: Number(one.toFixed(2)),
    five: Number(five.toFixed(2)),
    fifteen: Number(fifteen.toFixed(2))
  }
}

async function getDiskUsage() {
  try {
    const stats = await fs.statfs(__dirname)
    const totalBytes = stats.blocks * stats.bsize
    const freeBytes = stats.bavail * stats.bsize
    const usedBytes = totalBytes - freeBytes

    const usedGB = usedBytes / (1024 * 1024 * 1024)
    const totalGB = totalBytes / (1024 * 1024 * 1024)
    const percent = totalBytes === 0 ? 0 : (100 * usedBytes) / totalBytes

    return {
      usedGB: Number(usedGB.toFixed(2)),
      totalGB: Number(totalGB.toFixed(2)),
      percent: Number(percent.toFixed(1))
    }
  } catch {
    return null
  }
}

async function buildSnapshot(oldCPUs, newCPUs) {
  return {
    timestamp: new Date().toISOString(),
    cpu: computeCPUUsage(oldCPUs, newCPUs),
    memory: getMemoryUsage(),
    load: getLoadAverage(),
    disk: await getDiskUsage()
  }
}

async function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url
  const filePath = path.join(publicDir, urlPath)

  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }

    const ext = path.extname(filePath)
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8'
    }[ext] || 'application/octet-stream'

    const data = await fs.readFile(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not Found')
  }
}

function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })

  let oldCPUs = os.cpus()
  let sending = false

  const interval = setInterval(() => {
    if (sending) return
    sending = true

    const newCPUs = os.cpus()
    buildSnapshot(oldCPUs, newCPUs)
      .then((payload) => {
        oldCPUs = newCPUs
        res.write(`data: ${JSON.stringify(payload)}\n\n`)
      })
      .finally(() => {
        sending = false
      })
  }, 1000)

  req.on('close', () => {
    clearInterval(interval)
  })
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/stream') {
    handleSSE(req, res)
    return
  }

  if (req.url === '/api/snapshot') {
    if (req.method !== 'GET') {
      res.writeHead(405)
      res.end('Method Not Allowed')
      return
    }

    const oldCPUs = os.cpus()
    setTimeout(async () => {
      try {
        const newCPUs = os.cpus()
        const payload = await buildSnapshot(oldCPUs, newCPUs)
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(payload))
      } catch {
        res.writeHead(500)
        res.end('Internal Server Error')
      }
    }, 1000)
    return
  }

  if (req.method !== 'GET') {
    res.writeHead(405)
    res.end('Method Not Allowed')
    return
  }

  serveStatic(req, res)
})

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
