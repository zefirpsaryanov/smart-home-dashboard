#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
from urllib.parse import urlparse, parse_qs
import threading
import time

PORT = 8090

password_mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
password_mgr.add_password(None, 'http://192.168.10.4:88', 'admin', 'admin000')
auth_handler = urllib.request.HTTPDigestAuthHandler(password_mgr)
opener = urllib.request.build_opener(auth_handler)

camera_cache = {}
cache_lock = threading.Lock()

class CameraProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/snapshot'):
            query = parse_qs(urlparse(self.path).query)
            channel = query.get('channel', ['1'])[0]

            camera_url = f'http://192.168.10.4:88/cgi-bin/snapshot.cgi?channel={channel}&subtype=0'

            try:
                with cache_lock:
                    now = time.time()
                    if channel in camera_cache:
                        cached_time, cached_data = camera_cache[channel]
                        if now - cached_time < 0.5:
                            self.send_response(200)
                            self.send_header('Content-type', 'image/jpeg')
                            self.send_header('Cache-Control', 'no-cache')
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.end_headers()
                            self.wfile.write(cached_data)
                            return

                response = opener.open(camera_url, timeout=5)
                image_data = response.read()

                with cache_lock:
                    camera_cache[channel] = (time.time(), image_data)

                self.send_response(200)
                self.send_header('Content-type', 'image/jpeg')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(image_data)
            except Exception as e:
                print(f"Camera {channel} error: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        pass

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

with ThreadedTCPServer(("", PORT), CameraProxyHandler) as httpd:
    print(f"Camera proxy running on port {PORT}")
    httpd.serve_forever()
