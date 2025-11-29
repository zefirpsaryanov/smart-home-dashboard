const lights = {
    1: { state: false, brightness: 100, name: 'Хол' },
    2: { state: false, brightness: 100, name: 'Спалня' },
    3: { state: false, brightness: 100, name: 'Кухня' }
};

const sensors = {
    1: { temp: 22.5, location: 'hall' },
    2: { temp: 21.8, location: 'bedroom' },
    3: { temp: 18.3, location: 'outside' }
};

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('currentTime').textContent = `${dateStr} ${timeStr}`;
}

function toggleLight(id, state) {
    lights[id].state = state;
    const brightnessControl = document.getElementById(`brightness${id}`);

    if (state) {
        brightnessControl.style.display = 'block';
    } else {
        brightnessControl.style.display = 'none';
    }

    console.log(`Light ${id} (${lights[id].name}): ${state ? 'ON' : 'OFF'}`);
    console.log(`API Call: POST /api/lights/${id}`, { state: state, brightness: lights[id].brightness });

    saveLights();
}

function setBrightness(id, value) {
    lights[id].brightness = value;
    const brightnessValue = document.querySelector(`#brightness${id} .brightness-value`);
    brightnessValue.textContent = `${value}%`;

    console.log(`Light ${id} brightness: ${value}%`);
    console.log(`API Call: POST /api/lights/${id}`, { state: lights[id].state, brightness: value });

    saveLights();
}

function saveLights() {
    localStorage.setItem('lights', JSON.stringify(lights));
}

function loadLights() {
    const saved = localStorage.getItem('lights');
    if (saved) {
        const savedLights = JSON.parse(saved);
        for (let id in savedLights) {
            lights[id] = savedLights[id];
            document.getElementById(`light${id}`).checked = lights[id].state;
            if (lights[id].state) {
                document.getElementById(`brightness${id}`).style.display = 'block';
            }
            const slider = document.querySelector(`#brightness${id} input[type="range"]`);
            slider.value = lights[id].brightness;
            document.querySelector(`#brightness${id} .brightness-value`).textContent = `${lights[id].brightness}%`;
        }
    }
}

function updateSensors() {
    sensors[1].temp = (22 + Math.random() * 2).toFixed(1);
    sensors[2].temp = (21 + Math.random() * 2).toFixed(1);
    sensors[3].temp = (17 + Math.random() * 3).toFixed(1);

    document.getElementById('sensor1').textContent = `${sensors[1].temp}°C`;
    document.getElementById('sensor2').textContent = `${sensors[2].temp}°C`;
    document.getElementById('sensor3').textContent = `${sensors[3].temp}°C`;

    updateChart();
}

let chartData = {
    labels: [],
    hall: [],
    bedroom: [],
    outside: []
};

function initChart() {
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        chartData.labels.push(time.getHours() + ':00');
        chartData.hall.push((22 + Math.random() * 2).toFixed(1));
        chartData.bedroom.push((21 + Math.random() * 2).toFixed(1));
        chartData.outside.push((17 + Math.random() * 3).toFixed(1));
    }
    drawChart();
}

function updateChart() {
    chartData.labels.shift();
    chartData.hall.shift();
    chartData.bedroom.shift();
    chartData.outside.shift();

    const now = new Date();
    chartData.labels.push(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
    chartData.hall.push(sensors[1].temp);
    chartData.bedroom.push(sensors[2].temp);
    chartData.outside.push(sensors[3].temp);

    drawChart();
}

function drawChart() {
    const canvas = document.getElementById('tempChart');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const maxTemp = Math.max(...chartData.hall, ...chartData.bedroom, ...chartData.outside);
    const minTemp = Math.min(...chartData.hall, ...chartData.bedroom, ...chartData.outside);
    const tempRange = maxTemp - minTemp + 2;

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    function drawLine(data, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((temp, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = canvas.height - padding - ((temp - minTemp + 1) / tempRange) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    drawLine(chartData.hall, '#00bfff');
    drawLine(chartData.bedroom, '#ff69b4');
    drawLine(chartData.outside, '#32cd32');

    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.fillText(maxTemp.toFixed(1) + '°C', 5, padding);
    ctx.fillText(minTemp.toFixed(1) + '°C', 5, canvas.height - padding);

    const legendY = 20;
    ctx.fillStyle = '#00bfff';
    ctx.fillRect(canvas.width - 150, legendY, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText('Хол', canvas.width - 130, legendY + 12);

    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(canvas.width - 150, legendY + 20, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText('Спалня', canvas.width - 130, legendY + 32);

    ctx.fillStyle = '#32cd32';
    ctx.fillRect(canvas.width - 150, legendY + 40, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText('Навън', canvas.width - 130, legendY + 52);
}

function updateCameraSnapshot(cameraId) {
    const imgElement = document.getElementById(`camera${cameraId}Stream`);
    const cameraView = document.getElementById(`camera${cameraId}`);

    if (imgElement) {
        const snapshotUrl = getSnapshotUrl(cameraId);
        const timestamp = new Date().getTime();

        imgElement.onerror = function() {
            cameraView.innerHTML = '<div class="camera-error">Грешка при зареждане на камерата<br><small>Проверете IP: ' + cameraConfig.xvr.ip + ':' + cameraConfig.xvr.webPort + '</small></div>';
            console.error(`Camera ${cameraId} failed to load`);
        };

        imgElement.onload = function() {
            imgElement.classList.add('loaded');
            console.log(`Camera ${cameraId} snapshot updated`);
        };

        imgElement.src = `${snapshotUrl}&t=${timestamp}`;
    }
}

function initCameras() {
    if (typeof cameraConfig === 'undefined') {
        console.log('Camera config not found');
        return;
    }

    cameraConfig.cameras.forEach(camera => {
        if (camera.enabled) {
            const snapshotUrl = getSnapshotUrl(camera.id);
            console.log(`Camera ${camera.id} using snapshot: ${snapshotUrl}`);

            updateCameraSnapshot(camera.id);

            setInterval(() => {
                updateCameraSnapshot(camera.id);
            }, 2000);
        }
    });
}

function init() {
    loadLights();
    updateTime();
    setInterval(updateTime, 1000);

    updateSensors();
    setInterval(updateSensors, 5000);

    initChart();
    initCameras();

    console.log('Smart Home Dashboard initialized');
    console.log('API endpoints ready for ESP8266/ESP32');
}

window.addEventListener('load', init);
window.addEventListener('resize', drawChart);
