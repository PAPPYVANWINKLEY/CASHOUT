/*
============================================================
SIX SPIRITS 수정용 파일
============================================================

이 파일은 윈도우 "메모장"으로 열어서 수정하면 됩니다.
수정 방법:
1) 파일을 마우스 오른쪽 클릭
2) 연결 프로그램 > 메모장
3) 따옴표 " " 안의 글자와 URL만 변경
4) 저장(Ctrl+S) 후 index.html 새로고침

주의:
- 콜론(:), 쉼표(,), 중괄호({ })는 지우지 마세요.
- 문장 안에서 큰따옴표를 쓰려면 \"처럼 앞에 역슬래시를 붙이세요.
- BGM은 반드시 파일 끝이 .mp3, .ogg, .wav, .m4a, .aac 중 하나인 직접 주소를 권장합니다.
============================================================
*/

window.SIX_SPIRITS_EDIT = {
  page: {
    brandSubtitle: "식스 스피릿츠 · 프루프",

    heroEyebrow: "CASHOUT NIGHT · 캐시아웃 나이트 · 매년 1월 27일 · 00:00—06:00",
    heroLead: "하우스는 언제나 승리한다.<br>적어도 오늘 밤, 프루프가 살아남기 전까지는.",
    heroSummary: "칩이 곧 목숨값인 이능력자 사회, 하우스가 짜놓은 여섯 시간짜리 합법 사냥. 프리몬트 거리의 딜러 여섯은 해마다 같은 질문 앞에 선다. <em>누구의 규칙 아래 살아남을 것인가?</em>",

    quickBriefTitle: "들어오기 전에<br>알아둘 것.",

    worldIntro: "1951년, 네바다 핵실험 이후 오른손등에 카드 문양이 빛나는 사람들이 나타났다. 시질은 능력의 증표였고, 정부는 그 존재를 덮었다. 카지노 자본이 그들을 등록하고 관리하기 시작했고, 보호와 통제를 한 손에 쥔 거대한 딜러 생태계 — 하우스가 태어났다.",
    originText: "핵실험 직후 생존자와 인근 주민에게 나타난 카드 문양의 힘은 처음엔 국가 기밀이었다. 1960년대, 정부와 카지노 자본이 손잡고 능력 보유자를 등록·추적하는 비공식 관리망을 세웠다. 장부가 불어나고 권력이 붙으면서, 그 관리망이 오늘날의 하우스가 됐다.",
    cashoutText: "매년 1월 27일 자정, 베가스 전역이 여섯 시간짜리 사냥터로 뒤집힌다. 딜러끼리 칩을 뺏어 랭킹을 올리고, 살아남은 몫 일부는 반드시 하우스에 상납된다. 이긴 쪽도 빈손으론 못 빠져나가는 밤.",
    locationsSubtitle: "밤의 판을 가르는 일곱 무대",

    factionsIntro: "질서, 자유, 생존, 신앙 — 내세우는 이름은 달라도 원하는 건 같다. 사람을 제 판 위에 올려놓는 것.",
    charactersIntro: "누구도 먼저 패를 까지 않는다. 웃음도, 친절도, 협박도 전부 목적이 붙어 있다. <br><span class='intro-note'>(캐릭터 카드를 눌러 감춘 패를 확인하세요.)</span>",
    soundtrackIntro: "식스 스피릿츠 캐시아웃의 오리지널 사운드트랙.",
    abilityIntro: "전체 덱 혹은 원하는 계열(문양)에서 유저의 이능력을 뽑아보세요.",
    galleryIntro: "대표 이미지를 선택하면 해당 캐릭터의 일반 이미지 아카이브가 열립니다. <br><span class='intro-note'>(일반 이미지만 수록되어 있습니다. 언세이프 이미지는 스토리 고정댓글을 확인해주세요.)</span>",

    closingEyebrow: "WELCOME TO PROOF / 프루프에 오신 것을 환영합니다",
    footerLeft: "SIX SPIRITS · RP WORLD GUIDE / 역할극 세계관 가이드",
    footerRight: "FREMONT, LAS VEGAS"
  },

  bgm: {
    // true: 메인의 "입장하기" 버튼을 누르면 첫 곡이 자동 시작됩니다.
    startOnEnter: true,

    // 첫 곡은 0, 두 번째 곡은 1, 세 번째 곡은 2입니다.
    startTrack: 0,

    // 음량: 0.0(무음) ~ 1.0(최대). 0.35 정도를 권장합니다.
    volume: 0.35,

    // 마지막 곡이 끝나면 다시 첫 곡으로 돌아갈지 설정합니다.
    loopPlaylist: true,

    tracks: [
      {
        code: "M01",
        title: "BACK DOOR THUNDER",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "OUTSIDE PROOF / 프루프 외부 전투",
        description: "프루프 외부 전투 시 재생되는 재키의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M01.mp3"
      },
      {
        code: "M02",
        title: "BEFORE THE BELL",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "PROOF 1F BAR / 프루프 1층 바",
        description: "프루프 1층 바와 마리아의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M02.mp3"
      },
      {
        code: "M03",
        title: "COLD LENS",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "MIKAELA THEME / 미케일라 테마",
        description: "미케일라의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M03.mp3"
      },
      {
        code: "M04",
        title: "COLD MERCY",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "BLACK CLINIC / 블랙 클리닉",
        description: "블랙 클리닉의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M04.mp3"
      },
      {
        code: "M05",
        title: "DEAD MAN'S CHANGE",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "CHIP MARKET / 칩 마켓",
        description: "칩 마켓의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M05.mp3"
      },
      {
        code: "M06",
        title: "HOUSE ALWAYS WINS",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "THE HOUSE / 하우스",
        description: "하우스의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M06.mp3"
      },
      {
        code: "M07",
        title: "LAST CALL AT PROOF",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "PROOF · KAYLA THEME / 프루프 · 케일라 테마",
        description: "프루프와 케일라의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M07.mp3"
      },
      {
        code: "M08",
        title: "NULL REQUEST",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "ADRIEN THEME / 아드리엔 테마",
        description: "아드리엔의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M08.mp3"
      },
      {
        code: "M09",
        title: "RED LIGHT PROTOCOL",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "PROOF BASEMENT · ELIA THEME / 프루프 지하 · 엘리아 테마",
        description: "프루프 지하와 엘리아의 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M09.mp3"
      },
      {
        code: "M10",
        title: "TOMORROW NEVER CAME",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "CHARACTER DEATH / 등장인물 사망",
        description: "등장인물이 사망하는 장면을 위한 테마곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M10.mp3"
      }
    ]
  }
};
