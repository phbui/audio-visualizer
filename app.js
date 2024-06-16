const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");
let audioContext;
let analyser;
let microphone;
let javascriptNode;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvasCtx.scale(dpr, dpr);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

startButton.onclick = async () => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024; // Increase FFT size for better frequency resolution
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(512, 1, 1); // Smaller buffer size to reduce latency

  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);
  javascriptNode.onaudioprocess = () => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    drawVisualizer(dataArray);
  };
};

stopButton.onclick = () => {
  audioContext.close();
};

function drawVisualizer(dataArray) {
  requestAnimationFrame(() => {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillStyle = "black";
    canvasCtx.fillRect(
      0,
      0,
      canvas.width / (window.devicePixelRatio || 1),
      canvas.height / (window.devicePixelRatio || 1)
    );

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    // Draw the main shape
    drawPolygon(dataArray, centerX, centerY, radius, 0);

    // Draw mirrored copies (horizontal)
    drawPolygon(dataArray, centerX, centerY, radius, 0, true, false);

    // Draw mirrored copies (vertical)
    drawPolygon(dataArray, centerX, centerY, radius, 0, false, true);

    // Draw mirrored copies (both horizontal and vertical)
    drawPolygon(dataArray, centerX, centerY, radius, 0, true, true);

    // Draw the rotated shape (90 degrees)
    drawPolygon(dataArray, centerX, centerY, radius, Math.PI / 2);

    // Draw mirrored copies of rotated shape (horizontal)
    drawPolygon(dataArray, centerX, centerY, radius, Math.PI / 2, true, false);

    // Draw mirrored copies of rotated shape (vertical)
    drawPolygon(dataArray, centerX, centerY, radius, Math.PI / 2, false, true);

    // Draw mirrored copies of rotated shape (both horizontal and vertical)
    drawPolygon(dataArray, centerX, centerY, radius, Math.PI / 2, true, true);
  });
}

function drawPolygon(
  dataArray,
  centerX,
  centerY,
  radius,
  rotation,
  mirrorX = false,
  mirrorY = false
) {
  canvasCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
  canvasCtx.strokeStyle = "white";
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();

  for (let i = 0; i < dataArray.length; i++) {
    const angle = (i / dataArray.length) * 2 * Math.PI + rotation;
    const distance = (dataArray[i] / 255) * radius;
    let x = centerX + distance * Math.cos(angle);
    let y = centerY + distance * Math.sin(angle);

    if (mirrorX) x = centerX - (x - centerX);
    if (mirrorY) y = centerY - (y - centerY);

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
  }

  canvasCtx.closePath();
  canvasCtx.stroke();
  canvasCtx.fill();
}
