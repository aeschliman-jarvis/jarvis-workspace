from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import json

OUT = Path('/Users/jaeschliman/.openclaw/workspace/.openclaw/google-oauth-callback.json')

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        data = {k: v[0] for k, v in q.items()}
        OUT.write_text(json.dumps(data, indent=2))
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'<html><body><h1>Authorization received.</h1><p>You can return to chat.</p></body></html>')
    def log_message(self, *args):
        pass

HTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
