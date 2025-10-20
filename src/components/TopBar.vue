<template>
  <div class="topbar">
    <div class="left-logo">
      <a
        href="https://weibo.com/n/ANNYX_official"
        target="_blank"
        rel="noopener noreferrer"
        class="home-link"
      >
        ANNYX_official
      </a>
    </div>

    <div class="icons">
      <a
        v-for="(m, idx) in members"
        :key="idx"
        :href="m.link"
        target="_blank"
        class="icon-link"
        :title="m.name"
      >
        <img :src="m.icon" class="icon-img" />
      </a>
    </div>

    <div class="right-actions">
      <button class="action-btn" @click="$emit('open-weibo')" title="Check updates">🔔</button>
      <button class="action-btn" @click="$emit('open-settings')" title="Settings">⚙️</button>
    </div>
  </div>
</template>

<script>
import members from '../data/members.js'
export default {
  data() {
    return { members }
  }
}
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 8px;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  margin: 0 auto;
  max-width: 1400px;
  box-sizing: border-box;
  transition: background 0.3s ease;
}

.left-logo {
  font-weight: 600;
  padding-left: 8px;
}

.home-link {
  color: black;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  opacity: 0.9;
}

.home-link:hover {
  text-decoration: underline;
  opacity: 1;
  transform: scale(1.05);
}

.icons {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.icon-link {
  display: inline-block;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.icon-link:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.3);
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.right-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}
</style>
