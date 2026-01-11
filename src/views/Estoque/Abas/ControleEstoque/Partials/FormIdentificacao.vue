<template>
    <div class="layout_identificacao">
        <div class="coluna_imagem">
            <slot name="imagem"></slot> 
        </div>

        <div class="coluna_dados">
            <div class="grupo_input">
                <label>Nome do Produto *</label>
                <input type="text" v-model="form.nome" required class="input_padrao" placeholder="Ex: Coca-cola 2L">
            </div>

            <div class="grid_compacto">
                <div class="grupo_input" style="flex: 2;">
                    <label>Categoria *</label>
                    <select v-model="form.categoria" class="input_padrao" required>
                        <option value="Outros">Selecione...</option>
                        <option v-for="cat in listas.categorias" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
                <div class="grupo_input" style="flex: 1; min-width: 90px;">
                    <label>Unidade *</label>
                    <select v-model="form.unidade_medida" required class="input_padrao">
                        <option v-for="u in listas.unidades" :key="u.codigo" :value="u.codigo">{{ u.nome }}</option>
                    </select>
                </div>
                <div class="grupo_input" style="flex: 1; min-width: 80px;">
                    <label>ID (#)</label>
                    <input type="number" v-model="form.id" disabled placeholder="Auto" class="input_padrao">
                </div>
            </div>

            <div class="grid_compacto" style="margin-top: 10px;">
                <div class="grupo_input" style="flex: 2;">
                    <label>Fornecedor Padrão</label>
                    <div class="input_com_botao">
                        <select v-model="form.fornecedor_id" class="input_padrao">
                            <option :value="null">-- Sem Fornecedor --</option>
                            <option v-for="f in fornecedores" :key="f.id" :value="f.id">{{ f.nome_fantasia }}</option>
                        </select>
                        
                        <button v-if="form.fornecedor_id" type="button" class="btn_icon_mini btn_edit" @click="$emit('editar-fornecedor', form.fornecedor_id)" title="Editar Fornecedor">✏️</button>
                        
                        <button type="button" class="btn_icon_mini btn_add" @click="$emit('abrir-modal-fornecedor')" title="Novo Fornecedor">+</button>
                    </div>
                </div>

                <div class="grupo_input" style="flex: 2;">
                    <div v-if="['KG', 'L'].includes(form.unidade_medida)" class="flex_balanca">
                        <div class="check_balanca" title="Usar Balança">
                            <input type="checkbox" id="chk_b" v-model="usa_balanca_local">
                            <label for="chk_b">⚖️</label>
                        </div>
                        <input v-if="usa_balanca_local" type="number" v-model="form.codigo_balanca" class="input_padrao destaque_balanca" placeholder="Digito (Ex: 50)">
                        <input v-else type="text" v-model="form.codigo_barras" class="input_padrao" placeholder="EAN / Barras">
                    </div>
                    <div v-else>
                        <label>Cód. Barras (EAN)</label>
                        <input type="text" v-model="form.codigo_barras" class="input_padrao" placeholder="Leitor...">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps(['form', 'fornecedores']);
const emit = defineEmits(['abrir-modal-fornecedor', 'editar-fornecedor']);

const listas = {
    unidades: [{ codigo: 'UN', nome: 'UN' }, { codigo: 'KG', nome: 'KG' }, { codigo: 'L', nome: 'LT' }, { codigo: 'CX', nome: 'CX' }],
    categorias: ["Panificação", "Confeitaria", "Bebidas", "Frios", "Insumos", "Outros"]
};

const usa_balanca_local = ref(false);

onMounted(() => {
    if (props.form.codigo_balanca && props.form.codigo_balanca > 0) {
        usa_balanca_local.value = true;
    }
});

watch(usa_balanca_local, (val) => {
    if (!val) props.form.codigo_balanca = '';
    else props.form.codigo_barras = '';
});
</script>

<style scoped>
.layout_identificacao { display: grid; grid-template-columns: 150px 1fr; gap: 20px; align-items: start; }
.coluna_imagem { display: flex; justify-content: center; }
.grid_compacto { display: flex; gap: 15px; flex-wrap: wrap; }
.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; }

/* Botões do Fornecedor */
.input_com_botao { display: flex; gap: 5px; }
.btn_icon_mini { 
    color: white; border: none; width: 36px; border-radius: 6px; 
    font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s;
}
.btn_icon_mini:hover { opacity: 0.9; }
.btn_add { background: #10b981; font-size: 20px; } /* Verde */
.btn_edit { background: #f59e0b; } /* Laranja */

/* Balança */
.flex_balanca { display: flex; gap: 5px; align-items: center; }
.check_balanca { padding-top: 5px; cursor: pointer; }
.destaque_balanca { background-color: #fffbeb !important; border-color: #fcd34d !important; color: #b45309 !important; font-weight: bold; }

@media (max-width: 768px) {
    .layout_identificacao { grid-template-columns: 1fr; }
}
</style>