<template>
  <section class="vehicle-video" aria-label="차량 소개 영상">
    <iframe
      :src="embedUrl"
      :title="title"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  youtubeId: string
  title: string
}>()

const embedUrl = computed(() => `https://www.youtube.com/embed/${props.youtubeId}`)
</script>
