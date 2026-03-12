<template>
  <div class="home">
    <section class="hero">
      <h2>探索世界，从这里开始</h2>
      <p>让AI助手为你规划完美的旅行</p>
      <router-link to="/chat" class="cta-button">开始咨询</router-link>
    </section>

    <section class="features">
      <div class="feature-card">
        <span class="icon">🤖</span>
        <h3>智能问答</h3>
        <p>24/7在线AI助手，即时解答旅游疑问</p>
      </div>
      <div class="feature-card">
        <span class="icon">🗺️</span>
        <h3>个性化攻略</h3>
        <p>根据你的喜好定制专属旅行方案</p>
      </div>
      <div class="feature-card">
        <span class="icon">💡</span>
        <h3>实用建议</h3>
        <p>获取当地美食、景点、交通等实用信息</p>
      </div>
    </section>

    <section class="popular-destinations">
      <h2>热门目的地</h2>
      <div class="destinations-grid">
        <div v-for="dest in destinations" :key="dest.name" class="dest-card">
          <div class="dest-image">{{ dest.emoji }}</div>
          <h3>{{ dest.name }}</h3>
          <p>{{ dest.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Destination } from '../types'

const destinations: Destination[] = [
  { name: '东京', emoji: '🗼', description: '现代与传统的完美融合' },
  { name: '巴黎', emoji: '🗼', description: '浪漫之都，艺术天堂' },
  { name: '纽约', emoji: '🗽', description: '不夜城，梦想之地' },
  { name: '巴厘岛', emoji: '🏝️', description: '热带天堂，度假胜地' }
]
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.hero p {
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #718096;
}

.popular-destinations h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.dest-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s;
}

.dest-card:hover {
  transform: translateY(-4px);
}

.dest-image {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.dest-card h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.dest-card p {
  color: #718096;
  font-size: 0.9rem;
}
</style>
