<template>
  <div class="weibo-feed">
    <div class="header">
      <h3>微博更新</h3>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchPosts">⟳刷新</button>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="(m, i) in members"
        :key="i"
        :class="['tab', { active: currentIndex === i }]"
        @click="selectMember(i)"
        :title="m.name"
      >
        <img :src="m.icon" class="tab-icon" />
      </button>
    </div>

    <div class="member-info">
      <h4>{{ currentMember.name }}</h4>
      <a :href="currentMember.link" target="_blank" rel="noopener">访问微博主页↗</a>
    </div>

    <div class="posts" ref="postsContainer">
      <div v-if="loading" class="loading">少女祈祷中<br>Loading posts...请耐心等待...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-for="(p, i) in posts" :key="p.id || i" class="post" :data-id="p.id || i">
          <div class="post-text" v-html="p.text"></div>

          <div v-if="p.pics && p.pics.length" class="post-pics">
            <img
              v-for="(pic, j) in p.pics"
              :key="j"
              :src="pic"
              @click="openImage(pic)"
              loading="lazy"
              alt="weibo-pic"
            />
          </div>

          <div class="post-time">{{ p.time }}</div>
        </div>
      </div>
    </div>

    <!-- Image lightbox viewer -->
    <div v-if="showImage" class="lightbox" @click.self="closeImage">
      <img :src="showImage" />
    </div>
  </div>
</template>

<script>
import members from "../data/members.js";

export default {
  props: ["member"],
  data() {
    return {
      members,
      currentIndex: 0,
      posts: [],
      loading: false,
      error: null,
      showImage: null,
      // fixed worker URL you asked me to use
      proxy: "https://weibo-proxy.kurorin201.workers.dev",
      postLimit: 20
    };
  },
  computed: {
    currentMember() {
      return this.members[this.currentIndex] || {};
    }
  },
  mounted() {
    if (this.member) {
      const idx = this.members.findIndex(m => m.name === this.member.name);
      this.currentIndex = idx >= 0 ? idx : 0;
    }
    // auto-refresh when opened
    this.fetchPosts();
  },
  methods: {
    selectMember(i) {
      this.currentIndex = i;
      this.fetchPosts();
    },

    // Full method with improved error logs and safe handling
    async fetchPosts() {
      this.loading = true;
      this.error = null;
      this.posts = [];

      const uid = this.currentMember.uid;
      if (!uid) {
        this.error = "No UID specified for this member.";
        this.loading = false;
        return;
      }

      const url = `${this.proxy}/api/weibo?uid=${encodeURIComponent(uid)}`;
      console.info("[WeiboFeed] fetching:", url);

      try {
        const res = await fetch(url, { method: "GET", mode: "cors" });
        console.info("[WeiboFeed] status:", res.status);

        const text = await res.text();
        console.debug("[WeiboFeed] raw response snippet:", text.slice(0, 2000));

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("[WeiboFeed] JSON parse failed:", parseErr);
          this.error = "Proxy returned non-JSON response. See console.";
          return;
        }

        // Many worker versions wrap Weibo JSON under data/data.cards
        const cards = (data.data && data.data.cards) || data.cards || [];

        if (!cards || cards.length === 0) {
          this.error = "No posts found or user may be private.";
          console.info("[WeiboFeed] cards empty or undefined:", cards);
          return;
        }

        // Map to internal posts using proxied images (?img=...)
        this.posts = cards
          .filter(c => c.mblog) // ensure mblog exists
          .map(c => {
            const m = c.mblog;
            return {
              id: m.id || m.mid || (c.idstr || c.card_id),
              text: this.sanitizeText(m.text || ""),
              time: m.created_at || "",
              pics: (m.pics || []).map(p => {
                // p.url or p.large.url depending on API shape
                const original = p.url || p.large && p.large.url || p.large && p.large;
                // Use proxy ?img=... entrypoint (worker supports ?img=)
                return `${this.proxy}?img=${encodeURIComponent(original)}`;
              })
            };
          })
          .slice(0, this.postLimit);

        // After rendering, rewrite internal Weibo links so they open in new tabs
        this.$nextTick(() => this.rewriteInternalLinks());

      } catch (err) {
        console.error("[WeiboFeed] fetchPosts error:", err);
        this.error = "Failed to load Weibo posts (proxy connection or CORS issue).";
      } finally {
        this.loading = false;
      }
    },

    // sanitize & convert relative links in the HTML returned from Weibo
    sanitizeText(rawHtml) {
      if (!rawHtml) return "";
      // Convert relative hrefs (/status/...) into absolute links and add target
      let t = rawHtml
        .replace(/href="\/status\/(\d+)"/g, 'href="https://weibo.com/status/$1" target="_blank" rel="noopener"')
        .replace(/href="\/u\//g, 'href="https://weibo.com/u/')
        .replace(/href="\/([^"]+)"/g, (m, p1) => {
          // keep absolute or other relative paths; only adjust obvious patterns
          if (m.startsWith('href="https://') || m.startsWith('href="http://')) return m;
          return `href="https://weibo.com/${p1}" target="_blank" rel="noopener"`;
        });
      return t;
    },

    // Finds internal <a href="/..." /> and ensures they open separately
    rewriteInternalLinks() {
      try {
        const container = this.$refs.postsContainer;
        if (!container) return;
        const links = container.querySelectorAll("a[href]");
        links.forEach(link => {
          const href = link.getAttribute("href") || "";
          // if it's a relative weibo link or starts with /status or /u, make it absolute and open new tab
          if (href.startsWith("/status") || href.startsWith("/u") || href.startsWith("/")) {
            if (!href.startsWith("http")) {
              link.href = href.startsWith("/") ? `https://weibo.com${href}` : `https://weibo.com/${href}`;
            }
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          }
        });
      } catch (err) {
        console.warn("[WeiboFeed] rewriteInternalLinks failed:", err);
      }
    },

    // open image in lightbox — note 'src' should be proxied URL already
    openImage(src) {
      // if src is original and not proxied, turn into proxied by detection
      if (src && !src.includes(this.proxy)) {
        this.showImage = `${this.proxy}?img=${encodeURIComponent(src)}`;
      } else {
        this.showImage = src;
      }
    },
    closeImage() {
      this.showImage = null;
    }
  }
};
</script>

