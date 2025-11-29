# Smart Home Dashboard

Modern web-based home automation dashboard with ESP8266/ESP32 support.

## Features

- 💡 **Light Control** - Toggle lights ON/OFF with brightness control
- 🌡️ **Temperature Sensors** - Real-time temperature monitoring
- 🌤️ **Weather Info** - Current weather display
- 📹 **Camera View** - MJPEG stream support
- 📊 **Temperature Charts** - 24-hour temperature history
- 🌙 **Dark Theme** - Beautiful dark UI
- 📱 **Responsive** - Works on mobile/tablet

## API Endpoints for ESP8266/ESP32

### Lights Control

**Get all lights status:**
```http
GET /api/lights
```

Response:
```json
{
  "1": {"state": true, "brightness": 80, "name": "Хол"},
  "2": {"state": false, "brightness": 100, "name": "Спалня"},
  "3": {"state": true, "brightness": 50, "name": "Кухня"}
}
```

**Control specific light:**
```http
POST /api/lights/:id
Content-Type: application/json

{
  "state": true,
  "brightness": 80
}
```

### Temperature Sensors

**Send sensor data:**
```http
POST /api/sensors
Content-Type: application/json

{
  "id": 1,
  "temp": 22.5,
  "humidity": 65,
  "location": "hall"
}
```

**Get sensor data:**
```http
GET /api/sensors
```

### Camera Stream

**MJPEG Stream:**
```http
GET /api/camera
```

To add your camera, update the URL in the camera card settings.

## ESP8266/ESP32 Example Code

### Light Control (Relay)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP/api/lights/1";

const int relayPin = D1;
const int pwmPin = D2;

void setup() {
  pinMode(relayPin, OUTPUT);
  pinMode(pwmPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void loop() {
  HTTPClient http;
  http.begin(serverUrl);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);

    bool state = doc["state"];
    int brightness = doc["brightness"];

    digitalWrite(relayPin, state ? HIGH : LOW);
    analogWrite(pwmPin, map(brightness, 0, 100, 0, 1023));
  }

  http.end();
  delay(1000);
}
```

### Temperature Sensor (DHT22)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

#define DHTPIN D4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP/api/sensors";

void setup() {
  WiFi.begin(ssid, password);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(temp) && !isnan(humidity)) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(1024);
    doc["id"] = 1;
    doc["temp"] = temp;
    doc["humidity"] = humidity;
    doc["location"] = "hall";

    String json;
    serializeJson(doc, json);

    http.POST(json);
    http.end();
  }

  delay(5000);
}
```

## Local Development

1. Open `index.html` in your browser
2. Control lights and see simulated sensor data
3. All settings are saved in localStorage

## Server Setup

Deploy to Nginx:
```bash
ln -s /home/zefir/smart-home-dashboard /var/www/projects/smart-home-dashboard
```

Access at: http://localhost/smart-home-dashboard/

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] MQTT integration
- [ ] User authentication
- [ ] Database storage (SQLite/MySQL)
- [ ] Mobile app
- [ ] Automation rules and scenes
- [ ] Voice control integration
- [ ] Energy monitoring

## Technologies

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript
- Canvas API (for charts)
- localStorage API
- REST API ready for ESP devices

## License

MIT
