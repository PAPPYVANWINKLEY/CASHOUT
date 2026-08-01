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
    menuToggle.textContent = open ? "CLOSE / 닫기" : "MENU / 목차";
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
            <span>GOAL / \ubaa9\ud45c \u00b7 ${faction.goal}</span>
            <span>${hasChars ? chars.length + "\uba85 \uc18c\uc18d \u00b7 \ub20c\ub7ec\uc11c \ubcf4\uae30" : "\ub4f1\uc7a5 \uce90\ub9ad\ud130 \uc5c6\uc74c"}</span>
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
          ${portraitMarkup(character)}
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

  // Browsers block sound autoplay before a user gesture.
  // The main Enter button supplies that gesture and starts the selected track.
  const enterFloor = $("#enterFloor");
  if (enterFloor && bgmSettings.startOnEnter !== false) {
    enterFloor.addEventListener("click", () => {
      const playable = tracks.map((t, i) => [t, i]).filter(([t]) => isDirectAudio(t.url));
      if (!playable.length) return;
      const [track, startIndex] = playable[Math.floor(Math.random() * playable.length)];
      syncTrack(startIndex, true).catch(() => {});
    });
  }

  // BGM deep links for RP prompts: ?bgm=M01
  const bgmParams = new URLSearchParams(window.location.search);
  const requestedBgm = (bgmParams.get("bgm") || "").trim().toUpperCase();
  if (requestedBgm) {
    const requestedIndex = tracks.findIndex(track => String(track.code || "").toUpperCase() === requestedBgm);
    if (requestedIndex >= 0) {
      // Prevent the browser from restoring an older scroll position over the requested track.
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";

      // Select and attempt playback immediately. Delaying play() makes transient activation less useful.
      syncTrack(requestedIndex, true)
        .then(removeDeepLinkPlayButton)
        .catch(() => showDeepLinkPlayButton(requestedIndex));

      // Layout, fonts and in-app browsers can settle at different times, so focus the exact row more than once.
      const focusRequestedTrack = behavior => {
        requestAnimationFrame(() => requestAnimationFrame(() => focusTrackRow(requestedIndex, behavior)));
      };
      focusRequestedTrack("auto");
      window.setTimeout(() => focusRequestedTrack("auto"), 260);
      window.addEventListener("load", () => {
        window.setTimeout(() => focusRequestedTrack("smooth"), 80);
      }, { once: true });
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
})();
