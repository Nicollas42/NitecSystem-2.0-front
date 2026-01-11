<template>
  <div>
    <h3 class="titulo_sub">Fechamento de Custos</h3>

    <div class="grid_resumo">
        <div class="card_resumo">
            <span>Matéria Prima (Total)</span>
            <strong>R$ {{ custo_ingredientes.toFixed(2) }}</strong>
        </div>
        <div class="card_resumo">
            <span>Operacional (Total)</span>
            <strong>R$ {{ custo_operacional.toFixed(2) }}</strong>
        </div>
        <div class="card_resumo total">
            <span>CUSTO RECEITA</span>
            <strong>R$ {{ custo_total_receita.toFixed(2) }}</strong>
        </div>
    </div>

    <div class="form_preco">
        
        <h4 class="titulo_secao_form">1. Definição de Rendimento</h4>
        
        <div class="linha_equacao">
            <div class="grupo_eq">
                <label>Custo Total</label>
                <div class="valor_estatico">R$ {{ custo_total_receita.toFixed(2) }}</div>
            </div>

            <div class="operador">÷</div>

            <div class="grupo_eq">
                <label v-if="unidade_produto === 'KG' || unidade_produto === 'L'">
                    Rendimento (Peso Total)
                </label>
                <label v-else>
                    Rendimento (Qtd. Unidades)
                </label>

                <input 
                    type="number" 
                    step="0.001" 
                    v-model="rendimento" 
                    class="input_padrao centro" 
                    :placeholder="unidade_produto === 'KG' ? 'Ex: 5.200' : 'Ex: 12'"
                >
            </div>

            <div class="operador">=</div>

            <div class="grupo_eq">
                <label v-if="unidade_produto === 'KG' || unidade_produto === 'L'">
                    Custo do Quilo/Litro
                </label>
                <label v-else>
                    Custo Unitário
                </label>

                <div class="valor_resultado">
                    R$ {{ custo_unitario }}
                </div>
            </div>
        </div>
        
        <small class="ajuda_centro" v-if="unidade_produto === 'KG'">
            ℹ️ Como é um produto pesado (KG), informe o <strong>peso total da massa</strong> pronta.
        </small>
        <small class="ajuda_centro" v-else>
            ℹ️ Informe quantas unidades essa receita rendeu.
        </small>


        <h4 class="titulo_secao_form" style="margin-top: 25px;">
            2. Formação de Preço ({{ unidade_produto === 'KG' ? 'Por Kg' : 'Unitário' }})
        </h4>

        <div class="linha_tripla">
            
            <div class="grupo">
                <label>Margem Lucro (%)</label>
                <input type="number" v-model="margem_lucro" class="input_padrao">
            </div>

            <div class="grupo">
                <label>Imposto Venda (%)</label>
                <input type="number" v-model="imposto_venda" class="input_padrao" placeholder="0">
            </div>

            <div class="grupo">
                <label style="color: #10b981; font-weight: bold;">
                    Preço Venda REAL (R$)
                </label>
                
                <input 
                    type="number" 
                    step="0.01" 
                    v-model="preco_venda_real" 
                    class="input_padrao input_real" 
                    :placeholder="`Sug: R$ ${preco_sugerido}`"
                >
                
                <div class="texto_apoio_sugerido">
                    Sugerido: <strong>R$ {{ preco_sugerido }}</strong>
                </div>
            </div>

        </div>
    </div>

    <button class="botao_salvar" @click="emitir_salvamento">
        💾 Salvar Ficha e Atualizar Estoque
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { api_request } from '@/services/api_helper';

const props = defineProps(['produto_id', 'custo_ingredientes', 'custo_operacional']);
const emit = defineEmits(['salvar-completo']);

const margem_lucro = ref(100); 
const imposto_venda = ref(0); 
const preco_venda_real = ref(''); 
const rendimento = ref(1); 
const unidade_produto = ref('UN'); // Estado para guardar a unidade (KG, UN, CX)

