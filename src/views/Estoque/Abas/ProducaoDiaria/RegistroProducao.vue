<template>
  <div>
    <div class="topo_prod">
        <h3>Registrar Produção</h3>
        <p>A produção dará entrada no produto final e baixará os insumos automaticamente.</p>
    </div>

    <div class="grid_principal">
        
        <div class="card_input">
            <div class="grupo_input">
                <label>Produto a Fabricar</label>
                <select v-model="produto_selecionado_id" class="input_padrao" @change="carregar_ficha">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="p in lista_produtos" :key="p.id" :value="p.id">
                        {{ p.nome }} (Base: {{ formatar_inteligente(p.rendimento, p.unidade_medida) }})
                    </option>
                </select>
            </div>

            <div class="grupo_input" v-if="produto_selecionado_id">
                <label>Quantidade Real Produzida ({{ unidade_produto }})</label>
                <div class="input_com_unidade">
                    <input 
                        type="number" 
                        step="0.001" 
                        v-model="qtd_producao" 
                        class="input_destaque" 
                        placeholder="0"
                    >
                    <span>{{ unidade_produto }}</span>
                </div>
                <small class="hint" v-if="fator_multiplicador > 0">
                    Proporção: <strong>{{ fator_multiplicador.toFixed(2) }}x</strong> da receita base.
                </small>
            </div>

            <button 
                v-if="produto_selecionado_id"
                :class="['btn_registrar', { 'bloqueado': tem_ingrediente_faltante }]" 
                @click="abrir_confirmacao" 
                :disabled="!qtd_producao || qtd_producao <= 0 || tem_ingrediente_faltante"
            >
                <span v-if="tem_ingrediente_faltante">⚠️ Estoque Insuficiente</span>
                <span v-else>🚀 Confirmar Produção</span>
            </button>
        </div>

        <div class="card_resumo" v-if="produto_selecionado_id">
            <h4>📦 Previsão de Movimentação</h4>
            
            <div class="item_movimentacao entrada">
                <span class="sinal">+</span>
                <div class="detalhe">
                    <strong>{{ produto_nome }}</strong>
                    <span>Entrada: {{ formatar_inteligente(qtd_producao, unidade_produto) }}</span>
                </div>
            </div>

            <div class="divisor">🔻 Baixa de Insumos</div>

            <div class="lista_insumos">
                <div v-for="ing in ingredientes_calculados" :key="ing.id" class="item_movimentacao saida">
                    <span class="sinal">-</span>
                    <div class="detalhe" style="width: 100%;">
                        <div class="info_topo_ing">
                            <strong>{{ ing.nome }}</strong>
                            <span :class="['badge_estoque', ing.saldo_insuficiente ? 'ruim' : 'bom']">
                                Estoque: 
                                <span v-if="ing.eh_infinito">♾️ Ilimitado</span>
                                <span v-else>{{ formatar_inteligente(ing.estoque_atual, ing.unidade) }}</span>
                            </span>
                        </div>
                        <div class="linha_qtds">
                            <span>Vai usar: <strong>{{ formatar_inteligente(ing.qtd_calculada, ing.unidade) }}</strong></span>
                            <small class="aviso_falta" v-if="ing.saldo_insuficiente">
                                (Falta {{ formatar_inteligente(ing.qtd_calculada - ing.estoque_atual, ing.unidade) }})
                            </small>
                        </div>
                    </div>
                </div>
                <div v-if="ingredientes_calculados.length === 0" class="aviso_vazio">
                    Nenhum ingrediente na ficha técnica.
                </div>
            </div>
        </div>
    </div>

    <div v-if="modal.confirmacao" class="modal_overlay">
        <div class="modal_box">
            <div class="modal_icon">🏭</div>
            <h3>Confirmar Produção?</h3>
            <p>Produto: <strong>{{ produto_nome }}</strong></p>
            <p>Quantidade: <strong>{{ formatar_inteligente(qtd_producao, unidade_produto) }}</strong></p>
            <div class="modal_actions">
                <button class="btn_secundario" @click="modal.confirmacao = false">Cancelar</button>
                <button class="btn_primario" @click="registrar_producao_real">Sim, Produzir</button>
            </div>
        </div>
    </div>

    <div v-if="modal.aviso" class="modal_overlay">
        <div class="modal_box">
            <div class="modal_icon">{{ modal.tipo === 'sucesso' ? '✅' : '❌' }}</div>
            <h3>{{ modal.titulo }}</h3>
            <p>{{ modal.mensagem }}</p>
            <div class="modal_actions">
                <button class="btn_primario" @click="modal.aviso = false">OK</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { api_request } from '@/services/api_helper';

const lista_produtos = ref([]);
const produto_selecionado_id = ref('');
const produto_nome = ref('');
const unidade_produto = ref('');
const rendimento_base = ref(1);
const qtd_producao = ref('');
const ingredientes_base = ref([]);

const modal = reactive({ confirmacao: false, aviso: false, tipo: 'sucesso', titulo: '', mensagem: '' });

// Funções Auxiliares
const formatar_inteligente = (valor, unidade) => {
    let num = parseFloat(valor);
    if (isNaN(num)) return `0 ${unidade || ''}`;
    if (num > 0 && num < 1 && unidade === 'KG') return (num * 1000).toLocaleString('pt-BR') + ' g';
    if (num > 0 && num < 1 && unidade === 'L') return (num * 1000).toLocaleString('pt-BR') + ' ml';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) + ' ' + (unidade || '');
};

