<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="panel">
      <h3>选择背景图</h3>
      <div class="grid">
        <div 
          v-for="(img, idx) in images" 
          :key="idx" 
          class="thumb" 
          @click="$emit('select', img)"
        >
          <img :src="img" />
        </div>
      </div>
      <div class="note">
        添加图片至 <code>/src/assets/backgrounds/</code> 以增加背景图
      </div>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  props: { images: Array, current: String }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.panel {
  background: white;
  padding: 16px;
  border-radius: 10px;
  width: min(900px, 90%);
  max-height: 80vh;
  overflow: auto;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 12px 0;
  justify-content: center;
}

.thumb {
  width: 160px;
  height: 106px; /* close to 3:2 ratio */
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* show full image */
  object-position: center;
  display: block;
}

.note {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
}
</style>
