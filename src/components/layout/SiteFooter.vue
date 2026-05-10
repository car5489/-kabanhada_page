<template>
  <footer class="site-footer">
    <p>카반하다는 현재 판매중인 차량을 카드형 목록으로 안내하고, 상담부터 출고 후 관리까지 직접 책임집니다.</p>
    <nav aria-label="하단 메뉴">
      <RouterLink v-for="item in navigation" :key="item.id" :to="item.href">
        {{ item.label }}
      </RouterLink>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { getNavigation } from '@/navigation/pageIndex'

const navigation = getNavigation('footer')
</script>
