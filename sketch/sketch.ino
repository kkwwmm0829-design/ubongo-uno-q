// 뼈대 앱 — 버튼·조이스틱 읽기 (UNO Q 마이크로컨트롤러). 이 파일은 고치지 않아도 됩니다.
// 배선: 스위치 한쪽 = 핀, 다른 쪽 = GND. 저항 없음(내부 풀업). 5V·3.3V 핀에는 연결하지 않기.
//
//   버튼 A (빨) D2   버튼 B (노) D3   버튼 C (초) D4   버튼 D (파) D5
//   조이스틱 위 D13  아래 D11         왼쪽 D12         오른쪽 D10   (GND는 13번 옆 GND, 5핀 커넥터가 앞쪽)
//   방향이 엇갈리면 아래 PINS 의 뒤 4개 숫자 순서만 바꾸기 (위, 아래, 왼쪽, 오른쪽)
//
// 눌린 순간마다 파이썬의 on_input(번호)를 부릅니다.
//   번호 0~3 = 버튼 A~D, 4~7 = 위·아래·왼쪽·오른쪽
// 조이스틱 위·아래는 계속 밀고 있으면 자동으로 반복됩니다.

#include "Arduino_RouterBridge.h"

const int PINS[8] = {2, 3, 4, 5, 13, 11, 12, 10};
const unsigned long DEBOUNCE_MS = 25;
const unsigned long REPEAT_DELAY_MS = 400;   // 처음 반복까지
const unsigned long REPEAT_EVERY_MS = 150;   // 반복 간격

bool stableDown[8];
bool lastRead[8];
unsigned long changedAt[8];
unsigned long nextRepeat[8];

void setup() {
  for (int i = 0; i < 8; i++) {
    pinMode(PINS[i], INPUT_PULLUP);
    stableDown[i] = false;
    lastRead[i] = false;
    changedAt[i] = 0;
    nextRepeat[i] = 0;
  }
  Bridge.begin();
}

void loop() {
  unsigned long now = millis();
  for (int i = 0; i < 8; i++) {
    bool down = (digitalRead(PINS[i]) == LOW);
    if (down != lastRead[i]) {          // 흔들림 시작
      lastRead[i] = down;
      changedAt[i] = now;
    }
    if (now - changedAt[i] >= DEBOUNCE_MS && down != stableDown[i]) {
      stableDown[i] = down;
      if (down) {
        Bridge.notify("on_input", i);
        nextRepeat[i] = now + REPEAT_DELAY_MS;
      }
    }
    // 위(4)·아래(5)만 길게 밀면 반복
    if ((i == 4 || i == 5) && stableDown[i] && now >= nextRepeat[i]) {
      Bridge.notify("on_input", i);
      nextRepeat[i] = now + REPEAT_EVERY_MS;
    }
  }
  delay(2);
}
