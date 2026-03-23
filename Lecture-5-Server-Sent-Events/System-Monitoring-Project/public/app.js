const statusDot = document.getElementById('statusDot')
const statusText = document.getElementById('statusText')
const memoryFill = document.getElementById('memoryFill')
const memoryMeta = document.getElementById('memoryMeta')
const diskFill = document.getElementById('diskFill')
const diskMeta = document.getElementById('diskMeta')
const load1 = document.getElementById('load1')
const load5 = document.getElementById('load5')
const load15 = document.getElementById('load15')
const coresContainer = document.getElementById('cores')
const latest = document.getElementById('latest')

const MAX_POINTS = 30
const coreHistory = []

function setStatus(state, text) {
  statusText.textContent = text
  if (state === 'connected') {
    statusDot.style.background = '#22c55e'
    statusDot.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.6)'
  } else if (state === 'error') {
    statusDot.style.background = '#ef4444'
    statusDot.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.6)'
  } else {
    statusDot.style.background = '#f59e0b'
    statusDot.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.6)'
  }
}

function updateHistory(cores) {
  cores.forEach((core) => {
    if (!coreHistory[core.core]) coreHistory[core.core] = []
    const series = coreHistory[core.core]
    series.push(core.usage)
    if (series.length > MAX_POINTS) series.shift()
  })
}

function sparklinePoints(values, width = 100, height = 30) {
  if (!values.length) return ''
  const step = values.length === 1 ? width : width / (values.length - 1)
  return values
    .map((v, i) => {
      const x = (i * step).toFixed(1)
      const y = (height - (v / 100) * height).toFixed(1)
      return `${x},${y}`
    })
    .join(' ')
}

function renderCores(cores) {
  updateHistory(cores)

  if (!coresContainer.children.length) {
    coresContainer.innerHTML = ''
    cores.forEach((core) => {
      const el = document.createElement('div')
      el.className = 'core'
      el.innerHTML = `
        <div class="label">Core ${core.core}</div>
        <div class="value" data-value>--</div>
        <div class="bar"><div class="fill" data-fill></div></div>
        <div class="sparkline">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline data-line points=""></polyline>
          </svg>
        </div>
      `
      coresContainer.appendChild(el)
    })
  }

  cores.forEach((core, index) => {
    const el = coresContainer.children[index]
    if (!el) return
    const valueEl = el.querySelector('[data-value]')
    const fillEl = el.querySelector('[data-fill]')
    const lineEl = el.querySelector('[data-line]')

    valueEl.textContent = `${core.usage.toFixed(1)}%`
    fillEl.style.width = `${core.usage}%`
    const points = sparklinePoints(coreHistory[core.core] || [])
    lineEl.setAttribute('points', points)
  })
}

function renderMemory(memory) {
  memoryFill.style.width = `${memory.percent}%`
  memoryMeta.textContent = `${memory.usedGB}GB / ${memory.totalGB}GB (${memory.percent}%)`

  if (memory.percent >= 80) {
    memoryFill.style.background = 'linear-gradient(90deg, #f97316, #ef4444)'
  } else if (memory.percent >= 60) {
    memoryFill.style.background = 'linear-gradient(90deg, #facc15, #f97316)'
  } else {
    memoryFill.style.background = 'linear-gradient(90deg, #22c55e, #22d3ee)'
  }
}

function renderDisk(disk) {
  if (!disk) {
    diskFill.style.width = '0%'
    diskFill.style.background = 'linear-gradient(90deg, #64748b, #94a3b8)'
    diskMeta.textContent = 'Unavailable'
    return
  }

  diskFill.style.width = `${disk.percent}%`
  diskMeta.textContent = `${disk.usedGB}GB / ${disk.totalGB}GB (${disk.percent}%)`

  if (disk.percent >= 85) {
    diskFill.style.background = 'linear-gradient(90deg, #f97316, #ef4444)'
  } else if (disk.percent >= 70) {
    diskFill.style.background = 'linear-gradient(90deg, #facc15, #f97316)'
  } else {
    diskFill.style.background = 'linear-gradient(90deg, #22c55e, #22d3ee)'
  }
}

function renderLoad(load) {
  load1.textContent = load.one.toFixed(2)
  load5.textContent = load.five.toFixed(2)
  load15.textContent = load.fifteen.toFixed(2)
}

function updateLatest(timestamp) {
  const time = new Date(timestamp)
  latest.textContent = `Last update: ${time.toLocaleTimeString()}`
}

setStatus('connecting', 'Connecting...')

const source = new EventSource('/stream')

source.onopen = () => {
  setStatus('connected', 'Connected')
}

source.onerror = () => {
  setStatus('error', 'Connection error')
}

source.onmessage = (event) => {
  const payload = JSON.parse(event.data)
  renderCores(payload.cpu)
  renderMemory(payload.memory)
  renderDisk(payload.disk)
  renderLoad(payload.load)
  updateLatest(payload.timestamp)
}
