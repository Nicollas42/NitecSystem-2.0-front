import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSistemaStore = defineStore('sistema', () => {
  // State (Variáveis globais - Snake Case)
  const usuario_atual = ref(null);

  // Actions (Funções globais - Snake Case)
  function carregar_dados_iniciais() {
     console.log("Carregando configurações globais...");
  }

  return { usuario_atual, carregar_dados_iniciais }
})