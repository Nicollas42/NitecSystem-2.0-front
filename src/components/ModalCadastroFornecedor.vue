<template>
    <div v-if="visivel" class="modal_overlay" @click.self="tentarFechar">
        
        <div v-if="!mostrarSucesso" class="modal_box" @click.stop>
            <div class="modal_header">
                <h3>{{ form.id ? '✏️ Editar Fornecedor' : '🤝 Novo Fornecedor' }}</h3>
                <button type="button" class="btn_fechar" @click="tentarFechar">×</button>
            </div>

            <div class="modal_body">
                <div class="grupo_input">
                    <label>Nome Fantasia *</label>
                    <input type="text" v-model="form.nome_fantasia" class="input_padrao" placeholder="Ex: Atacadão dos Frios">
                </div>

                <div class="grupo_input">
                    <label>Razão Social (Nome Real)</label>
                    <input type="text" v-model="form.razao_social" class="input_padrao" placeholder="Ex: Comércio de Alimentos LTDA">
                </div>

                <div class="linha_dupla">
                    <div class="grupo_input">
                        <label>CNPJ</label>
                        <input type="text" v-model="form.cnpj" class="input_padrao" placeholder="Apenas números">
                    </div>
                    <div class="grupo_input">
                        <label>Telefone Empresa (Fixo/SAC)</label>
                        <input type="text" v-model="form.telefone" class="input_padrao" placeholder="(99) 3333-0000">
                    </div>
                </div>

                <div class="area_vendedor">
                    <div class="linha_dupla">
                        <div class="grupo_input">
                            <label>Nome do Vendedor</label>
                            <input type="text" v-model="form.vendedor_nome" class="input_padrao" placeholder="Ex: João">
                        </div>
                        <div class="grupo_input">
                            <label>WhatsApp Vendedor (Novo)</label>
                            <input type="text" v-model="form.vendedor_telefone" class="input_padrao" placeholder="(99) 99999-9999">
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal_footer">
                <button type="button" class="btn_cancelar" @click="tentarFechar">Cancelar</button>
                <button type="button" class="btn_salvar" @click="salvar">
                    {{ form.id ? 'Salvar Alterações' : 'Cadastrar' }}
                </button>
            </div>
        </div>

        <div v-else class="modal_box box_sucesso" @click.stop>
            <div class="animacao_check">✅</div>
            <h3>{{ form.id ? 'Atualizado!' : 'Cadastrado!' }}</h3>
            <p>Os dados de <strong>{{ form.nome_fantasia }}</strong> foram salvos.</p>
            <button type="button" class="btn_ok" @click="finalizar">OK, Fechar</button>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
// CORREÇÃO 1: Importar o api_request e remover axios
import { api_request } from '@/services/api_helper'; 

// Ajuste o caminho do import acima se a pasta components estiver em src/components
// Se api_helper.js estiver em src/, o caminho '../api_helper' está correto.

const props = defineProps(['visivel', 'dadosEdicao']);
const emit = defineEmits(['update:visivel', 'salvo']);

const mostrarSucesso = ref(false);

const form = reactive({
    id: null, nome_fantasia: '', razao_social: '', cnpj: '', 
    telefone: '', vendedor_nome: '', vendedor_telefone: ''
});

watch(() => props.visivel, (val) => {
    if (val) {
        if (props.dadosEdicao) {
            Object.assign(form, props.dadosEdicao);
        } else {
            limparForm();
        }
        mostrarSucesso.value = false;
    }
});

const tentarFechar = () => {
    if (mostrarSucesso.value) finalizar();
    else {
        emit('update:visivel', false);
        limparForm();
    }
};

const limparForm = () => {
    Object.assign(form, { 
        id: null, nome_fantasia: '', razao_social: '', cnpj: '', 
        telefone: '', vendedor_nome: '', vendedor_telefone: '' 
    });
};

const finalizar = () => {
    emit('update:visivel', false);
    limparForm();
};

const salvar = async () => {
    if (!form.nome_fantasia) return alert("Nome Fantasia é obrigatório");

    try {
        // CORREÇÃO 2: Usar URL relativa e lógica do api_request
        let url = '/fornecedores';
        let method = 'post';

        if (form.id) {
            url += `/${form.id}`;
            method = 'put';
        }

        // CORREÇÃO 3: Chamada limpa (sem headers manuais)
        const res = await api_request(method, url, form);
        
        // O api_request já devolve o objeto limpo, não precisa de .data
        emit('salvo', res);
        mostrarSucesso.value = true;

    } catch (e) {
        alert("Erro: " + e.message);
    }
};
</script>

<style scoped>
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(2px); }
.modal_box { background: var(--bg-card); padding: 0; border-radius: 10px; width: 450px; border: 1px solid var(--border-color); display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.2s ease; }
.modal_header { padding: 15px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-page); border-radius: 10px 10px 0 0; }
.modal_header h3 { margin: 0; color: var(--primary-color); font-size: 16px; }
.btn_fechar { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary); }
.modal_body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.grupo_input label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
.input_padrao { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); }
.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.area_vendedor { border-top: 1px dashed var(--border-color); padding-top: 15px; margin-top: 5px; }
.modal_footer { padding: 15px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-page); border-radius: 0 0 10px 10px; }
.btn_cancelar { background: transparent; border: 1px solid var(--border-color); padding: 8px 15px; border-radius: 6px; cursor: pointer; color: var(--text-primary); }
.btn_salvar { background: var(--primary-color); color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.box_sucesso { text-align: center; padding: 30px; align-items: center; }
.animacao_check { font-size: 50px; margin-bottom: 10px; }
.btn_ok { background: #10b981; color: white; border: none; padding: 10px 30px; border-radius: 6px; font-weight: bold; cursor: pointer; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>