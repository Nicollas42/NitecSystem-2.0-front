<template>
  <div class="container_producao">
    <div class="topo_prod">
        <h3>🏭 Registro de Produção</h3>
        <p>Selecione o produto fabricado para dar entrada no estoque e baixar os insumos automaticamente.</p>
    </div>

    <div class="grid_principal">
        
        <div class="card_input">
            <div class="grupo_input">
                <label>Produto a Produzir</label>
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
                <small class="hint" v-if="fator_multiplicador !== 1 && fator_multiplicador > 0">
                    Isso representa <strong>{{ fator_multiplicador.toFixed(2) }}x</strong> a receita base.
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
            <h4>📦 Movimentação Prevista</h4>
            
            <div class="item_movimentacao entrada">
                <span class="sinal">+</span>
                <div class="detalhe">
                    <strong>{{ produto_nome }}</strong>
                    <span>Entrada no Estoque: {{ formatar_inteligente(qtd_producao, unidade_produto) }}</span>
                </div>
            </div>

            <div class="divisor">🔻 Insumos a Baixar (Saída)</div>

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
                                (Faltam {{ formatar_inteligente(ing.qtd_calculada - ing.estoque_atual, ing.unidade) }})
                            </small>
                        </div>
                    </div>
                </div>
                <div v-if="ingredientes_calculados.length === 0" class="aviso_vazio">
                    Nenhum ingrediente vinculado na Ficha Técnica.
                </div>
            </div>
        </div>
    </div>

    <div v-if="modal.confirmacao" class="modal_overlay">
        <div class="modal_box">
            <div class="modal_icon">🏭</div>
            <h3>Confirmar Produção?</h3>
            <p>Você vai produzir <strong>{{ formatar_inteligente(qtd_producao, unidade_produto) }}</strong> de <strong>{{ produto_nome }}</strong>.</p>
            <p class="sub_aviso">Isso dará entrada no produto final e baixará os estoques dos ingredientes automaticamente.</p>
            
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
                <button class="btn_primario" @click="fechar_aviso">OK</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import axios from 'axios';

const lista_produtos = ref([]);
const produto_selecionado_id = ref('');
const produto_nome = ref('');
const unidade_produto = ref('');
const rendimento_base = ref(1);
const qtd_producao = ref('');
const ingredientes_base = ref([]);

// Controle dos Modais
const modal = reactive({
    confirmacao: false,
    aviso: false,
    tipo: 'sucesso', 
    titulo: '',
    mensagem: ''
});

const carregar_lista_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        lista_produtos.value = res.data.filter(p => p.tipo_item === 'INTERNO');
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
        const res = await axios.get(`http://127.0.0.1:8000/api/produtos/${produto_selecionado_id.value}/ficha`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        ingredientes_base.value = res.data.ingredientes.map(i => ({
            id: i.id,
            nome: i.nome,
            unidade: i.unidade,
            qtd_base: parseFloat(i.qtd),
            estoque_atual: parseFloat(i.estoque_atual) || 0,
            // CAPTURA SE É INFINITO (converte 1/0 para bool)
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
        const estoque = ing.estoque_atual;
        
        // Verifica se é infinito
        const ehInfinito = ing.estoque_infinito; 
        
        // Se for infinito, a "falta" é zero para fins de cálculo
        const falta = ehInfinito ? 0 : (necessaria - estoque);
        
        return {
            ...ing,
            qtd_calculada: necessaria,
            // Só marca como insuficiente se NÃO for infinito E faltar material
            saldo_insuficiente: !ehInfinito && (falta > 0.0001),
            eh_infinito: ehInfinito // Passa para o template usar no v-if
        };
    });
});

const tem_ingrediente_faltante = computed(() => {
    return ingredientes_calculados.value.some(i => i.saldo_insuficiente);
});

// --- FUNÇÃO DE FORMATAÇÃO INTELIGENTE ---
const formatar_inteligente = (valor, unidade) => {
    let num = parseFloat(valor);
    if (isNaN(num)) return `0 ${unidade || ''}`;

    // REGRA 1: Conversão para Gramas ou Mililitros se for < 1 e > 0
    if (num > 0 && num < 1) {
        if (unidade === 'KG') {
            // Ex: 0.900 KG -> 900 g
            return (num * 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' g';
        }
        if (unidade === 'L') {
            // Ex: 0.500 L -> 500 ml
            return (num * 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ml';
        }
    }

    // REGRA 2: Remove zeros à direita desnecessários (ex: 30,000 -> 30)
    // toLocaleString 'pt-BR' já usa vírgula
    const valorFormatado = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 0, // Se for inteiro, não mostra decimal
        maximumFractionDigits: 3  // No máximo 3 casas se precisar
    });

    return `${valorFormatado} ${unidade || ''}`;
};

