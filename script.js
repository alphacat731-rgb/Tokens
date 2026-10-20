(() => {
  "use strict";

  const STORAGE_KEY = "token-guest-v1";
  const LOCK_KEY = "token-earn-lock-v1";
  const EARNING_INTERVAL = 5 * 60 * 1000;
  const EARNING_REWARD = 5;
  const AD_REWARD = 15;
  const AD_DURATION = 8000;
  const AD_COOLDOWN = 30000;
  const LOCK_TTL = 90000;
  const HEARTBEAT_EVERY = 1000;
  const MAX_COUNTED_GAP = 75000;
  const numberFormat = new Intl.NumberFormat("en-US");
  const thresholds = [
    { id: 100, label: "First century", note: "100 Tokens", icon: "✦" },
    { id: 1000, label: "Tiny tycoon", note: "1,000 Tokens", icon: "◈" },
    { id: 10000, label: "Pointless pro", note: "10,000 Tokens", icon: "✧" },
    { id: 100000, label: "The void knows", note: "100,000 Tokens", icon: "♔" }
  ];
  const ads = [
    { kicker: "NOW WITH 0% MORE PURPOSE", object: "∅", title: "Nothing, now in premium.", description: "The exact same empty space. But the feeling of ownership is deluxe.", brand: "NOTHING+™" },
    { kicker: "THE FUTURE IS COMPLETELY EMPTY", object: "◌", title: "Self-warming ice cubes.", description: "Why tolerate cold ice when it can be pleasantly lukewarm? Innovation has peaked.", brand: "MELT LABS™" },
    { kicker: "BREATHE LIKE YOU MEAN IT", object: "〰", title: "Artisanal bottled air.", description: "Captured in a room with a very tasteful window. Now with notes of Tuesday.", brand: "AIR DE RIEN™" },
    { kicker: "YOU DESERVE LESS", object: "◇", title: "A subscription to absolutely nothing.", description: "Monthly billing for the same nothing you already have. Cancel never. Receive never.", brand: "EMPTYCO™" },
    { kicker: "FINALLY, AN INVISIBLE SOLUTION", object: "◯", title: "Premium invisible furniture.", description: "You'll never stub your toe on it. You'll also never sit on it. Perfectly balanced.", brand: "NOT THERE™" }
  ];
  const boards = {
    today: [
      { name: "MossWithWiFi", score: 865, vibe: "↑ 4", shift: "up", avatar: "M" },
      { name: "soup.exe", score: 740, vibe: "↑ 2", shift: "up", avatar: "S" },
      { name: "ChairEnjoyer", score: 625, vibe: "↑ 1", shift: "up", avatar: "C" },
      { name: "BitOfDust", score: 510, vibe: "—", shift: "steady", avatar: "B" },
      { name: "toast enthusiast", score: 445, vibe: "↓ 1", shift: "down", avatar: "T" },
      { name: "CtrlAltDefeat", score: 385, vibe: "↑ 3", shift: "up", avatar: "C" },
      { name: "GrandmaPing", score: 320, vibe: "—", shift: "steady", avatar: "G" },
      { name: "maybe_a_rock", score: 275, vibe: "↓ 2", shift: "down", avatar: "R" },
      { name: "Loading...", score: 205, vibe: "↑ 1", shift: "up", avatar: "L" },
      { name: "VeryIdlePerson", score: 145, vibe: "—", shift: "steady", avatar: "V" },
      { name: "SparePixel", score: 95, vibe: "↑ 2", shift: "up", avatar: "P" },
      { name: "BreadWitness", score: 40, vibe: "↓ 1", shift: "down", avatar: "B" }
    ],
    week: [
      { name: "ChairEnjoyer", score: 8240, vibe: "↑ 2", shift: "up", avatar: "C" },
      { name: "MossWithWiFi", score: 7795, vibe: "↓ 1", shift: "down", avatar: "M" },
      { name: "BitOfDust", score: 6430, vibe: "↑ 3", shift: "up", avatar: "B" },
      { name: "soup.exe", score: 5915, vibe: "↑ 1", shift: "up", avatar: "S" },
      { name: "GrandmaPing", score: 4805, vibe: "—", shift: "steady", avatar: "G" },
      { name: "SparePixel", score: 4100, vibe: "↑ 5", shift: "up", avatar: "P" },
      { name: "toast enthusiast", score: 3650, vibe: "↓ 2", shift: "down", avatar: "T" },
      { name: "maybe_a_rock", score: 2770, vibe: "↑ 1", shift: "up", avatar: "R" },
      { name: "BreadWitness", score: 1950, vibe: "↓ 3", shift: "down", avatar: "B" },
      { name: "VeryIdlePerson", score: 1340, vibe: "↑ 4", shift: "up", avatar: "V" },
      { name: "Loading...", score: 825, vibe: "—", shift: "steady", avatar: "L" },
      { name: "CtrlAltDefeat", score: 610, vibe: "↓ 4", shift: "down", avatar: "C" }
    ],
    all: [
      { name: "MossWithWiFi", score: 189420, vibe: "↑ 1", shift: "up", avatar: "M" },
      { name: "ChairEnjoyer", score: 172850, vibe: "↑ 2", shift: "up", avatar: "C" },
      { name: "soup.exe", score: 161210, vibe: "↓ 1", shift: "down", avatar: "S" },
      { name: "GrandmaPing", score: 149875, vibe: "↑ 3", shift: "up", avatar: "G" },
      { name: "toast enthusiast", score: 133640, vibe: "—", shift: "steady", avatar: "T" },
      { name: "BitOfDust", score: 119990, vibe: "↑ 1", shift: "up", avatar: "B" },
      { name: "CtrlAltDefeat", score: 101250, vibe: "↓ 2", shift: "down", avatar: "C" },
      { name: "SparePixel", score: 87325, vibe: "↑ 4", shift: "up", avatar: "P" },
      { name: "maybe_a_rock", score: 72880, vibe: "—", shift: "steady", avatar: "R" },
      { name: "BreadWitness", score: 61950, vibe: "↑ 2", shift: "up", avatar: "B" },
      { name: "VeryIdlePerson", score: 48110, vibe: "↓ 3", shift: "down", avatar: "V" },
      { name: "Loading...", score: 25830, vibe: "↑ 1", shift: "up", avatar: "L" }
    ]
  };

  const byId = id => document.getElementById(id);
  // All sounds are synthesized locally with Web Audio; no audio files or network requests.
  let audioContext = null;
  let soundEnabled = true;
  let hapticsEnabled = true;
  let audioUnlocked = false;

  function unlockAudio() {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") void audioContext.resume();
      audioUnlocked = true;
    } catch (error) { audioUnlocked = false; }
  }

  function playRewardSound(kind) {
    if (!soundEnabled || !audioUnlocked || !audioContext) return;
    try {
      if (audioContext.state === "suspended") void audioContext.resume();
      const now = audioContext.currentTime;
      const patterns = {
        reward: [{ f: 660, t: 0, d: .13 }, { f: 880, t: .09, d: .17 }, { f: 1175, t: .19, d: .24 }],
        milestone: [{ f: 523, t: 0, d: .16 }, { f: 659, t: .12, d: .16 }, { f: 784, t: .24, d: .16 }, { f: 1047, t: .36, d: .38 }],
        adStart: [{ f: 440, t: 0, d: .09 }, { f: 554, t: .1, d: .12 }],
        adDone: [{ f: 587, t: 0, d: .14 }, { f: 784, t: .12, d: .16 }, { f: 988, t: .25, d: .28 }]
      };
      (patterns[kind] || patterns.reward).forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, now + note.t);
        gain.gain.setValueAtTime(0.0001, now + note.t);
        gain.gain.exponentialRampToValueAtTime(kind === "milestone" ? 0.105 : 0.075, now + note.t + .018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + .025);
      });
    } catch (error) { /* Audio is an enhancement; it must never block a reward. */ }
  }

  function rewardHaptic(milestone) {
    if (!hapticsEnabled || typeof navigator.vibrate !== "function") return;
    try { navigator.vibrate(milestone ? [24, 35, 48] : 22); } catch (error) {}
  }
  const guestSuffix = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  const freshState = () => ({
    version: 1,
    username: "Guest-" + guestSuffix(),
    balance: 0,
    totalEarned: 0,
    adsWatched: 0,
    progressMs: 0,
    joinedAt: Date.now(),
    adCooldownUntil: 0,
    boosts: { doubleUntil: 0, bonusAdsRemaining: 0 },
    unlocked: [],
    activity: [{ text: "Clocked in for a shift of doing nothing.", delta: "", time: Date.now(), kind: "welcome" }],
    updatedAt: Date.now()
  });
  let storageAvailable = true;
  let state;
  let tabId = "tab-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
  let leader = false;
  let lastPulseAt = Date.now();
  let pulseHandle = null;
  let uiHandle = null;
  let activePeriod = "today";
  let displayedBalance = 0;
  let balanceAnimation = null;
  let adTickHandle = null;
  let adStartedAt = 0;
  let selectedAd = null;
  let adFinished = false;
  let adRunToken = 0;
  let toastHandle = null;
  let supabaseClient = null;
  let backendReady = false;
  let remoteBoards = { today: null, week: null, all: null };
  let remoteRefreshInFlight = false;
  let awardInFlight = false;
  let passiveClaimInFlight = false;
  let liveModeErrorShown = false;

  function safeReadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return freshState();
      return {
        ...freshState(),
        ...parsed,
        username: sanitizeName(parsed.username || ("Guest-" + guestSuffix())),
        balance: Math.max(0, Math.floor(Number(parsed.balance) || 0)),
        totalEarned: Math.max(0, Math.floor(Number(parsed.totalEarned) || 0)),
        adsWatched: Math.max(0, Math.floor(Number(parsed.adsWatched) || 0)),
        progressMs: Math.max(0, Math.min(EARNING_INTERVAL - 1, Number(parsed.progressMs) || 0)),
        adCooldownUntil: Math.max(0, Number(parsed.adCooldownUntil) || 0),
        boosts: {
          doubleUntil: Math.max(0, Number(parsed.boosts && parsed.boosts.doubleUntil) || 0),
          bonusAdsRemaining: Math.max(0, Math.min(99, Math.floor(Number(parsed.boosts && parsed.boosts.bonusAdsRemaining) || 0)))
        },
        unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked.filter(n => thresholds.some(t => t.id === n)) : [],
        activity: Array.isArray(parsed.activity) ? parsed.activity.slice(0, 12) : [],
        joinedAt: Number(parsed.joinedAt) || Date.now()
      };
    } catch (error) {
      storageAvailable = false;
      return freshState();
    }
  }

  function saveState() {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
      setStorageStatus();
    }
  }

  function sanitizeName(value) {
    return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 18);
  }

  function readLock() {
    try {
      const raw = localStorage.getItem(LOCK_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      storageAvailable = false;
      return null;
    }
  }

  function claimLock(now) {
    if (!storageAvailable) {
      leader = true;
      return;
    }
    const current = readLock();
    if (!current || !current.owner || Number(current.expiresAt) < now || current.owner === tabId) {
      try {
        localStorage.setItem(LOCK_KEY, JSON.stringify({ owner: tabId, expiresAt: now + LOCK_TTL }));
        const verify = readLock();
        const wasLeader = leader;
        leader = !!verify && verify.owner === tabId;
        if (leader && !wasLeader) lastPulseAt = now;
      } catch (error) {
        storageAvailable = false;
        leader = true;
      }
    } else {
      leader = current.owner === tabId;
    }
  }

  function releaseLock() {
    if (!storageAvailable) return;
    const lock = readLock();
    if (lock && lock.owner === tabId) {
      try { localStorage.removeItem(LOCK_KEY); } catch (error) { storageAvailable = false; }
    }
    leader = false;
  }

  function addActivity(text, delta, kind) {
    state.activity.unshift({ text: text, delta: delta || "", time: Date.now(), kind: kind || "normal" });
    state.activity = state.activity.slice(0, 10);
  }

  function checkMilestones(previousTotal) {
    thresholds.forEach(item => {
      if (state.totalEarned >= item.id && state.unlocked.indexOf(item.id) === -1) {
        state.unlocked.push(item.id);
        addActivity("Unlocked: " + item.label + ".", "", "milestone");
        showToast("Milestone unlocked", item.label + " — " + numberFormat.format(item.id) + " Tokens earned.", "✦");
      }
    });
  }

  async function awardTokens(amount, reason, rewardType) {
    if (awardInFlight) return false;
    awardInFlight = true;
    try {
      const oldTotal = state.totalEarned;
      if (backendReady) {
        const rpcName = rewardType === "ad" ? "token_claim_ad" : "token_claim_passive";
        const { data, error } = await supabaseClient.rpc(rpcName);
        if (error) throw error;
        const result = Array.isArray(data) ? data[0] : data;
        if (!result || result.granted !== true) {
          if (result) {
            state.balance = Math.max(0, Number(result.balance) || 0);
            state.totalEarned = Math.max(0, Number(result.all_time_tokens) || 0);
            state.adsWatched = Math.max(0, Number(result.ads_watched) || 0);
            if (rewardType === "passive") {
              const waitMs = Math.max(0, Number(result.retry_after_seconds) || 0) * 1000;
              state.progressMs = Math.max(0, EARNING_INTERVAL - waitMs);
            }
            const cooldown = Date.parse(result.ad_cooldown_until || "");
            if (Number.isFinite(cooldown)) state.adCooldownUntil = cooldown;
          }
          saveState();
          renderAll(true);
          showToast("Not quite yet", "The shared server is keeping rewards properly spaced.", "◷");
          return false;
        }
        state.balance = Math.max(0, Number(result.balance) || 0);
        state.totalEarned = Math.max(0, Number(result.all_time_tokens) || 0);
        state.adsWatched = Math.max(0, Number(result.ads_watched) || 0);
        const cooldown = Date.parse(result.ad_cooldown_until || "");
        if (Number.isFinite(cooldown)) state.adCooldownUntil = cooldown;
      } else {
        if (rewardType === "passive" && state.boosts.doubleUntil > Date.now()) amount *= 2;
        if (rewardType === "ad" && state.boosts.bonusAdsRemaining > 0) {
          amount += AD_REWARD;
          state.boosts.bonusAdsRemaining -= 1;
        }
        state.balance += amount;
        state.totalEarned += amount;
        if (rewardType === "ad") {
          state.adsWatched += 1;
          state.adCooldownUntil = Date.now() + AD_COOLDOWN;
        }
      }
      addActivity(reason, "+" + numberFormat.format(amount), "reward");
      checkMilestones(oldTotal);
      saveState();
      renderAll(true);
      spawnParticles(rewardType === "ad" ? byId("fake-ad-creative") : byId("timer-dial"));
      animateNewMilestones(oldTotal);
      showRewardMoment(amount, state.totalEarned > oldTotal && thresholds.some(item => oldTotal < item.id && state.totalEarned >= item.id));
      if (backendReady) void refreshRemoteLeaderboard();
      return true;
    } catch (error) {
      console.warn("TOKEN shared reward failed; continuing in local mode.", error);
      backendReady = false;
      remoteBoards = { today: null, week: null, all: null };
      setLeaderboardMode(false);
      const oldTotal = state.totalEarned;
      state.balance += amount;
      state.totalEarned += amount;
      if (rewardType === "ad") {
        state.adsWatched += 1;
        state.adCooldownUntil = Date.now() + AD_COOLDOWN;
      }
      addActivity(reason, "+" + numberFormat.format(amount), "reward");
      checkMilestones(oldTotal);
      saveState();
      renderAll(true);
      spawnParticles(rewardType === "ad" ? byId("fake-ad-creative") : byId("timer-dial"));
      animateNewMilestones(oldTotal);
      showRewardMoment(amount, thresholds.some(item => oldTotal < item.id && state.totalEarned >= item.id));
      if (!liveModeErrorShown) {
        showToast("Global board offline", "This reward is saved locally for now; shared rankings need a connection.", "!");
        liveModeErrorShown = true;
      }
      return true;
    } finally {
      awardInFlight = false;
    }
  }

  function animateNewMilestones(previousTotal) {
    if (document.body.classList.contains("reduce-motion")) return;
    thresholds.filter(item => previousTotal < item.id && state.totalEarned >= item.id).forEach(item => {
      window.setTimeout(() => {
        const card = Array.from(document.querySelectorAll(".achievement")).find(el => {
          const goal = el.querySelector(".achievement-goal");
          return goal && goal.textContent.replace(/,/g, "") === String(item.id);
        });
        if (!card) return;
        card.classList.remove("just-unlocked");
        void card.offsetWidth;
        card.classList.add("just-unlocked");
        window.setTimeout(() => card.classList.remove("just-unlocked"), 950);
      }, 40);
    });
  }

  function showRewardMoment(amount, milestone) {
    playRewardSound(milestone ? "milestone" : "reward");
    rewardHaptic(milestone);
    const downloadIcon = document.querySelector(".token-download-icon");
    if (downloadIcon && !document.body.classList.contains("reduce-motion")) {
      downloadIcon.classList.remove("is-downloaded");
      void downloadIcon.offsetWidth;
      downloadIcon.classList.add("is-downloaded");
      window.setTimeout(() => downloadIcon.classList.remove("is-downloaded"), 1250);
    }
    const stage = byId("reward-stage");
    byId("reward-stage-amount").textContent = "+" + numberFormat.format(amount);
    byId("reward-stage-label").textContent = milestone ? "MILESTONE UNLOCKED" : "TOKENS EARNED";
    stage.classList.remove("is-visible");
    byId("balance").classList.remove("balance-pop");
    void stage.offsetWidth;
    stage.classList.add("is-visible");
    byId("balance").classList.add("balance-pop");
    byId("wallet-card")?.classList.add("is-rewarding");
    const count = milestone ? 30 : 18;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement("span");
      spark.className = "reward-spark-particle";
      spark.textContent = i % 3 === 0 ? "✦" : (i % 2 ? "·" : "✧");
      spark.style.setProperty("--angle", (360 / count * i + Math.random() * 12) + "deg");
      spark.style.setProperty("--distance", (milestone ? 74 : 54) + Math.random() * (milestone ? 56 : 38) + "px");
      spark.style.animationDelay = Math.floor(Math.random() * 100) + "ms";
      stage.append(spark);
      window.setTimeout(() => spark.remove(), 1050);
    }
    window.setTimeout(() => {
      stage.classList.remove("is-visible");
      byId("balance").classList.remove("balance-pop");
      byId("wallet-card")?.classList.remove("is-rewarding");
    }, milestone ? 1900 : 1450);
  }

  function renderAll(allowBalanceAnimation) {
    renderBalance(allowBalanceAnimation);
    renderTimer();
    renderProfile();
    renderActivity();
    renderAchievements();
    renderShop();
    renderLeaderboard();
    renderCooldown();
    setStorageStatus();
  }

  function renderShop() {
    const balance = byId("shop-balance");
    if (!balance) return;
    balance.textContent = numberFormat.format(state.balance);
    const localOnly = backendReady;
    byId("shop-mode").textContent = localOnly
      ? "SHOP PAUSED · SHARED SERVER BALANCE IS ENABLED"
      : "LOCAL SHOP · PURCHASES SAVED ON THIS DEVICE";
    document.querySelectorAll("[data-buy-boost]").forEach(button => {
      const cost = { double: 250, ad: 180, time: 75 }[button.dataset.buyBoost];
      button.disabled = localOnly || state.balance < cost;
      button.title = localOnly
        ? "Local-only boosts are paused while a shared server balance is enabled."
        : state.balance < cost ? "You need " + numberFormat.format(cost - state.balance) + " more Tokens." : "";
    });
    const active = [];
    if (state.boosts.doubleUntil > Date.now()) {
      active.push("Double Shift: " + Math.ceil((state.boosts.doubleUntil - Date.now()) / 60000) + " min left");
    }
    if (state.boosts.bonusAdsRemaining > 0) {
      active.push("Ad Bonus: " + state.boosts.bonusAdsRemaining + " ad" + (state.boosts.bonusAdsRemaining === 1 ? "" : "s") + " left");
    }
    byId("active-boosts-copy").textContent = active.length
      ? active.join(" · ") + " · Time Skip is a one-time timer bump."
      : "No boosts active. The grind remains unmodified.";
    byId("active-boosts").classList.toggle("has-active-boosts", active.length > 0);
  }

  function buyBoost(kind) {
    if (backendReady) {
      showToast("Shop paused", "This shop spends local Tokens only, so it is paused when a shared server balance is active.", "◷");
      return;
    }
    const items = {
      double: { cost: 250, label: "Double Shift", message: "Passive payouts are doubled for 15 minutes." },
      ad: { cost: 180, label: "Ad Bonus Pack", message: "Your next three completed fake ads earn +15 extra Tokens each." },
      time: { cost: 75, label: "Time Skip", message: "Your passive timer moved forward by one minute." }
    };
    const item = items[kind];
    if (!item) return;
    if (state.balance < item.cost) {
      showToast("Not enough Tokens", "You need " + numberFormat.format(item.cost - state.balance) + " more Tokens for " + item.label + ".", "◇");
      return;
    }
    state.balance -= item.cost;
    if (kind === "double") {
      state.boosts.doubleUntil = Math.max(Date.now(), state.boosts.doubleUntil || 0) + 15 * 60 * 1000;
    } else if (kind === "ad") {
      state.boosts.bonusAdsRemaining = Math.min(99, (state.boosts.bonusAdsRemaining || 0) + 3);
    } else if (kind === "time") {
      state.progressMs += 60 * 1000;
      if (state.progressMs >= EARNING_INTERVAL) {
        state.progressMs -= EARNING_INTERVAL;
        window.setTimeout(() => {
          if (!passiveClaimInFlight) {
            passiveClaimInFlight = true;
            void awardTokens(EARNING_REWARD, "A Time Skip paid off early.", "passive")
              .finally(() => { passiveClaimInFlight = false; });
          }
        }, 0);
      }
    }
    addActivity("Bought " + item.label + ".", "-" + numberFormat.format(item.cost), "purchase");
    saveState();
    renderAll(true);
    playRewardSound("milestone");
    rewardHaptic(false);
    const button = document.querySelector('[data-buy-boost="' + kind + '"]');
    if (button) {
      button.classList.remove("purchase-flash");
      void button.offsetWidth;
      button.classList.add("purchase-flash");
      window.setTimeout(() => button.classList.remove("purchase-flash"), 700);
      spawnParticles(button);
    }
    showToast(item.label + " purchased", item.message, "✦");
  }

  function renderBalance(animate) {
    const target = state.balance;
    if (!animate || target === displayedBalance) {
      displayedBalance = target;
      byId("balance").textContent = numberFormat.format(target);
      return;
    }
    if (balanceAnimation) cancelAnimationFrame(balanceAnimation);
    const from = displayedBalance;
    const start = performance.now();
    const duration = document.body.classList.contains("reduce-motion") ? 1 : 620;
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const value = Math.round(from + (target - from) * eased);
      byId("balance").textContent = numberFormat.format(value);
      displayedBalance = value;
      if (t < 1) balanceAnimation = requestAnimationFrame(frame);
      else {
        displayedBalance = target;
        byId("balance").textContent = numberFormat.format(target);
        balanceAnimation = null;
      }
    };
    balanceAnimation = requestAnimationFrame(frame);
  }

  function formatCountdown(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  }

  function renderTimer() {
    const progress = Math.min(1, state.progressMs / EARNING_INTERVAL);
    byId("earning-rate").classList.toggle("is-almost-there", progress >= 0.965 && progress < 1);
    const dial = byId("timer-dial");
    dial.classList.toggle("is-almost-there", progress >= 0.965 && progress < 1);
    const remaining = Math.max(0, EARNING_INTERVAL - state.progressMs);
    const countdown = formatCountdown(remaining);
    byId("main-countdown").textContent = countdown;
    byId("wallet-countdown").textContent = countdown;
    byId("timer-dial").style.setProperty("--progress", (progress * 100).toFixed(3) + "%");
    byId("wallet-progress-fill").style.width = (progress * 100).toFixed(3) + "%";
    byId("wallet-progress").setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    byId("wallet-percent").textContent = Math.floor(progress * 100) + "% complete";
    const status = byId("timer-status");
    if (state.progressMs > 0) status.textContent = "The clock is ticking. You are technically at work.";
    else status.textContent = "Your shift has begun. Try to look busy.";
    if (!storageAvailable) status.textContent = "Storage unavailable — progress may vanish when this tab closes.";
  }

  function renderProfile() {
    const initial = state.username.trim().charAt(0).toUpperCase() || "G";
    byId("nav-username").textContent = state.username;
    document.querySelector(".profile-pill .avatar").textContent = initial;
    byId("profile-title").innerHTML = escapeHtml(state.username) + " <em>profile.</em>";
    byId("profile-summary-name").textContent = state.username;
    document.querySelector(".avatar-large").textContent = initial;
    byId("profile-balance").textContent = numberFormat.format(state.balance);
    byId("profile-earned").textContent = numberFormat.format(state.totalEarned);
    byId("profile-ads").textContent = numberFormat.format(state.adsWatched);
    byId("profile-joined").textContent = new Date(state.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    byId("username-input").value = state.username;
    byId("achievement-count").textContent = state.unlocked.length + " / " + thresholds.length;
    renderProfileAchievements();
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function renderProfileAchievements() {
    const holder = byId("profile-achievement-list");
    holder.replaceChildren();
    thresholds.forEach(item => {
      const unlocked = state.totalEarned >= item.id;
      const row = document.createElement("div");
      row.className = "profile-achievement";
      const icon = document.createElement("span");
      icon.className = "achievement-icon" + (unlocked ? " unlocked" : "");
      icon.textContent = item.icon;
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = item.label;
      const note = document.createElement("small");
      note.textContent = unlocked ? "Earned · " + numberFormat.format(item.id) + " Tokens" : "Earn " + numberFormat.format(item.id) + " Tokens";
      copy.append(title, note);
      row.append(icon, copy);
      holder.append(row);
    });
  }

  function renderActivity() {
    const feed = byId("activity-feed");
    feed.replaceChildren();
    if (!state.activity.length) {
      const empty = document.createElement("p");
      empty.className = "activity-empty";
      empty.textContent = "A pristine record of absolutely nothing. Earn your first Tokens to make history.";
      feed.append(empty);
      return;
    }
    state.activity.slice(0, 4).forEach(item => {
      const row = document.createElement("div");
      row.className = "activity-item";
      const mark = document.createElement("span");
      mark.className = "activity-mark" + (item.kind === "reward" ? " reward" : "");
      mark.textContent = item.kind === "reward" ? "＋" : item.kind === "milestone" ? "✦" : "◷";
      const copy = document.createElement("div");
      copy.className = "activity-item-copy";
      const title = document.createElement("div");
      title.className = "activity-text";
      title.textContent = item.text;
      const time = document.createElement("div");
      time.className = "activity-time";
      time.textContent = relativeTime(item.time);
      copy.append(title, time);
      row.append(mark, copy);
      if (item.delta) {
        const delta = document.createElement("span");
        delta.className = "activity-delta";
        delta.textContent = item.delta;
        row.append(delta);
      }
      feed.append(row);
    });
  }

  function relativeTime(timestamp) {
    const seconds = Math.max(0, Math.floor((Date.now() - Number(timestamp || Date.now())) / 1000));
    if (seconds < 10) return "Just now";
    if (seconds < 60) return seconds + " seconds ago";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";
    return Math.floor(seconds / 86400) + " days ago";
  }

  function renderAchievements() {
    const holder = byId("achievement-grid");
    holder.replaceChildren();
    thresholds.forEach(item => {
      const unlocked = state.totalEarned >= item.id;
      const card = document.createElement("div");
      card.className = "achievement" + (unlocked ? " unlocked" : "");
      const icon = document.createElement("div");
      icon.className = "achievement-icon";
      icon.textContent = item.icon;
      const name = document.createElement("div");
      name.className = "achievement-name";
      name.textContent = item.label;
      const goal = document.createElement("div");
      goal.className = "achievement-goal";
      goal.textContent = numberFormat.format(item.id);
      const status = document.createElement("div");
      status.className = "achievement-state";
      status.textContent = unlocked ? "UNLOCKED" : "LOCKED";
      card.append(icon, name, goal, status);
      holder.append(card);
    });
  }

  function setLeaderboardMode(isLive) {
    const label = byId("leaderboard-mode-label");
    const stamp = document.querySelector(".demo-stamp");
    const note = byId("leaderboard-disclaimer");
    if (label) label.textContent = isLive ? "LIVE GLOBAL LEADERBOARD" : "DEMO LEADERBOARD";
    if (stamp) stamp.classList.toggle("is-live", !!isLive);
    if (note) note.textContent = isLive
      ? "Live shared rankings from connected TOKEN guests. Scores sync through Supabase; this is a casual leaderboard, not an anti-cheat system."
      : "This is sample data for the demo. Your guest balance stays in this browser and is not submitted to a global ranking.";
  }

  function loadSupabaseSdk() {
    if (window.supabase && typeof window.supabase.createClient === "function") return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-token-supabase-sdk="true"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("Supabase SDK could not be loaded.")), { once: true });
        return;
      }
      const sdk = document.createElement("script");
      sdk.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      sdk.async = true;
      sdk.dataset.tokenSupabaseSdk = "true";
      sdk.onload = resolve;
      sdk.onerror = () => reject(new Error("Supabase SDK could not be loaded."));
      document.head.append(sdk);
    });
  }

  function firstRow(data) {
    return Array.isArray(data) ? (data[0] || null) : data;
  }

  async function initializeRemoteBackend() {
    const config = window.TOKEN_SUPABASE_CONFIG || {};
    const url = String(config.url || "").trim();
    const anonKey = String(config.anonKey || "").trim();
    if (!url.startsWith("https://") || !anonKey || /YOUR_|PASTE_|CHANGE_ME/i.test(url + anonKey)) {
      setLeaderboardMode(false);
      return;
    }
    try {
      await loadSupabaseSdk();
      if (!window.supabase || typeof window.supabase.createClient !== "function") throw new Error("Supabase client is unavailable.");
      supabaseClient = window.supabase.createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
      let { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData || !sessionData.session) {
        const signIn = await supabaseClient.auth.signInAnonymously();
        if (signIn.error) throw signIn.error;
        sessionData = { session: signIn.data.session };
      }
      if (!sessionData || !sessionData.session) throw new Error("Anonymous guest sign-in did not return a session.");
      const { data, error } = await supabaseClient.rpc("token_ensure_player", { p_username: state.username });
      if (error) throw error;
      const profile = firstRow(data);
      if (!profile) throw new Error("Supabase did not return a guest profile.");
      state.username = sanitizeName(profile.username || state.username) || state.username;
      state.balance = Math.max(0, Number(profile.balance) || 0);
      state.totalEarned = Math.max(0, Number(profile.all_time_tokens) || 0);
      state.adsWatched = Math.max(0, Number(profile.ads_watched) || 0);
      const cooldown = Date.parse(profile.ad_cooldown_until || "");
      if (Number.isFinite(cooldown)) state.adCooldownUntil = cooldown;
      backendReady = true;
      saveState();
      setLeaderboardMode(true);
      renderAll(false);
      await refreshRemoteLeaderboard();
      window.setInterval(() => { if (backendReady) void refreshRemoteLeaderboard(); }, 25000);
    } catch (error) {
      backendReady = false;
      remoteBoards = { today: null, week: null, all: null };
      setLeaderboardMode(false);
      console.warn("TOKEN global leaderboard is not configured or reachable.", error);
      showToast("Still in demo mode", "Connect the Supabase project to turn on shared rankings.", "◇");
    }
  }

  async function refreshRemoteLeaderboard() {
    if (!backendReady || !supabaseClient || remoteRefreshInFlight) return;
    remoteRefreshInFlight = true;
    try {
      const periods = ["today", "week", "all"];
      const responses = await Promise.all(periods.map(period =>
        supabaseClient.rpc("token_leaderboard", { p_period: period, p_limit: 100 })
      ));
      for (let i = 0; i < periods.length; i++) {
        const response = responses[i];
        if (response.error) throw response.error;
        remoteBoards[periods[i]] = (response.data || []).map(row => ({
          name: String(row.username || "Guest").slice(0, 18),
          score: Math.max(0, Number(row.tokens) || 0),
          rank: Math.max(1, Number(row.rank_no) || 1),
          isYou: row.is_you === true,
          avatar: String(row.username || "G").charAt(0).toUpperCase(),
          vibe: row.is_you ? "YOU" : "—",
          shift: "steady"
        }));
      }
      setLeaderboardMode(true);
      renderLeaderboard();
    } catch (error) {
      console.warn("Could not refresh shared TOKEN rankings.", error);
      backendReady = false;
      remoteBoards = { today: null, week: null, all: null };
      setLeaderboardMode(false);
      renderLeaderboard();
      if (!liveModeErrorShown) {
        showToast("Global board disconnected", "The sample leaderboard is shown until the shared database reconnects.", "!");
        liveModeErrorShown = true;
      }
    } finally {
      remoteRefreshInFlight = false;
    }
  }

  async function startRemoteAd() {
    if (!backendReady) return true;
    try {
      const { data, error } = await supabaseClient.rpc("token_start_ad");
      if (error) throw error;
      const result = firstRow(data);
      if (!result || result.started !== true) {
        if (result && result.ad_cooldown_until) {
          const cooldown = Date.parse(result.ad_cooldown_until);
          if (Number.isFinite(cooldown)) state.adCooldownUntil = cooldown;
        }
        renderCooldown();
        showToast("Ad not ready yet", "The server is keeping the bonus on cooldown.", "◷");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Could not start a shared fake ad.", error);
      backendReady = false;
      remoteBoards = { today: null, week: null, all: null };
      setLeaderboardMode(false);
      return true;
    }
  }

  function cancelRemoteAd() {
    if (!backendReady || !supabaseClient) return;
    void supabaseClient.rpc("token_cancel_ad").then(({ error }) => {
      if (error) console.warn("Could not cancel remote ad state.", error);
    }).catch(error => console.warn("Could not cancel remote ad state.", error));
  }

  function getRanked(period) {
    if (backendReady && Array.isArray(remoteBoards[period])) return remoteBoards[period];
    const base = boards[period].map(item => ({ ...item, isYou: false }));
    const you = { name: state.username, score: state.balance, vibe: "YOU", shift: "steady", avatar: state.username.charAt(0).toUpperCase() || "G", isYou: true };
    const list = base.concat(you).sort((a, b) => b.score - a.score || (a.isYou ? 1 : -1));
    return list.map((item, index) => ({ ...item, rank: index + 1 }));
  }

  function renderLeaderboard() {
    if (backendReady && !Array.isArray(remoteBoards[activePeriod])) {
      byId("podium").replaceChildren();
      const loading = document.createElement("div");
      loading.className = "empty-leaderboard";
      loading.textContent = "Connecting to the shared void…";
      byId("podium").append(loading);
      byId("leader-list").replaceChildren();
      byId("leaderboard-count").textContent = "Loading live rankings…";
      return;
    }
    const ranked = getRanked(activePeriod);
    const search = byId("leader-search").value.trim().toLowerCase();
    const top = ranked.slice(0, 3);
    renderPodium(top);
    let rows;
    if (search) {
      rows = ranked.filter(item => item.name.toLowerCase().includes(search)).slice(0, 10);
    } else {
      const you = ranked.find(item => item.isYou);
      rows = ranked.slice(0, 8);
      if (you && !rows.some(item => item.isYou)) rows = ranked.slice(0, 7).concat(you);
    }
    const holder = byId("leader-list");
    holder.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "empty-leaderboard";
      const title = document.createElement("strong");
      title.textContent = search ? "Nobody by that name. Probably for the best." : "No Tokens have been earned here yet.";
      const sub = document.createElement("span");
      sub.textContent = search ? "Try another search." : "Be the first to make it meaningless.";
      empty.append(title, sub);
      holder.append(empty);
    } else {
      rows.forEach((item, index) => holder.append(createLeaderRow(item, index)));
    }
    byId("leaderboard-count").textContent = search ? "Found " + rows.length + " matching player" + (rows.length === 1 ? "" : "s") : "Showing " + rows.length + " ranked players";
  }

  function renderPodium(top) {
    const holder = byId("podium");
    holder.replaceChildren();
    top.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "podium-card " + (index === 0 ? "first" : index === 1 ? "second" : "third");
      const rank = document.createElement("span");
      rank.className = "podium-rank";
      rank.textContent = String(item.rank);
      const info = document.createElement("div");
      info.className = "podium-info";
      const name = document.createElement("div");
      name.className = "podium-name";
      name.textContent = item.name;
      const label = document.createElement("div");
      label.className = "podium-label";
      label.textContent = index === 0 ? "Crown of nothing" : index === 1 ? "Almost pointless" : "Thirdly useless";
      const score = document.createElement("div");
      score.className = "podium-score";
      score.textContent = numberFormat.format(item.score) + " ";
      const unit = document.createElement("small");
      unit.textContent = "TOK";
      score.append(unit);
      info.append(name, label, score);
      card.append(rank, info);
      holder.append(card);
    });
  }

  function createLeaderRow(item, index) {
    const row = document.createElement("div");
    row.className = "leader-row" + (item.isYou ? " is-you" : "");
    row.style.animationDelay = Math.min(index * 25, 180) + "ms";
    const player = document.createElement("div");
    player.className = "player-cell";
    const rank = document.createElement("span");
    rank.className = "rank-number" + (item.rank <= 3 ? " rank-" + (item.rank === 1 ? "one" : item.rank === 2 ? "two" : "three") : "");
    rank.textContent = String(item.rank).padStart(2, "0");
    const avatar = document.createElement("span");
    avatar.className = "player-avatar";
    avatar.textContent = item.avatar || item.name.charAt(0).toUpperCase();
    const meta = document.createElement("span");
    meta.className = "player-meta";
    const name = document.createElement("span");
    name.className = "player-name";
    name.textContent = item.name;
    const label = document.createElement("span");
    label.className = "player-label" + (item.isYou ? " you-label" : "");
    label.textContent = item.isYou ? "YOUR LOCAL GUEST" : "SAMPLE PLAYER";
    meta.append(name, label);
    player.append(rank, avatar, meta);
    const score = document.createElement("div");
    score.className = "player-score";
    score.textContent = numberFormat.format(item.score) + " ";
    const unit = document.createElement("small");
    unit.textContent = "TOK";
    score.append(unit);
    const vibe = document.createElement("div");
    vibe.className = "player-vibe" + (item.shift === "down" ? " down" : item.shift === "steady" ? " steady" : "");
    vibe.textContent = item.isYou ? "YOU" : item.vibe;
    row.append(player, score, vibe);
    return row;
  }

  function renderCooldown() {
    const button = byId("watch-ad");
    const note = byId("ad-cooldown-note");
    const remaining = Math.max(0, state.adCooldownUntil - Date.now());
    if (remaining > 0) {
      button.disabled = true;
      button.innerHTML = '<span class="play-icon" aria-hidden="true">◷</span> Bonus cooldown <span class="button-trailing">' + Math.ceil(remaining / 1000) + "s</span>";
      note.textContent = "Another completely fictional ad is available shortly.";
    } else {
      button.disabled = false;
      button.innerHTML = '<span class="play-icon" aria-hidden="true">▶</span> Watch a fake ad <span class="button-trailing">+15</span>';
      note.textContent = "Simulated ad · no tracking, no advertisers, no product.";
    }
  }

  function setStorageStatus() {
    const status = byId("storage-status");
    if (!status) return;
    status.textContent = storageAvailable ? "Available" : "Unavailable";
    status.classList.toggle("unavailable", !storageAvailable);
  }

  function showToast(title, message, icon) {
    const region = byId("toast-region");
    const toast = document.createElement("div");
    toast.className = "toast";
    const mark = document.createElement("span");
    mark.className = "toast-icon";
    mark.textContent = icon || "✦";
    const copy = document.createElement("span");
    copy.innerHTML = "<strong>" + escapeHtml(title) + "</strong><br>" + escapeHtml(message);
    toast.append(mark, copy);
    region.append(toast);
    window.setTimeout(() => {
      toast.classList.add("toast-out");
      window.setTimeout(() => toast.remove(), 240);
    }, 3600);
  }

  function spawnParticles(sourceElement) {
    if (document.body.classList.contains("reduce-motion")) return;
    const layer = byId("particle-layer");
    const target = byId("balance").getBoundingClientRect();
    const targetX = target.left + target.width / 2;
    const targetY = target.top + target.height / 2;
    const source = sourceElement && sourceElement.getBoundingClientRect
      ? sourceElement.getBoundingClientRect()
      : byId("timer-dial").getBoundingClientRect();
    const sourceX = source.left + source.width / 2;
    const sourceY = source.top + source.height / 2;
    const count = 16;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("img");
      particle.src = "assets/token-cube-dark.png";
      particle.alt = "";
      particle.className = "reward-particle";
      const startX = Math.max(8, Math.min(window.innerWidth - 20, sourceX + (Math.random() - .5) * Math.min(100, source.width * .8)));
      const startY = Math.max(8, Math.min(window.innerHeight - 20, sourceY + (Math.random() - .5) * Math.min(70, source.height * .6)));
      particle.style.left = startX + "px";
      particle.style.top = startY + "px";
      particle.style.setProperty("--x", "0px");
      particle.style.setProperty("--y", "0px");
      particle.style.setProperty("--dx", (targetX - startX) + "px");
      particle.style.setProperty("--dy", (targetY - startY) + "px");
      particle.style.animationDelay = (i * 28) + "ms";
      particle.style.width = (11 + Math.random() * 7) + "px";
      particle.style.height = particle.style.width;
      layer.append(particle);
      window.setTimeout(() => particle.remove(), 1150);
    }
  }

  function pulse() {
    const now = Date.now();
    claimLock(now);
    if (leader) {
      try {
        if (storageAvailable) {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const remote = JSON.parse(raw);
            if (remote && remote.version === 1 && Number(remote.updatedAt) > Number(state.updatedAt || 0)) {
              state = { ...state, ...remote };
              state.balance = Math.max(0, Math.floor(Number(state.balance) || 0));
              state.totalEarned = Math.max(0, Math.floor(Number(state.totalEarned) || 0));
              state.progressMs = Math.max(0, Math.min(EARNING_INTERVAL - 1, Number(state.progressMs) || 0));
            }
          }
        }
      } catch (error) { storageAvailable = false; }
      const delta = now - lastPulseAt;
      if (delta > 0 && delta <= MAX_COUNTED_GAP) {
        state.progressMs += delta;
        if (state.progressMs >= EARNING_INTERVAL && !passiveClaimInFlight) {
          state.progressMs -= EARNING_INTERVAL;
          passiveClaimInFlight = true;
          void awardTokens(EARNING_REWARD, "Five more minutes productively wasted.", "passive")
            .finally(() => { passiveClaimInFlight = false; });
        }
        saveState();
      }
      lastPulseAt = now;
      try {
        if (storageAvailable) localStorage.setItem(LOCK_KEY, JSON.stringify({ owner: tabId, expiresAt: now + LOCK_TTL }));
      } catch (error) { storageAvailable = false; }
    } else {
      lastPulseAt = now;
    }
    renderTimer();
    renderCooldown();
  }

  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  async function startAd() {
    if (adTickHandle || byId("watch-ad").disabled || byId("ad-dialog").open) return;
    byId("watch-ad").disabled = true;
    const remoteStarted = await startRemoteAd();
    if (!remoteStarted) {
      renderCooldown();
      return;
    }
    unlockAudio();
    playRewardSound("adStart");
    selectedAd = ads[Math.floor(Math.random() * ads.length)];
    adStartedAt = Date.now();
    adFinished = false;
    adRunToken += 1;
    const thisRun = adRunToken;
    byId("creative-kicker").textContent = selectedAd.kicker;
    byId("creative-object").textContent = selectedAd.object;
    byId("creative-title").textContent = selectedAd.title;
    byId("creative-description").textContent = selectedAd.description;
    byId("creative-brand").textContent = selectedAd.brand;
    byId("ad-progress-message").textContent = "Your attention is being wasted…";
    byId("ad-countdown").textContent = "8s";
    byId("ad-progress-fill").style.width = "0%";
    byId("ad-progress").setAttribute("aria-valuenow", "0");
    byId("ad-complete-message").hidden = true;
    byId("ad-done").disabled = true;
    byId("ad-done").textContent = "Almost nothing…";
    byId("ad-dialog").dataset.running = "true";
    openDialog(byId("ad-dialog"));
    const update = () => {
      if (thisRun !== adRunToken || !byId("ad-dialog").open || adFinished) return;
      const elapsed = Date.now() - adStartedAt;
      const progress = Math.min(1, elapsed / AD_DURATION);
      const percent = Math.floor(progress * 100);
      byId("ad-progress-fill").style.width = percent + "%";
      byId("ad-progress").setAttribute("aria-valuenow", String(percent));
      const remaining = Math.max(0, Math.ceil((AD_DURATION - elapsed) / 1000));
      byId("ad-countdown").textContent = remaining + "s";
      if (progress >= 1) {
        void finishAd();
        return;
      }
    };
    adTickHandle = window.setInterval(update, 100);
    update();
  }

  async function finishAd() {
    if (adFinished || byId("ad-dialog").dataset.claiming === "true") return;
    byId("ad-dialog").dataset.claiming = "true";
    if (adTickHandle) window.clearInterval(adTickHandle);
    adTickHandle = null;
    const granted = await awardTokens(AD_REWARD, "Survived a fake ad for " + selectedAd.brand.replace(/™/g, "") + ".", "ad");
    byId("ad-dialog").dataset.claiming = "false";
    adFinished = true;
    if (!granted) cancelRemoteAd();
    byId("ad-dialog").dataset.running = "false";
    byId("ad-progress-message").textContent = granted ? "Your attention has been successfully wasted." : "That ad didn't qualify for a reward. Please try again.";
    byId("ad-countdown").textContent = granted ? "Done" : "No reward";
    byId("ad-progress-fill").style.width = "100%";
    byId("ad-progress").setAttribute("aria-valuenow", "100");
    const completion = byId("ad-complete-message");
    completion.hidden = !granted;
    completion.classList.remove("reward-confirmed");
    if (granted && !document.body.classList.contains("reduce-motion")) {
      void completion.offsetWidth;
      completion.classList.add("reward-confirmed");
    }
    byId("ad-done").disabled = false;
    byId("ad-done").textContent = "Back to nothing";
    if (granted) playRewardSound("adDone");
    renderCooldown();
    saveState();
  }

  function cancelAd() {
    adRunToken += 1;
    if (adTickHandle) window.clearInterval(adTickHandle);
    adTickHandle = null;
    if (!adFinished) {
      byId("ad-dialog").dataset.running = "false";
      cancelRemoteAd();
    }
    byId("watch-ad").disabled = false;
    renderCooldown();
  }

  function bindEvents() {
    document.querySelectorAll("[data-open-profile]").forEach(button => button.addEventListener("click", () => openDialog(byId("profile-dialog"))));
    document.querySelectorAll("[data-open-settings]").forEach(button => button.addEventListener("click", () => {
      if (byId("profile-dialog").open) closeDialog(byId("profile-dialog"));
      openDialog(byId("settings-dialog"));
    }));
    document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (dialog) closeDialog(dialog);
    }));
    document.querySelectorAll("dialog").forEach(dialog => {
      dialog.addEventListener("click", event => {
        if (event.target === dialog) {
          if (dialog.id === "ad-dialog") cancelAd();
          closeDialog(dialog);
        }
      });
    });
    document.querySelectorAll("[data-period]").forEach(button => button.addEventListener("click", () => {
      activePeriod = button.dataset.period;
      document.querySelectorAll("[data-period]").forEach(tab => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      renderLeaderboard();
      if (backendReady) void refreshRemoteLeaderboard();
    }));
    byId("leader-search").addEventListener("input", renderLeaderboard);
    document.querySelectorAll("[data-buy-boost]").forEach(button => button.addEventListener("click", () => buyBoost(button.dataset.buyBoost)));
    byId("username-form").addEventListener("submit", async event => {
      event.preventDefault();
      const nextName = sanitizeName(byId("username-input").value);
      if (nextName.length < 2) {
        byId("username-input").setCustomValidity("Please enter at least 2 characters.");
        byId("username-input").reportValidity();
        return;
      }
      byId("username-input").setCustomValidity("");
      if (backendReady) {
        try {
          const { error } = await supabaseClient.rpc("token_update_username", { p_username: nextName });
          if (error) throw error;
        } catch (error) {
          showToast("Name not synced", "The shared database could not save that alias. Please try again.", "!");
          return;
        }
      }
      state.username = nextName;
      addActivity("Changed your guest alias to " + nextName + ".", "", "normal");
      saveState();
      renderAll(false);
      showToast("Alias updated", backendReady ? "Your name is now on the shared leaderboard." : "Your guest alias has been saved on this device.", "✎");
      if (backendReady) void refreshRemoteLeaderboard();
      closeDialog(byId("profile-dialog"));
    });
    byId("username-input").addEventListener("input", () => byId("username-input").setCustomValidity(""));
    byId("motion-toggle").addEventListener("change", event => {
      document.body.classList.toggle("reduce-motion", !event.target.checked);
      try { localStorage.setItem("token-motion-enabled", event.target.checked ? "true" : "false"); } catch (error) {}
    });
    byId("sound-toggle").addEventListener("change", event => {
      soundEnabled = event.target.checked;
      try { localStorage.setItem("token-sound-enabled", soundEnabled ? "true" : "false"); } catch (error) {}
      if (soundEnabled) { unlockAudio(); playRewardSound("reward"); }
    });
    byId("haptics-toggle").addEventListener("change", event => {
      hapticsEnabled = event.target.checked;
      try { localStorage.setItem("token-haptics-enabled", hapticsEnabled ? "true" : "false"); } catch (error) {}
      if (hapticsEnabled) rewardHaptic(false);
    });
    document.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
    byId("watch-ad").addEventListener("click", startAd);
    byId("close-ad").addEventListener("click", () => {
      cancelAd();
      closeDialog(byId("ad-dialog"));
    });
    byId("ad-done").addEventListener("click", () => {
      if (!adFinished) return;
      closeDialog(byId("ad-dialog"));
      showToast("Nothing achieved", "Fifteen more Tokens. Still worth precisely zero.", "✦");
    });
    byId("ad-dialog").addEventListener("cancel", event => {
      event.preventDefault();
      cancelAd();
      closeDialog(byId("ad-dialog"));
    });
    byId("open-reset").addEventListener("click", () => {
      closeDialog(byId("settings-dialog"));
      openDialog(byId("reset-dialog"));
    });
    byId("confirm-reset").addEventListener("click", () => {
      releaseLock();
      if (pulseHandle) window.clearInterval(pulseHandle);
      if (uiHandle) window.clearInterval(uiHandle);
      state = freshState();
      displayedBalance = 0;
      saveState();
      lastPulseAt = Date.now();
      startEngine();
      renderAll(false);
      closeDialog(byId("reset-dialog"));
      showToast("Freshly pointless", "Your local guest account has been reset.", "↺");
    });
    window.addEventListener("storage", event => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const remote = JSON.parse(event.newValue);
          if (remote && remote.version === 1 && Number(remote.updatedAt) >= Number(state.updatedAt || 0)) {
            state = { ...state, ...remote };
            renderAll(false);
          }
        } catch (error) {}
      }
      if (event.key === LOCK_KEY && event.newValue) {
        const lock = safeParse(event.newValue);
        if (lock && lock.owner !== tabId && leader) leader = false;
      }
    });
    window.addEventListener("pagehide", () => {
      saveState();
      releaseLock();
    });
    window.addEventListener("pageshow", () => {
      lastPulseAt = Date.now();
      claimLock(Date.now());
    });
    document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    }));
  }

  function safeParse(text) {
    try { return JSON.parse(text); } catch (error) { return null; }
  }

  function startEngine() {
    if (pulseHandle) window.clearInterval(pulseHandle);
    lastPulseAt = Date.now();
    claimLock(lastPulseAt);
    pulseHandle = window.setInterval(pulse, HEARTBEAT_EVERY);
    uiHandle = window.setInterval(() => {
      renderTimer();
      renderActivity();
      renderCooldown();
      renderShop();
    }, 1000);
  }

  function boot() {
    state = safeReadState();
    if (!state.activity.length) addActivity("Clocked in for a shift of doing nothing.", "", "welcome");
    displayedBalance = state.balance;
    byId("year").textContent = String(new Date().getFullYear());
    try {
      const savedSound = localStorage.getItem("token-sound-enabled");
      soundEnabled = savedSound !== "false";
      byId("sound-toggle").checked = soundEnabled;
      const savedHaptics = localStorage.getItem("token-haptics-enabled");
      hapticsEnabled = savedHaptics !== "false";
      byId("haptics-toggle").checked = hapticsEnabled;
      const motion = localStorage.getItem("token-motion-enabled");
      if (motion === "false") {
        byId("motion-toggle").checked = false;
        document.body.classList.add("reduce-motion");
      }
    } catch (error) { storageAvailable = false; }
    bindEvents();
    renderAll(false);
    startEngine();
    void initializeRemoteBackend();
  }

  boot();
})();