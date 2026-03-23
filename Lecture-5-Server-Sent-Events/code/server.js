import { createServer } from 'node:http'
import * as fs from 'node:fs'

const server = createServer(async (req, res) => {

  if (req.url === '/') {
    // Serve the HTML page first
    const htmlPage = fs.createReadStream('./stream.html')
    htmlPage.pipe(res)  // Stream the file directly to response
  }

  else if (req.url === '/stream') {
    // THIS is where SSE happens

    // Step 1: Write the special SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',  // Magic header
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    // Step 2: Set up a counter
    let count = 0

    // Step 3: Send data every second
    setInterval(() => {
      count++
      // Step 4: Write in SSE format — "data: " prefix + double newline
      res.write(`data: The count is ${count}\n\n`)
    }, 1000)

    // Notice: res.end() is NEVER called!
    // The connection stays open indefinitely
  }
})

server.listen(3000, () => {
  console.log('Server is listening on port 3000')
})