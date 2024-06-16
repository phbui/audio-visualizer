const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");
let audioContext;
let analyser;
let microphone;
let javascriptNode;

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
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    canvasCtx.strokeStyle = "white";
    canvasCtx.beginPath();

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * 2 * Math.PI;
      const distance = (dataArray[i] / 255) * radius;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
    }

    canvasCtx.closePath();
    canvasCtx.stroke();
  });
}
