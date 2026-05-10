<template>
  <section class="vehicle-profile-columns" aria-labelledby="vehicle-profile-title">
    <h2 id="vehicle-profile-title">차량 정보</h2>
    <dl>
      <div v-for="row in rows" :key="row.label" class="vehicle-profile-item">
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const rows = computed(() => {
  const profile = props.vehicle.profile
  return [
    { label: '차종', value: profile.vehicleType },
    { label: '브랜드', value: profile.brand },
    { label: '모델', value: profile.model },
    { label: '연식', value: `${profile.year}년식` },
    { label: '주행거리', value: `${profile.mileageKm.toLocaleString()}km` },
    { label: '연료', value: profile.fuel },
    { label: '변속기', value: profile.transmission },
    { label: '색상', value: profile.color },
    { label: '판매 상태', value: statusLabel.value },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))
})
</script>
