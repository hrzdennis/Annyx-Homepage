<template>
  <div class="app" :style="bgStyle">
    <TopBar @open-settings="showSettings = true" @open-weibo="showWeibo = true" />
    <SearchBar />
    <SettingsBox
      v-if="showSettings"
      :images="bgImages"
      :current="currentBg"
      @close="showSettings = false"
      @select="setBackground"
    />
    <WeiboFeed v-if="showWeibo" @close="showWeibo = false" />
    <div class="center-note"></div>
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue'
import SettingsBox from './components/SettingsBox.vue'
import WeiboFeed from './components/WeiboFeed.vue'
import SearchBar from './components/SearchBar.vue'

// ✅ ORIGINAL method — automatically imports all images in the backgrounds folder
const images = import.meta.glob('./assets/backgrounds/*.{jpg,jpeg,png}', { eager: true })

export default {
  components: { TopBar, SearchBar, SettingsBox, WeiboFeed },
  data() {
    const imgs = Object.values(images).map(m => m.default)
    return {
      bgImages: imgs,
      currentBg: imgs[0] || '',
      showSettings: false,
      showWeibo: false
    }
  },
  computed: {
    bgStyle() {
      return { backgroundImage: `url('${this.currentBg}')` }
    }
  },
  methods: {
    setBackground(src) {
      this.currentBg = src
    }
  }
}
</script>

<style>
html, body, #app, .app {
  height: 100%;
  margin: 0;
}
.app {
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100vh;
  position: relative;
  font-family: Arial, Helvetica, sans-serif;
}
.center-note {
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
</style>