<style scoped>
.weibo-feed {
  position: fixed;
  top: 0;
  right: 0;
  width: 430px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  z-index: 100;
  padding: 16px;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.refresh-btn,
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 6px;
}
.refresh-btn:hover {
  color: #007bff;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
.tab {
  background: none;
  border: 2px solid transparent;
  cursor: pointer;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.tab:hover {
  transform: scale(1.1);
}
.tab.active {
  border-color: #007bff;
}
.tab-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Member info */
.member-info {
  text-align: center;
  margin-bottom: 12px;
}
.member-info h4 {
  margin: 4px 0;
  font-size: 16px;
  font-weight: 600;
}
.member-info a {
  color: #007bff;
  text-decoration: none;
  font-size: 13px;
}
.member-info a:hover {
  text-decoration: underline;
}

/* Posts */
.posts {
  flex: 1;
  overflow-y: auto;
  font-size: 14px;
  padding-right: 4px;
}
.post {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-bottom: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.post:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}
.post-text {
  margin-bottom: 8px;
  color: #222;
  line-height: 1.5;
  word-break: break-word;
}
.post-pics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  justify-items: center;
  margin-top: 8px;
}
.post-pics img {
  width: 100%;
  max-width: 120px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.post-pics img:hover {
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.post-time {
  font-size: 12px;
  color: #777;
  text-align: right;
  margin-top: 6px;
}

/* States */
.loading,
.error {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}
.error {
  color: #d9534f;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.lightbox img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}
</style>