const abrir_confirmacao = () => {
    modal.confirmacao = true;
};

const registrar_producao_real = async () => {
    modal.confirmacao = false; 
    const lojaId = localStorage.getItem('loja_ativa_id');
    
    try {
        await axios.post('http://127.0.0.1:8000/api/producao', {
            loja_id: lojaId,
            produto_id: produto_selecionado_id.value,
            quantidade: qtd_producao.value
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });

        modal.tipo = 'sucesso';
        modal.titulo = 'Produção Registrada!';
        modal.mensagem = `Estoque de ${produto_nome.value} atualizado e insumos baixados.`;
        modal.aviso = true;

        produto_selecionado_id.value = '';
        ingredientes_base.value = [];
        
    } catch (e) {
        modal.tipo = 'erro';
        modal.titulo = 'Erro ao Produzir';
        modal.mensagem = e.response?.data?.mensagem || e.message;
        modal.aviso = true;
    }
};

const fechar_aviso = () => {
    modal.aviso = false;
};

onMounted(carregar_lista_produtos);
</script>

<style scoped>
.container_producao { padding: 10px; }
.topo_prod h3 { color: var(--primary-color); margin: 0 0 5px 0; }
.topo_prod p { color: var(--text-secondary); font-size: 14px; margin: 0 0 20px 0; }

.grid_principal { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.card_input, .card_resumo { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; }

.grupo_input { margin-bottom: 20px; }
.grupo_input label { display: block; font-weight: bold; color: var(--text-primary); margin-bottom: 8px; }
.input_padrao { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 16px; background: var(--input-bg); color: var(--text-primary); }

.input_com_unidade { display: flex; align-items: center; gap: 10px; }
.input_destaque { flex: 1; padding: 10px; border: 2px solid var(--primary-color); border-radius: 6px; font-size: 18px; font-weight: bold; color: var(--primary-color); text-align: center; }
.hint { display: block; margin-top: 5px; color: var(--text-secondary); font-size: 12px; }

.btn_registrar { width: 100%; background: #10b981; color: white; border: none; padding: 15px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: background 0.2s; }
.btn_registrar:hover { opacity: 0.9; }
.btn_registrar.bloqueado { background: #ef4444; cursor: not-allowed; opacity: 0.7; }
.btn_registrar:disabled { cursor: not-allowed; }

/* Resumo Visual */
.item_movimentacao { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border-color); align-items: center; }
.item_movimentacao.entrada { background: rgba(16, 185, 129, 0.1); border-radius: 6px; border: 1px solid #10b981; margin-bottom: 15px; }
.item_movimentacao.saida .sinal { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.item_movimentacao.entrada .sinal { color: #10b981; background: white; }

.sinal { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 18px; flex-shrink: 0; }
.detalhe { display: flex; flex-direction: column; }
.info_topo_ing { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.detalhe strong { color: var(--text-primary); }

.badge_estoque { font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
.badge_estoque.bom { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.badge_estoque.ruim { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.linha_qtds { font-size: 13px; margin-top: 4px; color: var(--text-secondary); }
.aviso_falta { color: #ef4444; font-weight: bold; margin-left: 5px; }

.divisor { background: var(--bg-page); color: var(--text-secondary); padding: 5px 10px; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px; margin-bottom: 10px; }
.lista_insumos { max-height: 400px; overflow-y: auto; }
.aviso_vazio { text-align: center; color: var(--text-secondary); padding: 20px; font-style: italic; }

/* MODAL STYLES */
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 200; backdrop-filter: blur(2px); }
.modal_box { background: var(--bg-card); padding: 30px; border-radius: 12px; width: 400px; text-align: center; border: 1px solid var(--border-color); box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: var(--text-primary); }
.modal_icon { font-size: 40px; margin-bottom: 15px; }
.modal_box h3 { margin: 0 0 10px 0; color: var(--text-primary); }
.sub_aviso { font-size: 13px; color: var(--text-secondary); margin-top: 5px; }
.modal_actions { display: flex; justify-content: center; gap: 10px; margin-top: 25px; }
.btn_primario { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn_secundario { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>