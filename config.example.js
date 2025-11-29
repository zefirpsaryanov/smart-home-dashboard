const cameraConfig = {
    xvr: {
        ip: '192.168.1.100',
        username: 'admin',
        password: 'your_password',
        webPort: 88,
        mediaPort: 37777
    },
    cameras: [
        {
            id: 1,
            name: 'Камера 1 - Вход',
            channel: 1,
            enabled: true
        },
        {
            id: 2,
            name: 'Камера 2',
            channel: 2,
            enabled: true
        }
    ]
};

function getCameraUrl(cameraId, streamType = 'mjpeg') {
    const camera = cameraConfig.cameras.find(c => c.id === cameraId);
    if (!camera) return null;

    const { ip, username, password, webPort } = cameraConfig.xvr;
    const auth = `${username}:${password}`;

    switch(streamType) {
        case 'mjpeg':
            return `http://${auth}@${ip}:${webPort}/cgi-bin/mjpg/video.cgi?channel=${camera.channel}&subtype=1`;
        case 'snapshot':
            return `http://${auth}@${ip}:${webPort}/cgi-bin/snapshot.cgi?channel=${camera.channel}`;
        case 'rtsp':
            return `rtsp://${auth}@${ip}:554/cam/realmonitor?channel=${camera.channel}&subtype=0`;
        default:
            return null;
    }
}

function getSnapshotUrl(cameraId) {
    return getCameraUrl(cameraId, 'snapshot');
}

function getMjpegUrl(cameraId) {
    return getCameraUrl(cameraId, 'mjpeg');
}
