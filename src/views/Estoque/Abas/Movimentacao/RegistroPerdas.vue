<template>
    <div class="regperda_container">
        
        <div class="regperda_card">
            <h4 class="regperda_titulo">Registro de Perdas / Quebras</h4>
            <p class="regperda_desc">Baixa de estoque por avaria, validade, consumo interno ou furto.</p>

            <div class="regperda_grid">
                
                <div class="regperda_grupo">
                    <BuscaProdutoInput 
                        label="Produto Avariado"
                        :lista="lista_produtos"
                        v-model="texto_busca_produto"
                        @selecionado="selecionar_produto"
                    />
                </div>

                <div class="regperda_grupo">
                    <label class="regperda_label">Origem da Perda</label>
                    <select v-model="form.acao" class="regperda_input">
                        <option value="perda_vitrine">🏪 Estava na Vitrine</option>
                        <option value="perda_deposito">📦 Estava no Depósito</option>
                    </select>
                </div>

                <div class="regperda_grupo">
                    <label class="regperda_label">Lote Específico (Opcional)</label>
                    <select 
                        v-model="form.lote_id" 
                        class="regperda_input" 
                        :disabled="lotes_disponiveis.length === 0"
                    >
                        <option value="">-- Automático (Menor Lote) --</option>
                        <option v-for="lote in lotes_disponiveis" :key="lote.id" :value="lote.id">
                            {{ lote.fornecedor }} | Qtd: {{ parseFloat(lote.quantidade_atual).toFixed(3) }}
                        </option>
                    </select>
                    <span v-if="lotes_disponiveis.length === 0 && form.produto_id" style="font-size: 10px; color: #b91c1c; margin-top: 4px;">
                        Nenhum lote com saldo encontrado.
                    </span>
                </div>

                <div class="regperda_grupo">
                    <label class="regperda_label">
                        Quantidade Perdida 
                        <span v-if="unidade_selecionada" style="color: #ef4444;">({{ unidade_selecionada }})</span>
                    </label>
                    <div class="input_com_unidade">
                        <input type="number" step="0.001" v-model="form.quantidade" class="regperda_input" placeholder="0.000">
                        <span v-if="unidade_selecionada" class="badge_unidade">{{ unidade_selecionada }}</span>
                    </div>
                </div>

                <div class="regperda_grupo regperda_full">
                    <label class="regperda_label">Relatório / Motivo (Obrigatório)</label>
                    <textarea v-model="form.motivo" class="regperda_input" rows="3" placeholder="Ex: Pão amanheceu duro; Sobra da produção de ontem; Caiu no chão..."></textarea>
                </div>
            </div>

            <button class="regperda_btn_action" @click="abrir_confirmacao">🗑️ Registrar Perda Definitiva</button>
        </div>

        <div v-if="modais.confirmacao" class="regperda_overlay">
            <div class="regperda_modal confirmacao">
                <div class="regperda_icon">⚠️</div>
                <h3>Confirmar Perda?</h3>
                <p>
                    Isso irá remover 
                    <strong>{{ form.quantidade }} {{ unidade_selecionada }}</strong> 
                    do estoque permanentemente.
                </p>
                <div class="regperda_actions">
                    <button class="btn_cancelar" @click="modais.confirmacao = false">Cancelar</button>
                    <button class="btn_confirmar" @click="confirmar_perda_real">Sim, Registrar</button>
                </div>
            </div>
        </div>

        <div v-if="modais.feedback.aberto" class="regperda_overlay">
            <div class="regperda_modal feedback">
                <div class="regperda_icon">{{ modais.feedback.tipo === 'sucesso' ? '🗑️' : '❌' }}</div>
                <h3>{{ modais.feedback.titulo }}</h3>
                <p>{{ modais.feedback.mensagem }}</p>
                <button class="btn_ok" @click="modais.feedback.aberto = false">Entendi</button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { api_request } from '@/services/api_helper';
import BuscaProdutoInput from '@/components/BuscaProdutoInput.vue';

const lista_produtos = ref([]);
const lotes_disponiveis = ref([]); 
const texto_busca_produto = ref('');
const unidade_selecionada = ref(''); // NOVA VARIÁVEL PARA GUARDAR A UNIDADE

const form = ref({ 
    produto_id: '', 
    lote_id: '', 
    acao: 'perda_vitrine', 
    quantidade: '', 
    motivo: '' 
});

const modais = reactive({
    confirmacao: false,
    feedback: { aberto: false, tipo: 'sucesso', titulo: '', mensagem: '' }
});

