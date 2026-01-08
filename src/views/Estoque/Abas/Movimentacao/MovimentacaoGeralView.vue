<template>
  <div class="container_mov">
    
    <div class="nav_mov">
        <button :class="{ ativo: sub_aba === 'movimentacao' }" @click="sub_aba = 'movimentacao'">
            📦 Movimentação de Estoque
        </button>
        <button :class="{ ativo: sub_aba === 'perdas' }" @click="sub_aba = 'perdas'" class="btn_perda">
            🗑️ Registro de Perdas
        </button>
        <button :class="{ ativo: sub_aba === 'historico' }" @click="sub_aba = 'historico'" class="btn_hist">
            📜 Histórico & Logs
        </button>
    </div>

    <div class="area_conteudo_mov">
        <MovimentacaoEstoque v-if="sub_aba === 'movimentacao'" />
        <RegistroPerdas v-if="sub_aba === 'perdas'" />
        <HistoricoMovimentacao v-if="sub_aba === 'historico'" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import MovimentacaoEstoque from './MovimentacaoEstoque.vue';
import RegistroPerdas from './RegistroPerdas.vue';
import HistoricoMovimentacao from './HistoricoMovimentacao.vue';

const sub_aba = ref('movimentacao');
</script>

<style scoped>
.container_mov { padding: 10px; }
.nav_mov { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
.nav_mov button { 
    background: transparent; border: 1px solid var(--border-color); 
    padding: 10px 20px; border-radius: 6px; cursor: pointer; color: var(--text-secondary); font-weight: 600;
}
.nav_mov button:hover { background: var(--hover-bg); }
.nav_mov button.ativo { background: var(--primary-color); color: white; border-color: var(--primary-color); }
.nav_mov button.btn_perda.ativo { background: #ef4444; border-color: #ef4444; }
.nav_mov button.btn_hist.ativo { background: #6366f1; border-color: #6366f1; }
</style>