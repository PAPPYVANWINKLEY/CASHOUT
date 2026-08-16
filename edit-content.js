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

------------------------------------------------------------
[주석 항목]  이름이 ~Annot 으로 끝나는 항목은 본문 옆에 갈겨쓴
주석처럼 표시됩니다(청록색, 왼쪽 세로선, 살짝 기울어짐).
본문에서 한 박자 쉬고 찌르는 문장을 여기에 넣으세요.
비워두면 그 자리에 아무것도 안 나옵니다.
------------------------------------------------------------
*/

window.SIX_SPIRITS_EDIT = {
  page: {
    brandSubtitle: "식스 스피릿츠 · 프루프 / 중립(자칭)",

    heroEyebrow: "CASHOUT NIGHT · 매년 1월 27일 · 00:00—06:00 · 네, 강제참가입니다",
    heroLead: "하우스는 언제나 승리한다.",
    heroAnnot: "재수 없으니까 올해는 좀 적자 보게 만들어주자.",
    heroSummary: "칩이 목숨값이고 킬이 경력이며, 정부는 관전자석에 앉아 있다. 하우스가 정성껏 마련한 여섯 시간짜리 합법 사냥에서 프루프의 딜러 여섯이 할 일은 간단하다. <em>살아남기. 가능하면 하우스 성질도 긁어놓기.</em>",

    quickBriefTitle: "설명서 안 읽을 귀차니스트를 위한<br>다섯 줄.",

    worldIntro: "1951년 네바다에서 핵을 터뜨렸다. 좋은 아이디어는 아니었다. 일부 생존자의 오른손에 카드 문양(시질)이 나타났고, 정부는 덮었고, 카지노는 장부를 폈다. 그렇게 보호와 통제를 한 손에 쥔 딜러 생태계, 하우스가 태어났다.",
    worldAnnot: "'관리'라는 말은 참 편리하다. 목줄에도 붙일 수 있으니까.",

    originText: "핵실험 뒤 생존자와 인근 주민에게 카드 문양의 힘이 나타났다. 정부는 국가 기밀로 묶었고, 1960년대 카지노 자본과 손잡고 능력 보유자를 등록·추적하기 시작했다. 비공식 관리망은 장부가 두꺼워질수록 권력이 됐고, 지금은 하우스라 불린다.",
    originAnnot: "카지노가 사람까지 회원제로 만든 셈이다.",

    burstAnnot: "축하한다. 네 몸이 사표를 던졌다. 능력은 계속 출근중인데.",

    cashoutText: "매년 1월 27일 자정, 베가스 전역이 여섯 시간짜리 사냥터가 된다. 딜러는 서로의 칩을 뺏어 랭킹을 올리고, 살아남아도 일부는 레이크로 하우스에 바친다.",
    cashoutAnnot: "이겨도 수수료는 낸다. 카지노가 괜히 카지노겠나.",
    locationsSubtitle: "오늘 밤 사고 치기 좋은 열한 군데",

    factionsIntro: "질서, 자유, 생존, 신앙. 간판은 제각각이다. 사람을 자기 판 위에 올려놓고 싶다는 점에서는 놀랍도록 의견이 잘 맞는다.",
    charactersIntro: "좋은 소식: 여기 있는 사람들은 유능하다.<br>나쁜 소식: 그래서 더 위험하다. 웃음도 친절도 협박도 대개 목적지가 있다. <br><span class='intro-note'>(카드를 눌러 프로필을 열어보세요. 이럴 때 쓰라고 만든 버튼입니다.)</span>",
    soundtrackIntro: "사람이 죽고 도시가 불타도 BGM은 필요하다. 분위기는 죄가 없으니까.",
    abilityIntro: "문양을 고르거나 그냥 운명에 맡기세요. 능력은 랜덤, 제약은 기본 옵션, 버스트 위험은 환불 불가입니다.",
    galleryIntro: "증거 사진 모음. 다들 살아 있을 때 찍힌 게 보기 좋군요. <br><span class='intro-note'>(일반 이미지만 수록. 언세이프 이미지는 스토리 고정댓글 쪽입니다. 야한 건 직접 알아내는 맛이 있으니까.)</span>",

    closingEyebrow: "WELCOME TO PROOF / 여기까지 내려왔으면 한 잔은 자격 있습니다",
    footerLeft: "SIX SPIRITS · RP WORLD GUIDE / 세계관 안내, 생존 보장은 별도",
    footerRight: "FREMONT, LAS VEGAS · 좋은 동네입니다. 어디든 밤엔 조심해야 하니까요."
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
        description: "재키의 프루프 외부 전투 테마. 문보다 벽을 선호하는 사람에게 잘 어울린다.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M01.mp3"
      },
      {
        code: "M02",
        title: "BEFORE THE BELL",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "PROOF 1F BAR / 프루프 1층 바",
        description: "프루프 1층과 마리아의 테마. 술보다 분위기가 먼저 취하는 구간.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M02.mp3"
      },
      {
        code: "M03",
        title: "COLD LENS",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "MIKAELA THEME / 미케일라 테마",
        description: "미케일라의 테마. 총성보다 조용한 사람이 더 무서울 때가 있다.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M03.mp3"
      },
      {
        code: "M04",
        title: "COLD MERCY",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "BLACK CLINIC / 블랙 클리닉",
        description: "블랙 클리닉의 테마. 살아서 들어왔다면 절반은 성공이다.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M04.mp3"
      },
      {
        code: "M05",
        title: "DEAD MAN'S CHANGE",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "CHIP MARKET / 칩 마켓",
        description: "칩 마켓의 테마. 가격표를 붙이기 애매한 물건들이 가장 비싸게 팔리는 곳.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M05.mp3"
      },
      {
        code: "M06",
        title: "HOUSE ALWAYS WINS",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "THE HOUSE / 하우스",
        description: "하우스의 테마. 권력에도 테마곡은 필요하단다. 겸손은 없지만.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M06.mp3"
      },
      {
        code: "M07",
        title: "LAST CALL AT PROOF",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "PROOF · KAYLA THEME / 프루프 · 케일라 테마",
        description: "프루프와 케일라의 테마. 마지막 주문과 마지막 방어선이 같은 시각에 닫히는 밤.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M07.mp3"
      },
      {
        code: "M08",
        title: "NULL REQUEST",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "ADRIEN THEME / 아드리엔 테마",
        description: "아드리엔의 테마. 이 곡을 좋아할 확률도 본인이 계산해뒀을 것 같다.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M08.mp3"
      },
      {
        code: "M09",
        title: "RED LIGHT PROTOCOL",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "PROOF BASEMENT · ELIA THEME / 프루프 지하 · 엘리아 테마",
        description: "프루프 지하와 엘리아의 테마. 박자보다 심박이 먼저 올라가면 진료 대상이다.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M09.mp3"
      },
      {
        code: "M10",
        title: "TOMORROW NEVER CAME",
        artist: "SIX SPIRITS ORIGINAL SOUNDTRACK",
        scene: "CHARACTER DEATH / 등장인물 사망",
        description: "등장인물 사망 테마. 재생되는 순간 아무도 앙코르를 원하지 않는 곡.",
        duration: "--:--",
        url: "https://i.cpvw.uk/6SC/ost/M10.mp3"
      }
    ]
  }
};