const carregar_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await api_request('get', '/produtos', {
            params: { loja_id: lojaId }
        });

        let lista = [];
        if (Array.isArray(res)) lista = res;
        else if (res.data && Array.isArray(res.data)) lista = res.data;

        // Trazemos todos, mas focamos nos que têm cadastro
        lista_produtos.value = lista.filter(p => p.tem_cadastro == 1);
    } catch (e) { console.error(e); }
};

const selecionar_produto = async (prod) => {
    form.value.produto_id = prod.id;
    unidade_selecionada.value = prod.unidade_medida; // CAPTURA A UNIDADE (KG, UN, LT)
    
    form.value.lote_id = ''; 
    lotes_disponiveis.value = [];

    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await api_request('get', '/movimentacao/lotes-produto', {
            params: { loja_id: lojaId, produto_id: prod.id }
        });
        
        if (Array.isArray(res)) {
            lotes_disponiveis.value = res;
        }
    } catch (e) {
        console.error("Erro ao buscar lotes:", e);
    }
};

const abrir_confirmacao = () => {
    if(!form.value.produto_id || !form.value.quantidade || !form.value.motivo) {
        modais.feedback = { aberto: true, tipo: 'erro', titulo: 'Dados Incompletos', mensagem: 'Preencha produto, quantidade e motivo.' };
        return;
    }
    modais.confirmacao = true;
};

const confirmar_perda_real = async () => {
    modais.confirmacao = false;
    
    const lojaId = localStorage.getItem('loja_ativa_id');
    const payload = { ...form.value, loja_id: lojaId };

    try {
        await api_request('post', '/movimentacao/registrar', payload);
        
        modais.feedback = { 
            aberto: true, 
            tipo: 'sucesso', 
            titulo: 'Perda Registrada', 
            mensagem: 'O estoque foi atualizado e a quebra contabilizada.' 
        };
        
        form.value.quantidade = ''; 
        form.value.motivo = ''; 
        form.value.lote_id = '';
        texto_busca_produto.value = ''; 
        unidade_selecionada.value = ''; // Reseta unidade
        lotes_disponiveis.value = [];
        
        carregar_produtos();
        
    } catch (e) {
        modais.feedback = { 
            aberto: true, 
            tipo: 'erro', 
            titulo: 'Erro', 
            mensagem: e.response?.data?.mensagem || e.message 
        };
    }
};

onMounted(carregar_produtos);
</script>

<style scoped>
.regperda_container { animation: fadeIn 0.3s ease; }
.regperda_card { background: #fff1f2; padding: 25px; border-radius: 10px; border: 1px solid #fda4af; box-shadow: 0 4px 6px rgba(225, 29, 72, 0.05); }
.regperda_titulo { color: #be123c; margin: 0 0 5px 0; font-size: 1.2rem; }
.regperda_desc { font-size: 13px; color: #9f1239; margin-bottom: 25px; opacity: 0.8; }

.regperda_grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px; }
.regperda_full { grid-column: span 3; }

.regperda_grupo { display: flex; flex-direction: column; }
.regperda_label { font-weight: 700; font-size: 12px; color: #881337; margin-bottom: 6px; }
.regperda_input { padding: 12px; border: 1px solid #fecdd3; border-radius: 6px; background: white; color: #881337; font-size: 14px; width: 100%; box-sizing: border-box; }
.regperda_input:focus { border-color: #f43f5e; outline: none; }
.regperda_input:disabled { background: #fff1f2; cursor: not-allowed; opacity: 0.6; }

/* Novo estilo para input com unidade dentro */
.input_com_unidade { position: relative; display: flex; align-items: center; }
.badge_unidade { position: absolute; right: 10px; font-size: 11px; font-weight: bold; color: #be123c; background: #ffe4e6; padding: 2px 6px; border-radius: 4px; }

.regperda_btn_action { width: 100%; padding: 14px; background: #e11d48; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: background 0.2s; }
.regperda_btn_action:hover { background: #be123c; }

.regperda_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(136, 19, 55, 0.6); display: flex; justify-content: center; align-items: center; z-index: 200; backdrop-filter: blur(2px); }
.regperda_modal { background: white; padding: 30px; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 20px 25px rgba(0,0,0,0.3); animation: popIn 0.3s ease; }
.regperda_icon { font-size: 40px; margin-bottom: 15px; }
.regperda_actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }

.btn_cancelar { background: transparent; border: 1px solid #ccc; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn_confirmar { background: #e11d48; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn_ok { background: #881337; color: white; border: none; padding: 10px 30px; border-radius: 6px; margin-top: 20px; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>