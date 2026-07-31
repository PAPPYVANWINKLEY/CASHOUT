# SIX SPIRITS 웹사이트

## 실행
압축을 푼 뒤 `index.html`을 브라우저에서 엽니다.

## 메모장으로 수정
일반 문구와 BGM은 `edit-content.js`만 메모장으로 열어 수정하면 됩니다.
자세한 방법은 `메모장_수정방법.txt`를 참고하세요.

캐릭터와 세력의 상세 정보는 `data.js`에 있습니다. 이 파일도 메모장으로 열 수 있습니다.

## BGM 연결
1. MP3 파일을 Cloudflare R2 등에 업로드합니다.
2. 브라우저에서 직접 열리는 공개 MP3 주소를 복사합니다.
3. `edit-content.js`의 `tracks` 안 `url`에 주소를 붙여 넣습니다.

```js
url: "https://media.example.com/bgm/proof-opening.mp3"
```

메인의 `입장하기` 버튼을 누르면 첫 곡이 자동 시작됩니다. 브라우저 정책상 사용자의 클릭 없이 소리가 나는 완전 자동재생은 보장되지 않습니다.

## 이미지
캐릭터 썸네일은 `data.js` 각 캐릭터의 `thumbnail`에 연결되어 있습니다.
갤러리 일반 이미지 URL 규칙:

```text
https://i.cpvw.uk/6SC/{캐릭터 코드}/{상황 코드}.png
```


## Persona ability generator
- `ABILITY DRAW / 능력 뽑기`에서 48개 프리셋을 전체 또는 시질 문양별로 추첨합니다.
- 결과에는 효과, 제약, 버스트 위험, RP 설정문이 포함됩니다.
- `COPY SETTING / 설정 복사` 버튼으로 페르소나 설정을 복사할 수 있습니다.
- 프리셋 문구를 수정하려면 `abilities.js`를 메모장으로 여세요.
