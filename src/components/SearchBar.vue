<template>
  <div class="search-bar">
    <form @submit.prevent="search">
      <img :src="currentEngine.icon" alt="engine" class="engine-icon" />
      <input
        v-model="query"
        type="text"
        class="search-input"
        :placeholder="`Enter键搜索，Tab键切换搜索引擎（${currentEngine.name}）`"
        @keydown.tab.prevent="switchEngine"
      />
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
      engines: [
        {
          name: 'Baidu',
          icon: 'https://www.baidu.com/favicon.ico',
          url: 'https://www.baidu.com/s?wd=',
        },

        {
          name: 'Bing',
          icon: 'https://www.bing.com/favicon.ico',
          url: 'https://www.bing.com/search?q=',
        },

        {
          name: 'Weibo',
          icon: 'https://s.weibo.com/favicon.ico',
          url: 'https://s.weibo.com/weibo?q='
        },
        {
          name: 'Google',
          icon: 'https://www.google.com/favicon.ico',
          url: 'https://www.google.com/search?q=',
        }
        
      ],
      currentIndex: 0,
    }
  },
  computed: {
    currentEngine() {
      return this.engines[this.currentIndex]
    },
  },
  methods: {
    search() {
      const q = this.query.trim()
      if (!q) return
      window.open(this.currentEngine.url + encodeURIComponent(q), '_blank')
      this.query = ''
    },
    switchEngine() {
      this.currentIndex = (this.currentIndex + 1) % this.engines.length
    },
  },
}
</script>

<style scoped>
.search-bar {
  position: absolute;
  top: calc(80px + 10%);
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

form {
  display: flex;
  align-items: center;
  width: 480px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(16px);
  border-radius: 50px;
  padding: 8px 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

form:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  transform: scale(1.02);
}

.engine-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #222;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
}
</style>
