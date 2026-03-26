// JS scripts placed here
const beads = document.querySelectorAll(".bead");
const string = document.getElementById("string");

let stringVisible = false;
let placedCount = 0;

beads.forEach((bead, index) => {
  bead.style.left = Math.random() * window.innerWidth + "px";
  bead.style.top = Math.random() * window.innerHeight + "px";

  float(bead);
  enableDrag(bead);
});

function float(el) {
  let x = parseFloat(el.style.left);
  let y = parseFloat(el.style.top);

  let dx = (Math.random() - 0.5) * 0.3;
  let dy = (Math.random() - 0.5) * 0.3;

  function animate() {
    x += dx;
    y += dy;

    el.style.left = x + "px";
    el.style.top = y + "px";

    requestAnimationFrame(animate);
  }

  animate();
}

function enableDrag(el) {
  let offsetX = 0;
  let offsetY = 0;

  function onMouseMove(e) {
    el.style.left = (e.clientX - offsetX) + "px";
    el.style.top = (e.clientY - offsetY) + "px";
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    el.style.cursor = "grab";
    snapToString(el);
  }

  el.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

    el.style.cursor = "grabbing";

    // Show string on first interaction
    if (!stringVisible) {
      string.style.opacity = 1;
      stringVisible = true;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

function snapToString(el) {
  const stringRect = string.getBoundingClientRect();
  const beadRect = el.getBoundingClientRect();

  const beadCenterY = beadRect.top + beadRect.height / 2;

  if (Math.abs(beadCenterY - stringRect.top) < 40) {
    const spacing = 50;
    const startX = stringRect.left + 20;

    const newX = startX + (placedCount * spacing);
    const newY = stringRect.top;

    el.style.left = newX + "px";
    el.style.top = newY + "px";

    el.style.transform = "scale(1.2)";
    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 150);

    placedCount++;
  }
}