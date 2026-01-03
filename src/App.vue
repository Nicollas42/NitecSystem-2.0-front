<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Reset básico para ocupar a tela toda */
body, html, #app {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family: var(--p-font-family);
}
</style>