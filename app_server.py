import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 8001

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_POST(self):
        # API pro tiché uložení projektu na disk (Vyhne se složce Stahování v Prohlížeči)
        if self.path == '/api/save_project':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(post_data)
                
                # Zabezpečení názvu souboru
                project_name = data.get('projectName', 'Nová Sada')
                safe_name = "".join([c if c.isalnum() else "_" for c in project_name]).lower()
                
                # Ujistíme se, že složka existuje
                save_dir = os.path.join(os.getcwd(), 'generator_karet', 'projekty')
                os.makedirs(save_dir, exist_ok=True)
                
                # Finální cesta
                file_path = os.path.join(save_dir, f"{safe_name}.json")
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=4)
                    
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'file': file_path}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

# Zajištění čistého vypnutí
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"===========================================================")
    print(f"  VYLEPŠENÝ LOKÁLNÍ SERVER PRO GENERÁTOR KARET ({PORT}) ")
    print(f"===========================================================")
    print(f"- Backend podporující API: /api/save_project")
    print(f"- Projekty ukládá přímo do: generator_karet/projekty/")
    print(f"Pro ukončení stiskněte: Cmd+C")
    httpd.serve_forever()
