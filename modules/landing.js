/* =====================================================
   FocusFlow — Landing Module
   Full-page landing overlay with hero, features, steps,
   auth forms, and footer. Shown to unauthenticated users.
   BEM naming: .landing__*
   ===================================================== */

var LandingModule = {
  _initialized: false,
  _overlayEl: null,

  /* ========== PUBLIC API ========== */

  init: function() {
    if (this._initialized) return;

    var self = this;

    this._buildOverlay();
    document.body.appendChild(this._overlayEl);

    // Listen for auth events
    document.addEventListener("auth:login", function() {
      self.hide();
    });

    document.addEventListener("auth:logout", function() {
      self.show();
    });

    // Check initial auth state
    if (typeof AuthModule !== "undefined" && AuthModule.isLoggedIn()) {
      this._overlayEl.hidden = true;
      var appShell = document.querySelector(".app-shell");
      if (appShell) appShell.classList.remove("is-hidden");
    } else if (sessionStorage.getItem("focusflow_guest_session")) {
      this._overlayEl.hidden = true;
      var appShell2 = document.querySelector(".app-shell");
      if (appShell2) appShell2.classList.remove("is-hidden");
    } else {
      this.show();
    }

    this._initialized = true;
    console.log("[Landing] Initialized");
  },

  show: function() {
    var self = this;
    if (!this._overlayEl) return;

    // Clear guest session so landing stays visible
    sessionStorage.removeItem("focusflow_guest_session");

    this._overlayEl.hidden = false;
    requestAnimationFrame(function() {
      self._overlayEl.classList.add("is-visible");
    });

    var appShell = document.querySelector(".app-shell");
    if (appShell) appShell.classList.add("is-hidden");

    document.body.style.overflow = "hidden";
  },

  hide: function() {
    var self = this;
    if (!this._overlayEl) return;

    this._overlayEl.classList.remove("is-visible");

    setTimeout(function() {
      if (self._overlayEl) self._overlayEl.hidden = true;
    }, 300);

    var appShell = document.querySelector(".app-shell");
    if (appShell) appShell.classList.remove("is-hidden");

    document.body.style.overflow = "";

    document.dispatchEvent(new CustomEvent("landing:hidden"));
  },

  isVisible: function() {
    if (!this._overlayEl) return false;
    return !this._overlayEl.hidden && this._overlayEl.classList.contains("is-visible");
  },

  /* ========== PRIVATE: DOM BUILDERS ========== */

  _buildOverlay: function() {
    var self = this;

    var overlay = document.createElement("div");
    overlay.className = "landing__overlay";
    overlay.hidden = true;

    var scroll = document.createElement("div");
    scroll.className = "landing__scroll-container";

    // ============ HERO SECTION ============
    var hero = document.createElement("section");
    hero.className = "landing__hero";
    hero.innerHTML =
      '<div class="landing__hero-glow landing__hero-glow--1"></div>' +
      '<div class="landing__hero-glow landing__hero-glow--2"></div>' +
      '<div class="landing__hero-content">' +
        '<div class="landing__logo-badge">FF</div>' +
        '<h1 class="landing__title">FocusFlow</h1>' +
        '<p class="landing__tagline">Quy trình 3 bước giúp bạn tập trung và làm việc hiệu quả hơn</p>' +
        '<div class="landing__cta-group">' +
          '<button class="btn btn--primary btn--large landing__cta-signup">Bắt đầu miễn phí</button>' +
          '<button class="btn btn--ghost btn--large landing__cta-login">Đăng nhập</button>' +
        '</div>' +
      '</div>';
    scroll.appendChild(hero);

    hero.querySelector(".landing__cta-signup").addEventListener("click", function() {
      self._scrollToAuth();
    });
    hero.querySelector(".landing__cta-login").addEventListener("click", function() {
      self._scrollToAuth();
    });

    // ============ FEATURES SECTION ============
    var features = document.createElement("section");
    features.className = "landing__features";
    features.innerHTML =
      '<h2 class="landing__section-title">Quy trình 3 bước để tập trung</h2>' +
      '<div class="landing__features-grid">' +
        '<div class="landing__feature-card">' +
          '<span class="landing__feature-icon">\uD83C\uDFAF</span>' +
          '<h3 class="landing__feature-title">Priority Flow</h3>' +
          '<p class="landing__feature-desc">Phân loại công việc theo Ma trận Eisenhower. Tập trung vào điều quan trọng nhất.</p>' +
        '</div>' +
        '<div class="landing__feature-card">' +
          '<span class="landing__feature-icon">\u23F0</span>' +
          '<h3 class="landing__feature-title">Time Flow</h3>' +
          '<p class="landing__feature-desc">Sắp xếp thời gian bằng Time Blocking. Timeline trực quan với màu sắc.</p>' +
        '</div>' +
        '<div class="landing__feature-card">' +
          '<span class="landing__feature-icon">\uD83D\uDD25</span>' +
          '<h3 class="landing__feature-title">Deep Flow</h3>' +
          '<p class="landing__feature-desc">Pomodoro Timer giúp duy trì sự tập trung. Chọn 25, 50 hoặc 90 phút.</p>' +
        '</div>' +
      '</div>';
    scroll.appendChild(features);

    // ============ HOW IT WORKS SECTION ============
    var howItWorks = document.createElement("section");
    howItWorks.className = "landing__steps";
    howItWorks.innerHTML =
      '<h2 class="landing__section-title">Cách hoạt động</h2>' +
      '<div class="landing__steps-row">' +
        '<div class="landing__step">' +
          '<div class="landing__step-number">1</div>' +
          '<h3 class="landing__step-title">Xác định ưu tiên</h3>' +
          '<p class="landing__step-desc">Phân loại công việc theo mức độ quan trọng và khẩn cấp</p>' +
        '</div>' +
        '<div class="landing__step-arrow">\u2192</div>' +
        '<div class="landing__step">' +
          '<div class="landing__step-number">2</div>' +
          '<h3 class="landing__step-title">Lên lịch</h3>' +
          '<p class="landing__step-desc">Phân bổ thời gian cụ thể cho từng nhiệm vụ trong ngày</p>' +
        '</div>' +
        '<div class="landing__step-arrow">\u2192</div>' +
        '<div class="landing__step">' +
          '<div class="landing__step-number">3</div>' +
          '<h3 class="landing__step-title">Tập trung</h3>' +
          '<p class="landing__step-desc">Sử dụng Pomodoro Timer để làm việc hiệu quả</p>' +
        '</div>' +
      '</div>';
    scroll.appendChild(howItWorks);

    // ============ AUTH SECTION ============
    var authSection = document.createElement("section");
    authSection.className = "landing__auth";
    authSection.id = "landing-auth-section";

    var authCard = document.createElement("div");
    authCard.className = "landing__auth-card";

    // Auth header
    var authHeader = document.createElement("div");
    authHeader.className = "landing__auth-header";
    authHeader.innerHTML =
      '<div class="landing__logo-badge landing__logo-badge--small">FF</div>' +
      '<h2 class="landing__auth-title">Bắt đầu với FocusFlow</h2>';
    authCard.appendChild(authHeader);

    // Error display
    var errorDiv = document.createElement("div");
    errorDiv.className = "auth-error";
    errorDiv.id = "landing-auth-error";
    errorDiv.hidden = true;
    authCard.appendChild(errorDiv);

    // Google OAuth button
    var googleBtn = document.createElement("button");
    googleBtn.type = "button";
    googleBtn.className = "auth-google-btn";
    googleBtn.id = "landing-google-btn";
    googleBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20">' +
        '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>' +
        '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
        '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
        '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
      '</svg>' +
      '<span>Tiếp tục với Google</span>';
    authCard.appendChild(googleBtn);

    // Divider
    var divider = document.createElement("div");
    divider.className = "auth-divider";
    divider.id = "landing-auth-divider";
    divider.innerHTML = "<span>hoặc</span>";
    authCard.appendChild(divider);

    // Guest mode button
    var guestBtn = document.createElement("button");
    guestBtn.type = "button";
    guestBtn.className = "landing__guest-btn";
    guestBtn.textContent = "Dùng thử không cần tài khoản";
    authCard.appendChild(guestBtn);

    authSection.appendChild(authCard);
    scroll.appendChild(authSection);

    // ============ FOOTER ============
    var footer = document.createElement("footer");
    footer.className = "landing__footer";
    footer.innerHTML = '<p>FocusFlow \u2014 Được tạo bởi GYB Agent</p>';
    scroll.appendChild(footer);

    overlay.appendChild(scroll);
    this._overlayEl = overlay;

    // ============ EVENT LISTENERS ============

    googleBtn.addEventListener("click", function() {
      self._handleGoogleOAuth();
    });

    guestBtn.addEventListener("click", function() {
      sessionStorage.setItem("focusflow_guest_session", "true");
      self.hide();
    });
  },

  /* ========== PRIVATE: AUTH HANDLING ========== */

  _handleGoogleOAuth: function() {
    var self = this;
    this._clearMessages();

    AuthModule.signInWithGoogle().catch(function(err) {
      self._showError(AuthModule.getErrorMessage(err));
    });
  },

  /* ========== PRIVATE: HELPERS ========== */

  _showError: function(msg) {
    var el = document.getElementById("landing-auth-error");
    if (el) {
      el.textContent = msg;
      el.hidden = false;
    }
  },

  _scrollToAuth: function() {
    var authSection = document.getElementById("landing-auth-section");
    if (authSection) {
      authSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

/* ========== SELF-INITIALIZATION ========== */

(function() {
  function tryInit() {
    if (typeof AuthModule !== "undefined" && typeof SupabaseConfig !== "undefined") {
      LandingModule.init();
    } else {
      setTimeout(tryInit, 100);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(tryInit, 50); });
  } else {
    setTimeout(tryInit, 50);
  }
})();
