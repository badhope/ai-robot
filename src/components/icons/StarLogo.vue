<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="50%" style="stop-color:#8b5cf6"/>
        <stop offset="100%" style="stop-color:#ec4899"/>
      </linearGradient>
      <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fbbf24"/>
        <stop offset="100%" style="stop-color:#f59e0b"/>
      </linearGradient>
    </defs>
    
    <!-- 外圈星芒 -->
    <path d="M50 5 L58 35 L90 35 L65 55 L75 90 L50 70 L25 90 L35 55 L10 35 L42 35 Z" 
          fill="url(#starGradient)" opacity="0.3"/>
    
    <!-- 内圈 -->
    <circle cx="50" cy="50" r="30" fill="url(#starGradient)"/>
    
    <!-- 闪电 -->
    <path d="M55 25 L45 50 L52 50 L40 75 L60 45 L52 45 L65 25 Z" 
          fill="url(#boltGradient)"/>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>
