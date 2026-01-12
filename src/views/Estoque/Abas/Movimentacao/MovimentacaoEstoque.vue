<template>
    <div class="movest_container">
        
        <div class="movest_card">
            <h4 class="movest_titulo">Movimentação Interna & Entradas</h4>
            <p class="movest_desc">Transfira itens entre depósito e vitrine ou distribua para filiais.</p>

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
                    <label class="movest_label">Saldos Atuais na Unidade</label>
                    <div class="movest_display_saldo">
                        <span class="tag_dep">📦 DEP: {{ formatar_qtd(produto_selecionado.estoque_deposito) }}</span>
                        <span class="tag_vit">🏪 VIT: {{ formatar_qtd(produto_selecionado.estoque_vitrine) }}</span>
                    </div>
                </div>
                <div class="movest_grupo" v-else></div>

                <div class="movest_grupo">
                    <label class="movest_label">Tipo de Operação</label>
                    <select v-model="form.acao" class="movest_input" @change="limpar_campos_especificos">
                        <option value="transf_dep_vit">➡️ Depósito para Vitrine (Reposição)</option>
                        <option value="transf_vit_dep">⬅️ Vitrine para Depósito (Recolhimento)</option>
                        <option value="transf_entre_lojas">🚚 Matriz para Filial (Distribuição)</option>
                        <option value="entrada_deposito">➕ Entrada no Depósito (Compra/Ajuste)</option>
                    </select>
                </div>

                <div class="movest_grupo">
                    <label class="movest_label">Quantidade</label>
                    <input type="number" step="0.001" v-model="form.quantidade" class="movest_input" placeholder="0.000">
                </div>

                <template v-if="form.acao === 'transf_entre_lojas'">
                    <div class="movest_grupo">
                        <label class="movest_label">Filial de Destino</label>
                        <select v-model="form.loja_destino_id" class="movest_input_destaque">
                            <option value="">Selecione a Filial...</option>
                            <option v-for="loja in lista_lojas" :key="loja.id" :value="loja.id">
                                {{ loja.nome_fantasia }}
                            </option>
                        </select>
                    </div>

                    <div class="movest_grupo">
                        <label class="movest_label">Lote de Origem (Obrigatório)</label>
                        <select v-model="form.lote_id" class="movest_input_destaque">
                            <option value="">Selecione o Lote na Matriz...</option>
                            <option v-for="lote in lotes_disponiveis" :key="lote.id" :value="lote.id">
                                {{ lote.fornecedor }} | Saldo: {{ formatar_qtd(lote.quantidade_atual) }}
                            </option>
                        </select>
                    </div>
                </template>

                <div class="movest_grupo movest_full_width">
                    <label class="movest_label">Motivo da Movimentação</label>
                    <input type="text" v-model="form.motivo" class="movest_input" placeholder="Ex: Reposição da tarde, Envio para Filial B...">
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
const lista_lojas = ref([]); 
const lotes_disponiveis = ref([]); 
const produto_selecionado = ref(null);
const texto_busca_produto = ref(''); 

const form = ref({ 
    produto_id: '', 
    acao: 'transf_dep_vit', 
    quantidade: '', 
    motivo: '',
    loja_destino_id: '',
    lote_id: ''
});

const modal = reactive({ aberto: false, tipo: 'sucesso', titulo: '', mensagem: '' });

const carregar_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await api_request('get', '/produtos', { params: { loja_id: lojaId } });
        let lista = Array.isArray(res) ? res : (res.data || []);
        lista_produtos.value = lista.filter(p => p.tem_cadastro == 1);
    } catch (e) { console.error(e); }
};

const carregar_lojas = async () => {
    try {
        const res = await api_request('get', '/lojas'); 
        
        // Como o seu Controller retorna { matriz: {}, filiais: [] }
        if (res && res.filiais) {
            lista_lojas.value = res.filiais; 
        } else if (res && res.data && res.data.filiais) {
            lista_lojas.value = res.data.filiais;
        }

        console.log("Filiais carregadas para destino:", lista_lojas.value);
    } catch (e) { 
        console.error("Erro ao carregar lojas:", e); 
    }
};

const selecionar_produto = async (prod) => {
    produto_selecionado.value = prod;
    form.value.produto_id = prod.id;
    
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        // Busca lotes específicos para garantir que a transferência respeite o custo e fornecedor original
        const res = await api_request('get', '/movimentacao/lotes-produto', {
            params: { loja_id: lojaId, produto_id: prod.id }
        });
        lotes_disponiveis.value = res || [];
    } catch (e) { console.error(e); }
};

