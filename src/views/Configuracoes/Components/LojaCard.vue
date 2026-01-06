<template>
  <div :class="['card_loja', { 'matriz': isMatriz, 'editavel': !loja.bloqueado, 'ativa': isAtiva }]">
    
    <div class="topo_card">
        <div class="badges">
            <span :class="['tag_tipo', { 'filial_tag': !isMatriz }]">
                {{ isMatriz ? 'Matriz' : `Filial ${index + 1}` }}
            </span>
            <span v-if="isAtiva" class="tag_ativa">EM USO AGORA ✅</span>
        </div>
        
        <div class="acoes_card">
            <button class="btn_lock" @click="$emit('request-unlock', loja)" title="Editar Dados">
                <component :is="loja.bloqueado ? Lock : Unlock" size="18" />
            </button>
            <button v-if="!isMatriz && !loja.bloqueado" class="btn_del" @click="$emit('delete', index)">🗑️</button>
        </div>
    </div>

    <div v-if="!isAtiva" class="area_selecao">
        <button class="btn_selecionar" @click="$emit('selecionar', loja.id)">
            Trabalhar nesta Loja
        </button>
    </div>

    <div class="form_loja">
        <div class="grupo_input">
            <label>Nome Fantasia</label>
            <input type="text" v-model="loja.nome_fantasia" class="input_padrao" :disabled="loja.bloqueado">
        </div>

        <div class="linha_dupla">
            <div class="grupo_input">
                <label>CNPJ</label>
                <input type="text" v-model="loja.documento" class="input_padrao" :disabled="loja.bloqueado">
            </div>
            <div class="grupo_input">
                <label>Telefone</label>
                <input type="text" v-model="loja.telefone" class="input_padrao" :disabled="loja.bloqueado">
            </div>
        </div>

        <div class="grupo_input">
            <label>Endereço Completo</label>
            <input type="text" v-model="loja.endereco" class="input_padrao" :disabled="loja.bloqueado">
        </div>
    </div>

  </div>
</template>

<script setup>
import { Lock, Unlock } from 'lucide-vue-next';

const props = defineProps({
    loja: Object,
    isMatriz: Boolean,
    index: Number,
    isAtiva: Boolean // Recebe do pai se esta é a loja ativa
});

defineEmits(['request-unlock', 'delete', 'selecionar']);
</script>

<style scoped>
.card_loja { 
    background: var(--bg-card); border: 1px solid var(--border-color); 
    padding: 25px; border-radius: 12px; position: relative; 
    transition: all 0.3s ease; display: flex; flex-direction: column;
}

/* ESTILO DA LOJA ATIVA */
.ativa {
    border: 2px solid #10b981 !important; /* Borda Verde */
    background-color: rgba(16, 185, 129, 0.05) !important;
    transform: scale(1.02);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.badges { display: flex; gap: 8px; align-items: center; }
.tag_tipo { background: var(--primary-color); color: white; padding: 4px 12px; font-size: 11px; border-radius: 20px; font-weight: bold; }
.filial_tag { background: var(--text-secondary); }
.tag_ativa { background: #10b981; color: white; padding: 4px 8px; font-size: 10px; border-radius: 4px; font-weight: bold; }

/* Botão Selecionar */
.area_selecao { margin-bottom: 15px; text-align: center; }
.btn_selecionar {
    background: var(--text-primary); color: white; border: none; width: 100%;
    padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.btn_selecionar:hover { opacity: 0.9; }

/* Outros Estilos */
.matriz { border-left: 4px solid var(--primary-color); }
.card_loja:not(.editavel) { opacity: 0.9; }
.card_loja:not(.editavel) .input_padrao { border-color: transparent; background: transparent; color: var(--text-secondary); pointer-events: none; }
.editavel { border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.topo_card { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.acoes_card { display: flex; gap: 10px; }
.btn_lock { background: none; border: none; cursor: pointer; color: var(--text-secondary); }
.editavel .btn_lock { color: #10b981; }
.btn_del { background: none; border: none; cursor: pointer; opacity: 0.7; }
.btn_del:hover { opacity: 1; color: #ef4444; }
.grupo_input { margin-bottom: 10px; }
.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.grupo_input label { display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; font-size: 14px; box-sizing: border-box; }
</style>