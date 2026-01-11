<template>
    <div class="secao_form destaque_financeiro">
        <h3 class="subtitulo_form">2. Estoque de Insumo</h3>
        <div class="linha_tripla">
            <div class="grupo_input">
                <label>Preço Custo</label>
                <input type="number" step="0.01" v-model="form.preco_custo" class="input_padrao" placeholder="Custo de Compra">
            </div>
            
            <div class="grupo_input checkbox_infinito">
                <input type="checkbox" id="chk_infinito" v-model="form.estoque_infinito">
                <label for="chk_infinito" style="cursor: pointer;">
                    🔄 <strong>Estoque Infinito?</strong>
                    <small style="display:block; font-weight:normal; color:#666;">(Ex: Água, Energia)</small>
                </label>
            </div>

            <div class="grupo_input" v-if="!form.estoque_infinito">
                <label>📦 Estoque Depósito</label>
                <input type="number" step="0.001" v-model="form.estoque_deposito" class="input_padrao">
            </div>
            
            <div class="grupo_input">
                <label>Validade</label>
                <input type="date" v-model="form.validade" class="input_padrao">
            </div>
        </div>
        <p class="aviso_info">ℹ️ Insumos não possuem preço de venda direta, apenas custo para fichas técnicas.</p>
    </div>
</template>

<script setup>
const props = defineProps(['form']);
</script>

<style scoped>
/* Mesmos estilos para consistência */
.secao_form { margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); padding-bottom: 15px; }
.subtitulo_form { color: var(--primary-color); font-size: 14px; margin-bottom: 15px; font-weight: bold; }
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-bottom: 10px; }
.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; }
.destaque_financeiro { background: #fff7ed; padding: 15px; border-radius: 8px; border: 1px solid #fed7aa; }
.checkbox_infinito { display: flex; align-items: center; gap: 8px; background: white; padding: 5px; border-radius: 6px; border: 1px solid var(--border-color); height: 38px; margin-top: 18px; }
.aviso_info { font-size: 12px; color: var(--text-secondary); margin-top: 5px; font-style: italic; }
</style>