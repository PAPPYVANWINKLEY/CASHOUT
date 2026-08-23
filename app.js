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
    heroLead: ["#heroLead", true],
    heroAnnot: ["#heroAnnot", true],
    heroSummary: ["#heroSummary", true],
    quickBriefTitle: ["#quickBriefTitle", true],
    worldIntro: ["#worldIntro", false],
    worldAnnot: ["#worldAnnot", false],
    originText: ["#originText", false],
    originAnnot: ["#originAnnot", false],
    burstAnnot: ["#burstAnnot", false],
    cashoutText: ["#cashoutText", false],
    cashoutAnnot: ["#cashoutAnnot", false],
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
  const ticker = $(".ticker");

  // Keep the rotating world-guide ticker directly beneath the fixed header.
  // Nav is now a sibling after header, so insert ticker after nav or header.
  const tickerAnchor = siteNav || header;
  if (ticker && tickerAnchor && tickerAnchor.nextElementSibling !== ticker) {
    tickerAnchor.insertAdjacentElement("afterend", ticker);
  }
  if (ticker) ticker.classList.add("top-ticker");

  const syncHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const setMobileMenu = open => {
    siteNav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "CLOSE / 그만 보기" : "MENU / 목차는 읽어두자";
  };

  setMobileMenu(false);

  menuToggle.addEventListener("click", () => {
    setMobileMenu(!siteNav.classList.contains("open"));
  });

  $$("a", siteNav).forEach(link => link.addEventListener("click", () => {
    setMobileMenu(false);
  }));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && siteNav.classList.contains("open")) {
      setMobileMenu(false);
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && siteNav.classList.contains("open")) {
      setMobileMenu(false);
    }
  });

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
  ["world", "factions", "soundtrack", "ability-generator", "gallery"].forEach(id => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });


  // Factions + Characters (merged)
  const factionFilters = $("#factionFilters");
  const factionGrid = $("#factionGrid");
  const factionCharacters = $("#factionCharacters");
  const factionCharactersTitle = $("#factionCharactersTitle");
  const characterGrid = $("#characterGrid");
  const characterModal = $("#characterModal");
  const modalCharacter = $("#modalCharacter");
  const closeFactionCharacters = $("#closeFactionCharacters");

  const factionFilterLabels = {
    all: "\uc804\uccb4 / ALL",
    independent: "\ub3c5\ub9bd \uc138\ub825 / INDEPENDENT",
    authority: "\uad8c\ub825\uad8c / AUTHORITY",
    hostile: "\uc801\ub300 \uc138\ub825 / HOSTILE",
    underground: "\uc9c0\ud558 \uc138\ub825 / UNDERGROUND"
  };

  const factionToCharGroup = {
    "six-spirits": "six-spirits",
    "house": "house",
    "ledger": "house",
    "red-chapel": "red-chapel",
    "uncut": "uncut"
  };

  Object.entries(factionFilterLabels).forEach(([key, label], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.filter = key;
    button.classList.toggle("active", index === 0);
    factionFilters.appendChild(button);
  });

  const sortedFactions = [...data.factions].sort((a, b) => {
    const aHas = data.characters.some(c => c.group === factionToCharGroup[a.id]);
    const bHas = data.characters.some(c => c.group === factionToCharGroup[b.id]);
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return 0;
  });

  let activeFactionId = null;

  const renderFactions = (filter = "all") => {
    factionGrid.innerHTML = "";
    sortedFactions
      .filter(f => filter === "all" || f.group === filter)
      .forEach((faction, index) => {
        const charGroup = factionToCharGroup[faction.id];
        const chars = data.characters.filter(c => c.group === charGroup);
        const hasChars = chars.length > 0;
        const card = document.createElement("article");
        card.className = `faction-card reveal${faction.featured ? " featured" : ""}${hasChars ? " has-members" : ""}`;
        card.dataset.symbol = faction.symbol;
        card.dataset.factionId = faction.id;
        card.innerHTML = `
          <span class="tag">${faction.tag}</span>
          <h3>${faction.name}<small> / ${faction.ko}</small></h3>
          <p class="motto">\u201c${faction.motto}\u201d</p>
          <p>${faction.description}</p>
          <footer>
            <span>AGENDA / 속셈 · ${faction.goal}</span>
            <span>${hasChars ? chars.length + "명 소속 · 파일 까보기" : "등장 캐릭터 없음 · 아직은"}</span>
          </footer>
        `;
        if (activeFactionId === faction.id) card.classList.add("faction-active");
        factionGrid.appendChild(card);
        setTimeout(() => card.classList.add("visible"), index * 45);
      });
  };
  renderFactions();

  factionFilters.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    $$("button", factionFilters).forEach(btn => btn.classList.toggle("active", btn === button));
    activeFactionId = null;
    factionCharacters.hidden = true;
    renderFactions(button.dataset.filter);
  });

  factionGrid.addEventListener("click", event => {
    const card = event.target.closest(".faction-card");
    if (!card) return;
    const factionId = card.dataset.factionId;
    const charGroup = factionToCharGroup[factionId];
    const chars = data.characters.filter(c => c.group === charGroup);
    if (!chars.length) return;
    const faction = data.factions.find(f => f.id === factionId);
    activeFactionId = factionId;
    $$(".faction-card", factionGrid).forEach(c => c.classList.toggle("faction-active", c.dataset.factionId === factionId));
    factionCharactersTitle.textContent = `${faction.ko} / ${faction.name}`;
    renderCharacters(charGroup);
    factionCharacters.hidden = false;
    requestAnimationFrame(() => factionCharacters.scrollIntoView({ behavior: "smooth", block: "start" }));
  });

  closeFactionCharacters.addEventListener("click", () => {
    factionCharacters.hidden = true;
    activeFactionId = null;
    $$(".faction-card", factionGrid).forEach(c => c.classList.remove("faction-active"));
    factionGrid.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const portraitMarkup = character => {
    if (character.thumbnail) {
      return `
        <img src="${character.thumbnail}" alt="${character.ko} ${character.name}" loading="lazy" />
        <div class="image-fallback" aria-hidden="true">${character.suit}</div>
      `;
    }
    return `
      <div class="character-placeholder" aria-label="${character.ko} \uc774\ubbf8\uc9c0 \uc900\ube44 \uc911">
        <span>${character.code}</span>
        <small>PORTRAIT PENDING / \uc774\ubbf8\uc9c0 \uc900\ube44 \uc911</small>
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
        const suitMap = {"\u2660":"spade","\u2665":"heart","\u2666":"diamond","\u2663":"club"};
        card.dataset.suit = suitMap[character.suit] || "";
        card.setAttribute("aria-label", `${character.ko} \uc0c1\uc138 \ud504\ub85c\ud544 \uc5f4\uae30`);
        card.innerHTML = `
          <div class="character-card-portrait">${portraitMarkup(character)}</div>
          <div class="character-card-content">
            <div class="character-card-top"><span class="rank-badge">${character.rank}</span><span class="character-code">FILE ${character.code}</span></div>
            <h3>${character.name}<small>${character.ko}</small></h3>
            <p class="character-role">${character.role} \u00b7 ${character.callSign}</p>
            <p class="character-power">${character.suit} ${character.power}</p>
          </div>
        `;
        characterGrid.appendChild(card);
        applyImageFallback(card);
        setTimeout(() => card.classList.add("visible"), index * 55);
      });
  };

  // Track which characters are currently shown, for modal prev/next
  let modalCharList = [];
  let modalCharIndex = 0;

  const openCharacter = id => {
    const character = data.characters.find(item => item.id === id);
    if (!character) return;

    // Build nav list from currently rendered cards
    modalCharList = $$(".character-card", characterGrid).map(c => c.dataset.character);
    modalCharIndex = modalCharList.indexOf(id);
    if (modalCharIndex < 0) { modalCharList = [id]; modalCharIndex = 0; }

    modalCharacter.innerHTML = `
      <div class="modal-portrait">${portraitMarkup(character)}</div>
      <div class="modal-copy">
        <p class="eyebrow">CHARACTER FILE / 신상명세서 · ${character.code}</p>
        <h2>${character.name}<small>${character.ko}</small></h2>
        <div class="modal-meta">
          <span>${character.age}세</span><span>${character.origin}</span><span>${character.rank}</span><span>${character.suit} ${character.power}</span>
        </div>
        <h3>ROLE / CALLSIGN · 하는 일 / 불리는 이름</h3><p>${character.role} · ${character.callSign}</p>
        <h3>PERSONALITY / 성격, 혹은 문제의 근원</h3><p>${character.personality}</p>
        <h3>HISTORY / 왜 이렇게 됐나</h3><p>${character.history}</p>
        <h3>DETAILS / 쓸데없이 중요한 디테일</h3><p>${character.style}. ${character.detail}</p>
        <h3>WEAPON / 문제 해결 도구</h3><p>${character.weapon}</p>
        <div class="quote">“${character.quote}”</div>
      </div>
    `;
    applyImageFallback(modalCharacter);

    // Update nav state
    const navCount = $("#modalNavCount");
    const navPrev = $("#modalPrev");
    const navNext = $("#modalNext");
    if (navCount) navCount.textContent = `${modalCharIndex + 1} / ${modalCharList.length}`;
    const single = modalCharList.length < 2;
    if (navPrev) navPrev.style.visibility = single ? "hidden" : "visible";
    if (navNext) navNext.style.visibility = single ? "hidden" : "visible";

    if (!characterModal.open) characterModal.showModal();
    modalCharacter.scrollTop = 0;
    characterModal.scrollTop = 0;
    document.body.classList.add("modal-open");
  };

  const stepCharacter = dir => {
    if (modalCharList.length < 2) return;
    modalCharIndex = (modalCharIndex + dir + modalCharList.length) % modalCharList.length;
    openCharacter(modalCharList[modalCharIndex]);
  };

  const modalPrevBtn = $("#modalPrev");
  const modalNextBtn = $("#modalNext");
  if (modalPrevBtn) modalPrevBtn.addEventListener("click", e => { e.stopPropagation(); stepCharacter(-1); });
  if (modalNextBtn) modalNextBtn.addEventListener("click", e => { e.stopPropagation(); stepCharacter(1); });

  // Arrow keys inside character modal
  document.addEventListener("keydown", event => {
    if (!characterModal.open) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); stepCharacter(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); stepCharacter(1); }
  });

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
  let deepLinkUnlockCleanup = null;

  const clearDeepLinkUnlock = () => {
    if (typeof deepLinkUnlockCleanup === "function") deepLinkUnlockCleanup();
    deepLinkUnlockCleanup = null;
  };

  const removeDeepLinkPlayButton = () => {
    if (deepLinkPlayButton) deepLinkPlayButton.remove();
    deepLinkPlayButton = null;
    clearDeepLinkUnlock();
  };

  const focusTrackRow = (index, behavior = "smooth") => {
    const row = $(`.track[data-track="${index}"]`, playlist);
    if (!row) return;
    $$(".track.deep-linked", playlist).forEach(item => item.classList.remove("deep-linked"));
    row.classList.add("deep-linked");
    row.scrollIntoView({ behavior, block: "center", inline: "nearest" });
  };

  const armDeepLinkUnlock = index => {
    clearDeepLinkUnlock();
    const tryPlay = () => {
      clearDeepLinkUnlock();
      syncTrack(index, true)
        .then(removeDeepLinkPlayButton)
        .catch(() => showDeepLinkPlayButton(index));
    };
    const options = { capture: true, passive: true };
    document.addEventListener("pointerdown", tryPlay, options);
    document.addEventListener("keydown", tryPlay, { capture: true });
    deepLinkUnlockCleanup = () => {
      document.removeEventListener("pointerdown", tryPlay, options);
      document.removeEventListener("keydown", tryPlay, { capture: true });
    };
  };

  const showDeepLinkPlayButton = index => {
    const track = tracks[index];
    if (!track || !isDirectAudio(track.url)) return;
    if (deepLinkPlayButton) deepLinkPlayButton.remove();
    deepLinkPlayButton = document.createElement("button");
    deepLinkPlayButton.type = "button";
    deepLinkPlayButton.className = "deep-link-play";
    deepLinkPlayButton.innerHTML = `<span>▶ 선택한 BGM 재생</span><strong>${track.code || "OST"} · ${track.title}</strong>`;
    deepLinkPlayButton.setAttribute("aria-label", `${track.title} 재생`);
    deepLinkPlayButton.addEventListener("click", event => {
      event.stopPropagation();
      focusTrackRow(index, "smooth");
      syncTrack(index, true).then(removeDeepLinkPlayButton).catch(() => {});
    });
    document.body.appendChild(deepLinkPlayButton);
    armDeepLinkUnlock(index);
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
    row.id = `bgm-${String(track.code || index + 1).toUpperCase()}`;
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
  // Progress bar click-to-seek
  const progressContainer = $(".progress");
  if (progressContainer) {
    progressContainer.addEventListener("click", event => {
      if (!audio.duration) return;
      const rect = progressContainer.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * audio.duration;
    });
  }
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

  // ------------------------------------------------------------------
  // BGM deep links for RP prompts: ?bgm=M01
  //
  // Browsers refuse audio.play() until the page has received a real user
  // gesture. Arriving via a link is NOT such a gesture, so an unattended
  // autoplay attempt on load is rejected in Chrome, Safari, and every
  // in-app browser (KakaoTalk, Discord, Instagram...).
  //
  // The entry gate solves this: the visitor must click "입장하기" to get in,
  // and that single click is the gesture that unlocks playback. We still try
  // to play right away in case the browser happens to allow it.
  // ------------------------------------------------------------------
  const bgmParams = new URLSearchParams(window.location.search);
  const requestedBgm = (bgmParams.get("bgm") || "").trim().toUpperCase();
  const deepLinkIndex = requestedBgm
    ? tracks.findIndex(track => String(track.code || "").toUpperCase() === requestedBgm)
    : -1;
  const deepLinkTrack = deepLinkIndex >= 0 ? tracks[deepLinkIndex] : null;

  if (deepLinkIndex >= 0) {
    // Prevent the browser from restoring an older scroll position over the requested track.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    // Preload so playback starts instantly the moment the gate is opened.
    if (isDirectAudio(deepLinkTrack.url)) {
      audio.preload = "auto";
      syncTrack(deepLinkIndex, true)
        .then(removeDeepLinkPlayButton)
        .catch(() => {
          // Blocked, as expected. The gate click will handle it.
          if (!document.body.classList.contains("gated")) showDeepLinkPlayButton(deepLinkIndex);
        });
    } else {
      syncTrack(deepLinkIndex);
    }
  }

  // Called from the entry gate click handler, synchronously, so the gesture counts.
  const startBgmOnEnter = () => {
    if (deepLinkIndex >= 0) {
      if (!isDirectAudio(deepLinkTrack.url)) return;
      syncTrack(deepLinkIndex, true)
        .then(removeDeepLinkPlayButton)
        .catch(() => showDeepLinkPlayButton(deepLinkIndex));
      return;
    }
    if (bgmSettings.startOnEnter === false) return;
    const playable = tracks.map((t, i) => [t, i]).filter(([t]) => isDirectAudio(t.url));
    if (!playable.length) return;
    const [, startIndex] = playable[Math.floor(Math.random() * playable.length)];
    syncTrack(startIndex, true).catch(() => {});
  };

  // Tell the visitor which track the link asked for, right on the gate.
  const enterHint = $("#enterHint");
  const enterFloor = $("#enterFloor");
  if (deepLinkTrack && enterHint) {
    enterHint.hidden = false;
    enterHint.innerHTML = `♪ 요청된 BGM <strong>${deepLinkTrack.code} ${deepLinkTrack.title}</strong> — 입장과 동시에 재생됩니다.`;
    if (enterFloor) enterFloor.textContent = `▶ PLAY & ENTER / ${deepLinkTrack.title} 재생하고 입장`;
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

  // === Silent card spin reveal after the MP4 ===
  const suitCharsMap = { spade: '♠', heart: '♥', diamond: '♦', club: '♣' };

  const playCardFlipReveal = (ability, onDone) => {
    const isRed = ability.type === 'heart' || ability.type === 'diamond';
    const suitChar = suitCharsMap[ability.type] || '♠';
    const colorClass = isRed ? 'red' : 'gold';

    const oldOverlay = abilityResult.querySelector('.draw-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'draw-overlay';
    overlay.innerHTML = `
      <div class="draw-card">
        <div class="draw-card-inner">
          <div class="draw-card-face draw-card-back"></div>
          <div class="draw-card-face draw-card-front">
            <span class="corner-suit tl ${colorClass}">${suitChar}</span>
            <span class="draw-suit-symbol ${colorClass}">${suitChar}</span>
            <span class="corner-suit br ${colorClass}">${suitChar}</span>
          </div>
        </div>
      </div>
    `;
    abilityResult.appendChild(overlay);
    abilityResult.classList.add('staging');

    const inner = overlay.querySelector('.draw-card-inner');

    // Let the card settle into frame, then rotate continuously on one axis.
    setTimeout(() => {
      if (inner) inner.classList.add('spinning');
    }, 620);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      fillAbilityContent(ability);
      abilityResult.classList.remove('staging');
      abilityResult.classList.remove('file-reveal');
      void abilityResult.offsetWidth;
      abilityResult.classList.add('file-reveal');
      setTimeout(() => {
        overlay.remove();
        if (typeof onDone === 'function') onDone();
      }, 420);
    }, 2180);
  };

  // === Cinematic MP4 ability draw sequence ===
  const ABILITY_DRAW_VIDEO_URL = "https://i.cpvw.uk/6SC/ability-draw.mp4";
  let drawInProgress = false;
  let cinematicOverlay = null;
  let cinematicVideo = null;
  let cinematicTimeout = null;
  let bgmVolumeBeforeCinematic = null;

  const fillAbilityContent = ability => {
    abilityResult.dataset.suit = ability.type;
    abilityCode.textContent = `${ability.code} · UNREGISTERED FILE`;
    abilitySuit.textContent = ability.suit;
    abilityCategory.textContent = abilitySuitNames[ability.type] || "SIGIL TYPE / 시질 계통";
    abilityName.textContent = ability.name;
    abilityNameEn.textContent = ability.en;
    abilityEffect.textContent = ability.effect;
    abilityLimit.textContent = ability.limit;
    abilityBurst.textContent = ability.burst;
    if (ability.pitch) {
      abilityPitch.textContent = `“${ability.pitch}”`;
      abilityPitch.hidden = false;
    } else {
      abilityPitch.textContent = "";
      abilityPitch.hidden = true;
    }
    abilityCopyStatus.textContent = "";
  };

  const ensureAbilityCinematic = () => {
    if (cinematicOverlay && cinematicVideo) return;

    cinematicOverlay = document.createElement("div");
    cinematicOverlay.className = "ability-cinematic-overlay";
    cinematicOverlay.hidden = true;
    cinematicOverlay.setAttribute("aria-hidden", "true");
    cinematicOverlay.innerHTML = `
      <div class="ability-cinematic-frame">
        <video
          class="ability-cinematic-video"
          preload="auto"
          playsinline
          webkit-playsinline
          disablepictureinpicture
          disableremoteplayback
        ></video>
        <span class="ability-cinematic-loader" aria-hidden="true">6</span>
      </div>
    `;
    document.body.appendChild(cinematicOverlay);

    cinematicVideo = cinematicOverlay.querySelector("video");
    cinematicVideo.src = ABILITY_DRAW_VIDEO_URL;
    cinematicVideo.controls = false;
    cinematicVideo.loop = false;
    cinematicVideo.muted = false;
    cinematicVideo.volume = 1;
    cinematicVideo.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
    cinematicVideo.load();
  };

  const duckBgmForCinematic = () => {
    if (!audio || audio.paused || bgmVolumeBeforeCinematic !== null) return;
    bgmVolumeBeforeCinematic = audio.volume;
    audio.volume = Math.min(audio.volume, 0.07);
  };

  const restoreBgmAfterCinematic = () => {
    if (!audio || bgmVolumeBeforeCinematic === null) return;
    audio.volume = bgmVolumeBeforeCinematic;
    bgmVolumeBeforeCinematic = null;
  };

  const renderAbility = ability => {
    if (!ability || !abilityResult || drawInProgress) return;
    currentAbility = ability;
    drawInProgress = true;

    abilityResult.classList.remove("file-reveal");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      fillAbilityContent(ability);
      void abilityResult.offsetWidth;
      abilityResult.classList.add("file-reveal");
      drawInProgress = false;
      return;
    }

    ensureAbilityCinematic();
    if (!cinematicOverlay || !cinematicVideo) {
      playCardFlipReveal(ability, () => {
        drawInProgress = false;
      });
      return;
    }

    abilityResult.classList.add("staging");
    document.body.classList.add("ability-cinematic-open");
    cinematicOverlay.hidden = false;
    cinematicOverlay.classList.remove("playing", "ending");
    void cinematicOverlay.offsetWidth;
    cinematicOverlay.classList.add("active");

    cinematicVideo.pause();
    try { cinematicVideo.currentTime = 0; } catch (error) {}
    cinematicVideo.muted = false;
    cinematicVideo.volume = 1;
    duckBgmForCinematic();

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (cinematicTimeout) clearTimeout(cinematicTimeout);
      cinematicTimeout = null;

      cinematicOverlay.classList.add("ending");

      setTimeout(() => {
        cinematicVideo.pause();
        cinematicOverlay.classList.remove("active", "playing", "ending");
        cinematicOverlay.hidden = true;
        document.body.classList.remove("ability-cinematic-open");
        restoreBgmAfterCinematic();

        playCardFlipReveal(ability, () => {
          drawInProgress = false;
          abilityResult.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }, 260);
    };

    cinematicVideo.onplaying = () => cinematicOverlay.classList.add("playing");
    cinematicVideo.ontimeupdate = () => {
      if (Number.isFinite(cinematicVideo.duration) && cinematicVideo.duration - cinematicVideo.currentTime < 0.55) {
        cinematicOverlay.classList.add("ending");
      }
    };
    cinematicVideo.onended = finish;
    cinematicVideo.onerror = finish;

    cinematicTimeout = setTimeout(finish, 8000);

    const playPromise = cinematicVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Muted inline playback is the broadest mobile fallback.
        cinematicVideo.muted = true;
        cinematicVideo.play().catch(finish);
      });
    }
  };

  // Warm the remote MP4 cache after the page has settled.
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(ensureAbilityCinematic, { timeout: 1800 });
  } else {
    setTimeout(ensureAbilityCinematic, 500);
  }

  const drawAbility = () => {
    if (drawInProgress) return;
    const pool = getAbilityPool();
    if (!pool.length) return;
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && currentAbility) {
      while (next.code === currentAbility.code) next = pool[Math.floor(Math.random() * pool.length)];
    }
    renderAbility(next);
    // Auto-scroll to see the card animation
    requestAnimationFrame(() => {
      abilityResult.scrollIntoView({ behavior: "smooth", block: "center" });
    });
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
      ? "복사 완료. 이제 RP 페르소나란에 붙여넣고 책임은 미래의 나에게 넘기세요."
      : "복사 실패. 기술도 가끔 배신합니다. 직접 선택해서 복사해주세요.";
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
    // Initial load: show without animation
    const initPool = getAbilityPool();
    if (initPool.length) {
      const initAbility = initPool[Math.floor(Math.random() * initPool.length)];
      currentAbility = initAbility;
      fillAbilityContent(initAbility);
    }
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
    galleryDetailDesc.textContent = `${character.role} · ${character.callSign} · 일반 이미지 00~20`;
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

  // Floating back-to-top button
  const fabTop = document.getElementById("fabTop");
  if (fabTop) {
    fabTop.hidden = false;
    const syncFab = () => {
      fabTop.classList.toggle("visible", window.scrollY > window.innerHeight);
    };
    syncFab();
    window.addEventListener("scroll", syncFab, { passive: true });
    fabTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  // ==========================================================
  // MINI BGM PLAYER (bottom navigator)
  // ==========================================================
  const miniPlayer = $("#miniPlayer");
  if (miniPlayer && audio) {
    const miniPlay = $("#miniPlay");
    const miniPrev = $("#miniPrev");
    const miniNext = $("#miniNext");
    const miniMute = $("#miniMute");
    const miniClose = $("#miniClose");
    const miniCode = $("#miniCode");
    const miniTitle = $("#miniTitle");
    const miniProgress = $("#miniProgress");
    const miniProgressBar = $("#miniProgressBar");

    let miniDismissed = false;

    // Restore mute preference
    try {
      if (localStorage.getItem("sixSpiritsMuted") === "1") {
        audio.muted = true;
        miniMute.classList.add("muted");
        miniMute.textContent = "\u{1F507}";
      }
    } catch (e) {}

    const syncMini = () => {
      const track = tracks[currentTrack];
      if (!track) return;
      miniCode.textContent = track.code || String(currentTrack + 1).padStart(2, "0");
      miniTitle.textContent = track.title || "\u2014";
      miniPlay.classList.toggle("playing", !audio.paused);
      // Show player once audio has been engaged
      if (!miniDismissed && (!audio.paused || audio.currentTime > 0)) {
        miniPlayer.hidden = false;
        requestAnimationFrame(() => miniPlayer.classList.add("visible"));
      }
    };

    audio.addEventListener("play", syncMini);
    audio.addEventListener("pause", syncMini);
    audio.addEventListener("loadedmetadata", syncMini);
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      miniProgressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    });

    miniPlay.addEventListener("click", () => {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });
    miniPrev.addEventListener("click", () => {
      syncTrack(currentTrack - 1, !audio.paused).catch(() => {});
      setTimeout(syncMini, 60);
    });
    miniNext.addEventListener("click", () => {
      syncTrack(currentTrack + 1, !audio.paused).catch(() => {});
      setTimeout(syncMini, 60);
    });
    miniMute.addEventListener("click", () => {
      audio.muted = !audio.muted;
      miniMute.classList.toggle("muted", audio.muted);
      miniMute.textContent = audio.muted ? "\u{1F507}" : "\u{1F50A}";
      try { localStorage.setItem("sixSpiritsMuted", audio.muted ? "1" : "0"); } catch (e) {}
    });
    miniClose.addEventListener("click", () => {
      miniDismissed = true;
      miniPlayer.classList.remove("visible");
      setTimeout(() => { miniPlayer.hidden = true; }, 320);
    });
    miniProgress.addEventListener("click", event => {
      if (!audio.duration) return;
      const rect = miniProgress.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * audio.duration;
    });

    syncMini();
  }

  // ==========================================================
  // GALLERY IMAGE LIGHTBOX
  // ==========================================================
  const imgLightbox = $("#imgLightbox");
  if (imgLightbox) {
    const lbImg = $("#imgLightboxImg");
    const lbCaption = $("#imgLightboxCaption");
    const lbClose = $("#imgLightboxClose");
    const lbPrev = $("#imgLightboxPrev");
    const lbNext = $("#imgLightboxNext");

    let lbItems = [];
    let lbIndex = 0;

    const showLb = i => {
      if (!lbItems.length) return;
      lbIndex = (i + lbItems.length) % lbItems.length;
      const item = lbItems[lbIndex];
      lbImg.src = item.src;
      lbImg.alt = item.caption;
      lbCaption.textContent = item.caption;
      const single = lbItems.length < 2;
      lbPrev.style.display = single ? "none" : "block";
      lbNext.style.display = single ? "none" : "block";
    };

    const openLb = (items, startIndex) => {
      lbItems = items;
      imgLightbox.hidden = false;
      document.body.classList.add("modal-open");
      showLb(startIndex);
    };
    const closeLb = () => {
      imgLightbox.hidden = true;
      document.body.classList.remove("modal-open");
      lbImg.src = "";
    };

    lbClose.addEventListener("click", closeLb);
    lbPrev.addEventListener("click", () => showLb(lbIndex - 1));
    lbNext.addEventListener("click", () => showLb(lbIndex + 1));
    imgLightbox.addEventListener("click", event => {
      if (event.target === imgLightbox) closeLb();
    });
    document.addEventListener("keydown", event => {
      if (imgLightbox.hidden) return;
      if (event.key === "Escape") closeLb();
      if (event.key === "ArrowLeft") showLb(lbIndex - 1);
      if (event.key === "ArrowRight") showLb(lbIndex + 1);
    });

    // Hook archive items
    if (galleryDetailGrid) {
      galleryDetailGrid.addEventListener("click", event => {
        const fig = event.target.closest(".gallery-detail-item");
        if (!fig) return;
        const all = $$(".gallery-detail-item", galleryDetailGrid);
        const items = all
          .filter(f => {
            const img = f.querySelector("img");
            return img && img.style.display !== "none";
          })
          .map(f => ({ src: f.dataset.src, caption: f.dataset.caption }));
        const clickedSrc = fig.dataset.src;
        const idx = items.findIndex(it => it.src === clickedSrc);
        if (idx >= 0) openLb(items, idx);
      });
      galleryDetailGrid.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const fig = event.target.closest(".gallery-detail-item");
        if (!fig) return;
        event.preventDefault();
        fig.click();
      });
    }
  }

  // ==========================================================
  // GLOSSARY TOOLTIPS
  // ==========================================================
  const glossaryTip = $("#glossaryTip");
  if (glossaryTip) {
    const glossary = {
      "시질": ["SIGIL / 시질", "오른손등에 나타나는 카드 문양. 능력의 증표이자 계통표다. 몸에 붙은 사원증인데 퇴사 버튼이 없다."],
      "딜러": ["DEALER / 딜러", "하우스에 등록된 이능력자. 전적과 킬에 따라 브론즈부터 다이아몬드까지 오른다. 경력 관리가 문자 그대로 살벌하다."],
      "마크": ["MARK / 마크", "능력 없는 사람 또는 미등록자를 낮춰 부르는 말. 차별은 짧은 단어일수록 휴대가 편한 모양이다."],
      "칩": ["CHIP / 칩", "화폐이자 등록권이자 생존 자원. 하우스는 사람 목숨에 가격표를 붙이고 디자인까지 카지노답게 맞췄다."],
      "버스트": ["BURST / 버스트", "능력 과부하로 몸과 판단이 무너지는 상태. 발열, 손떨림, 코피, 감각 왜곡, 폭주 순. 몸이 다섯 번이나 경고해준다."],
      "캐시아웃": ["CASHOUT / 캐시아웃", "매년 1월 27일 자정부터 여섯 시간 동안 열리는 강제 생존전. 연례행사지만 가족 할인은 없다."],
      "하우스": ["THE HOUSE / 하우스", "딜러를 등록하고 억제제와 정보망, 캐시아웃까지 관리하는 권력 조직. 보호와 통제를 한 손에 쥔다. 어느 쪽이 엄지인지는 굳이 묻지 말자."]
    };

    const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Wrap glossary terms in target sections
    const targets = ["#world", "#factions", ".quick-brief-board"];
    const seen = new Set();
    targets.forEach(sel => {
      const root = document.querySelector(sel);
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.closest(".glossary-term, h1, h2, script, style, button, .eyebrow")) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);

      textNodes.forEach(node => {
        let html = node.nodeValue;
        let changed = false;
        terms.forEach(term => {
          if (seen.has(term)) return;
          const re = new RegExp(escapeRe(term));
          if (re.test(html)) {
            html = html.replace(re, `<span class="glossary-term" data-term="${term}" tabindex="0">${term}</span>`);
            seen.add(term);
            changed = true;
          }
        });
        if (changed) {
          const span = document.createElement("span");
          span.innerHTML = html;
          node.parentNode.replaceChild(span, node);
        }
      });
    });

    const showTip = (el) => {
      const term = el.dataset.term;
      const entry = glossary[term];
      if (!entry) return;
      glossaryTip.innerHTML = `<strong>${entry[0]}</strong>${entry[1]}`;
      glossaryTip.hidden = false;
      const rect = el.getBoundingClientRect();
      requestAnimationFrame(() => {
        const tipRect = glossaryTip.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - tipRect.width / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - tipRect.width - 12));
        let top = rect.top - tipRect.height - 10;
        if (top < 12) top = rect.bottom + 10;
        glossaryTip.style.left = `${left}px`;
        glossaryTip.style.top = `${top}px`;
        glossaryTip.classList.add("visible");
      });
    };
    const hideTip = () => {
      glossaryTip.classList.remove("visible");
      setTimeout(() => { glossaryTip.hidden = true; }, 200);
    };

    document.addEventListener("mouseover", event => {
      const el = event.target.closest(".glossary-term");
      if (el) showTip(el);
    });
    document.addEventListener("mouseout", event => {
      if (event.target.closest(".glossary-term")) hideTip();
    });
    document.addEventListener("focusin", event => {
      const el = event.target.closest(".glossary-term");
      if (el) showTip(el);
    });
    document.addEventListener("focusout", event => {
      if (event.target.closest(".glossary-term")) hideTip();
    });
    // Mobile tap
    document.addEventListener("click", event => {
      const el = event.target.closest(".glossary-term");
      if (el) {
        event.preventDefault();
        if (glossaryTip.classList.contains("visible")) hideTip();
        else showTip(el);
      } else if (glossaryTip.classList.contains("visible")) {
        hideTip();
      }
    });
  }

  // ==========================================================
  // IMAGE SKELETON LOADING
  // ==========================================================
  const attachSkeleton = img => {
    const parent = img.parentElement;
    if (!parent || parent.classList.contains("img-skeleton")) return;
    parent.classList.add("img-skeleton");
    if (img.complete && img.naturalWidth > 0) {
      parent.classList.add("loaded");
      return;
    }
    img.addEventListener("load", () => parent.classList.add("loaded"), { once: true });
    img.addEventListener("error", () => parent.classList.add("loaded"), { once: true });
  };

  const skeletonObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === "IMG") attachSkeleton(node);
        node.querySelectorAll && node.querySelectorAll("img").forEach(attachSkeleton);
      });
    });
  });
  skeletonObserver.observe(document.body, { childList: true, subtree: true });
  $$("img").forEach(attachSkeleton);


  /* ============================================================
     REVISION LAYER — 주석 등장 · 버스트 점화 · 용어 힌트 ·
                      미니플레이어 접기 · 갤러리 목록 복귀
     ============================================================ */

  // (1) 주석(.annot)이 화면에 들어오면 왼쪽 세로선이 그어진다.
  //     내용이 비어 있는 주석은 자리를 차지하지 않도록 숨긴다.
  $$(".annot").forEach(el => {
    if (!el.textContent.trim()) el.hidden = true;
  });
  const annotObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      annotObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  $$(".annot").forEach(el => annotObserver.observe(el));

  // (2) 버스트 트랙: 스크롤 진행에 따라 01 -> 05 로 붉게 물든다.
  const burstBoard = $(".system-board");
  const burstItems = $$(".burst-track li");
  if (burstBoard && burstItems.length) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paintBurst = () => {
      const rect = burstBoard.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.35)));
      const lit = Math.round(progress * burstItems.length);
      burstItems.forEach((li, i) => {
        const on = i < lit;
        li.classList.toggle("lit", on);
        if (on) li.style.setProperty("--lit", (0.04 + i * 0.035).toFixed(3));
      });
      burstBoard.classList.toggle("burning", progress > 0.6);
    };
    if (reduceMotion) {
      burstItems.forEach((li, i) => { li.classList.add("lit"); li.style.setProperty("--lit", (0.04 + i * 0.035).toFixed(3)); });
    } else {
      paintBurst();
      window.addEventListener("scroll", paintBurst, { passive: true });
      window.addEventListener("resize", paintBurst);
    }
  }

  // (3) 용어 툴팁: 첫 진입 때 첫 번째 용어만 한 번 깜빡여 알려준다.
  const firstTerm = $(".glossary-term");
  if (firstTerm) {
    const hintObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        firstTerm.classList.add("hint-pulse");
        setTimeout(() => firstTerm.classList.remove("hint-pulse"), 5200);
        hintObserver.disconnect();
      });
    }, { threshold: 1 });
    hintObserver.observe(firstTerm);
  }

  // (4) 미니 플레이어 접기 (모바일에서는 기본 접힘)
  const miniPlayerEl = $("#miniPlayer");
  const miniHandle = $("#miniHandle");
  if (miniPlayerEl && miniHandle) {
    if (window.matchMedia("(max-width: 720px)").matches) miniPlayerEl.classList.add("collapsed");
    miniHandle.addEventListener("click", () => miniPlayerEl.classList.toggle("collapsed"));
  }

  // (5) 갤러리 상세 하단 -> 캐릭터 목록으로 복귀
  const galleryBackTop = $("#galleryBackTop");
  const galleryGridEl = $("#galleryGrid");
  const galleryDetailEl = $("#galleryDetail");
  if (galleryBackTop && galleryGridEl) {
    galleryBackTop.addEventListener("click", () => {
      const headerH = ($(".site-header") || {}).offsetHeight || 64;
      const tickerH = ($(".ticker") || {}).offsetHeight || 0;
      const top = galleryGridEl.getBoundingClientRect().top + window.scrollY - headerH - tickerH - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }
  // 상세가 열려 있는 동안에만 하단 복귀 버튼이 의미가 있으므로 상태를 맞춰둔다.
  if (galleryDetailEl && galleryBackTop) {
    const detailStateObserver = new MutationObserver(() => {
      galleryBackTop.disabled = galleryDetailEl.hidden;
    });
    detailStateObserver.observe(galleryDetailEl, { attributes: true, attributeFilter: ["hidden"] });
  }


  // (6) 입장 게이트 — 첫 화면은 히어로 하나만. 버튼을 눌러야 안으로 들어간다.
  const gateButton = $("#enterFloor");
  const enterCurtain = $("#enterCurtain");
  let gateOpened = false;

  const openGate = () => {
    if (gateOpened) return;
    gateOpened = true;

    // 이 호출은 클릭 핸들러 안에서 동기적으로 일어나야 브라우저가
    // 사용자 제스처로 인정하고 오디오 재생을 허용한다.
    startBgmOnEnter();

    if (enterCurtain) enterCurtain.classList.add("on");
    window.setTimeout(() => {
      document.documentElement.classList.remove("gated");
      document.body.classList.remove("gated");
      document.body.classList.add("entered");

      // ?bgm= 로 들어온 방문자는 해당 트랙 앞으로, 그 외에는 빠른 요약으로.
      const target = deepLinkIndex >= 0 ? $("#soundtrack") : $("#quick-brief");
      if (target) {
        const headerH = ($(".site-header") || {}).offsetHeight || 64;
        const tickerH = ($(".ticker") || {}).offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - tickerH - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      }
      if (deepLinkIndex >= 0) {
        window.setTimeout(() => focusTrackRow(deepLinkIndex, "auto"), 80);
      }
      if (enterCurtain) enterCurtain.classList.remove("on");
    }, 270);
  };

  if (gateButton) {
    gateButton.addEventListener("click", event => {
      if (!document.body.classList.contains("gated")) return; // 이미 들어온 뒤에는 평범한 앵커 링크
      event.preventDefault();
      openGate();
    });
  }
  // 게이트가 열리기 전에는 Enter/Space 로도 들어갈 수 있게
  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("gated")) return;
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      openGate();
    }
  });
  // 안전장치: 어떤 이유로든 버튼이 없으면 게이트를 걸어두지 않는다.
  if (!gateButton) {
    document.documentElement.classList.remove("gated");
    document.body.classList.remove("gated");
  }

})();
