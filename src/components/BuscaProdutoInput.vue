<template>
    <div class="busca_wrapper" style="position: relative;">
        <label v-if="label" class="busca_label">{{ label }}</label>
        
        <input 
            type="text" 
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :placeholder="placeholder"
            class="busca_input"
            :class="customClass"
            @focus="mostrar_lista = true"
            @blur="fechar_lista_delay"
        >
        
        <div v-if="mostrar_lista && lista_filtrada.length > 0" class="busca_lista">
            <div 
                v-for="prod in lista_filtrada" 
                :key="prod.id" 
                class="busca_item"
                @mousedown="selecionar(prod)"
            >
                <div class="busca_item_topo">
                    <strong>{{ prod.nome }}</strong>
                    <small class="busca_badge_id">#{{ prod.id }}</small>
                </div>
                
                <div class="busca_item_detalhe">
                    <span v-if="prod.codigo_barras" class="busca_ean">{{ prod.codigo_barras }}</span>
                    <div class="busca_saldos">
                        <span class="saldo_tag dep">📦 {{ formatar_qtd(prod.estoque_deposito) }}</span>
                        <span class="saldo_tag vit">🏪 {{ formatar_qtd(prod.estoque_vitrine) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, toRef, watch } from 'vue';
import { useBuscaProduto } from '@/composables/useBuscaProduto';

const props = defineProps({
    lista: { type: Array, required: true },
    label: { type: String, default: '' },
    placeholder: { type: String, default: 'Pesquisar produto...' },
    customClass: { type: String, default: '' },
    modelValue: { type: String, default: '' }
});

const emit = defineEmits(['selecionado', 'update:modelValue']);

// Conecta a prop reativa ao composable
const listaRef = toRef(props, 'lista');

// Chama o composable passando a referência da lista
const { 
    termo_busca, 
    mostrar_lista, 
    lista_filtrada, 
    fechar_lista_delay 
} = useBuscaProduto(listaRef);

// Sincroniza o v-model do pai com o termo de busca interno
watch(() => props.modelValue, (newVal) => {
    termo_busca.value = newVal;
}, { immediate: true });

const selecionar = (prod) => {
    emit('selecionado', prod);
    emit('update:modelValue', prod.nome); // Atualiza o texto do input
    mostrar_lista.value = false;
};

const formatar_qtd = (v) => parseFloat(v || 0).toFixed(3).replace('.', ',');
</script>

<style scoped>
.busca_label { display: block; font-weight: 600; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; }
.busca_input { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); font-size: 14px; transition: border 0.2s; }
.busca_input:focus { border-color: var(--primary-color); outline: none; }

/* LISTA FLUTUANTE */
.busca_lista {
    position: absolute; top: 100%; left: 0; width: 100%;
    background: var(--bg-card); border: 1px solid var(--border-color);
    border-radius: 0 0 6px 6px; max-height: 250px; overflow-y: auto;
    z-index: 100; box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}
.busca_item { padding: 10px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.1s; display: flex; flex-direction: column; gap: 4px; }
.busca_item:hover { background: var(--hover-bg); }
.busca_item:last-child { border-bottom: none; }

.busca_item_topo { font-size: 13px; display: flex; justify-content: space-between; align-items: center; color: var(--text-primary); }
.busca_badge_id { background: var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; color: var(--text-secondary); }

.busca_item_detalhe { display: flex; justify-content: space-between; align-items: center; font-size: 10px; }
.busca_ean { font-family: monospace; color: var(--text-secondary); background: rgba(0,0,0,0.03); padding: 2px 4px; border-radius: 3px; }

.busca_saldos { display: flex; gap: 8px; }
.saldo_tag { padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; }
.saldo_tag.dep { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
.saldo_tag.vit { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
</style>