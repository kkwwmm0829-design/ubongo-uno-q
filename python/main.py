# 뼈대 앱 — 리눅스 쪽 (중계 + 인쇄). 이 파일은 고치지 않아도 됩니다.
#  - 스케치가 보낸 버튼·조이스틱 신호 → 화면(app.js)의 onKey(key)
#  - 화면이 print({...}) 하면 → 영수증 프린터
from arduino.app_utils import *
from arduino.app_bricks.web_ui import WebUI

import printer

KEYS = ["A", "B", "C", "D", "UP", "DOWN", "LEFT", "RIGHT"]

ui = WebUI()


def on_input(code: int):
    if 0 <= code < len(KEYS):
        ui.send_message("input", {"key": KEYS[code]})


def on_print(sid, data):
    try:
        result = printer.send(printer.make_card(data or {}))
    except Exception as e:
        result = {"ok": False, "via": f"오류: {e}"}
    print("인쇄:", result, flush=True)
    ui.send_message("print_response", result, room=sid)   # 화면의 '인쇄 중...' 해제
    return None


def http_print_test():
    try:
        result = printer.send(printer.make_test())
    except Exception as e:
        result = {"ok": False, "via": f"오류: {e}"}
    print("인쇄 시험:", result)
    return result


Bridge.provide("on_input", on_input)
ui.on_message("print", on_print)
ui.expose_api(method="GET", path="/print_test", function=http_print_test)

App.run()
