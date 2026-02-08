/* =====================================================
   FocusFlow — Supabase Configuration
   Singleton client for Supabase auth & data services.
   Requires Supabase JS CDN loaded in index.html.
   ===================================================== */

var SupabaseConfig = {
  client: null,
  SUPABASE_URL: "https://hobunfargxqzfhxjggnu.supabase.co",
  SUPABASE_KEY: "sb_publishable_uQc0Po8HQaNvd-1yInGvLg_8WiiOG8V",

  init: function() {
    if (this.client) return this.client;
    if (typeof supabase === "undefined") {
      console.warn("[SupabaseConfig] Supabase JS not loaded yet");
      return null;
    }
    this.client = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
    console.log("[SupabaseConfig] Client initialized");
    return this.client;
  },

  getClient: function() {
    return this.client || this.init();
  }
};
