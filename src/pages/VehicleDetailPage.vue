<template>
  <main v-if="isLoading" class="empty-page">
    <p class="eyebrow">불러오는 중</p>
    <h1>차량 정보를 불러오고 있습니다</h1>
  </main>

  <main v-else-if="errorMessage" class="empty-page">
    <p class="eyebrow">카탈로그 오류</p>
    <h1>차량 목록을 불러오지 못했습니다</h1>
    <p>{{ errorMessage }}</p>
    <RouterLink class="button-link" :to="{ name: 'vehicle-catalog' }">
      차량 목록으로 돌아가기
    </RouterLink>
  </main>

  <main v-else-if="!vehicle" class="empty-page">
    <p class="eyebrow">차량 없음</p>
    <h1>등록되지 않은 차량입니다</h1>
    <p>이 주소에 연결된 차량 정보가 없습니다.</p>
    <RouterLink class="button-link" :to="{ name: 'vehicle-catalog' }">
      차량 목록으로 돌아가기
    </RouterLink>
  </main>

  <VehicleDetailView v-else :vehicle="vehicle" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import VehicleDetailView from '@/components/vehicles/VehicleDetailView.vue'
import { fetchVehicleCatalog } from '@/data/fetchVehicleCatalog'
import type { VehicleCatalog } from '@/types/vehicle'

const props = defineProps<{
  vehicleId: string
}>()

const catalog = ref<VehicleCatalog | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const vehicle = computed(() => {
  return catalog.value?.vehicles.find((item) => item.id === props.vehicleId) ?? null
})

onMounted(async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    catalog.value = await fetchVehicleCatalog()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '차량 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>
