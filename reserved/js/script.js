(function () {
  "use strict";

  const REDIRECT_DELAY = 30;
  const TARGET_URL = "https://miyomi.pages.dev";
  const QUOTE_INTERVAL = 8;

  const animeQuotes = [
    {
      text: "No matter what happens, keep walking on the path you believe in.",
      source: "Monkey D. Luffy, One Piece",
    },
    {
      text: "I'll never give up! That is my nindo, my ninja way!",
      source: "Naruto Uzumaki, Naruto",
    },
    {
      text: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be.",
      source: "Naruto Uzumaki, Naruto",
    },
    {
      text: "There is no truth in this world. Anyone can become a God or a Devil, all it takes is for someone to claim that to be the truth.",
      source: "Eren Kruger, Attack on Titan",
    },
    {
      text: "Set your heart ablaze, for the sake of changing tomorrow.",
      source: "Demon Slayer (Kimetsu no Yaiba)",
    },
    {
      text: "No matter how many people you may lose, never give up. No matter how devastating the blows may be, never give up.",
      source: "Demon Slayer (Kimetsu no Yaiba)",
    },
    {
      text: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger as well as kinder.",
      source: "Gildarts Clive, Fairy Tail",
    },
    {
      text: "The strong should aid and protect the weak. Then, the weak will become strong, and they in turn will aid and protect those weaker than them.",
      source: "Jiraiya, Naruto",
    },
    {
      text: "When you hit the point of no return, that's the moment it truly becomes a journey. If you can still turn back, it's not really a journey.",
      source: "Hinata Miyake, A Place Further Than The Universe",
    },
    {
      text: "Believe in yourself. Not in the you who believes in me. Not the me who believes in you. Believe in the you who believes in yourself.",
      source: "Kamina, Gurren Lagann",
    },
  ];

  let timeLeft = REDIRECT_DELAY;
  let countdownInterval;
  let progressInterval;
  let quoteInterval;
  let currentQuoteIndex = getRandomQuoteIndex(-1);
  let isPaused = false;

  // DOM Elements
  const countdownEl = document.getElementById("countdown");
  const progressEl = document.getElementById("progress");
  const redirectBtn = document.getElementById("redirect-btn");
  const toggleBtn = document.getElementById("toggle-btn");
  const toggleBtnText = toggleBtn ? toggleBtn.querySelector(".btn-text") : null;
  const toggleBtnIcon = toggleBtn ? toggleBtn.querySelector(".btn-icon") : null;
  const quoteText = document.getElementById("quote-text");
  const quoteSource = document.getElementById("quote-source");
  const quoteContainer = document.getElementById("quote-container");

  function updateToggleButton(state) {
    if (!toggleBtn) return;
    toggleBtn.dataset.state = state;
    if (toggleBtnIcon) {
      toggleBtnIcon.setAttribute(
        "data-icon-state",
        state === "paused" ? "play" : "pause"
      );
    }
    if (toggleBtnText) {
      const targetText =
        state === "paused"
          ? toggleBtnText.dataset.paused || "Continue redirect"
          : toggleBtnText.dataset.running || "Let me stay";
      toggleBtnText.textContent = targetText;
    }
    toggleBtn.setAttribute(
      "aria-pressed",
      state === "paused" ? "true" : "false"
    );
    toggleBtn.setAttribute(
      "aria-label",
      state === "paused"
        ? "Resume auto-redirect"
        : `Pause auto-redirect (redirects in ${timeLeft} seconds)`
    );
  }

  function init() {
    displayQuote(currentQuoteIndex);
    startQuoteRotation();
    startCountdown();
    startProgressBar();
    setupEventListeners();
    addSubtleAnimations();
    updateToggleButton("running");
  }

  function getRandomQuoteIndex(previousIndex) {
    if (animeQuotes.length <= 1) return 0;
    let nextIndex = Math.floor(Math.random() * animeQuotes.length);
    while (nextIndex === previousIndex) {
      nextIndex = Math.floor(Math.random() * animeQuotes.length);
    }
    return nextIndex;
  }

  // Quote rotation
  function startQuoteRotation() {
    quoteInterval = setInterval(() => {
      if (!isPaused) {
        currentQuoteIndex = getRandomQuoteIndex(currentQuoteIndex);
        displayQuote(currentQuoteIndex);
      }
    }, QUOTE_INTERVAL * 1000);
  }

  function displayQuote(index) {
    const quote = animeQuotes[index];
    quoteContainer.classList.remove("visible");
    setTimeout(() => {
      quoteText.textContent = `"${quote.text}"`;
      quoteSource.textContent = `- ${quote.source}`;
      quoteContainer.classList.add("visible");
    }, 300);
  }

  // Countdown timer
  function startCountdown() {
    updateCountdown();

    countdownInterval = setInterval(() => {
      if (!isPaused) {
        timeLeft--;
        updateCountdown();

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          performRedirect();
        }
      }
    }, 1000);
  }

  function updateCountdown() {
    if (countdownEl) {
      countdownEl.classList.add("updating");
      countdownEl.textContent = timeLeft;

      setTimeout(() => {
        countdownEl.classList.remove("updating");
      }, 200);
    }
  }

  // Progress bar animation
  function startProgressBar() {
    if (progressEl) {
      const totalWidth = 100;
      const decrementPerSecond = totalWidth / REDIRECT_DELAY;
      let currentWidth = 100;

      progressInterval = setInterval(() => {
        if (!isPaused) {
          currentWidth -= decrementPerSecond;

          if (currentWidth <= 0) {
            currentWidth = 0;
            clearInterval(progressInterval);
          }

          if (currentWidth < 30) {
            progressEl.style.boxShadow = "0 0 8px rgba(255, 152, 0, 0.4)";
          }

          progressEl.style.width = currentWidth + "%";
        }
      }, 1000);

      progressEl.style.width = "100%";
    }
  }

  // Perform the redirect
  function performRedirect() {
    const button = redirectBtn;
    if (button) {
      const originalText = button.querySelector(".button-text").textContent;
      button.querySelector(".button-text").textContent = "Opening...";
      button.style.opacity = "0.8";

      setTimeout(() => {
        window.location.href = TARGET_URL;
      }, 800);
    } else {
      window.location.href = TARGET_URL;
    }
  }

  // Pause redirect
  function pauseRedirect() {
    if (isPaused || timeLeft <= 0) return;
    isPaused = true;
    if (countdownInterval) clearInterval(countdownInterval);
    if (progressInterval) clearInterval(progressInterval);
    updateToggleButton("paused");
    if (countdownEl) {
      countdownEl.style.opacity = "0.65";
      countdownEl.classList.add("paused-state");
    }
  }

  // Resume redirect
  function resumeRedirect() {
    if (!isPaused || timeLeft <= 0) return;
    isPaused = false;
    startCountdown();
    startProgressBar();
    updateToggleButton("running");
    if (countdownEl) {
      countdownEl.style.opacity = "1";
      countdownEl.classList.remove("paused-state");
      updateCountdown();
    }
  }
  // Event listeners
  function setupEventListeners() {
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (isPaused) {
          resumeRedirect();
        } else {
          pauseRedirect();
        }
      });
    }

    if (redirectBtn) {
      redirectBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearIntervals();
        performRedirect();
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (isPaused) {
          resumeRedirect();
        } else {
          pauseRedirect();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        clearIntervals();
        performRedirect();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (!isPaused) pauseRedirect();
      }
    });
  }

  function addSubtleAnimations() {
    const avatar = document.querySelector(".avatar-image");
    if (avatar) {
      avatar.addEventListener("mouseenter", () => {
        avatar.style.transform = "scale(1.05) rotate(2deg)";
      });

      avatar.addEventListener("mouseleave", () => {
        avatar.style.transform = "scale(1) rotate(0deg)";
      });

      avatar.addEventListener("click", () => {
        avatar.style.transform = "scale(1.1) rotate(360deg)";
        setTimeout(() => {
          avatar.style.transform = "scale(1) rotate(0deg)";
        }, 500);
      });
    }

    const floatingElements = document.querySelectorAll(".floating-element");
    floatingElements.forEach((element) => {
      element.addEventListener("click", () => {
        element.style.animation = "none";
        element.offsetHeight;
        element.style.animation = "gentleFloat 1s ease-out";
      });
    });
  }

  // Clear all intervals
  function clearIntervals() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (progressInterval) clearInterval(progressInterval);
    if (quoteInterval) clearInterval(quoteInterval);
  }

  function setupAccessibility() {
    if (redirectBtn) {
      redirectBtn.setAttribute(
        "aria-label",
        `Navigate to miyomi.pages.dev (redirects in ${timeLeft} seconds)`
      );
    }

    if (toggleBtn) {
      toggleBtn.setAttribute(
        "aria-label",
        "Pause auto-redirect to enjoy the page"
      );
      toggleBtn.setAttribute("aria-pressed", "false");
    }

    [redirectBtn, toggleBtn].forEach((btn) => {
      if (btn) {
        btn.addEventListener("focus", () => {
          btn.style.outline = "2px solid #ffc107";
          btn.style.outlineOffset = "2px";
        });

        btn.addEventListener("blur", () => {
          btn.style.outline = "none";
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init();
      setupAccessibility();
    });
  } else {
    init();
    setupAccessibility();
  }

  // Cleanup
  window.addEventListener("beforeunload", () => {
    clearIntervals();
  });
})();
