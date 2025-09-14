//設定関係UI 変数定義
const playButton=document.getElementById("playButton");
const resetButton=document.getElementById("resetButton");
const waveSourceTable=document.getElementById("wavePointTable");
const objectTable=document.getElementById("objectTable");


//シミュレーション本体　変数定義
const waveCanvas = document.getElementById("waveCanvas");
const viewCanvas = document.getElementById("viewCanvas");
const waveCtx = waveCanvas.getContext("2d");
const viewCtx = viewCanvas.getContext("2d");

const N = 200;                 // 格子の数
const c = 3;                   // 波速
const dx = 1.0;
const dt = 0.1;
const lambda = (c*c)*(dt*dt)/(dx*dx);
var isPlaying=false;

let uPrev = Array.from({length: N}, () => Array(N).fill(0));
let u = Array.from({length: N}, () => Array(N).fill(0));
let uNext = Array.from({length: N}, () => Array(N).fill(0));
let isObj = Array.from({length: N}, () => Array(N).fill(false));


draw();
loop();




function playButton_Click(){
    isPlaying=!isPlaying;
    playButton.innerText=isPlaying?"Pause":"Play";
}
function resetButton_Click(){
    //Reset();
    UpdateCanvasData();
    draw();
}

function UpdateCanvasData(){//tableのデータを参照して波源と障害物を設置
    Reset();

    document.querySelectorAll("#wavePointTable tr").forEach((tr, i) => {
      if (i < 2) return; // ヘッダー行はスキップ
      const x = tr.querySelector(".wave-x").value;
      const y = tr.querySelector(".wave-y").value;
      if(x && y){
        u[y][x]=10;
      }
    });
    document.querySelectorAll("#objectTable tr").forEach((tr, i) => {
      if (i < 2) return; // ヘッダー行はスキップ
      const xs = tr.querySelector(".object-xs").value;
      const xe = tr.querySelector(".object-xe").value;
      const ys = tr.querySelector(".object-ys").value;
      const ye = tr.querySelector(".object-ye").value;
      if(xs && xe && ys && ye){
        for(let i = ys; i<ye; i++){
          for(let j= xs; j<xe; j++){
            isObj[i][j]=true;
          }
        }
      }
    });

    draw();
}

function AddWaveSourceRow(){
    const row = waveSourceTable.insertRow();
    row.insertCell().innerHTML = `<input type="number" class="wave-x">`;
    row.insertCell().innerHTML = `<input type="number" class="wave-y">`;
    row.insertCell().innerHTML = `<button onclick="deleteRow(this)" class="removeRowButton">×</button>`;
}
function AddObjectRow(){
    const row = objectTable.insertRow();
    row.insertCell().innerHTML = `<input type="number" class="object-xs">`;
    row.insertCell().innerHTML = `<input type="number" class="object-xe">`;
    row.insertCell().innerHTML = `<input type="number" class="object-ys">`;
    row.insertCell().innerHTML = `<input type="number" class="object-ye">`;
    row.insertCell().innerHTML = `<button onclick="deleteRow(this)" class="removeRowButton">×</button>`;
}
function deleteRow(btn){
  const row=btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
}


function Reset(){//シミュレーション時間を0にする
    uPrev = Array.from({length: N}, () => Array(N).fill(0));
    u = Array.from({length: N}, () => Array(N).fill(0));
    uNext = Array.from({length: N}, () => Array(N).fill(0));
    isObj = Array.from({length: N}, () => Array(N).fill(false));

}


function Init(){//初期化
    Reset();
    draw();
    while(waveSourceTable.rows.length>2){
      waveSourceTable.deleteRow(waveSourceTable.rows.length-1);
    }
    while(objectTable.rows.length>2){
      objectTable.deleteRow(objectTable.rows.length-1);
    }
}



function loop() {
    if(isPlaying){
        step();
        draw();
    }
    requestAnimationFrame(loop);
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