// Carregar dados salvos do produto
const carregar_dados_produto = async () => {
    if (!props.produto_id) return;
    const lojaId = localStorage.getItem('loja_ativa_id');
    
    try {
        const res = await api_request('get', '/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        // CORREÇÃO: Removido .data
        const produto = res.find(p => p.id === props.produto_id);
        if (produto) {
            // CAPTURA A UNIDADE PARA AJUSTAR O VISUAL
            unidade_produto.value = produto.unidade_medida || 'UN';

            rendimento.value = parseFloat(produto.rendimento) || 1;
            const precoBanco = parseFloat(produto.preco_venda);
            preco_venda_real.value = precoBanco > 0 ? precoBanco : ''; 
            
            margem_lucro.value = parseFloat(produto.margem_lucro) || 100;
            imposto_venda.value = parseFloat(produto.imposto_venda) || 0;
        }
    } catch (e) { console.error(e); }
};

watch(() => props.produto_id, carregar_dados_produto);
onMounted(carregar_dados_produto);

// Cálculos
const custo_total_receita = computed(() => props.custo_ingredientes + props.custo_operacional);

const custo_unitario = computed(() => {
    const r = parseFloat(rendimento.value);
    if (!r || r <= 0) return "0.00";
    return (custo_total_receita.value / r).toFixed(2);
});

const preco_sugerido = computed(() => {
    const custo = parseFloat(custo_unitario.value);
    if (custo === 0) return "0.00";

    const base_com_lucro = custo * (1 + (margem_lucro.value / 100));
    const divisor_imposto = 1 - (imposto_venda.value / 100);
    
    if (divisor_imposto <= 0) return "Erro"; 

    return (base_com_lucro / divisor_imposto).toFixed(2);
});

// AÇÃO: Emite os dados para o pai salvar a ficha completa
const emitir_salvamento = () => {
    if (!props.produto_id) return alert('Selecione um produto!');
    
    if (!preco_venda_real.value || preco_venda_real.value <= 0) {
        return alert('Defina um preço de venda real!');
    }
    if (rendimento.value <= 0) {
        return alert('O rendimento deve ser maior que 0!');
    }

    emit('salvar-completo', {
        rendimento: rendimento.value,
        preco_custo: custo_unitario.value,
        preco_venda: preco_venda_real.value,
        margem_lucro: margem_lucro.value,
        imposto_venda: imposto_venda.value
    });
};
</script>

<style scoped>
/* ESTILOS (Mantidos iguais, focando na usabilidade) */
.titulo_sub { color: var(--primary-color); margin-bottom: 20px; }
.grid_resumo { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
.card_resumo { background: var(--bg-page); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; text-align: center; }
.card_resumo span { font-size: 13px; color: var(--text-secondary); margin-bottom: 5px; }
.card_resumo strong { font-size: 20px; color: var(--text-primary); }
.card_resumo.total { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); }
.card_resumo.total strong { color: var(--primary-color); }

.form_preco { background: var(--bg-page); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; }
.titulo_secao_form { color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px; font-size: 15px; }

/* LINHA EQUAÇÃO */
.linha_equacao { display: flex; align-items: flex-end; gap: 10px; justify-content: flex-start; }
.grupo_eq { display: flex; flex-direction: column; }
.grupo_eq label { font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600; }
.operador { font-size: 24px; color: var(--text-secondary); font-weight: bold; padding-bottom: 5px; }

.valor_estatico { padding: 10px 15px; background: var(--border-color); border-radius: 6px; font-weight: bold; color: var(--text-secondary); min-width: 100px; text-align: center; }
.valor_resultado { padding: 10px 15px; background: #ecfdf5; border: 2px solid #10b981; border-radius: 6px; font-weight: bold; color: #047857; min-width: 120px; text-align: center; }

.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; font-size: 16px; }
.input_padrao.centro { text-align: center; font-weight: bold; width: 140px; }
.ajuda_centro { display: block; text-align: left; margin-top: 8px; font-size: 12px; color: var(--text-secondary); }

/* LINHA TRIPLA */
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.grupo label { display: block; color: var(--text-secondary); margin-bottom: 5px; font-size: 13px; }

.input_real { border: 2px solid #10b981; color: #10b981; font-weight: bold; font-size: 18px; }
.input_real::placeholder { color: #9ca3af; font-weight: normal; font-size: 14px; }

.texto_apoio_sugerido { font-size: 11px; color: var(--text-secondary); margin-top: 4px; text-align: right; }

.botao_salvar { width: 100%; background: var(--primary-color); color: white; border: none; padding: 15px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 16px; transition: opacity 0.2s; }
.botao_salvar:hover { opacity: 0.9; }
</style>