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
    heroLead: "하우스는 언제나 승리한다. 적어도 오늘 밤, 프루프가 살아남기 전까지는.",
    heroSummary: "이능력자(딜러) 사회, 칩으로 가격이 매겨지는 생존, 그리고 하우스가 설계한 여섯 시간짜리 합법 사냥. 라스베가스 프리몬트 거리의 여섯 딜러는 매년 같은 질문 앞에 선다. <em>누구의 규칙 아래 살아남을 것인가?</em>",

    quickBriefTitle: "입장 전에 알아둘<br>다섯 가지.",

    worldIntro: "1951년, 네바다에서 강행된 핵실험 이후 오른손등에 카드 문양이 빛나는 사람들이 나타났다. 시질은 〈능력〉의 증표였고, 정부는 그 존재를 숨겼다. 카지노 자본은 그들을 등록하고 관리했으며, 마침내 보호와 통제를 한 손에 쥔 거대한 딜러 생태계, 하우스가 태어났다.",
    originText: "핵실험 이후 생존자 혹은 인근 주민들에게 나타난 카드 문양의 힘은 처음에는 국가 기밀이었다. 1960년대, 정부와 카지노 자본은 능력 보유자를 등록하고 추적하는 비공식 관리망을 만들었다. 장부가 커지고 권력이 붙으면서, 그 관리망은 오늘날의 하우스가 되었다.",
    cashoutText: "매년 1월 27일 자정, 베가스는 여섯 시간 동안 사냥터가 된다. 딜러는 타인의 칩을 빼앗아 랭킹을 올리고, 살아남은 몫의 일부를 하우스에 바친다. 승자조차 빈손으로 빠져나갈 수 없는 밤이다.",
    locationsSubtitle: "밤의 판을 가르는 일곱 개의 무대",

    factionsIntro: "질서, 자유, 생존, 신앙. 내세우는 명분은 달라도 원하는 것은 같다. 사람을 자기 판 위에 올려놓는 것.",
    charactersIntro: "누구도 먼저 패를 까지 않는다. 웃음도 친절도 협박도, 모두 목적을 품고 있다. <br><span class='intro-note'>(캐릭터 카드를 눌러 그들이 감춘 패를 확인하세요.)</span>",
    soundtrackIntro: "식스 스피릿츠 CASHOUT의 오리지널 사운드트랙",
    abilityIntro: "문양을 고르거나 전체 덱에서 뽑아 페르소나의 능력을 완성하세요. 효과뿐 아니라 제약과 버스트 위험까지 함께 생성됩니다.",
    galleryIntro: "대표 이미지를 선택하면 해당 캐릭터의 일반 이미지 아카이브를 확인할 수 있습니다. <br><span class='intro-note'>(일반이미지만 존재합니다. 언세이프 이미지는 스토리의 고정댓글을 확인해주세요.)</span>",

    closingEyebrow: "WELCOME TO PROOF / 프루프에 오신 것을 환영합니다",
    footerLeft: "SIX SPIRITS · RP WORLD GUIDE / 역할극 세계관 안내",
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
