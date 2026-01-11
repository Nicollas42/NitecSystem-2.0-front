<template>
    <div class="secao_form destaque_financeiro">
        <h3 class="subtitulo_form">2. Valores & Estoque (Loja Atual)</h3>
        
        <div class="linha_dupla">
            <div class="grupo_input">
                <label>Preço Custo</label>
                <input type="number" step="0.01" v-model="form.preco_custo" class="input_padrao" placeholder="0,00">
            </div>
            <div class="grupo_input">
                <label>Preço Venda *</label>
                <input type="number" step="0.01" v-model="form.preco_venda" required class="input_padrao" placeholder="0,00">
            </div>
        </div>

        <div class="linha_tripla">
            <div class="grupo_input">
                <label>📦 Depósito</label>
                <input type="number" step="0.001" v-model="form.estoque_deposito" class="input_padrao" placeholder="0">
            </div>
            <div class="grupo_input">
                <label>🏪 Vitrine (Loja)</label>
                <input type="number" step="0.001" v-model="form.estoque_vitrine" class="input_padrao destaque_vitrine" placeholder="0">
            </div>
            <div class="grupo_input">
                <label>Validade</label>
                <input type="date" v-model="form.validade" class="input_padrao">
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['form']);
</script>

<style scoped>
/* Estilos reutilizados */
.secao_form { margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); padding-bottom: 15px; }
.subtitulo_form { color: var(--primary-color); font-size: 14px; margin-bottom: 15px; font-weight: bold; }
.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 10px; }
.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; }
.destaque_financeiro { background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; }
.destaque_vitrine { background-color: #fffbeb !important; border-color: #fcd34d !important; font-weight: bold; color: #b45309 !important; }
</style>