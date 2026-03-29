window.addEventListener("DOMContentLoaded", () => {

const bg = document.getElementById('bg')
const sand = document.getElementById('sand')

const bgCtx = bg.getContext('2d')
const ctx = sand.getContext('2d')

let W, H

const cell = 5
let cols, rows
let grid
let colorGrid

function resize(){
  W = bg.width = sand.width = window.innerWidth
  H = bg.height = sand.height = window.innerHeight
  initSand()
}

window.addEventListener('resize', resize)
resize()

const ocean = new Audio("./audio/oceansounds.mp3")

ocean.loop = true
ocean.volume = 0.35

window.addEventListener("mousedown", () => {
  ocean.play().catch(()=>{})
}, { once:true })

let time = 0

function drawBackground(){
  bgCtx.clearRect(0,0,W,H)

  time += 0.0005
  const day = (Math.sin(time) + 1) / 2

  const skyTop = lerpColor("#87c7ff", "#0b1d3a", 1-day)
  const skyBottom = lerpColor("#ffd7a3", "#091426", 1-day)

  const g = bgCtx.createLinearGradient(0,0,0,H)
  g.addColorStop(0, skyTop)
  g.addColorStop(1, skyBottom)

  bgCtx.fillStyle = g
  bgCtx.fillRect(0,0,W,H)

  drawSun(day)
  drawWater(day)
  drawWaves(day)
  drawBirds(day)
}

function drawSun(day){
  const x = W * (0.2 + day * 0.6)
  const y = H * (0.25 + (1-day) * 0.55)

  const r = 120

  const g = bgCtx.createRadialGradient(x,y,0,x,y,r)
  g.addColorStop(0, `rgba(255,220,160,${0.6*day})`)
  g.addColorStop(1, "rgba(255,200,120,0)")

  bgCtx.fillStyle = g
  bgCtx.beginPath()
  bgCtx.arc(x,y,r,0,Math.PI*2)
  bgCtx.fill()
}

function drawWater(day){
  const horizon = H * 0.55

  const g = bgCtx.createLinearGradient(0,horizon,0,H)
  g.addColorStop(0, lerpColor("#3ec6d3", "#091a2f", 1-day))
  g.addColorStop(1, lerpColor("#1ea0b6", "#02060f", 1-day))

  bgCtx.fillStyle = g
  bgCtx.fillRect(0,horizon,W,H)

  for(let i=0;i<20;i++){
    bgCtx.globalAlpha = 0.06
    bgCtx.fillStyle = "white"

    const y =
      horizon +
      i * 6 +
      Math.sin(time * 3 + i) * 4

    bgCtx.fillRect(
      (i * 200 + time * 200) % W,
      y,
      220,
      3
    )
  }

  bgCtx.globalAlpha = 1
}

function drawWaves(day){
  const horizon = H * 0.55

  for(let i=0;i<3;i++){

    const y =
      horizon +
      40 +
      i*35 +
      Math.sin(time*2 + i)*8

    const amplitude = 18 + i*6
    const wavelength = 220 - i*40

    bgCtx.beginPath()

    for(let x=0; x<=W; x+=8){

      const waveY =
        y +
        Math.sin((x/wavelength) + time*3 + i) * amplitude

      if(x === 0)
        bgCtx.moveTo(x, waveY)
      else
        bgCtx.lineTo(x, waveY)
    }

    bgCtx.strokeStyle = `rgba(255,255,255,${0.35 - i*0.08})`
    bgCtx.lineWidth = 3 - i*0.7
    bgCtx.stroke()

    bgCtx.strokeStyle = "rgba(255,255,255,0.15)"
    bgCtx.lineWidth = 6 - i
    bgCtx.stroke()
  }
}

let birds = []

function generateBirds(){
  birds = []

  for(let i=0;i<8;i++){
    birds.push({
      x: Math.random(),
      y: 0.12 + Math.random()*0.18,
      speed: 0.00015 + Math.random()*0.0002,
      size: 8 + Math.random()*6,
      flap: Math.random()*10
    })
  }
}

generateBirds()

function drawBirds(day){

  bgCtx.strokeStyle = `rgba(0,0,0,${0.5*day})`
  bgCtx.lineWidth = 2

  birds.forEach(b=>{

    b.x += b.speed
    if(b.x > 1.2) b.x = -0.2

    const x = b.x * W
    const y =
      (b.y + Math.sin(time*2 + b.flap)*0.01)
      * H

    const wing =
      Math.sin(time*12 + b.flap)
      * b.size * 0.6

    bgCtx.beginPath()
    bgCtx.moveTo(x - b.size, y)
    bgCtx.quadraticCurveTo(x, y + wing, x + b.size, y)
    bgCtx.stroke()

  })
}

function initSand(){
  cols = Math.floor(W / cell)
  rows = Math.floor(H / cell)

  grid = new Uint8Array(cols * rows)
  colorGrid = new Array(cols * rows)
}

function idx(x,y){
  return x + y * cols
}

function updateSand(){
  for(let y = rows-2; y>=0; y--){
    for(let x=0; x<cols; x++){
      const i = idx(x,y)
      if(!grid[i]) continue

      const below = idx(x,y+1)

      if(!grid[below]){
        grid[below] = 1
        colorGrid[below] = colorGrid[i]
        grid[i] = 0
        continue
      }

      const dir = Math.random() < 0.5 ? -1 : 1
      const diag = idx(x+dir, y+1)

      if(x+dir >=0 && x+dir < cols && !grid[diag]){
        grid[diag] = 1
        colorGrid[diag] = colorGrid[i]
        grid[i] = 0
      }
    }
  }
}

function drawSand(){
  ctx.clearRect(0,0,W,H)

  const r = cell * 0.65  

  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      const i = idx(x,y)
      if(!grid[i]) continue

      ctx.fillStyle = colorGrid[i]

      ctx.beginPath()
      ctx.arc(
        x*cell + cell*0.5,
        y*cell + cell*0.5,
        r,
        0,
        Math.PI*2
      )
      ctx.fill()
    }
  }
}

