/* =====================================================
   FocusFlow -- Sync Engine Module
   Offline-first cloud sync via Supabase.
   Handles bidirectional sync between localStorage and
   the user_data table using version-based conflict
   resolution.
   ===================================================== */

var SyncModule = {

  /* ---- Internal state ---- */

  _userId: null,
  _syncTimer: null,
  _dirty: false,
  _lastSyncAt: null,
  _status: 'offline',
  _localVersion: 0,
  _destroying: false,

  /* ---- localStorage key to user_data column mapping ---- */

  _keyMap: {
    'focusflow_settings':     'settings',
    'focusflow_tasks':        'tasks',
    'focusflow_sessions':     'sessions',
    'focusflow_blocks':       'blocks',
    'focusflow_streak':       'streak',
    'focusflow_achievements': 'achievements',
    'focusflow_reflections':  'reflections'
  },

  /* Keys that must NOT be synced */
  _excludeKeys: ['focusflow_state', 'focusflow_onboarding_complete'],

  /* ---- Event helpers ---- */

  _dispatch: function(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: detail || {} }));
  },

  _setStatus: function(status) {
    this._status = status;
    this._dispatch('sync:status', { status: status });
  },

  /* ---- Initialization ---- */

  /**
   * Setup sync for a logged-in user.
   * @param {string} userId - The authenticated user's UUID
   */
  init: function(userId) {
    this._userId = userId;
    this._dirty = false;
    this._destroying = false;
    this._localVersion = this._readLocalVersion();

    // Listen for online/offline events
    this._onOnline = this._handleOnline.bind(this);
    this._onOffline = this._handleOffline.bind(this);
    window.addEventListener('online', this._onOnline);
    window.addEventListener('offline', this._onOffline);

    // Set initial status based on connectivity
    if (navigator.onLine) {
      this._setStatus('synced');
    } else {
      this._setStatus('offline');
    }
  },

  /* ---- Version tracking ---- */

  _readLocalVersion: function() {
    try {
      var raw = localStorage.getItem('focusflow_sync_version');
      return raw ? parseInt(raw, 10) : 0;
    } catch (e) {
      return 0;
    }
  },

  _writeLocalVersion: function(version) {
    this._localVersion = version;
    try {
      localStorage.setItem('focusflow_sync_version', String(version));
    } catch (e) {
      // storage unavailable
    }
  },

  /* ---- Reading localStorage data ---- */

  /**
   * Collects all syncable data from localStorage into a flat object
   * matching the user_data column schema.
   */
  _collectLocalData: function() {
    var data = {};
    var self = this;

    // Map standard keys
    Object.keys(this._keyMap).forEach(function(localKey) {
      var column = self._keyMap[localKey];
      var raw = localStorage.getItem(localKey);
      if (raw) {
        try {
          data[column] = JSON.parse(raw);
        } catch (e) {
          data[column] = raw;
        }
      } else {
        // Provide sensible defaults matching the DB schema
        var arrayColumns = ['tasks', 'sessions', 'blocks', 'achievements', 'reflections'];
        data[column] = arrayColumns.indexOf(column) !== -1 ? [] : {};
      }
    });

    // Theme goes into preferences.theme
    var theme = localStorage.getItem('focusflow_theme') || 'auto';
    data.preferences = data.preferences || {};
    data.preferences.theme = theme;

    return data;
  },

  /**
   * Writes cloud data into localStorage, overwriting local values.
   * @param {Object} cloudData - Row from user_data table
   */
  _applyCloudData: function(cloudData) {
    var self = this;

    Object.keys(this._keyMap).forEach(function(localKey) {
      var column = self._keyMap[localKey];
      var value = cloudData[column];
      if (value !== undefined && value !== null) {
        try {
          localStorage.setItem(localKey, JSON.stringify(value));
        } catch (e) {
          // storage full
        }
      }
    });

    // Extract theme from preferences
    if (cloudData.preferences && cloudData.preferences.theme) {
      try {
        localStorage.setItem('focusflow_theme', cloudData.preferences.theme);
      } catch (e) {
        // storage full
      }
    }
  },

  /* ---- Cloud operations ---- */

  /**
   * Fetches the user's row from cloud.
   * @returns {Promise<Object|null>} The user_data row or null
   */
  _fetchCloudRow: function() {
    if (!this._userId) return Promise.resolve(null);

    var client = this._getClient();
    if (!client) return Promise.resolve(null);

    return client
      .from('user_data')
      .select('*')
      .eq('user_id', this._userId)
      .single()
      .then(function(result) {
        if (result.error) {
          // PGRST116 = no rows found, not a real error
          if (result.error.code === 'PGRST116') {
            return null;
          }
          throw result.error;
        }
        return result.data;
      });
  },

  /**
   * Upserts the user's data to cloud.
   * @param {Object} data - Column data to write
   * @param {number} newVersion - The version number to set
   * @returns {Promise<Object>} The upsert result
   */
  _upsertCloud: function(data, newVersion) {
    var client = this._getClient();
    if (!client) return Promise.reject(new Error('No Supabase client'));

    var row = {};
    row.user_id = this._userId;
    row.version = newVersion;

    // Copy all data columns
    var columns = ['settings', 'tasks', 'sessions', 'blocks', 'streak',
                   'achievements', 'reflections', 'preferences'];
    columns.forEach(function(col) {
      if (data[col] !== undefined) {
        row[col] = data[col];
      }
    });

    return client
      .from('user_data')
      .upsert(row, { onConflict: 'user_id' })
      .then(function(result) {
        if (result.error) {
          throw result.error;
        }
        return result;
      });
  },

  /**
   * Gets the Supabase client via SupabaseConfig global.
   * @returns {Object|null}
   */
  _getClient: function() {
    if (typeof SupabaseConfig !== 'undefined' && SupabaseConfig.getClient) {
      return SupabaseConfig.getClient();
    }
    return null;
  },

  /* ---- Core sync methods ---- */

  /**
   * Pull cloud data and compare with local.
   * If cloud is newer, overwrites localStorage and returns true.
   * If local is newer, pushes to cloud.
   * If same version, does nothing.
   * @returns {Promise<boolean>} true if localStorage was updated from cloud
   */
  syncFromCloud: function() {
    var self = this;

    if (!this._userId || !navigator.onLine) {
      return Promise.resolve(false);
    }

    this._setStatus('syncing');

    return this._fetchCloudRow()
      .then(function(cloudRow) {
        if (self._destroying) return false;

        // No cloud data exists yet -- migrate local data up
        if (!cloudRow) {
          return self.migrateLocalToCloud().then(function() {
            return false;
          });
        }

        var cloudVersion = cloudRow.version || 1;
        var localVersion = self._localVersion;

        // Check if cloud row is essentially empty (fresh signup, version 1 with no real data)
        if (cloudVersion === 1 && self._isCloudEmpty(cloudRow)) {
          return self.migrateLocalToCloud().then(function() {
            return false;
          });
        }

        if (cloudVersion > localVersion) {
          // Cloud is newer -- apply cloud data to localStorage
          self._applyCloudData(cloudRow);
          self._writeLocalVersion(cloudVersion);
          self._lastSyncAt = new Date().toISOString();
          self._setStatus('synced');
          return true;
        } else if (localVersion > cloudVersion) {
          // Local is newer -- push to cloud
          return self.syncToCloud().then(function() {
            return false;
          });
        } else {
          // Same version -- nothing to do
          self._lastSyncAt = new Date().toISOString();
          self._setStatus('synced');
          return false;
        }
      })
      .catch(function(err) {
        console.error('[Sync] syncFromCloud error:', err);
        self._setStatus('error');
        return false;
      });
  },

  /**
   * Push current localStorage to cloud immediately.
   * Increments the version number.
   * @returns {Promise<void>}
   */
  syncToCloud: function() {
    var self = this;

    if (!this._userId) {
      return Promise.reject(new Error('No user ID'));
    }

    if (!navigator.onLine) {
      this._dirty = true;
      this._setStatus('pending');
      return Promise.resolve();
    }

    this._setStatus('syncing');

    var localData = this._collectLocalData();
    var newVersion = this._localVersion + 1;

    return this._upsertCloud(localData, newVersion)
      .then(function() {
        if (self._destroying) return;

        self._writeLocalVersion(newVersion);
        self._dirty = false;
        self._lastSyncAt = new Date().toISOString();
        self._setStatus('synced');
      })
      .catch(function(err) {
        console.error('[Sync] syncToCloud error:', err);
        self._dirty = true;
        self._setStatus('error');
      });
  },

  /**
   * Debounced wrapper for syncToCloud. Waits 3 seconds of inactivity
   * before actually syncing. Each call resets the timer.
   */
  queueSync: function() {
    var self = this;

    if (!this._userId) return;

    // Clear any existing debounce timer
    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
      this._syncTimer = null;
    }

    if (!navigator.onLine) {
      this._dirty = true;
      this._setStatus('pending');
      return;
    }

    this._setStatus('pending');

    this._syncTimer = setTimeout(function() {
      self._syncTimer = null;
      self.syncToCloud();
    }, 3000);
  },

  /**
   * First-time migration: uploads local data to cloud when the user
   * has no cloud data yet (new account or first device).
   * @returns {Promise<void>}
   */
  migrateLocalToCloud: function() {
    var self = this;

    if (!this._userId || !navigator.onLine) {
      return Promise.resolve();
    }

    this._setStatus('syncing');

    var localData = this._collectLocalData();
    var newVersion = 1;

    return this._upsertCloud(localData, newVersion)
      .then(function() {
        if (self._destroying) return;

        self._writeLocalVersion(newVersion);
        self._dirty = false;
        self._lastSyncAt = new Date().toISOString();
        self._setStatus('synced');
      })
      .catch(function(err) {
        console.error('[Sync] migrateLocalToCloud error:', err);
        self._setStatus('error');
      });
  },

  /* ---- Status & info ---- */

  /**
   * Returns the timestamp of the last successful sync as a displayable string.
   * @returns {string|null}
   */
  getLastSyncTime: function() {
    if (!this._lastSyncAt) return null;
    try {
      var d = new Date(this._lastSyncAt);
      var hours = String(d.getHours()).padStart(2, '0');
      var minutes = String(d.getMinutes()).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      var month = String(d.getMonth() + 1).padStart(2, '0');
      return hours + ':' + minutes + ' ' + day + '/' + month;
    } catch (e) {
      return this._lastSyncAt;
    }
  },

  /**
   * Returns the current sync status string.
   * @returns {'synced'|'syncing'|'pending'|'offline'|'error'}
   */
  getSyncStatus: function() {
    // If not initialized or no user, report offline
    if (!this._userId) return 'offline';
    // If we are actually offline, report that regardless of internal status
    if (!navigator.onLine) return 'offline';
    return this._status;
  },

  /* ---- Helpers ---- */

  /**
   * Checks if a cloud row has only empty/default data, indicating a fresh record.
   * @param {Object} row - The cloud row
   * @returns {boolean}
   */
  _isCloudEmpty: function(row) {
    var emptyArrayColumns = ['tasks', 'sessions', 'blocks', 'achievements', 'reflections'];
    var emptyObjectColumns = ['settings', 'streak', 'preferences'];

    for (var i = 0; i < emptyArrayColumns.length; i++) {
      var col = emptyArrayColumns[i];
      var val = row[col];
      if (val && Array.isArray(val) && val.length > 0) return false;
    }

    for (var j = 0; j < emptyObjectColumns.length; j++) {
      var col2 = emptyObjectColumns[j];
      var val2 = row[col2];
      if (val2 && typeof val2 === 'object' && Object.keys(val2).length > 0) return false;
    }

    return true;
  },

  /* ---- Event handlers ---- */

  _handleOnline: function() {
    if (this._dirty && this._userId) {
      this.syncToCloud();
    } else if (this._userId) {
      this._setStatus('synced');
    }
  },

  _handleOffline: function() {
    this._setStatus('offline');
  },

  /* ---- Cleanup ---- */

  /**
   * Cleanup on logout. Removes listeners, clears timers and state.
   */
  destroy: function() {
    this._destroying = true;

    // Clear debounce timer
    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
      this._syncTimer = null;
    }

    // Remove event listeners
    if (this._onOnline) {
      window.removeEventListener('online', this._onOnline);
      this._onOnline = null;
    }
    if (this._onOffline) {
      window.removeEventListener('offline', this._onOffline);
      this._onOffline = null;
    }

    // Reset state
    this._userId = null;
    this._dirty = false;
    this._lastSyncAt = null;
    this._localVersion = 0;
    this._setStatus('offline');
    this._destroying = false;
  }
};

/* =====================================================
   Self-initialization: Listen for auth events
   ===================================================== */

(function() {
  document.addEventListener('auth:login', function(e) {
    var user = e.detail && e.detail.user;
    if (user) {
      SyncModule.init(user.id);
      SyncModule.syncFromCloud().then(function(updated) {
        if (updated) {
          document.dispatchEvent(new CustomEvent('sync:updated'));
        }
      });
    }
  });

  document.addEventListener('auth:logout', function() {
    SyncModule.destroy();
  });
})();
