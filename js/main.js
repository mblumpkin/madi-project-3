window.addEventListener("DOMContentLoaded", () => {

const bg = document.getElementById('bg')
const sand = document.getElementById('sand')

const bgCtx = bg.getContext('2d')
const ctx = sand.getContext('2d')

/* CRISP IMAGE RENDERING */
bgCtx.imageSmoothingEnabled = false
ctx.imageSmoothingEnabled = false

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

let currentColor = "#e6d3a3"

const colorPicker = document.getElementById("colorPicker")

if(colorPicker){
  currentColor = colorPicker.value

  colorPicker.addEventListener("input", e=>{
    currentColor = e.target.value
  })
}

let flow = 6

const flowSlider = document.getElementById("flowSlider")

if(flowSlider){
  flow = parseInt(flowSlider.value)

  flowSlider.addEventListener("input", e=>{
    flow = parseInt(e.target.value)
  })
}

let mouseDown = false
let mouseX = 0
let mouseY = 0

sand.addEventListener("mousedown", e=>{
  mouseDown = true
  updateMouse(e)
})

window.addEventListener("mouseup", ()=>{
  mouseDown = false
})

sand.addEventListener("mousemove", updateMouse)

function updateMouse(e){
  const rect = sand.getBoundingClientRect()

  mouseX = Math.floor((e.clientX - rect.left) / cell)
  mouseY = Math.floor((e.clientY - rect.top) / cell)
}

function spawnSand(){

  const spread = Math.floor(flow / 4) + 1

  for(let i=0; i < flow * 2; i++){

    const x = mouseX + rand(-spread, spread)
    const y = mouseY + rand(-spread, spread)

    if(x < 0 || x >= cols || y < 0 || y >= rows) continue

    const index = idx(x,y)

    if(!grid[index]){
      grid[index] = 1
      colorGrid[index] = varyColor(currentColor)
    }
  }
}

const ocean = new Audio("./audio/oceansounds.mp3")
ocean.loop = true
ocean.volume = 0.35

const overlay = document.getElementById("startOverlay")
const enterBtn = document.getElementById("enterBtn")

enterBtn.addEventListener("click", () => {
  overlay.style.display = "none"
  ocean.play().catch(()=>{})
})


let time = 0

function drawBackground(){
  bgCtx.clearRect(0,0,W,H)

  time += 0.001
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
      (b.y + Math.sin(time*2 + b.flap)*0.01) * H

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
      const nx = x + dir

      if(nx >= 0 && nx < cols){
        const diag = idx(nx, y+1)
        if(!grid[diag]){
          grid[diag] = 1
          colorGrid[diag] = colorGrid[i]
          grid[i] = 0
        }
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

const crabImg = new Image()
crabImg.src = "./img/crab.png"

let crab = {
  x: 200,
  dir: 1,
  speed: 0.6,
  bob: 0
}

function updateCrab(){
  crab.bob += 0.18

  if(!crabImg.complete) return

  const width = crabImg.width * 0.07

  crab.x += crab.dir * crab.speed

  if(crab.x <= 0) crab.dir = 1
  if(crab.x >= W - width) crab.dir = -1
}

function drawCrab(){

  if(!crabImg.complete) return

  const scale = 0.07
  const width = crabImg.width * scale
  const height = crabImg.height * scale

  const y = H - height - 2
  const bob = Math.sin(crab.bob) * 2

  bgCtx.save()

  bgCtx.translate(crab.x + width/2, y + height/2 + bob)
  bgCtx.scale(crab.dir, 1)

  bgCtx.drawImage(
    crabImg,
    -width/2,
    -height/2,
    width,
    height
  )

  bgCtx.restore()
}

function varyColor(hex){
  const c = hexToRgb(hex)
  const v = 12

  const r = Math.max(0, Math.min(255, c.r + rand(-v,v)))
  const g = Math.max(0, Math.min(255, c.g + rand(-v,v)))
  const b = Math.max(0, Math.min(255, c.b + rand(-v,v)))

  return `rgb(${r},${g},${b})`
}

function rand(a,b){
  return Math.floor(Math.random()*(b-a+1)+a)
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

  if(mouseDown){
    spawnSand()
  }

  drawBackground()

  updateCrab()
  drawCrab()

  updateSand()
  drawSand()

  requestAnimationFrame(loop)
}

loop()

})