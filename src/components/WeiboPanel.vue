<template>
  <div class="weibo-panel">
    <div class="panel-header">
      <h2>Weibo Feed</h2>
      <div class="panel-actions">
        <button @click="openWeibo" class="btn">Login / Open Weibo</button>
        <button @click="refreshPosts" class="btn">Refresh</button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading posts…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="feed">
      <div v-for="post in posts" :key="post.id" class="post">
        <p class="text">{{ post.text }}</p>
        <div class="images">
          <img
            v-for="(img, i) in post.images"
            :key="i"
            :src="img"
            alt="post image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WeiboPanel",
  data() {
    return {
      posts: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    openWeibo() {
      window.open("https://weibo.com", "_blank");
    },
    async refreshPosts() {
      this.loading = true;
      this.error = null;
      try {
        // 🧠 Attempt to fetch using existing Weibo cookies (no proxy)
        const response = await fetch("https://weibo.com/ajax/statuses/mymblog", {
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Simplify post structure for display
        this.posts = (data.data?.list || []).map((item) => ({
          id: item.idstr,
          text: item.text_raw || "",
          images: item.pic_ids?.map(
            (pid) => `https://wx4.sinaimg.cn/orj360/${pid}.jpg`
          ) || [],
        }));

        if (!this.posts.length) this.error = "No posts found (try logging in)";
      } catch (e) {
        console.error(e);
        this.error = "Failed to load Weibo posts – please login first";
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Auto-refresh on open
    this.refreshPosts();
  },
};
</script>

<style scoped>
.weibo-panel {
  width: 350px;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-left: 1px solid #ddd;
  padding: 10px;
  overflow-y: auto;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.panel-actions {
  display: flex;
  gap: 6px;
}
.btn {
  background: #ff8200;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.feed {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.post {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
.images {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
}
.images img {
  width: 100px;
  height: auto;
  border-radius: 4px;
}
.loading,
.error {
  text-align: center;
  padding: 20px;
  color: #666;
}
.error {
  color: red;
}
</style>
