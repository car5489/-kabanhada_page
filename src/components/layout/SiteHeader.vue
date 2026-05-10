<template>
  <header class="site-header">
    <RouterLink class="site-header__brand" to="/" aria-label="카반하다 판매 차량 목록으로 이동">
      <span class="site-header__mark site-header__mark--logo">
        <img :src="logoSrc" alt="" aria-hidden="true" />
      </span>
      <span>카반하다</span>
    </RouterLink>

    <nav class="site-header__nav" aria-label="주요 메뉴">
      <RouterLink
        v-for="item in navigation"
        :key="item.id"
        :to="item.href"
        class="site-header__link"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { getNavigation } from '@/navigation/pageIndex'

const navigation = getNavigation('header')
const logoSrc = `${import.meta.env.BASE_URL}brand/logo.svg`
</script>