let drawing = false
let sandColor = "#f4c27a"
let flow = 6

sand.addEventListener('mousedown', ()=> drawing = true)
window.addEventListener('mouseup', ()=> drawing = false)

sand.addEventListener('mousemove', e=>{
  if(!drawing) return

  const rect = sand.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / cell)
  const y = Math.floor((e.clientY - rect.top) / cell)

  for(let i=0;i<flow;i++){
    const rx = x + Math.floor((Math.random()-0.5)*3)
    const ry = y + Math.floor((Math.random()-0.5)*3)

    if(rx>=0 && rx<cols && ry>=0 && ry<rows){
      const id = idx(rx,ry)
      grid[id] = 1
      colorGrid[id] = varyColor(sandColor)
    }
  }
})


const picker = document.getElementById('colorPicker')
const flowSlider = document.getElementById('flow')
const clearBtn = document.getElementById('clear')

picker.addEventListener('input', e=> sandColor = e.target.value)
flowSlider.addEventListener('input', e=> flow = +e.target.value)

clearBtn.addEventListener('click', initSand)

function varyColor(hex){
  const c = hexToRgb(hex)
  const v = 10

  c.r += rand(-v,v)
  c.g += rand(-v,v)
  c.b += rand(-v,v)

  return `rgb(${c.r},${c.g},${c.b})`
}

function rand(a,b){
  return Math.floor(Math.random()*(b-a)+a)
}

function hexToRgb(hex){
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

function lerp(a,b,t){ return a + (b-a)*t }

function lerpColor(a,b,t){
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)

  const r = Math.floor(lerp(ca.r, cb.r, t))
  const g = Math.floor(lerp(ca.g, cb.g, t))
  const b2 = Math.floor(lerp(ca.b, cb.b, t))

  return `rgb(${r},${g},${b2})`
}

function loop(){
  drawBackground()
  updateSand()
  drawSand()
  requestAnimationFrame(loop)
}

loop()

})