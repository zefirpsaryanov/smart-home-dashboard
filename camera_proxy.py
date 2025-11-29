#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
from urllib.parse import urlparse, parse_qs

PORT = 8090

class CameraProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/snapshot'):
            query = parse_qs(urlparse(self.path).query)
            channel = query.get('channel', ['1'])[0]

            camera_url = f'http://192.168.10.4:88/cgi-bin/snapshot.cgi?channel={channel}'

            password_mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
            password_mgr.add_password(None, 'http://192.168.10.4:88', 'admin', 'admin000')

            auth_handler = urllib.request.HTTPDigestAuthHandler(password_mgr)
            opener = urllib.request.build_opener(auth_handler)

            try:
                response = opener.open(camera_url)
                image_data = response.read()

                self.send_response(200)
                self.send_header('Content-type', 'image/jpeg')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(image_data)
            except Exception as e:
                self.send_error(500, f'Camera error: {str(e)}')
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(("", PORT), CameraProxyHandler) as httpd:
    print(f"Camera proxy running on port {PORT}")
    httpd.serve_forever()
