<template>
  <RouterLink
    class="vehicle-card"
    :class="{ 'vehicle-card--simple': simple }"
    :to="{ name: 'vehicle-detail', params: { vehicleId: vehicle.id } }"
    :aria-label="`${vehicle.title} 상세 페이지로 이동`"
  >
    <div class="vehicle-card__media">
      <img :src="withBaseUrl(vehicle.thumbnail)" :alt="`${vehicle.title} 대표 이미지`" loading="lazy" />
      <span class="vehicle-status" :data-status="vehicle.status">{{ statusLabel }}</span>
    </div>

    <div class="vehicle-card__body">
      <h3>{{ vehicle.title }}</h3>
      <ul class="vehicle-card__facts" aria-label="주요 차량 정보">
        <li>{{ vehicle.profile.vehicleType }}</li>
        <li>{{ vehicle.profile.year }}년식</li>
        <li>{{ vehicle.profile.mileageKm.toLocaleString() }}km</li>
      </ul>
      <p class="vehicle-card__summary">{{ vehicle.profile.shortDescription }}</p>
    </div>

    <div v-if="simple" class="vehicle-card__simple-footer">
      <span>사진·영상·상세 정보 보기</span>
      <span aria-hidden="true">→</span>
    </div>

    <div v-else class="vehicle-card__footer">
      <span>상세 보기</span>
      <VehiclePhoneCopyButton v-if="vehicle.contact" :contact="vehicle.contact" compact />
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VehiclePhoneCopyButton from './VehiclePhoneCopyButton.vue'
import { withBaseUrl } from '@/data/fetchVehicleCatalog'
import type { Vehicle } from '@/types/vehicle'

const props = withDefaults(
  defineProps<{
    vehicle: Vehicle
    simple?: boolean
  }>(),
  {
    simple: false,
  },
)

const statusLabel = computed(() => {
  const labels: Record<Vehicle['status'], string> = {
    available: '판매중',
    reserved: '예약중',
    sold: '판매완료',
    hidden: '비공개',
  }
  return labels[props.vehicle.status]
})
</script>
