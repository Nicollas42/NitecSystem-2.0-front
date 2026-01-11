<template>
  <div class="container_producao_macro">
    
    <div class="nav_producao">
        <button :class="{ ativo: sub_aba === 'registro' }" @click="sub_aba = 'registro'">
            🏭 Nova Produção
        </button>
        <button :class="{ ativo: sub_aba === 'historico' }" @click="sub_aba = 'historico'">
            📜 Histórico de Lotes
        </button>
    </div>

    <div class="area_conteudo_prod">
        <RegistroProducao v-if="sub_aba === 'registro'" />
        <HistoricoProducao v-if="sub_aba === 'historico'" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import RegistroProducao from './RegistroProducao.vue';
import HistoricoProducao from './HistoricoProducao.vue';

const sub_aba = ref('registro');
</script>

<style scoped>
.container_producao_macro { padding: 10px; }
.nav_producao { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
.nav_producao button { 
    background: transparent; border: 1px solid var(--border-color); 
    padding: 10px 20px; border-radius: 6px; cursor: pointer; color: var(--text-secondary); font-weight: 600;
}
.nav_producao button:hover { background: var(--hover-bg); }
.nav_producao button.ativo { background: var(--primary-color); color: white; border-color: var(--primary-color); }
</style>