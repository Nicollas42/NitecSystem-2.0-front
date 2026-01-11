<template>
    <div class="movest_container">
        
        <div class="movest_card">
            <h4 class="movest_titulo">Movimentação Interna & Entradas</h4>
            <p class="movest_desc">Transfira itens entre depósito e vitrine ou registre compras.</p>

            <div class="movest_grid_form">
                
                <div class="movest_grupo">
                    <BuscaProdutoInput 
                        label="Pesquisar Produto"
                        :lista="lista_produtos"
                        v-model="texto_busca_produto"
                        @selecionado="selecionar_produto"
                    />
                </div>

                <div class="movest_grupo" v-if="produto_selecionado">
                    <label class="movest_label">Saldos Atuais</label>
                    <div class="movest_display_saldo">
                        <span class="tag_dep">📦 {{ formatar_qtd(produto_selecionado.estoque_deposito) }}</span>
                        <span class="tag_vit">🏪 {{ formatar_qtd(produto_selecionado.estoque_vitrine) }}</span>
                    </div>
                </div>
                <div class="movest_grupo" v-else></div>

                <div class="movest_grupo">
                    <label class="movest_label">Tipo de Operação</label>
                    <select v-model="form.acao" class="movest_input">
                        <option value="transf_dep_vit">➡️ Depósito para Vitrine (Reposição)</option>
                        <option value="transf_vit_dep">⬅️ Vitrine para Depósito (Recolhimento)</option>
                        <option value="entrada_deposito">➕ Entrada no Depósito (Compra/Ajuste)</option>
                    </select>
                </div>

                <div class="movest_grupo">
                    <label class="movest_label">Quantidade</label>
                    <input type="number" step="0.001" v-model="form.quantidade" class="movest_input" placeholder="0.000">
                </div>

                <div class="movest_grupo movest_full_width">
                    <label class="movest_label">Motivo da Movimentação</label>
                    <input type="text" v-model="form.motivo" class="movest_input" placeholder="Ex: Reposição da tarde, Chegada de Fornecedor...">
                </div>
            </div>

            <button class="movest_btn_confirmar" @click="confirmar_movimentacao">✅ Confirmar Movimentação</button>
        </div>

        <div v-if="modal.aberto" class="movest_modal_overlay">
            <div :class="['movest_modal_box', modal.tipo]">
                <div class="movest_modal_icon">{{ modal.tipo === 'sucesso' ? '✅' : '❌' }}</div>
                <h3>{{ modal.titulo }}</h3>
                <p>{{ modal.mensagem }}</p>
                <button class="movest_modal_btn" @click="modal.aberto = false">OK</button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { api_request } from '@/services/api_helper';
import BuscaProdutoInput from '@/components/BuscaProdutoInput.vue';

const lista_produtos = ref([]);
const produto_selecionado = ref(null);
const texto_busca_produto = ref(''); 

const form = ref({ produto_id: '', acao: 'transf_dep_vit', quantidade: '', motivo: '' });
const modal = reactive({ aberto: false, tipo: 'sucesso', titulo: '', mensagem: '' });

const carregar_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        // CORREÇÃO: URL curta
        const res = await api_request('get', '/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        // CORREÇÃO: Blindagem de resposta
        let lista = [];
        if (Array.isArray(res)) lista = res;
        else if (res.data && Array.isArray(res.data)) lista = res.data;

        lista_produtos.value = lista.filter(p => p.tem_cadastro == 1);
    } catch (e) { console.error(e); }
};

const selecionar_produto = (prod) => {
    produto_selecionado.value = prod;
    form.value.produto_id = prod.id;
};

const confirmar_movimentacao = async () => {
    if(!form.value.produto_id || !form.value.quantidade || !form.value.motivo) {
        mostrar_modal('erro', 'Campos Vazios', 'Por favor, preencha todos os campos.');
        return;
    }
    
    const lojaId = localStorage.getItem('loja_ativa_id');
    const payload = { ...form.value, loja_id: lojaId };

    try {
        // CORREÇÃO: URL Curta
        await api_request('post', '/movimentacao/registrar', payload, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        
        mostrar_modal('sucesso', 'Sucesso!', 'Movimentação realizada e estoque atualizado.');
        
        // Limpar Campos
        form.value.quantidade = ''; 
        form.value.motivo = '';
        texto_busca_produto.value = '';
        produto_selecionado.value = null;
        
        carregar_produtos();
        
    } catch (e) {
        mostrar_modal('erro', 'Erro ao Movimentar', e.response?.data?.mensagem || e.message);
    }
};

const mostrar_modal = (tipo, titulo, msg) => {
    modal.tipo = tipo; modal.titulo = titulo; modal.mensagem = msg; modal.aberto = true;
};

const formatar_qtd = (v) => parseFloat(v).toFixed(3).replace('.', ',');

onMounted(carregar_produtos);
</script>

<style scoped>
/* O ESTILO PERMANECE IGUAL, NENHUMA MUDANÇA VISUAL */
.movest_container { animation: fadeIn 0.3s ease; }
.movest_card { background: var(--bg-card); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
.movest_titulo { color: var(--primary-color); margin: 0 0 5px 0; font-size: 1.2rem; }
.movest_desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 25px; }

.movest_grid_form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
.movest_full_width { grid-column: span 2; }

.movest_grupo { display: flex; flex-direction: column; }
.movest_label { font-weight: 600; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.movest_input { padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); font-size: 14px; transition: border 0.2s; }
.movest_input:focus { border-color: var(--primary-color); outline: none; }

.movest_display_saldo { display: flex; gap: 10px; padding-top: 10px; }
.tag_dep { background: #eff6ff; color: #1d4ed8; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #dbeafe; }
.tag_vit { background: #fff7ed; color: #c2410c; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #ffedd5; }

.movest_btn_confirmar { width: 100%; padding: 14px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: opacity 0.2s; }
.movest_btn_confirmar:hover { opacity: 0.9; }

.movest_modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(2px); }
.movest_modal_box { background: var(--bg-card); padding: 30px; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 20px 25px rgba(0,0,0,0.3); animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.movest_modal_icon { font-size: 40px; margin-bottom: 15px; }
.movest_modal_box h3 { margin: 0 0 10px 0; color: var(--text-primary); }
.movest_modal_box p { color: var(--text-secondary); margin-bottom: 20px; }
.movest_modal_btn { background: var(--primary-color); color: white; border: none; padding: 10px 25px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.movest_modal_box.erro .movest_modal_btn { background: #ef4444; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>