/* =====================================================
   FocusFlow — Auth Module
   Handles Supabase authentication: email login, signup,
   password reset, session management, user profile
   display, and guest mode.
   ===================================================== */

var AuthModule = {
  _user: null,
  _session: null,
  _initialized: false,
  _modalEl: null,
  _authChangeSubscription: null,

  /* ========== PUBLIC API ========== */

  init: function() {
    var self = this;
    if (this._initialized) {
      return Promise.resolve(this._user);
    }

    var client = SupabaseConfig.getClient();
    if (!client) {
      console.warn("[Auth] Supabase client not available");
      this._renderSettingsSection();
      return Promise.resolve(null);
    }

    this._initialized = true;

    var authResult = client.auth.onAuthStateChange(function(event, session) {
      console.log("[Auth] State change:", event);
      self._session = session;
      self._user = session ? session.user : null;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        self._onLogin(self._user);
      } else if (event === "SIGNED_OUT") {
        self._onLogout();
      }
    });
    this._authChangeSubscription = authResult.data.subscription;

    return client.auth.getSession().then(function(result) {
      var session = result.data.session;
      self._session = session;
      self._user = session ? session.user : null;

      self._renderSettingsSection();
      self._renderUserWidget();

      if (self._user) {
        console.log("[Auth] Restored session for:", self._user.email);
      } else {
        console.log("[Auth] No active session (guest mode)");
      }

      return self._user;
    }).catch(function(err) {
      console.error("[Auth] Session check failed:", err);
      self._renderSettingsSection();
      self._renderUserWidget();
      return null;
    });
  },

  showLoginModal: function() {
    if (!this._modalEl) {
      this._createModal();
    }
    this._modalEl.hidden = false;
    requestAnimationFrame(function() {
      document.querySelector(".auth-modal-overlay").classList.add("is-visible");
    });
    var emailInput = document.getElementById("auth-email-input");
    if (emailInput) {
      setTimeout(function() { emailInput.focus(); }, 200);
    }
  },

  hideLoginModal: function() {
    var overlay = document.querySelector(".auth-modal-overlay");
    if (overlay) {
      overlay.classList.remove("is-visible");
      setTimeout(function() {
        var el = document.querySelector(".auth-modal-overlay");
        if (el) el.hidden = true;
      }, 300);
    }
  },

  logout: function() {
    var client = SupabaseConfig.getClient();
    if (!client) return Promise.resolve();

    var self = this;
    return client.auth.signOut().then(function() {
      self._user = null;
      self._session = null;
      console.log("[Auth] Logged out");
    }).catch(function(err) {
      console.error("[Auth] Logout error:", err);
    });
  },

  getUser: function() {
    return this._user;
  },

  isLoggedIn: function() {
    return this._user !== null;
  },

  /* ========== PUBLIC: AUTH ACTIONS (for LandingModule) ========== */

  signInWithEmail: function(email, password) {
    return this._signInWithEmail(email, password);
  },

  signUpWithEmail: function(email, password, displayName) {
    return this._signUpWithEmail(email, password, displayName);
  },

  resetPassword: function(email) {
    return this._resetPassword(email);
  },

  getErrorMessage: function(error) {
    return this._getErrorMessage(error);
  },

  /* ========== PRIVATE: AUTH ACTIONS ========== */

  _signInWithEmail: function(email, password) {
    var client = SupabaseConfig.getClient();
    if (!client) return Promise.reject(new Error("Supabase not ready"));

    return client.auth.signInWithPassword({
      email: email,
      password: password
    }).then(function(result) {
      if (result.error) throw result.error;
      return result.data;
    });
  },

  _signUpWithEmail: function(email, password, displayName) {
    var client = SupabaseConfig.getClient();
    if (!client) return Promise.reject(new Error("Supabase not ready"));

    return client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: displayName }
      }
    }).then(function(result) {
      if (result.error) throw result.error;
      return result.data;
    });
  },

  _resetPassword: function(email) {
    var client = SupabaseConfig.getClient();
    if (!client) return Promise.reject(new Error("Supabase not ready"));

    return client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    }).then(function(result) {
      if (result.error) throw result.error;
      return result.data;
    });
  },

  /* ========== PRIVATE: STATE HANDLERS ========== */

  _onLogin: function(user) {
    this._renderUserWidget();
    this._renderSettingsSection();
    this.hideLoginModal();
    document.dispatchEvent(new CustomEvent("auth:login", { detail: { user: user } }));

    if (typeof showToast === "function") {
      var name = this._getDisplayName(user);
      showToast("Xin chào, " + name + "!", "success", 3000);
    }
  },

  _onLogout: function() {
    this._renderUserWidget();
    this._renderSettingsSection();
    document.dispatchEvent(new CustomEvent("auth:logout"));

    if (typeof showToast === "function") {
      showToast("Đã đăng xuất thành công.", "info", 2500);
    }
  },

  /* ========== PRIVATE: HELPERS ========== */

  _getDisplayName: function(user) {
    if (!user) return "Guest";
    var meta = user.user_metadata || {};
    return meta.full_name || meta.name || user.email.split("@")[0];
  },

  _getAvatarUrl: function(user) {
    if (!user) return null;
    var meta = user.user_metadata || {};
    return meta.avatar_url || meta.picture || null;
  },

  _getErrorMessage: function(error) {
    if (!error) return "Đã xảy ra lỗi. Vui lòng thử lại.";
    var msg = error.message || "";

    if (msg.indexOf("Invalid login credentials") !== -1) {
      return "Email hoặc mật khẩu không đúng.";
    }
    if (msg.indexOf("Email not confirmed") !== -1) {
      return "Vui lòng xác nhận email trước khi đăng nhập.";
    }
    if (msg.indexOf("User already registered") !== -1) {
      return "Email này đã được đăng ký. Vui lòng đăng nhập.";
    }
    if (msg.indexOf("Password should be at least") !== -1) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (msg.indexOf("Unable to validate email") !== -1) {
      return "Địa chỉ email không hợp lệ.";
    }
    if (msg.indexOf("Email rate limit exceeded") !== -1) {
      return "Quá nhiều yêu cầu. Vui lòng đợi một lát.";
    }
    if (msg.indexOf("For security purposes") !== -1) {
      return "Vui lòng đợi một lát trước khi thử lại.";
    }
    return msg || "Đã xảy ra lỗi. Vui lòng thử lại.";
  },

  /* ========== PRIVATE: MODAL UI ========== */

  _createModal: function() {
    var self = this;

    var overlay = document.createElement("div");
    overlay.className = "auth-modal-overlay";
    overlay.hidden = true;

    var backdrop = document.createElement("div");
    backdrop.className = "auth-modal-backdrop";
    backdrop.addEventListener("click", function() {
      self.hideLoginModal();
    });
    overlay.appendChild(backdrop);

    var modal = document.createElement("div");
    modal.className = "auth-modal";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.className = "auth-modal__close";
    closeBtn.innerHTML = "×";
    closeBtn.setAttribute("aria-label", "Đóng");
    closeBtn.addEventListener("click", function() {
      self.hideLoginModal();
    });
    modal.appendChild(closeBtn);

    // Header
    var header = document.createElement("div");
    header.className = "auth-modal__header";
    header.innerHTML = '<span class="auth-modal__logo">FF</span><h3>FocusFlow</h3>';
    modal.appendChild(header);

    // Tabs
    var tabs = document.createElement("div");
    tabs.className = "auth-tabs";
    tabs.innerHTML =
      '<button class="auth-tab is-active" data-auth-tab="login">Đăng nhập</button>' +
      '<button class="auth-tab" data-auth-tab="signup">Đăng ký</button>';
    modal.appendChild(tabs);

    // Error display
    var errorDiv = document.createElement("div");
    errorDiv.className = "auth-error";
    errorDiv.id = "auth-error-msg";
    errorDiv.hidden = true;
    modal.appendChild(errorDiv);

    // Success display
    var successDiv = document.createElement("div");
    successDiv.className = "auth-success";
    successDiv.id = "auth-success-msg";
    successDiv.hidden = true;
    modal.appendChild(successDiv);

    // Login form
    var loginForm = document.createElement("form");
    loginForm.className = "auth-form";
    loginForm.id = "auth-login-form";
    loginForm.innerHTML =
      '<div class="auth-field">' +
        '<label for="auth-email-input">Email</label>' +
        '<input id="auth-email-input" type="email" placeholder="email@example.com" required autocomplete="email" />' +
      '</div>' +
      '<div class="auth-field">' +
        '<label for="auth-password-input">Mật khẩu</label>' +
        '<input id="auth-password-input" type="password" placeholder="Nhập mật khẩu" required autocomplete="current-password" minlength="6" />' +
      '</div>' +
      '<button type="submit" class="btn btn--primary auth-submit-btn">Đăng nhập</button>' +
      '<button type="button" class="auth-forgot-btn" id="auth-forgot-btn">Quên mật khẩu?</button>';
    modal.appendChild(loginForm);

    // Signup form
    var signupForm = document.createElement("form");
    signupForm.className = "auth-form";
    signupForm.id = "auth-signup-form";
    signupForm.hidden = true;
    signupForm.innerHTML =
      '<div class="auth-field">' +
        '<label for="auth-signup-name">Tên hiển thị</label>' +
        '<input id="auth-signup-name" type="text" placeholder="Tên của bạn" required autocomplete="name" />' +
      '</div>' +
      '<div class="auth-field">' +
        '<label for="auth-signup-email">Email</label>' +
        '<input id="auth-signup-email" type="email" placeholder="email@example.com" required autocomplete="email" />' +
      '</div>' +
      '<div class="auth-field">' +
        '<label for="auth-signup-password">Mật khẩu</label>' +
        '<input id="auth-signup-password" type="password" placeholder="Ít nhất 6 ký tự" required autocomplete="new-password" minlength="6" />' +
      '</div>' +
      '<button type="submit" class="btn btn--primary auth-submit-btn">Tạo tài khoản</button>';
    modal.appendChild(signupForm);

    // Reset password form
    var resetForm = document.createElement("form");
    resetForm.className = "auth-form";
    resetForm.id = "auth-reset-form";
    resetForm.hidden = true;
    resetForm.innerHTML =
      '<p class="auth-reset-desc">Nhập email để nhận liên kết đặt lại mật khẩu.</p>' +
      '<div class="auth-field">' +
        '<label for="auth-reset-email">Email</label>' +
        '<input id="auth-reset-email" type="email" placeholder="email@example.com" required autocomplete="email" />' +
      '</div>' +
      '<button type="submit" class="btn btn--primary auth-submit-btn">Gửi liên kết</button>' +
      '<button type="button" class="auth-back-btn" id="auth-back-to-login">Quay lại đăng nhập</button>';
    modal.appendChild(resetForm);

    // Skip button
    var skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "auth-skip-btn";
    skipBtn.textContent = "Bỏ qua";
    skipBtn.addEventListener("click", function() {
      self.hideLoginModal();
    });
    modal.appendChild(skipBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this._modalEl = overlay;

    // ---- Event listeners ----

    // Tab switching
    tabs.addEventListener("click", function(e) {
      var tabBtn = e.target.closest(".auth-tab");
      if (!tabBtn) return;
      var tab = tabBtn.getAttribute("data-auth-tab");
      self._switchTab(tab);
    });

    // Login form submit
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self._clearMessages();
      var email = document.getElementById("auth-email-input").value.trim();
      var password = document.getElementById("auth-password-input").value;
      if (!email || !password) return;

      self._setLoading(loginForm, true);
      self._signInWithEmail(email, password).then(function() {
        self._setLoading(loginForm, false);
      }).catch(function(err) {
        self._setLoading(loginForm, false);
        self._showError(self._getErrorMessage(err));
      });
    });

    // Signup form submit
    signupForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self._clearMessages();
      var name = document.getElementById("auth-signup-name").value.trim();
      var email = document.getElementById("auth-signup-email").value.trim();
      var password = document.getElementById("auth-signup-password").value;
      if (!name || !email || !password) return;

      self._setLoading(signupForm, true);
      self._signUpWithEmail(email, password, name).then(function(data) {
        self._setLoading(signupForm, false);
        if (data.session) {
          // Email confirmation disabled — user is auto-signed in
          // onAuthStateChange will handle the rest (modal close, toast, etc.)
          signupForm.reset();
        } else if (data.user && !data.session) {
          // Email confirmation enabled — show success message
          self._showSuccess("Đã tạo tài khoản! Vui lòng kiểm tra email để xác nhận.");
          signupForm.reset();
        }
      }).catch(function(err) {
        self._setLoading(signupForm, false);
        self._showError(self._getErrorMessage(err));
      });
    });

    // Reset form submit
    resetForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self._clearMessages();
      var email = document.getElementById("auth-reset-email").value.trim();
      if (!email) return;

      self._setLoading(resetForm, true);
      self._resetPassword(email).then(function() {
        self._setLoading(resetForm, false);
        self._showSuccess("Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.");
      }).catch(function(err) {
        self._setLoading(resetForm, false);
        self._showError(self._getErrorMessage(err));
      });
    });

    // Forgot password link
    document.getElementById("auth-forgot-btn").addEventListener("click", function() {
      self._switchTab("reset");
    });

    // Back to login from reset
    document.getElementById("auth-back-to-login").addEventListener("click", function() {
      self._switchTab("login");
    });

    // Escape key to close
    overlay.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        self.hideLoginModal();
      }
    });
  },

  _switchTab: function(tab) {
    this._clearMessages();

    var loginForm = document.getElementById("auth-login-form");
    var signupForm = document.getElementById("auth-signup-form");
    var resetForm = document.getElementById("auth-reset-form");
    var tabBtns = document.querySelectorAll(".auth-tab");

    loginForm.hidden = true;
    signupForm.hidden = true;
    resetForm.hidden = true;

    if (tab === "login") {
      loginForm.hidden = false;
      tabBtns.forEach(function(btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-auth-tab") === "login");
      });
    } else if (tab === "signup") {
      signupForm.hidden = false;
      tabBtns.forEach(function(btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-auth-tab") === "signup");
      });
    } else if (tab === "reset") {
      resetForm.hidden = false;
      tabBtns.forEach(function(btn) {
        btn.classList.remove("is-active");
      });
    }
  },

  _showError: function(msg) {
    var el = document.getElementById("auth-error-msg");
    if (el) {
      el.textContent = msg;
      el.hidden = false;
    }
  },

  _showSuccess: function(msg) {
    var el = document.getElementById("auth-success-msg");
    if (el) {
      el.textContent = msg;
      el.hidden = false;
    }
  },

  _clearMessages: function() {
    var err = document.getElementById("auth-error-msg");
    var succ = document.getElementById("auth-success-msg");
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

  /* ========== PRIVATE: USER WIDGET (sidebar) ========== */

  _renderUserWidget: function() {
    var container = document.getElementById("auth-user-widget");

    if (!container) {
      container = document.createElement("div");
      container.id = "auth-user-widget";
      container.className = "auth-user-widget";
      var streakWidget = document.getElementById("streak-widget");
      if (streakWidget && streakWidget.parentNode) {
        streakWidget.parentNode.insertBefore(container, streakWidget.nextSibling);
      }
    }

    if (!this._user) {
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    container.hidden = false;
    var name = this._getDisplayName(this._user);
    var avatarUrl = this._getAvatarUrl(this._user);
    var avatarHtml = avatarUrl
      ? '<img class="auth-user-widget__avatar" src="' + avatarUrl + '" alt="" />'
      : '<div class="auth-user-widget__avatar auth-user-widget__avatar--placeholder">' + name.charAt(0).toUpperCase() + '</div>';

    container.innerHTML =
      '<div class="auth-user-widget__inner">' +
        avatarHtml +
        '<div class="auth-user-widget__info">' +
          '<span class="auth-user-widget__name">' + this._escapeHtml(name) + '</span>' +
          '<span class="auth-user-widget__sync">Đã kết nối</span>' +
        '</div>' +
      '</div>';
  },

  /* ========== PRIVATE: SETTINGS SECTION ========== */

  _renderSettingsSection: function() {
    var existing = document.getElementById("auth-settings-group");
    if (existing) {
      existing.remove();
    }

    var settingsSections = document.querySelector(".settings-sections");
    if (!settingsSections) return;

    var group = document.createElement("div");
    group.className = "settings-group auth-settings";
    group.id = "auth-settings-group";

    var self = this;

    if (this._user) {
      var name = this._getDisplayName(this._user);
      var avatarUrl = this._getAvatarUrl(this._user);
      var email = this._user.email || "";
      var avatarHtml = avatarUrl
        ? '<img class="auth-settings__avatar" src="' + avatarUrl + '" alt="" />'
        : '<div class="auth-settings__avatar auth-settings__avatar--placeholder">' + name.charAt(0).toUpperCase() + '</div>';

      group.innerHTML =
        '<h3>Tài khoản</h3>' +
        '<div class="auth-settings__profile">' +
          avatarHtml +
          '<div class="auth-settings__info">' +
            '<span class="auth-settings__name">' + this._escapeHtml(name) + '</span>' +
            '<span class="auth-settings__email">' + this._escapeHtml(email) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="auth-settings__status">' +
          '<span class="auth-settings__sync-dot"></span>' +
          '<span>Đã kết nối với cloud</span>' +
        '</div>' +
        '<div class="auth-settings__actions">' +
          '<button class="btn btn--outline" id="auth-sync-btn">Đồng bộ ngay</button>' +
          '<button class="btn btn--ghost" id="auth-logout-btn">Đăng xuất</button>' +
        '</div>';

      settingsSections.insertBefore(group, settingsSections.firstChild);

      document.getElementById("auth-logout-btn").addEventListener("click", function() {
        self.logout();
      });

      document.getElementById("auth-sync-btn").addEventListener("click", function() {
        if (typeof showToast === "function") {
          showToast("Đang đồng bộ dữ liệu...", "info", 2000);
        }
        document.dispatchEvent(new CustomEvent("auth:sync-request"));
      });

    } else {
      group.innerHTML =
        '<h3>Tài khoản</h3>' +
        '<div class="auth-settings__guest">' +
          '<p class="auth-settings__guest-text">Đăng nhập để đồng bộ dữ liệu giữa các thiết bị.</p>' +
          '<button class="btn btn--primary" id="auth-login-settings-btn">Đăng nhập</button>' +
        '</div>';

      settingsSections.insertBefore(group, settingsSections.firstChild);

      document.getElementById("auth-login-settings-btn").addEventListener("click", function() {
        if (typeof LandingModule !== "undefined") {
          LandingModule.show();
        } else {
          self.showLoginModal();
        }
      });
    }
  },

  /* ========== PRIVATE: UTILITIES ========== */

  _escapeHtml: function(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
};

/* ========== SELF-INITIALIZATION ========== */

(function() {
  function autoInit() {
    if (typeof SupabaseConfig !== "undefined") {
      AuthModule.init();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    setTimeout(autoInit, 100);
  }
})();
