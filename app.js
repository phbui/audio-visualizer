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

    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = dataArray[i];
      canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
      canvasCtx.fillRect(
        x,
        canvas.height - barHeight / 2,
        barWidth,
        barHeight / 2
      );
      x += barWidth + 1;
    }
  });
}
