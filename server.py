#!/usr/bin/env python3
import http.server
import json
import socketserver
import threading
import os
import socket
import sys
import time
import random
import re

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data.json')
HTML_FILE = os.path.join(BASE_DIR, 'index.html')

DEFAULT_DATA = {'tags': {'music': [], 'games': [], 'anime': [], 'movie': [], 'sports': []}}


def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
            if 'tags' not in loaded:
                return json.loads(json.dumps(DEFAULT_DATA))
            for cat in DEFAULT_DATA['tags']:
                loaded['tags'].setdefault(cat, [])
            return loaded
        except Exception:
            pass
    return json.loads(json.dumps(DEFAULT_DATA))


def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)


data = load_data()
lock = threading.Lock()


def normalize_text(s):
    """规范化文本用于去重比较：转小写、全角转半角、合并空格、去首尾空格"""
    s = s.strip().lower()
    # 全角转半角（ASCII 范围的全角字符）
    result = []
    for ch in s:
        code = ord(ch)
        if code == 0x3000:  # 全角空格
            result.append(' ')
        elif 0xFF01 <= code <= 0xFF5E:  # 全角可见字符
            result.append(chr(code - 0xFEE0))
        else:
            result.append(ch)
    s = ''.join(result)
    # 合并连续空格为一个
    s = re.sub(r'\s+', ' ', s)
    return s


def gen_id():
    return f"{int(time.time() * 1000)}{random.randint(1000, 9999)}"


class Handler(http.server.BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _send_json(self, obj, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps(obj, ensure_ascii=False).encode('utf-8'))

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        body = self.rfile.read(length)
        try:
            return json.loads(body)
        except Exception:
            return {}

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            with lock:
                snapshot = json.dumps(data, ensure_ascii=False)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._cors()
            self.end_headers()
            self.wfile.write(snapshot.encode('utf-8'))
        elif self.path == '/' or self.path == '/index.html':
            self._serve_html()
        else:
            self.send_error(404)

    def do_POST(self):
        try:
            payload = self._read_body()
        except Exception:
            self._send_json({'error': 'bad request'}, 400)
            return

        try:
            if self.path == '/api/add':
                cat = payload.get('category', '')
                text = payload.get('text', '').strip()
                creator = payload.get('creator', '').strip()
                if not cat or not text or not creator:
                    self._send_json({'error': 'missing'})
                    return
                with lock:
                    tags = data['tags'].setdefault(cat, [])
                    norm = normalize_text(text)
                    existing = next((t for t in tags if normalize_text(t['text']) == norm), None)
                    if existing:
                        self._send_json({'error': 'duplicate', 'existing': existing['text'], 'tagId': existing['id']})
                        return
                    tag = {'id': gen_id(), 'text': text, 'creator': creator, 'plusOnes': []}
                    tags.append(tag)
                    save_data(data)
                self._send_json({'ok': True})

            elif self.path == '/api/plus':
                cat = payload.get('category', '')
                tag_id = payload.get('tagId', '')
                user = payload.get('user', '').strip()
                if not cat or not tag_id or not user:
                    self._send_json({'error': 'missing'})
                    return
                with lock:
                    tags = data['tags'].get(cat, [])
                    tag = next((t for t in tags if t['id'] == tag_id), None)
                    if not tag:
                        self._send_json({'error': 'notfound'})
                        return
                    if tag['creator'] == user:
                        self._send_json({'error': 'self'})
                        return
                    if user in tag['plusOnes']:
                        tag['plusOnes'].remove(user)
                    else:
                        tag['plusOnes'].append(user)
                    save_data(data)
                self._send_json({'ok': True})

            elif self.path == '/api/clear':
                with lock:
                    data.clear()
                    data.update(json.loads(json.dumps(DEFAULT_DATA)))
                    save_data(data)
                self._send_json({'ok': True})
            else:
                self.send_error(404)
        except Exception as e:
            self._send_json({'error': 'server'}, 500)

    def _serve_html(self):
        if os.path.exists(HTML_FILE):
            with open(HTML_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self._cors()
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        else:
            self.send_error(404, 'index.html not found')

    def log_message(self, *args):
        pass


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
        ip = get_local_ip()
        print(f'\n  ================================')
        print(f'  服务已启动!  端口 {PORT}')
        print(f'  ================================')
        print(f'  本机访问:   http://localhost:{PORT}')
        print(f'  局域网访问: http://{ip}:{PORT}')
        print(f'  ================================')
        print(f'  让同学们用浏览器打开上面的')
        print(f'  "局域网访问"地址即可多设备同步')
        print(f'  按 Ctrl+C 停止服务\n')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n  服务已停止')
            sys.exit(0)


if __name__ == '__main__':
    main()
