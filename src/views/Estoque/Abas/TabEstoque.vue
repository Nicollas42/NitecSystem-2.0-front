<template>
  <div>
    <div class="navegacao_abas">
      <button 
        :class="['aba_botao', { ativo: aba_atual === 'lista_dep' }]" 
        @click="aba_atual = 'lista_dep'"
      >
        📦 Estoque DEP (Depósito)
      </button>
      
      <button 
        :class="['aba_botao', { ativo: aba_atual === 'lista_vit' }]" 
        @click="aba_atual = 'lista_vit'"
      >
        🏪 Estoque VIT (Loja)
      </button>
      
      <button 
        :class="['aba_botao', { ativo: aba_atual === 'lista_geral' }]" 
        @click="aba_atual = 'lista_geral'"
      >
        🌎 Geral (Rede)
      </button>

      <button 
        :class="['aba_botao', { ativo: aba_atual === 'cadastro' }]" 
        @click="aba_atual = 'cadastro'"
      >
        ➕ Novo Cadastro
      </button>
    </div>

    <div class="area_conteudo">
        
        <ListaEstoqueLocal 
            v-if="aba_atual === 'lista_dep'" 
            titulo="Depósito"
        />
        
        <ListaEstoqueVitrine 
            v-if="aba_atual === 'lista_vit'" 
        />
        
        <ListaEstoqueGeral v-if="aba_atual === 'lista_geral'" />
        
        <CadastroProduto 
            v-if="aba_atual === 'cadastro'" 
            @cancelar="aba_atual = 'lista_dep'"
            @salvo="produto_salvo"
        />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Componentes
import ListaEstoqueLocal from './ControleEstoque/ListaEstoqueLocal.vue';
import ListaEstoqueVitrine from './ControleEstoque/ListaEstoqueVitrine.vue'; // <--- NOVO
import ListaEstoqueGeral from './ControleEstoque/ListaEstoqueGeral.vue';
import CadastroProduto from './ControleEstoque/CadastroProduto.vue';

const aba_atual = ref('lista_dep');

const produto_salvo = () => {
    aba_atual.value = 'lista_dep'; // Volta para o depósito ao salvar
};
</script>

<style scoped>
.navegacao_abas { display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
.aba_botao {
    background: none; border: none; padding: 10px 20px;
    color: var(--text-secondary); cursor: pointer;
    border-bottom: 3px solid transparent; font-weight: 500; font-size: 14px;
}
.aba_botao:hover { color: var(--text-primary); background: var(--hover-bg); }
.aba_botao.ativo { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: bold; }

.area_conteudo {
    background: var(--bg-card); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);
}
</style>