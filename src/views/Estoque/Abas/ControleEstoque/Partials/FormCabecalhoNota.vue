<template>
    <div class="form_manual_cabecalho">
        <div class="grupo_manual">
            <label>Fornecedor</label>
            <div class="input_com_botao">
                <select :value="modelValue.fornecedor_id" @input="$emit('update:modelValue', { ...modelValue, fornecedor_id: $event.target.value })" class="input_manual">
                    <option value="">Selecione o Fornecedor...</option>
                    <option v-for="f in fornecedores" :key="f.id" :value="f.id">{{ f.nome_fantasia }}</option>
                </select>
                <button class="btn_add_mini" @click="$emit('novo-fornecedor')" title="Novo Fornecedor">+</button>
            </div>
        </div>
        <div class="grupo_manual">
            <label>Número da Nota / Recibo</label>
            <input type="text" :value="modelValue.numero" @input="$emit('update:modelValue', { ...modelValue, numero: $event.target.value })" class="input_manual" placeholder="Ex: RECIBO-01">
        </div>
        <div class="grupo_manual">
            <label>Data Entrada</label>
            <input type="date" :value="modelValue.data" @input="$emit('update:modelValue', { ...modelValue, data: $event.target.value })" class="input_manual">
        </div>
        <div class="grupo_manual total_manual_box">
            <label>Total Estimado</label>
            <span class="valor_total_manual">R$ {{ totalFormatado }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['modelValue', 'fornecedores', 'total']);
const emit = defineEmits(['update:modelValue', 'novo-fornecedor']);

const totalFormatado = computed(() => {
    return props.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
});
</script>

<style scoped>
.form_manual_cabecalho { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px; }
.grupo_manual { display: flex; flex-direction: column; }
.grupo_manual label { font-size: 0.8rem; font-weight: bold; color: #6b7280; margin-bottom: 4px; }
.input_manual { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; }
.input_com_botao { display: flex; gap: 5px; }
.btn_add_mini { background: #10b981; color: white; border: none; width: 32px; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; }
.btn_add_mini:hover { background: #059669; }
.total_manual_box { align-items: flex-end; justify-content: center; }
.valor_total_manual { font-size: 1.2rem; font-weight: 800; color: #16a34a; }
</style>