(() => {
  const data = window.SIX_SPIRITS_DATA;
  const edit = window.SIX_SPIRITS_EDIT || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const imageUrl = (code, scene = "00") => `${data.imageBase}/${code}/${scene}.png`;

  // Apply text from edit-content.js
  const editableText = edit.page || {};
  const textBindings = {
    brandSubtitle: ["#brandSubtitle", false],
    heroEyebrow: ["#heroEyebrow", false],
    heroLead: ["#heroLead", false],
    heroSummary: ["#heroSummary", true],
    quickBriefTitle: ["#quickBriefTitle", true],
    worldIntro: ["#worldIntro", false],
    originText: ["#originText", false],
    cashoutText: ["#cashoutText", false],
    locationsSubtitle: ["#locationsSubtitle", false],
    factionsIntro: ["#factionsIntro", false],
    charactersIntro: ["#charactersIntro", true],
    soundtrackIntro: ["#soundtrackIntro", false],
    abilityIntro: ["#abilityIntro", false],
    galleryIntro: ["#galleryIntro", true],
    closingEyebrow: ["#closingEyebrow", false],
    footerLeft: ["#footerLeft", false],
    footerRight: ["#footerRight", false]
  };
  Object.entries(textBindings).forEach(([key, [selector, allowHtml]]) => {
    const target = $(selector);
    if (!target || typeof editableText[key] !== "string") return;
    if (allowHtml) target.innerHTML = editableText[key];
    else target.textContent = editableText[key];
  });

  // Header and mobile navigation
  const header = $(".site-header");
  const menuToggle = $(".menu-toggle");
  const siteNav = $(".site-nav");

  const syncHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", siteNav).forEach(link => link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  // Reveal animation
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObserver.observe(el));

  // Active nav section
  const navLinks = $$(".site-nav a");
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  ["world", "factions", "characters", "soundtrack", "ability-generator", "gallery"].forEach(id => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  // Countdown: Jan 27, 00:00 in Las Vegas. January is UTC-8.
  const countdownEls = {
    days: $("#countDays"), hours: $("#countHours"), minutes: $("#countMinutes"), seconds: $("#countSeconds")
  };
  const getNextCashout = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    let start = new Date(Date.UTC(year, 0, 27, 8, 0, 0));
    const end = new Date(Date.UTC(year, 0, 27, 14, 0, 0));
    if (now > end) start = new Date(Date.UTC(year + 1, 0, 27, 8, 0, 0));
    return start;
  };
  const updateCountdown = () => {
    const diff = Math.max(0, getNextCashout() - new Date());
    const day = 86400000;
    countdownEls.days.textContent = String(Math.floor(diff / day)).padStart(3, "0");
    countdownEls.hours.textContent = String(Math.floor((diff % day) / 3600000)).padStart(2, "0");
    countdownEls.minutes.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    countdownEls.seconds.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Factions
  const factionFilters = $("#factionFilters");
  const factionGrid = $("#factionGrid");
  const factionFilterLabels = {
    all: "전체 / ALL",
    independent: "독립 세력 / INDEPENDENT",
    authority: "권력권 / AUTHORITY",
    hostile: "적대 세력 / HOSTILE",
    underground: "지하 세력 / UNDERGROUND"
  };

  Object.entries(factionFilterLabels).forEach(([key, label], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.filter = key;
    button.classList.toggle("active", index === 0);
    factionFilters.appendChild(button);
  });

  const renderFactions = (filter = "all") => {
    factionGrid.innerHTML = "";
    data.factions
      .filter(faction => filter === "all" || faction.group === filter)
      .forEach((faction, index) => {
        const card = document.createElement("article");
        card.className = `faction-card reveal${faction.featured ? " featured" : ""}`;
        card.dataset.symbol = faction.symbol;
        card.innerHTML = `
          <span class="tag">${faction.tag}</span>
          <h3>${faction.name}<small> / ${faction.ko}</small></h3>
          <p class="motto">“${faction.motto}”</p>
          <p>${faction.description}</p>
          <footer><span>GOAL / 목표 · ${faction.goal}</span><span>${faction.relation}</span></footer>
        `;
        factionGrid.appendChild(card);
        setTimeout(() => card.classList.add("visible"), index * 45);
      });
  };
  renderFactions();

  factionFilters.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    $$("button", factionFilters).forEach(btn => btn.classList.toggle("active", btn === button));
    renderFactions(button.dataset.filter);
  });

  // Characters
  const characterTabs = $("#characterTabs");
  const characterGrid = $("#characterGrid");
  const characterModal = $("#characterModal");
  const modalCharacter = $("#modalCharacter");
  const charGroups = [
    ["all", "전체 / ALL PLAYERS"],
    ["six-spirits", "식스 스피릿츠 / SIX SPIRITS"],
    ["house", "하우스·렛저 / HOUSE · LEDGER"],
    ["red-chapel", "레드 채플 / RED CHAPEL"],
    ["uncut", "언컷 / UNCUT"]
  ];

  charGroups.forEach(([key, label], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.group = key;
    button.role = "tab";
    button.setAttribute("aria-selected", String(index === 0));
    button.classList.toggle("active", index === 0);
    characterTabs.appendChild(button);
  });

  const portraitMarkup = character => {
    if (character.thumbnail) {
      return `
        <img src="${character.thumbnail}" alt="${character.ko} ${character.name}" loading="lazy" />
        <div class="image-fallback" aria-hidden="true">${character.suit}</div>
      `;
    }
    return `
      <div class="character-placeholder" aria-label="${character.ko} 이미지 준비 중">
        <span>${character.code}</span>
        <small>PORTRAIT PENDING / 이미지 준비 중</small>
      </div>
    `;
  };

  const applyImageFallback = root => {
    $$("img", root).forEach(img => {
      img.addEventListener("error", () => {
        img.style.display = "none";
        const fallback = img.parentElement.querySelector(".image-fallback");
        if (fallback) fallback.style.display = "grid";
      }, { once: true });
      img.addEventListener("load", () => {
        const fallback = img.parentElement.querySelector(".image-fallback");
        if (fallback) fallback.style.display = "none";
      }, { once: true });
    });
  };

  const renderCharacters = (group = "all") => {
    characterGrid.innerHTML = "";
    data.characters
      .filter(character => group === "all" || character.group === group)
      .forEach((character, index) => {
        const card = document.createElement("article");
        card.className = "character-card reveal";
        card.tabIndex = 0;
        card.dataset.character = character.id;
        card.setAttribute("aria-label", `${character.ko} 상세 프로필 열기`);
        card.innerHTML = `
          ${portraitMarkup(character)}
          <div class="character-card-content">
            <div class="character-card-top"><span class="rank-badge">${character.rank}</span><span class="character-code">FILE ${character.code}</span></div>
            <h3>${character.name}<small>${character.ko}</small></h3>
            <p class="character-role">${character.role} · ${character.callSign}</p>
            <p class="character-power">${character.suit} ${character.power}</p>
          </div>
        `;
        characterGrid.appendChild(card);
        applyImageFallback(card);
        setTimeout(() => card.classList.add("visible"), index * 55);
      });
  };
  renderCharacters();

  characterTabs.addEventListener("click", event => {
    const button = event.target.closest("button[data-group]");
    if (!button) return;
    $$("button", characterTabs).forEach(btn => {
      const active = btn === button;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    renderCharacters(button.dataset.group);
  });

  const openCharacter = id => {
    const character = data.characters.find(item => item.id === id);
    if (!character) return;
    modalCharacter.innerHTML = `
      <div class="modal-portrait">${portraitMarkup(character)}</div>
      <div class="modal-copy">
        <p class="eyebrow">CHARACTER FILE / 캐릭터 파일 · ${character.code}</p>
        <h2>${character.name}<small>${character.ko}</small></h2>
        <div class="modal-meta">
          <span>${character.age}세</span><span>${character.origin}</span><span>${character.rank}</span><span>${character.suit} ${character.power}</span>
        </div>
        <h3>ROLE / CALLSIGN · 역할 / 콜사인</h3><p>${character.role} · ${character.callSign}</p>
        <h3>PERSONALITY / 성격</h3><p>${character.personality}</p>
        <h3>HISTORY / 배경</h3><p>${character.history}</p>
        <h3>DETAILS / 디테일</h3><p>${character.style}. ${character.detail}</p>
        <h3>WEAPON / 무장</h3><p>${character.weapon}</p>
        <div class="quote">“${character.quote}”</div>
      </div>
    `;
    applyImageFallback(modalCharacter);
    characterModal.showModal();
    document.body.classList.add("modal-open");
  };

  characterGrid.addEventListener("click", event => {
    const card = event.target.closest(".character-card");
    if (card) openCharacter(card.dataset.character);
  });
  characterGrid.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".character-card");
    if (card) {
      event.preventDefault();
      openCharacter(card.dataset.character);
    }
  });

  // Dialogs
  const closeDialog = dialog => {
    dialog.close();
    document.body.classList.remove("modal-open");
  };
  $$("dialog").forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog || event.target.closest("[data-close-modal]")) closeDialog(dialog);
    });
    dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
  });

  // Soundtrack
  const playlist = $("#playlist");
  const audio = $("#audioPlayer");
  const player = $(".player");
  const playerTitle = $("#playerTitle");
  const playerArtist = $("#playerArtist");
  let playerDescription = $("#playerDescription");
  if (!playerDescription) {
    playerDescription = document.createElement("p");
    playerDescription.id = "playerDescription";
    playerDescription.className = "player-description";
    playerArtist.insertAdjacentElement("afterend", playerDescription);
  }
  const playerScene = $("#playerScene");
  const playerNumber = $("#playerNumber");
  const progressBar = $("#progressBar");
  const playButton = $("#playTrack");
  const bgmSettings = edit.bgm || {};
  const tracks = Array.isArray(bgmSettings.tracks) && bgmSettings.tracks.length ? bgmSettings.tracks : data.tracks;
  let currentTrack = 0;
  audio.volume = Math.min(1, Math.max(0, Number(bgmSettings.volume ?? 0.35)));

  const isDirectAudio = url => /\.(mp3|ogg|wav|m4a|aac)(\?.*)?$/i.test(url || "");
  let deepLinkPlayButton = null;

  const removeDeepLinkPlayButton = () => {
    if (deepLinkPlayButton) deepLinkPlayButton.remove();
    deepLinkPlayButton = null;
  };

  const showDeepLinkPlayButton = (index) => {
    const track = tracks[index];
    if (!track || !isDirectAudio(track.url)) return;
    removeDeepLinkPlayButton();
    deepLinkPlayButton = document.createElement("button");
    deepLinkPlayButton.type = "button";
    deepLinkPlayButton.className = "deep-link-play";
    deepLinkPlayButton.innerHTML = `<span>▶ BGM 재생</span><strong>${track.code || "OST"} · ${track.title}</strong>`;
    deepLinkPlayButton.setAttribute("aria-label", `${track.title} 재생`);
    deepLinkPlayButton.addEventListener("click", () => {
      syncTrack(index, true).then(removeDeepLinkPlayButton).catch(() => {});
    });
    document.body.appendChild(deepLinkPlayButton);
  };

  const syncTrack = (index, autoplay = false) => {
    currentTrack = (index + tracks.length) % tracks.length;
    const track = tracks[currentTrack];
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerDescription.textContent = track.description || "";
    playerDescription.hidden = !track.description;
    playerScene.textContent = track.scene;
    playerNumber.textContent = track.code || String(currentTrack + 1).padStart(2, "0");
    $$(".track", playlist).forEach((el, i) => el.classList.toggle("active", i === currentTrack));
    progressBar.style.width = "0%";
    player.classList.remove("playing");
    if (isDirectAudio(track.url)) {
      audio.src = track.url;
      playButton.textContent = "PLAY / 재생";
      if (autoplay) return audio.play();
    } else {
      audio.removeAttribute("src");
      audio.load();
      playButton.textContent = track.url ? "OPEN / 열기" : "ADD LINK / 링크 추가";
    }
    return Promise.resolve();
  };

  tracks.forEach((track, index) => {
    const row = document.createElement("div");
    row.className = "track";
    row.tabIndex = 0;
    row.dataset.track = String(index);
    row.innerHTML = `
      <span class="track-number">${track.code || String(index + 1).padStart(2, "0")}</span>
      <div class="track-copy">
        <strong>${track.title}</strong>
        <small>${track.scene}</small>
        ${track.description ? `<p class="track-description">${track.description}</p>` : ""}
      </div>
      <em class="track-duration">${track.duration || "--:--"}</em>
    `;
    playlist.appendChild(row);
  });
  syncTrack(0);

  const activateTrackRow = event => {
    const row = event.target.closest(".track");
    if (!row) return;
    syncTrack(Number(row.dataset.track));
  };
  playlist.addEventListener("click", activateTrackRow);
  playlist.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") activateTrackRow(event);
  });

  playButton.addEventListener("click", () => {
    const track = tracks[currentTrack];
    if (!track.url) {
      playButton.textContent = "LINK NEEDED / 링크 필요";
      return;
    }
    if (!isDirectAudio(track.url)) {
      window.open(track.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  });
  $("#prevTrack").addEventListener("click", () => syncTrack(currentTrack - 1, !audio.paused).catch(() => {}));
  $("#nextTrack").addEventListener("click", () => syncTrack(currentTrack + 1, !audio.paused).catch(() => {}));
  audio.addEventListener("play", () => { player.classList.add("playing"); playButton.textContent = "PAUSE / 일시정지"; });
  audio.addEventListener("pause", () => { player.classList.remove("playing"); if (audio.src) playButton.textContent = "PLAY / 재생"; });
  const formatDuration = seconds => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remain = Math.floor(seconds % 60);
    return `${minutes}:${String(remain).padStart(2, "0")}`;
  };
  audio.addEventListener("loadedmetadata", () => {
    const row = $(`.track[data-track="${currentTrack}"]`, playlist);
    const duration = row ? $(".track-duration", row) : null;
    if (duration) duration.textContent = formatDuration(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });
  audio.addEventListener("ended", () => {
    const isLast = currentTrack >= tracks.length - 1;
    if (isLast && bgmSettings.loopPlaylist === false) {
      player.classList.remove("playing");
      playButton.textContent = "PLAY / 재생";
      return;
    }
    syncTrack(currentTrack + 1, true).catch(() => {});
  });

  // Browsers block sound autoplay before a user gesture.
  // The main Enter button supplies that gesture and starts the selected track.
  const enterFloor = $("#enterFloor");
  if (enterFloor && bgmSettings.startOnEnter !== false) {
    enterFloor.addEventListener("click", () => {
      const startIndex = Math.min(tracks.length - 1, Math.max(0, Number(bgmSettings.startTrack || 0)));
      const track = tracks[startIndex];
      if (track && isDirectAudio(track.url)) syncTrack(startIndex, true).catch(() => {});
    });
  }

  // BGM deep links for RP prompts: ?bgm=M01
  const bgmParams = new URLSearchParams(window.location.search);
  const requestedBgm = (bgmParams.get("bgm") || "").trim().toUpperCase();
  if (requestedBgm) {
    const requestedIndex = tracks.findIndex(track => String(track.code || "").toUpperCase() === requestedBgm);
    if (requestedIndex >= 0) {
      syncTrack(requestedIndex);
      window.setTimeout(() => {
        const soundtrackSection = document.getElementById("soundtrack");
        if (soundtrackSection) soundtrackSection.scrollIntoView({ block: "start" });
        syncTrack(requestedIndex, true)
          .then(removeDeepLinkPlayButton)
          .catch(() => showDeepLinkPlayButton(requestedIndex));
      }, 180);
    }
  }


  // Persona ability generator
  const abilityPresets = Array.isArray(window.SIX_SPIRITS_ABILITIES) ? window.SIX_SPIRITS_ABILITIES : [];
  const abilitySuitFilters = $("#abilitySuitFilters");
  const drawAbilityButton = $("#drawAbility");
  const redrawAbilityButton = $("#redrawAbility");
  const copyAbilityButton = $("#copyAbility");
  const abilityPoolCount = $("#abilityPoolCount");
  const abilityResult = $("#abilityResult");
  const abilityCode = $("#abilityCode");
  const abilitySuit = $("#abilitySuit");
  const abilityCategory = $("#abilityCategory");
  const abilityName = $("#abilityName");
  const abilityNameEn = $("#abilityNameEn");
  const abilityEffect = $("#abilityEffect");
  const abilityLimit = $("#abilityLimit");
  const abilityBurst = $("#abilityBurst");
  const abilityPitch = $("#abilityPitch");
  const abilityCopyStatus = $("#abilityCopyStatus");
  let selectedAbilitySuit = "all";
  let currentAbility = null;

  const abilitySuitNames = {
    spade: "신체계 / SPADE",
    heart: "정신계 / HEART",
    diamond: "에너지계 / DIAMOND",
    club: "물질·법칙계 / CLUB"
  };

  const getAbilityPool = () => abilityPresets.filter(item => selectedAbilitySuit === "all" || item.type === selectedAbilitySuit);
  const updateAbilityPoolCount = () => {
    if (abilityPoolCount) abilityPoolCount.textContent = String(getAbilityPool().length);
  };

  const renderAbility = ability => {
    if (!ability || !abilityResult) return;
    currentAbility = ability;
    abilityResult.dataset.suit = ability.type;
    abilityResult.classList.remove("dealt");
    void abilityResult.offsetWidth;
    abilityResult.classList.add("dealt");
    abilityCode.textContent = `${ability.code} · UNREGISTERED FILE`;
    abilitySuit.textContent = ability.suit;
    abilityCategory.textContent = abilitySuitNames[ability.type] || "SIGIL TYPE / 시질 계통";
    abilityName.textContent = ability.name;
    abilityNameEn.textContent = ability.en;
    abilityEffect.textContent = ability.effect;
    abilityLimit.textContent = ability.limit;
    abilityBurst.textContent = ability.burst;
    abilityPitch.textContent = `“${ability.pitch}”`;
    abilityCopyStatus.textContent = "";
  };

  const drawAbility = () => {
    const pool = getAbilityPool();
    if (!pool.length) return;
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && currentAbility) {
      while (next.code === currentAbility.code) next = pool[Math.floor(Math.random() * pool.length)];
    }
    renderAbility(next);
  };

  const abilityCopyText = ability => [
    "# {user} 이능력",
    `시질: ${ability.suit} ${abilitySuitNames[ability.type]}`,
    `능력명: ${ability.name} / ${ability.en}`,
    `효과: ${ability.effect}`,
    `제약: ${ability.limit}`,
    `버스트 위험: ${ability.burst}`
  ].join("\n");

  const fallbackCopy = text => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  };

  const copyAbility = async () => {
    if (!currentAbility) drawAbility();
    if (!currentAbility) return;
    const text = abilityCopyText(currentAbility);
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      } else copied = fallbackCopy(text);
    } catch (_) {
      copied = fallbackCopy(text);
    }
    abilityCopyStatus.textContent = copied
      ? "설정이 복사되었습니다. RP 페르소나란에 그대로 붙여넣으세요."
      : "복사에 실패했습니다. 텍스트를 직접 선택해 복사해주세요.";
  };

  if (abilitySuitFilters && abilityPresets.length) {
    abilitySuitFilters.addEventListener("click", event => {
      const button = event.target.closest("button[data-suit]");
      if (!button) return;
      selectedAbilitySuit = button.dataset.suit;
      $$("button[data-suit]", abilitySuitFilters).forEach(item => item.classList.toggle("active", item === button));
      updateAbilityPoolCount();
      drawAbility();
    });
    drawAbilityButton.addEventListener("click", drawAbility);
    redrawAbilityButton.addEventListener("click", drawAbility);
    copyAbilityButton.addEventListener("click", copyAbility);
    updateAbilityPoolCount();
    drawAbility();
  }

  // Gallery: featured mosaic -> character archive below
  const galleryGrid = $("#galleryGrid");
  const galleryDetail = $("#galleryDetail");
  const galleryDetailTitle = $("#galleryDetailTitle");
  const galleryDetailDesc = $("#galleryDetailDesc");
  const galleryDetailGrid = $("#galleryDetailGrid");
  const closeGalleryDetail = $("#closeGalleryDetail");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  const generalScenes = data.galleryScenes || [];

  const openLightbox = (src, caption, img) => {
    if (!img || img.style.display === "none") return;
    lightboxImage.src = src;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.showModal();
    document.body.classList.add("modal-open");
  };

  const renderFeaturedGallery = () => {
    galleryGrid.innerHTML = "";
    data.gallery.forEach(item => {
      const character = data.characters.find(entry => entry.code === item.code);
      const figure = document.createElement("figure");
      figure.className = "gallery-item reveal";
      figure.tabIndex = 0;
      figure.dataset.characterCode = item.code;
      figure.innerHTML = `
        <img src="${imageUrl(item.code, item.scene)}" alt="${item.title}" loading="lazy" />
        <div class="image-fallback" aria-hidden="true">${item.code}</div>
        <figcaption class="gallery-caption">
          <strong>${item.title}</strong>
          <span>${character ? `${character.ko} / ${character.name}` : item.subtitle}</span>
          <em>OPEN ARCHIVE / 아카이브 열기</em>
        </figcaption>
      `;
      galleryGrid.appendChild(figure);
      applyImageFallback(figure);
      revealObserver.observe(figure);
    });
  };

  const renderCharacterArchive = code => {
    const character = data.characters.find(item => item.code === code);
    if (!character) return;

    galleryDetail.hidden = false;
    galleryDetailTitle.textContent = `${character.ko} / ${character.name}`;
    galleryDetailDesc.textContent = `${character.role} · ${character.callSign} · 일반 이미지 00~21 및 50`;
    galleryDetailGrid.innerHTML = "";

    generalScenes.forEach((scene, index) => {
      const figure = document.createElement("figure");
      figure.className = "gallery-detail-item";
      figure.tabIndex = 0;
      const src = imageUrl(character.code, scene.code);
      const caption = `${character.ko} / ${character.name} · ${scene.code} · ${scene.label} / ${scene.en}`;
      figure.dataset.src = src;
      figure.dataset.caption = caption;
      figure.innerHTML = `
        <img src="${src}" alt="${character.ko} ${scene.label}" loading="lazy" />
        <div class="image-fallback" aria-hidden="true">${scene.code}</div>
        <figcaption><strong>${scene.code} · ${scene.label}</strong><span>${scene.en}</span></figcaption>
      `;
      galleryDetailGrid.appendChild(figure);
      applyImageFallback(figure);
      setTimeout(() => figure.classList.add("visible"), index * 20);
    });

    requestAnimationFrame(() => {
      galleryDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  renderFeaturedGallery();

  const activateFeaturedGallery = event => {
    const figure = event.target.closest(".gallery-item");
    if (!figure) return;
    renderCharacterArchive(figure.dataset.characterCode);
  };
  galleryGrid.addEventListener("click", activateFeaturedGallery);
  galleryGrid.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateFeaturedGallery(event);
  });

  galleryDetailGrid.addEventListener("click", event => {
    const figure = event.target.closest(".gallery-detail-item");
    if (!figure) return;
    openLightbox(figure.dataset.src, figure.dataset.caption, $("img", figure));
  });
  galleryDetailGrid.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const figure = event.target.closest(".gallery-detail-item");
    if (!figure) return;
    event.preventDefault();
    openLightbox(figure.dataset.src, figure.dataset.caption, $("img", figure));
  });

  closeGalleryDetail.addEventListener("click", () => {
    galleryDetail.hidden = true;
    galleryGrid.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
