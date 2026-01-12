<template>
    <div class="tabela_scroll manual_scroll">
        <table class="tabela_vinculo">
            <thead>
                <tr>
                    <th width="40%">Produto</th>
                    <th width="15%" class="col_center">Qtd</th>
                    <th width="20%" class="col_center">Custo Unit. (R$)</th>
                    <th width="15%" class="col_center">Subtotal</th>
                    <th width="10%"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, idx) in itens" :key="idx">
                    <td>
                        <select 
                            :value="item.produto_id" 
                            @change="(e) => verificarSelecao(item, e.target.value)"
                            class="select_vinculo"
                            :class="{'select_novo': item.produto_id === 'novo'}"
                        >
                            <option :value="null">🔍 Buscar Produto...</option>
                            <option value="novo">✨ CADASTRAR NOVO</option>
                            <optgroup label="Produtos Cadastrados">
                                <option v-for="prod in produtos" :key="prod.id" :value="prod.id">
                                    {{ prod.nome }}
                                </option>
                            </optgroup>
                        </select>
                    </td>
                    <td class="col_center">
                        <input type="number" v-model="item.quantidade" class="input_qtd_manual" placeholder="0">
                    </td>
                    <td class="col_center">
                        <input type="number" step="0.01" v-model="item.valor_unitario" class="input_qtd_manual" placeholder="0.00">
                    </td>
                    <td class="col_center subtotal_manual">
                        R$ {{ (item.quantidade * item.valor_unitario).toFixed(2) }}
                    </td>
                    <td class="col_center">
                        <button class="btn_remover" @click="$emit('remove', idx)" title="Remover">🗑️</button>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <button class="btn_add_linha" @click="$emit('add')">
            + Adicionar Produto na Nota
        </button>
    </div>
</template>

<script setup>
const props = defineProps(['itens', 'produtos']);
const emit = defineEmits(['add', 'remove', 'criar-produto']);

const verificarSelecao = (item, valor) => {
    if (valor === 'novo') {
        // Avisa o pai (ModalImportacaoNota) para abrir o cadastro
        // Passamos o item da linha para ele saber onde preencher depois
        emit('criar-produto', item); 
    } else {
        item.produto_id = valor; // Seleciona normalmente
    }
};
</script>

<style scoped>
/* Estilos mantidos iguais ao anterior */
.manual_scroll { flex: 1; max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
.tabela_vinculo { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabela_vinculo th { background: #f9fafb; padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; color: #374151; font-weight: 600; }
.tabela_vinculo td { padding: 10px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.select_vinculo { width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }
.select_novo { border-color: #f59e0b; background-color: #fffbeb; color: #b45309; font-weight: 700; }
.input_qtd_manual { width: 80px; text-align: center; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px; }
.subtotal_manual { font-weight: bold; color: #4b5563; }
.col_center { text-align: center; }
.btn_remover { background: #fee2e2; color: #ef4444; border: none; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.btn_remover:hover { background: #fecaca; }
.btn_add_linha { width: 100%; padding: 10px; background: #e0f2fe; color: #0369a1; border: 1px dashed #7dd3fc; border-radius: 0 0 8px 8px; font-weight: bold; cursor: pointer; margin-top: -1px; transition: background 0.2s; }
.btn_add_linha:hover { background: #bae6fd; }
</style>