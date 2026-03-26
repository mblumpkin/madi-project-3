const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const cellSize = 3;
const cols = Math.floor(width / cellSize);
const rows = Math.floor(height / cellSize);

const grid = new Array(cols * rows).fill(null);

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

let currentColor = '#f4d03f';

const palette = [
  "#e9d5a1", 
  "#d8b48a",
  "#cfa18d", 
  "#b8c4a2", 
  "#9fb7c9", 
  "#d6a77a", 
  "#c9b29b", 
  "#a8a39e", 
  "#e8cfc4", 
  "#f1e4c8"  
];

const colorContainer = document.getElementById('colors');

palette.forEach((color, i) => {
  const div = document.createElement('div');
  div.className = 'color' + (i === 0 ? ' active' : '');
  div.style.background = color;

  div.onclick = () => {
    currentColor = color;
    document.querySelectorAll('.color').forEach(c => c.classList.remove('active'));
    div.classList.add('active');
  };

  colorContainer.appendChild(div);
});

function index(x, y) {
  return x + y * cols;
}

function insideJar(x, y) {
  const cx = width / 2;

  const top = 80;
  const neck = 130;
  const shoulder = 190;
  const bottom = height - 20;

  if (y < top || y > bottom) return false;

  let half;

  if (y < neck) {
    half = 70;
  } 
  else if (y < shoulder) {
    const t = (y - neck) / (shoulder - neck);
    half = 70 + Math.sin(t * Math.PI/2) * 60;
  } 
  else {
    half = 130;
  }

  return Math.abs(x - cx) < half;
}

canvas.addEventListener('mousedown', () => {
  mouseDown = true;
});

window.addEventListener('mouseup', () => {
  mouseDown = false;
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function addSand() {
  if (!mouseDown) return;

  const radius = 3;

  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;

    const px = mouseX + Math.cos(angle) * r;
    const py = mouseY + Math.sin(angle) * r;

    const x = Math.floor(px / cellSize);
    const y = Math.floor(py / cellSize);

    if (x < 0 || x >= cols || y < 0 || y >= rows) continue;

    if (!insideJar(px, py)) continue;

    const iIndex = index(x,y);

    if (!grid[iIndex]) {
      grid[iIndex] = currentColor;
    }
  }
}

function update() {
  for (let y = rows - 2; y >= 0; y--) {
    for (let x = 0; x < cols; x++) {
      const iIndex = index(x,y);
      const below = index(x,y+1);

      if (!grid[iIndex]) continue;

      if (!grid[below] && insideJar(x*cellSize,(y+1)*cellSize)) {
        grid[below] = grid[iIndex];
        grid[iIndex] = null;
        continue;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;

      const diag = index(x+dir, y+1);

      if (x+dir>=0 && x+dir<cols && !grid[diag] && insideJar((x+dir)*cellSize,(y+1)*cellSize)) {
        grid[diag] = grid[iIndex];
        grid[iIndex] = null;
      }
    }
  }
}

function drawJar() {
  const cx = width/2;

  const top = 90;
  const neck = 135;
  const shoulder = 210;
  const bottom = height - 20;

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;

  ctx.beginPath();

  // left
  ctx.moveTo(cx - 75, top);

  ctx.quadraticCurveTo(
    cx - 70, neck,
    cx - 125, shoulder
  );

  ctx.quadraticCurveTo(
    cx - 130, bottom,
    cx - 130, bottom
  );

  // bottom
  ctx.lineTo(cx + 130, bottom);

  // right
  ctx.quadraticCurveTo(
    cx + 130, bottom,
    cx + 125, shoulder
  );

  ctx.quadraticCurveTo(
    cx + 70, neck,
    cx + 75, top
  );

  ctx.stroke();

  // rim
  ctx.beginPath();
  ctx.ellipse(cx, top, 75, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0,0,width,height);

  for (let y=0;y<rows;y++){
    for (let x=0;x<cols;x++){
      const c = grid[index(x,y)];
      if (!c) continue;

      ctx.fillStyle = c;
      ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
    }
  }

  drawJar();
}

function loop() {
  addSand();
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

const lid = document.getElementById("lid");

lid.addEventListener("click", () => {
  resetJar();
});

function resetJar(){
  for(let i=0;i<grid.length;i++){
    grid[i] = null;
  }
}