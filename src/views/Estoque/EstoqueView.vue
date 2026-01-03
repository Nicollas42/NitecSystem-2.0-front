<template>
  <div class="container_estoque">
    <div class="cabecalho_pagina">
        <h1 class="titulo_pagina">Gestão de Produtos</h1>
    </div>

    <div class="navegacao_macro">
      <button 
        :class="['botao_macro', { ativo: aba_macro === 'estoque' }]" 
        @click="aba_macro = 'estoque'"
      >
        📦 Controle de Estoque
      </button>
      <button 
        :class="['botao_macro', { ativo: aba_macro === 'ficha_tecnica' }]" 
        @click="aba_macro = 'ficha_tecnica'"
      >
        📝 Ficha Técnica (Produção)
      </button>
    </div>

    <div class="area_conteudo">
        <TabEstoque v-if="aba_macro === 'estoque'" />
        
        <FichaTecnicaView v-if="aba_macro === 'ficha_tecnica'" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

// Importando os Módulos
import TabEstoque from './Abas/TabEstoque.vue';
import FichaTecnicaView from './Abas/FichaTecnica/FichaTecnicaView.vue';

const aba_macro = ref('estoque');
</script>

<style scoped>
/* Estilos Layout Pai */
.cabecalho_pagina { margin-bottom: 20px; }
.titulo_pagina { color: var(--text-primary); margin: 0; }

.navegacao_macro {
    display: flex; gap: 10px; margin-bottom: 25px;
    border-bottom: 1px solid var(--border-color); padding-bottom: 10px;
}

.botao_macro {
    background: var(--bg-card); color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: 12px 25px; border-radius: 8px; cursor: pointer;
    font-size: 16px; font-weight: 600; transition: all 0.2s;
}

.botao_macro:hover { background: var(--hover-bg); color: var(--text-primary); }

.botao_macro.ativo {
    background: var(--primary-color); color: white; border-color: var(--primary-color);
}
</style>