const limpar_campos_especificos = () => {
    form.value.loja_destino_id = '';
    form.value.lote_id = '';
};

const confirmar_movimentacao = async () => {
    // 1. Validação de Campos Básicos
    if(!form.value.produto_id || !form.value.quantidade || !form.value.motivo) {
        mostrar_modal('erro', 'Campos Vazios', 'Preencha produto, quantidade e motivo.');
        return;
    }

    // 2. Validação de Saldo no Frontend (Feedback Rápido)
    const qtdSolicitada = parseFloat(form.value.quantidade);
    
    if (form.value.acao === 'transf_dep_vit') {
        const saldoDep = parseFloat(produto_selecionado.value.estoque_deposito || 0);
        if (qtdSolicitada > saldoDep) {
            mostrar_modal('erro', 'Saldo Insuficiente', `O Depósito tem apenas ${formatar_qtd(saldoDep)} e você pediu ${formatar_qtd(qtdSolicitada)}.`);
            return;
        }
    }
    
    if (form.value.acao === 'transf_vit_dep') {
        const saldoVit = parseFloat(produto_selecionado.value.estoque_vitrine || 0);
        if (qtdSolicitada > saldoVit) {
            mostrar_modal('erro', 'Saldo Insuficiente', `A Vitrine tem apenas ${formatar_qtd(saldoVit)} e você pediu ${formatar_qtd(qtdSolicitada)}.`);
            return;
        }
    }

    // 3. Validação de Transferência entre Lojas
    if(form.value.acao === 'transf_entre_lojas' && (!form.value.loja_destino_id || !form.value.lote_id)) {
        mostrar_modal('erro', 'Dados da Filial', 'Selecione a filial de destino e o lote de origem.');
        return;
    }
    
    // 4. Envio para API
    const lojaId = localStorage.getItem('loja_ativa_id');
    const payload = { ...form.value, loja_id: lojaId };

    try {
        await api_request('post', '/movimentacao/registrar', payload);
        mostrar_modal('sucesso', 'Movimentação Concluída', 'O estoque foi atualizado com sucesso.');
        
        // Reset do formulário
        form.value.quantidade = ''; 
        form.value.motivo = '';
        form.value.loja_destino_id = '';
        form.value.lote_id = '';
        texto_busca_produto.value = '';
        produto_selecionado.value = null;
        
        carregar_produtos();
    } catch (e) {
        mostrar_modal('erro', 'Falha na Movimentação', e.response?.data?.mensagem || e.message);
    }
};

const mostrar_modal = (tipo, titulo, msg) => {
    modal.tipo = tipo; modal.titulo = titulo; modal.mensagem = msg; modal.aberto = true;
};

const formatar_qtd = (v) => parseFloat(v).toFixed(3).replace('.', ',');

onMounted(() => {
    carregar_produtos();
    carregar_lojas();
});
</script>

<style scoped>
.movest_container { padding: 5px; animation: fadeIn 0.3s ease; }
.movest_card { background: var(--bg-card); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color); }
.movest_titulo { color: var(--primary-color); margin: 0 0 5px 0; }
.movest_desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 25px; }

.movest_grid_form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
.movest_full_width { grid-column: span 2; }

.movest_grupo { display: flex; flex-direction: column; }
.movest_label { font-weight: bold; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.movest_input { padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); }

/* Destaque visual para campos de transferência externa */
.movest_input_destaque { padding: 10px; border: 2px solid #6366f1; border-radius: 6px; background: #f5f3ff; color: #1e1b4b; font-weight: 600; }

.movest_display_saldo { display: flex; gap: 10px; margin-top: 5px; }
.tag_dep, .tag_vit { font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
.tag_dep { background: #dbeafe; color: #1e40af; }
.tag_vit { background: #fef3c7; color: #92400e; }

.movest_btn_confirmar { width: 100%; padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.movest_btn_confirmar:hover { opacity: 0.9; }

.movest_modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.movest_modal_box { background: white; padding: 30px; border-radius: 12px; text-align: center; width: 350px; }
.movest_modal_icon { font-size: 40px; margin-bottom: 10px; }
.movest_modal_btn { margin-top: 20px; padding: 8px 25px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>