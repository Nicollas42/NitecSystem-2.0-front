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
                    <label class="regperda_label">Quantidade Perdida</label>
                    <input type="number" step="0.001" v-model="form.quantidade" class="regperda_input" placeholder="0.000">
                </div>

                <div class="regperda_grupo regperda_full">
                    <label class="regperda_label">Relatório / Motivo (Obrigatório)</label>
                    <textarea v-model="form.motivo" class="regperda_input" rows="3" placeholder="Ex: Produto venceu; Caiu no chão; Consumo dos funcionários..."></textarea>
                </div>
            </div>

            <button class="regperda_btn_action" @click="abrir_confirmacao">🗑️ Registrar Perda Definitiva</button>
        </div>

        <div v-if="modais.confirmacao" class="regperda_overlay">
            <div class="regperda_modal confirmacao">
                <div class="regperda_icon">⚠️</div>
                <h3>Confirmar Perda?</h3>
                <p>Isso irá remover <strong>{{ form.quantidade }}</strong> do estoque permanentemente.</p>
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
const texto_busca_produto = ref('');
const form = ref({ produto_id: '', acao: 'perda_vitrine', quantidade: '', motivo: '' });

const modais = reactive({
    confirmacao: false,
    feedback: { aberto: false, tipo: 'sucesso', titulo: '', mensagem: '' }
});

const carregar_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        // CORREÇÃO: URL Curta
        const res = await api_request('get', '/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });

        // CORREÇÃO: Blindagem contra estrutura de resposta variável
        let lista = [];
        if (Array.isArray(res)) lista = res;
        else if (res.data && Array.isArray(res.data)) lista = res.data;

        lista_produtos.value = lista.filter(p => p.tem_cadastro == 1);
    } catch (e) { console.error(e); }
};

const selecionar_produto = (prod) => {
    form.value.produto_id = prod.id;
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
        // CORREÇÃO: URL Curta
        await api_request('post', '/movimentacao/registrar', payload, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        
        modais.feedback = { aberto: true, tipo: 'sucesso', titulo: 'Perda Registrada', mensagem: 'O estoque foi atualizado.' };
        
        // Reset
        form.value.quantidade = ''; form.value.motivo = ''; 
        texto_busca_produto.value = ''; // Limpa input
        carregar_produtos();
        
    } catch (e) {
        modais.feedback = { aberto: true, tipo: 'erro', titulo: 'Erro', mensagem: e.response?.data?.mensagem || e.message };
    }
};

onMounted(carregar_produtos);
</script>

<style scoped>
.regperda_container { animation: fadeIn 0.3s ease; }
.regperda_card { background: #fef2f2; padding: 25px; border-radius: 10px; border: 1px solid #fca5a5; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.05); }
.regperda_titulo { color: #b91c1c; margin: 0 0 5px 0; font-size: 1.2rem; }
.regperda_desc { font-size: 13px; color: #7f1d1d; margin-bottom: 25px; opacity: 0.8; }

.regperda_grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px; }
.regperda_full { grid-column: span 3; }

.regperda_grupo { display: flex; flex-direction: column; }
.regperda_label { font-weight: 700; font-size: 12px; color: #7f1d1d; margin-bottom: 6px; }
.regperda_input { padding: 12px; border: 1px solid #fecaca; border-radius: 6px; background: white; color: #450a0a; font-size: 14px; }
.regperda_input:focus { border-color: #ef4444; outline: none; ring: 2px solid #fee2e2; }

.regperda_btn_action { width: 100%; padding: 14px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: background 0.2s; }
.regperda_btn_action:hover { background: #dc2626; }

.regperda_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(69, 10, 10, 0.6); display: flex; justify-content: center; align-items: center; z-index: 200; backdrop-filter: blur(2px); }
.regperda_modal { background: white; padding: 30px; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 20px 25px rgba(0,0,0,0.3); animation: popIn 0.3s ease; }
.regperda_icon { font-size: 40px; margin-bottom: 15px; }
.regperda_actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }

.btn_cancelar { background: transparent; border: 1px solid #ccc; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn_confirmar { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn_ok { background: #450a0a; color: white; border: none; padding: 10px 30px; border-radius: 6px; margin-top: 20px; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>