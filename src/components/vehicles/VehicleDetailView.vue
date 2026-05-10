<template>
  <main class="vehicle-detail">
    <RouterLink class="vehicle-detail__back" :to="{ name: 'vehicle-catalog' }">
      판매 차량 목록으로 돌아가기
    </RouterLink>

    <section class="vehicle-detail__hero">
      <p class="eyebrow">차량 상세 정보</p>
      <h1>{{ vehicle.title }}</h1>
      <p class="vehicle-detail__lead">
        핵심 정보를 먼저 확인하고, 사진과 영상으로 차량 상태를 살펴보세요.
      </p>
      <ul class="vehicle-detail__keyfacts" aria-label="차량 핵심 정보">
        <li v-for="fact in keyFacts" :key="fact.label">
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </li>
      </ul>
    </section>

    <VehicleYoutubeEmbed
      v-if="vehicle.video"
      :youtube-id="vehicle.video.youtubeId"
      :title="vehicle.video.title"
    />

    <VehicleGallery :images="vehicle.images" />
    <VehicleProfileColumns :vehicle="vehicle" />

    <section class="vehicle-detail__description">
      <h2>상세 설명</h2>
      <p>{{ vehicle.profile.detailDescription }}</p>
    </section>

    <section v-if="vehicle.contact" class="vehicle-detail__cta">
      <div>
        <p class="eyebrow">상담 문의</p>
        <h2>{{ vehicle.contact.label }}</h2>
        <p>{{ vehicle.contact.phoneDisplay }}</p>
      </div>
      <VehiclePhoneCopyButton :contact="vehicle.contact" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VehicleGallery from './VehicleGallery.vue'
import VehiclePhoneCopyButton from './VehiclePhoneCopyButton.vue'
import VehicleProfileColumns from './VehicleProfileColumns.vue'
import VehicleYoutubeEmbed from './VehicleYoutubeEmbed.vue'
import type { Vehicle } from '@/types/vehicle'

const props = defineProps<{
  vehicle: Vehicle
}>()

const statusLabel = computed(() => {
  const labels: Record<Vehicle['status'], string> = {
    available: '판매중',
    reserved: '예약중',
    sold: '판매완료',
    hidden: '비공개',
  }

  return labels[props.vehicle.status]
})

const keyFacts = computed(() => [
  { label: '상태', value: statusLabel.value },
  { label: '연식', value: `${props.vehicle.profile.year}년식` },
  { label: '주행거리', value: `${props.vehicle.profile.mileageKm.toLocaleString()}km` },
  { label: '차종', value: props.vehicle.profile.vehicleType },
])
</script>
