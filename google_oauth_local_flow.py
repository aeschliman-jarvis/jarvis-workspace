import json, secrets, threading, webbrowser, urllib.parse, urllib.request, urllib.error, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

CFG = Path('/Users/jaeschliman/.openclaw/workspace/.openclaw/google-oauth.json')
OUT = Path('/Users/jaeschliman/.openclaw/workspace/.openclaw/google-token.json')
STATE_FILE = Path('/Users/jaeschliman/.openclaw/workspace/.openclaw/google-oauth-state.txt')

cfg = json.loads(CFG.read_text())['installed']
client_id = cfg['client_id']
client_secret = cfg['client_secret']
redirect_uri = 'http://127.0.0.1:8765/callback'
scopes = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
]
state = secrets.token_urlsafe(24)
STATE_FILE.write_text(state)
result = {}
server_holder = {}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        data = {k: v[0] for k, v in q.items()}
        result.update(data)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'<html><body><h1>Authorization received.</h1><p>You can return to chat.</p></body></html>')
        threading.Thread(target=server_holder['server'].shutdown, daemon=True).start()
    def log_message(self, *args):
        pass

server = HTTPServer(('127.0.0.1', 8765), Handler)
server_holder['server'] = server

params = {
  'client_id': client_id,
  'redirect_uri': redirect_uri,
  'response_type': 'code',
  'scope': ' '.join(scopes),
  'access_type': 'offline',
  'prompt': 'consent',
  'state': state,
}
auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
print('AUTH_URL', auth_url, flush=True)
try:
    webbrowser.open(auth_url)
except Exception:
    pass

server.timeout = 600
server.handle_request()

if not result:
    print('ERROR No callback received', flush=True)
    raise SystemExit(1)
if result.get('state') != state:
    print('ERROR State mismatch', flush=True)
    raise SystemExit(2)
if 'code' not in result:
    print('ERROR No code in callback', json.dumps(result), flush=True)
    raise SystemExit(3)

payload = urllib.parse.urlencode({
  'code': result['code'],
  'client_id': client_id,
  'client_secret': client_secret,
  'redirect_uri': redirect_uri,
  'grant_type': 'authorization_code',
}).encode()
req = urllib.request.Request('https://oauth2.googleapis.com/token', data=payload, headers={'Content-Type': 'application/x-www-form-urlencoded'})
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        token = json.loads(resp.read().decode())
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print('TOKEN_ERROR', body, flush=True)
    raise
OUT.write_text(json.dumps(token, indent=2))
print('TOKEN_SAVED', str(OUT), flush=True)
