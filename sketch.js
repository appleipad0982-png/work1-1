// === 電流急急棒 完整版 ===
let touched = false;      // 是否碰到鐵線
let prevTouched = false;  // 上一幀是否碰到
let errorCount = 0;       // 失誤次數
let gameState = "start";  // 遊戲狀態：start / playing / win
let osc;                  // 音效振盪器
let startTime = 0;        // 遊戲開始時間（毫秒）
let finalTime = 0;        // 過關時間（毫秒）

function setup() {
  createCanvas(600, 400);
  textFont("monospace");
  
  // 初始化音效振盪器（方波模擬嗶聲）
  osc = new p5.Oscillator("square");
  osc.freq(880);
  osc.amp(0);
  osc.start();
}

// 播放碰撞嗶聲
function playBuzz() {
  osc.amp(0.3, 0.01);
  osc.amp(0, 0.15);
}

// 繪製金屬質感鐵線
function drawWire() {
  let wireColors = [
    color(60, 60, 60),
    color(160, 160, 160),
    color(240, 240, 240),
    color(160, 160, 160),
    color(60, 60, 60)
  ];
  let offsets = [-8, -4, 0, 4, 8];
  
  for (let i = 0; i < wireColors.length; i++) {
    stroke(wireColors[i]);
    strokeWeight(4);
    noFill();
    beginShape();
    vertex(50, 200 + offsets[i]);
    bezierVertex(150, 50 + offsets[i], 250, 350 + offsets[i],
                 350, 200 + offsets[i]);
    bezierVertex(400, 100 + offsets[i], 500, 300 + offsets[i],
                 550, 200 + offsets[i]);
    endShape();
  }
}

// 繪製起點與終點圓圈
function drawEndpoints() {
  noStroke();
  // 起點（綠色）
  fill(0, 200, 0);
  circle(50, 200, 50);
  fill(255);
  textSize(11);
  textAlign(CENTER, CENTER);
  text("START", 50, 200);
  
  // 終點（紅色）
  fill(200, 0, 0);
  circle(550, 200, 50);
  fill(255);
  text("END", 550, 200);
}

// 偵測環是否碰到鐵線（白色像素採樣）
function detectCollision() {
  let r = 15;
  for (let angle = 0; angle < 360; angle += 30) {
    let px = int(mouseX + r * cos(radians(angle)));
    let py = int(mouseY + r * sin(radians(angle)));
    let c = get(px, py);
    if (red(c) > 180 && green(c) > 180 && blue(c) > 180) {
      return true;
    }
  }
  return false;
}

// 繪製「再玩一次」按鈕
function drawRestartButton() {
  let bx = width / 2, by = height / 2 + 100;
  let bw = 160, bh = 40;
  let over = mouseX > bx - bw / 2 && mouseX < bx + bw / 2 &&
             mouseY > by - bh / 2 && mouseY < by + bh / 2;
  fill(over ? color(255) : color(200));
  stroke(255);
  strokeWeight(2);
  rectMode(CENTER);
  rect(bx, by, bw, bh, 8);
  fill(0);
  noStroke();
  textSize(18);
  textAlign(CENTER, CENTER);
  text("再玩一次", bx, by);
  rectMode(CORNER);
}

function mousePressed() {
  if (gameState === "start") {
    // 點擊開始遊戲
    gameState = "playing";
    errorCount = 0;
    startTime = millis();
  } else if (gameState === "win") {
    // 點擊再玩一次按鈕
    let bx = width / 2, by = height / 2 + 100;
    let bw = 160, bh = 40;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 &&
        mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      gameState = "start";
    }
  }
}

function draw() {
  // ── 開始畫面 ──
  if (gameState === "start") {
    background(0);
    fill(255);
    noStroke();
    textSize(28);
    textAlign(CENTER, CENTER);
    text("⚡ 電流急急棒", width / 2, height / 2 - 30);
    textSize(18);
    fill(180);
    text("點擊畫面開始遊戲", width / 2, height / 2 + 20);
    return;
  }
  
  // ── 過關畫面 ──
  if (gameState === "win") {
    background(0, 80, 0);
    fill(255);
    noStroke();
    textSize(36);
    textAlign(CENTER, CENTER);
    text("🎉 恭喜過關！", width / 2, height / 2 - 50);
    textSize(20);
    text("失誤次數：" + errorCount + " 次", width / 2, height / 2);
    text("完成時間：" + nf(finalTime / 1000, 1, 1) + " 秒", width / 2, height / 2 + 40);
    drawRestartButton();
    return;
  }
  
  // ── 遊戲進行中 ──
  let elapsed = millis() - startTime;
  
  // 背景：碰觸鐵線時閃紅
  background(touched ? color(160, 0, 0) : color(20));
  
  // 繪製鐵線與端點
  drawWire();
  drawEndpoints();
  
  // 碰撞偵測
  touched = detectCollision();
  if (touched && !prevTouched) {
    errorCount++;
    playBuzz();
  }
  prevTouched = touched;
  
  // 終點判定
  if (dist(mouseX, mouseY, 550, 200) < 25) {
    finalTime = elapsed;
    gameState = "win";
  }
  
  // 繪製玩家的環
  stroke(touched ? color(255, 50, 50) : color(50, 180, 255));
  strokeWeight(3);
  noFill();
  circle(mouseX, mouseY, 30);
  
  // HUD 顯示
  noStroke();
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text("失誤：" + errorCount, 10, 10);
  textAlign(RIGHT, TOP);
  text("時間：" + nf(elapsed / 1000, 1, 1) + " 秒", width - 10, 10);
}
