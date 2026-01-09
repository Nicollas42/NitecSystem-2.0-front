<template>
    <div v-if="visivel" class="modal_overlay" @click.self="fechar">
        <div class="modal_box">
            <div class="modal_header">
                <h3>🤝 Novo Fornecedor</h3>
                <button class="btn_fechar" @click="fechar">×</button>
            </div>

            <div class="modal_body">
                <div class="grupo_input">
                    <label>Nome Fantasia *</label>
                    <input type="text" v-model="form.nome_fantasia" class="input_padrao" placeholder="Ex: Atacadão dos Frios">
                </div>

                <div class="linha_dupla">
                    <div class="grupo_input">
                        <label>CNPJ</label>
                        <input type="text" v-model="form.cnpj" class="input_padrao" placeholder="Apenas números">
                    </div>
                    <div class="grupo_input">
                        <label>Telefone</label>
                        <input type="text" v-model="form.telefone" class="input_padrao" placeholder="(99) 99999-9999">
                    </div>
                </div>

                <div class="grupo_input">
                    <label>Vendedor / Contato</label>
                    <input type="text" v-model="form.vendedor_nome" class="input_padrao" placeholder="Nome do vendedor que te atende">
                </div>
            </div>

            <div class="modal_footer">
                <button class="btn_cancelar" @click="fechar">Cancelar</button>
                <button class="btn_salvar" @click="salvar">Salvar Fornecedor</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const props = defineProps(['visivel']);
const emit = defineEmits(['update:visivel', 'salvo']);

const form = reactive({
    nome_fantasia: '',
    cnpj: '',
    telefone: '',
    vendedor_nome: ''
});

const fechar = () => {
    emit('update:visivel', false);
    // Limpa form ao fechar
    Object.assign(form, { nome_fantasia: '', cnpj: '', telefone: '', vendedor_nome: '' });
};

const salvar = async () => {
    if (!form.nome_fantasia) return alert("Preencha o Nome Fantasia");

    try {
        const res = await axios.post('http://127.0.0.1:8000/api/fornecedores', form, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        
        alert("Fornecedor cadastrado!");
        emit('salvo', res.data); // Manda o objeto criado de volta para o pai selecionar
        fechar();
    } catch (e) {
        alert("Erro ao salvar: " + (e.response?.data?.message || e.message));
    }
};
</script>

<style scoped>
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(2px); }
.modal_box { background: var(--bg-card); padding: 0; border-radius: 10px; width: 450px; border: 1px solid var(--border-color); display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.modal_header { padding: 15px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-page); border-radius: 10px 10px 0 0; }
.modal_header h3 { margin: 0; color: var(--primary-color); font-size: 16px; }
.btn_fechar { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary); }
.modal_body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.grupo_input label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
.input_padrao { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); }
.modal_footer { padding: 15px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-page); border-radius: 0 0 10px 10px; }
.btn_cancelar { background: transparent; border: 1px solid var(--border-color); padding: 8px 15px; border-radius: 6px; cursor: pointer; color: var(--text-primary); }
.btn_salvar { background: var(--primary-color); color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>