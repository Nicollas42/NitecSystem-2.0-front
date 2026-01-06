<template>
  <div class="container_estoque">
    <div class="cabecalho_pagina">
        <div>
            <h1 class="titulo_pagina">Gestão de Produtos</h1>
            <div class="badge_loja" v-if="loja_ativa_nome">
                🏠 Loja Ativa: <strong>{{ loja_ativa_nome }}</strong>
            </div>
            <div class="badge_loja erro" v-else>
                ⚠️ Nenhuma loja selecionada! Volte em "Meu Negócio".
            </div>
        </div>
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

        <button 
            :class="['botao_macro', { ativo: aba_macro === 'producao' }]" 
            @click="aba_macro = 'producao'"
        >
            🏭 Produção Diária
        </button>
        </div>

        <div class="area_conteudo">
            <TabEstoque v-if="aba_macro === 'estoque'" />
            
            <FichaTecnicaView 
                v-if="aba_macro === 'ficha_tecnica'" 
                @voltar-estoque="aba_macro = 'estoque'" 
            />

            <ProducaoDiariaView v-if="aba_macro === 'producao'" />
        </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Importando os Componentes Principais
import TabEstoque from './Abas/TabEstoque.vue';
import FichaTecnicaView from './Abas/FichaTecnica/FichaTecnicaView.vue';
import ProducaoDiariaView from './Abas/ProducaoDiaria/ProducaoDiariaView.vue';

const aba_macro = ref('estoque');
const loja_ativa_nome = ref('');

// Busca o nome da loja para mostrar ao usuário onde ele está mexendo
const carregar_info_loja = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    if(!lojaId) return;

    try {
        const res = await axios.get('http://127.0.0.1:8000/api/minhas-lojas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        
        let loja = null;
        if (res.data.matriz && res.data.matriz.id == lojaId) loja = res.data.matriz;
        else if (res.data.filiais) loja = res.data.filiais.find(f => f.id == lojaId);

        if(loja) loja_ativa_nome.value = loja.nome_fantasia;

    } catch (e) { console.error(e); }
};

onMounted(carregar_info_loja);
</script>

<style scoped>
/* Estilos Layout Pai */
.cabecalho_pagina { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
.titulo_pagina { color: var(--text-primary); margin: 0; }

.badge_loja { 
    margin-top: 8px; font-size: 14px; 
    color: var(--primary-color); background: rgba(59, 130, 246, 0.1); 
    padding: 6px 12px; border-radius: 6px; display: inline-block;
}
.badge_loja.erro { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

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