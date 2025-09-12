const waveCanvas = document.getElementById("waveCanvas");
const viewCanvas = document.getElementById("viewCanvas");
const waveCtx = waveCanvas.getContext("2d");
const viewCtx = viewCanvas.getContext("2d");

const N = 200;                 // 格子の数
const c = 3;                   // 波速
const dx = 1.0;
const dt = 0.1;
const lambda = (c*c)*(dt*dt)/(dx*dx);

let uPrev = Array.from({length: N}, () => Array(N).fill(0));
let u = Array.from({length: N}, () => Array(N).fill(0));
let uNext = Array.from({length: N}, () => Array(N).fill(0));
let isObj = Array.from({length: N}, () => Array(N).fill(false));

// 初期条件：真ん中に波を入れる
u[100][50] = 1;
//u[Math.floor(N/2)][Math.floor(N/2)-20] = 3;

for(let i=0; i<N; i+=5){
    for(let j=100; j<N; j+=5){
        isObj[i][j]=true;
    }
}


function step() {
  for (let i = 1; i < N-1; i++) {
    for (let j = 1; j < N-1; j++) {
        if(isObj[i][j]){
            uNext[i][j]=0;
        }else{
            uNext[i][j] = 2*u[i][j] - uPrev[i][j] +
            lambda * (u[i+1][j] + u[i-1][j] + u[i][j+1] + u[i][j-1] - 4*u[i][j]);
        }
    }
  }

  // 更新
  [uPrev, u, uNext] = [u, uNext, uPrev];
}

function draw() {
  const img = waveCtx.createImageData(N, N);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      //const val = Math.floor((u[i][j] + 1) * 127); // -1〜1 → 0〜255
      const index = 4 * (i * N + j);
      if(isObj[i][j]){
        img.data[index] = 0;
        img.data[index+1] = 0;
        img.data[index+2] = 0;
        img.data[index+3] = 255;
      }else{
        const val=u[i][j]
        img.data[index] = Math.floor(255*val);      // R
        img.data[index+1] = (255*(1-Math.abs(val-0.5)*2));    // G
        img.data[index+2] = Math.floor(255*(1-val));    // B
        img.data[index+3] = 255;    // A
      }
      
    }
  }
  waveCtx.putImageData(img, 0, 0);

  viewCtx.imageSmoothingEnabled=true;
  viewCtx.drawImage(waveCanvas,0,0,viewCanvas.width,viewCanvas.height);
}

function loop() {
  step();
  draw();
  requestAnimationFrame(loop);
}
loop();