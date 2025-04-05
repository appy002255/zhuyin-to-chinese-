import http.server
import socketserver
from functools import partial

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # 將 URL 路徑中的 %20 轉換為空格
        self.path = self.path.replace('%20', ' ')
        return super().do_GET()

PORT = 8000
Handler = partial(CORSRequestHandler, directory=".")

print(f"啟動伺服器在 http://localhost:{PORT}")
print("按 Ctrl+C 停止伺服器")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n伺服器已停止") 