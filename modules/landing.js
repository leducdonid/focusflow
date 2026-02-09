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
      setTimeout(function() { self._switchAuthTab("signup"); }, 300);
    });
    hero.querySelector(".landing__cta-login").addEventListener("click", function() {
      self._scrollToAuth();
      setTimeout(function() { self._switchAuthTab("login"); }, 300);
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

    // Auth tabs
    var tabs = document.createElement("div");
    tabs.className = "auth-tabs";
    tabs.innerHTML =
      '<button class="auth-tab is-active" data-landing-tab="login">Đăng nhập</button>' +
      '<button class="auth-tab" data-landing-tab="signup">Đăng ký</button>';
    authCard.appendChild(tabs);

    // Error display
    var errorDiv = document.createElement("div");
    errorDiv.className = "auth-error";
    errorDiv.id = "landing-auth-error";
    errorDiv.hidden = true;
    authCard.appendChild(errorDiv);

    // Success display
    var successDiv = document.createElement("div");
    successDiv.className = "auth-success";
    successDiv.id = "landing-auth-success";
    successDiv.hidden = true;
    authCard.appendChild(successDiv);

    // Login form
    var loginForm = document.createElement("form");
    loginForm.className = "auth-form";
    loginForm.id = "landing-login-form";
    loginForm.innerHTML =
      '<div class="auth-field">' +
        '<label for="landing-login-email">Email</label>' +
        '<input id="landing-login-email" type="email" placeholder="email@example.com" required autocomplete="email" />' +
      '</div>' +
      '<div class="auth-field">' +
        '<label for="landing-login-password">Mật khẩu</label>' +
        '<input id="landing-login-password" type="password" placeholder="Nhập mật khẩu" required autocomplete="current-password" minlength="6" />' +
      '</div>' +
      '<button type="submit" class="btn btn--primary auth-submit-btn">Đăng nhập</button>' +
      '<button type="button" class="auth-forgot-btn" id="landing-forgot-btn">Quên mật khẩu?</button>';
    authCard.appendChild(loginForm);

    // Signup form
    var signupForm = document.createElement("form");
    signupForm.className = "auth-form";
    signupForm.id = "landing-signup-form";
    signupForm.hidden = true;
    signupForm.innerHTML =
      '<div class="auth-field">' +
        '<label for="landing-signup-name">Tên hiển thị</label>' +
        '<input id="landing-signup-name" type="text" placeholder="Tên của bạn" required autocomplete="name" />' +
      '</div>' +
      '<div class="auth-field">' +
        '<label for="landing-signup-email">Email</label>' +
        '<input id="landing-signup-email" type="email" placeholder="email@example.com" required autocomplete="email" />' +
      '</div>' +
      '<div class="auth-field">' +
        '<label for="landing-signup-password">Mật khẩu</label>' +
        '<input id="landing-signup-password" type="password" placeholder="Ít nhất 6 ký tự" required autocomplete="new-password" minlength="6" />' +
      '</div>' +
      '<button type="submit" class="btn btn--primary auth-submit-btn">Tạo tài khoản</button>';
    authCard.appendChild(signupForm);

    // Reset password form
    var resetForm = document.createElement("form");
    resetForm.className = "auth-form";
    resetForm.id = "landing-reset-form";
    resetForm.hidden = true;
    resetForm.innerHTML =
      '<p class="auth-reset-desc">Nhập email để nhận liên kết đặt lại mật khẩu.</p>' +
      '<div class="auth-field">' +
        '<label for="landing-reset-email">Email</label>' +
        '<input id="landing-reset-email" type="email" placeholder="email@example.com" required autocomplete="email" />' +
      '</div>' +
      '<button type="submit" class="btn btn--primary auth-submit-btn">Gửi liên kết</button>' +
      '<button type="button" class="auth-back-btn" id="landing-back-to-login">Quay lại đăng nhập</button>';
    authCard.appendChild(resetForm);

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

    tabs.addEventListener("click", function(e) {
      var tabBtn = e.target.closest(".auth-tab");
      if (!tabBtn) return;
      var tab = tabBtn.getAttribute("data-landing-tab");
      self._switchAuthTab(tab);
    });

    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self._handleLogin(e);
    });

    signupForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self._handleSignup(e);
    });

    resetForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self._handleResetPassword(e);
    });

    authCard.querySelector("#landing-forgot-btn").addEventListener("click", function() {
      self._switchAuthTab("reset");
    });

    authCard.querySelector("#landing-back-to-login").addEventListener("click", function() {
      self._switchAuthTab("login");
    });

    guestBtn.addEventListener("click", function() {
      sessionStorage.setItem("focusflow_guest_session", "true");
      self.hide();
    });
  },

  /* ========== PRIVATE: AUTH HANDLING ========== */

  _switchAuthTab: function(tab) {
    this._clearMessages();

    var loginForm = document.getElementById("landing-login-form");
    var signupForm = document.getElementById("landing-signup-form");
    var resetForm = document.getElementById("landing-reset-form");
    var tabBtns = this._overlayEl.querySelectorAll(".auth-tab");

    if (!loginForm || !signupForm || !resetForm) return;

    loginForm.hidden = true;
    signupForm.hidden = true;
    resetForm.hidden = true;

    if (tab === "login") {
      loginForm.hidden = false;
      tabBtns.forEach(function(btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-landing-tab") === "login");
      });
    } else if (tab === "signup") {
      signupForm.hidden = false;
      tabBtns.forEach(function(btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-landing-tab") === "signup");
      });
    } else if (tab === "reset") {
      resetForm.hidden = false;
      tabBtns.forEach(function(btn) {
        btn.classList.remove("is-active");
      });
    }
  },

  _handleLogin: function(e) {
    var self = this;
    this._clearMessages();

    var email = document.getElementById("landing-login-email").value.trim();
    var password = document.getElementById("landing-login-password").value;
    if (!email || !password) return;

    var form = document.getElementById("landing-login-form");
    this._setLoading(form, true);

    AuthModule.signInWithEmail(email, password).then(function() {
      self._setLoading(form, false);
    }).catch(function(err) {
      self._setLoading(form, false);
      self._showError(AuthModule.getErrorMessage(err));
    });
  },

  _handleSignup: function(e) {
    var self = this;
    this._clearMessages();

    var name = document.getElementById("landing-signup-name").value.trim();
    var email = document.getElementById("landing-signup-email").value.trim();
    var password = document.getElementById("landing-signup-password").value;
    if (!name || !email || !password) return;

    var form = document.getElementById("landing-signup-form");
    this._setLoading(form, true);

    AuthModule.signUpWithEmail(email, password, name).then(function(data) {
      self._setLoading(form, false);
      if (data.session) {
        form.reset();
      } else if (data.user && !data.session) {
        self._showSuccess("Đã tạo tài khoản! Vui lòng kiểm tra email để xác nhận.");
        form.reset();
      }
    }).catch(function(err) {
      self._setLoading(form, false);
      self._showError(AuthModule.getErrorMessage(err));
    });
  },

  _handleResetPassword: function(e) {
    var self = this;
    this._clearMessages();

    var email = document.getElementById("landing-reset-email").value.trim();
    if (!email) return;

    var form = document.getElementById("landing-reset-form");
    this._setLoading(form, true);

    AuthModule.resetPassword(email).then(function() {
      self._setLoading(form, false);
      self._showSuccess("Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.");
    }).catch(function(err) {
      self._setLoading(form, false);
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

  _showSuccess: function(msg) {
    var el = document.getElementById("landing-auth-success");
    if (el) {
      el.textContent = msg;
      el.hidden = false;
    }
  },

  _clearMessages: function() {
    var err = document.getElementById("landing-auth-error");
    var succ = document.getElementById("landing-auth-success");
    if (err) { err.hidden = true; err.textContent = ""; }
    if (succ) { succ.hidden = true; succ.textContent = ""; }
  },

  _setLoading: function(form, loading) {
    var btn = form.querySelector(".auth-submit-btn");
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.textContent = "Đang xử lý...";
    } else {
      btn.textContent = btn.dataset.origText || btn.textContent;
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