const carregar_lista_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        // CORREÇÃO: URL curta
        const res = await api_request('get', '/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        // CORREÇÃO: Blindagem contra formato de resposta (removemos .data)
        let lista = [];
        if (Array.isArray(res)) lista = res;
        else if (res.data && Array.isArray(res.data)) lista = res.data;

        lista_produtos.value = lista.filter(p => p.tipo_item === 'INTERNO');

    } catch (e) { console.error(e); }
};

const carregar_ficha = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    const prod = lista_produtos.value.find(p => p.id === produto_selecionado_id.value);
    
    if (prod) {
        produto_nome.value = prod.nome;
        unidade_produto.value = prod.unidade_medida;
        rendimento_base.value = parseFloat(prod.rendimento) || 1;
        qtd_producao.value = rendimento_base.value; 
    }

    try {
        // CORREÇÃO: URL curta e uso de crase (template string)
        const res = await api_request('get', `/produtos/${produto_selecionado_id.value}/ficha`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        // CORREÇÃO: Removemos .data, pois o endpoint retorna { produto, ingredientes, maquinas }
        const listaIngredientes = res.ingredientes || [];

        ingredientes_base.value = listaIngredientes.map(i => ({
            ...i,
            qtd_base: parseFloat(i.qtd),
            estoque_atual: parseFloat(i.estoque_atual) || 0,
            estoque_infinito: i.estoque_infinito == 1 || i.estoque_infinito == true 
        }));
    } catch (e) { console.error(e); }
};

const fator_multiplicador = computed(() => {
    const qtd = parseFloat(qtd_producao.value);
    if (!qtd || qtd <= 0) return 0;
    return qtd / rendimento_base.value;
});

const ingredientes_calculados = computed(() => {
    const fator = fator_multiplicador.value;
    
    return ingredientes_base.value.map(ing => {
        const necessaria = ing.qtd_base * fator;
        
        const isInfinito = ing.estoque_infinito; 
        const falta = isInfinito ? 0 : (necessaria - ing.estoque_atual);
        
        return {
            ...ing,
            qtd_calculada: necessaria,
            saldo_insuficiente: !isInfinito && (falta > 0.0001),
            eh_infinito: isInfinito 
        };
    });
});

const tem_ingrediente_faltante = computed(() => ingredientes_calculados.value.some(i => i.saldo_insuficiente));

const abrir_confirmacao = () => { modal.confirmacao = true; };

const registrar_producao_real = async () => {
    modal.confirmacao = false; 
    const lojaId = localStorage.getItem('loja_ativa_id');
    
    try {
        // CORREÇÃO: URL curta
        await api_request('post', '/producao/registrar', { 
            loja_id: lojaId,
            produto_id: produto_selecionado_id.value,
            quantidade: qtd_producao.value
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });

        modal.tipo = 'sucesso';
        modal.titulo = 'Sucesso!';
        modal.mensagem = 'Produção registrada e estoques atualizados.';
        modal.aviso = true;

        produto_selecionado_id.value = '';
        ingredientes_base.value = [];
    } catch (e) {
        modal.tipo = 'erro';
        modal.titulo = 'Erro';
        modal.mensagem = e.response?.data?.mensagem || e.message;
        modal.aviso = true;
    }
};

onMounted(carregar_lista_produtos);
</script>

<style scoped>
/* REUTILIZAR ESTILOS DO ARQUIVO ANTERIOR */
.topo_prod h3 { color: var(--primary-color); margin: 0; }
.topo_prod p { color: var(--text-secondary); margin-bottom: 20px; font-size: 14px; }
.grid_principal { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card_input, .card_resumo { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; }
.grupo_input { margin-bottom: 15px; }
.grupo_input label { display: block; font-weight: bold; color: var(--text-primary); margin-bottom: 5px; font-size: 13px; }
.input_padrao { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); }
.input_com_unidade { display: flex; align-items: center; gap: 10px; }
.input_destaque { flex: 1; padding: 10px; border: 2px solid var(--primary-color); border-radius: 6px; font-size: 18px; font-weight: bold; color: var(--primary-color); text-align: center; }
.hint { font-size: 12px; color: var(--text-secondary); display: block; margin-top: 5px; }
.btn_registrar { width: 100%; background: #10b981; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 10px; }
.btn_registrar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn_registrar.bloqueado { background: #ef4444; }

.item_movimentacao { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border-color); align-items: center; font-size: 13px; }
.sinal { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; }
.entrada .sinal { background: #dcfce7; color: #15803d; }
.saida .sinal { background: #fee2e2; color: #b91c1c; }
.info_topo_ing { display: flex; justify-content: space-between; width: 100%; }
.badge_estoque { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
.badge_estoque.bom { background: #dcfce7; color: #15803d; }
.badge_estoque.ruim { background: #fee2e2; color: #b91c1c; }
.aviso_falta { color: #b91c1c; font-weight: bold; margin-left: 5px; }
.divisor { background: var(--bg-page); color: var(--text-secondary); padding: 5px; font-size: 11px; font-weight: bold; text-transform: uppercase; border-radius: 4px; margin: 10px 0; }
.lista_insumos { max-height: 350px; overflow-y: auto; }
.aviso_vazio { text-align: center; padding: 20px; color: var(--text-secondary); font-style: italic; }

/* Modal */
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 200; }
.modal_box { background: var(--bg-card); padding: 25px; border-radius: 12px; width: 400px; text-align: center; }
.modal_icon { font-size: 40px; margin-bottom: 10px; }
.modal_actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
.btn_primario { background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
.btn_secundario { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>