<template>
  <div>
    <div class="topo_maquinas">
        <div>
            <h3 class="titulo_sub">Máquinas e Mão de Obra</h3>
            <p class="desc">Adicione o tempo de uso dos equipamentos para calcular o custo operacional.</p>
        </div>
        <div class="botoes_topo">
            <button class="btn_secundario" @click="modal_tarifas_aberto = true">⚙️ Tarifas</button>
            <button class="btn_primario" @click="abrir_modal_equipamento">➕ Novo Equipamento</button>
        </div>
    </div>
    
    <div class="box_calculo">
        <h4 style="color:var(--text-primary); margin-bottom:10px;">Adicionar Tempo de Máquina</h4>
        
        <div class="linha_calc">
            <div class="grupo_input" style="flex: 2;">
                <label>Equipamento (Cadastrado)</label>
                <select v-model="uso_temp.equipamento_id" class="input_padrao" @change="selecionar_maquina">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="eq in lista_equipamentos_db" :key="eq.id" :value="eq.id">
                        {{ eq.nome }} ({{ eq.tipo_energia }})
                    </option>
                </select>
            </div>
            
            <div class="grupo_input" style="flex: 1;">
                <label>Tempo (Minutos)</label>
                <input type="number" v-model="uso_temp.minutos" class="input_padrao" placeholder="Ex: 40">
            </div>

            <div class="grupo_input" style="flex: 1;">
                <label>Custo Calc.</label>
                <div class="display_valor">R$ {{ custo_uso_preview }}</div>
            </div>

            <button class="botao_add" @click="adicionar_uso" :disabled="!uso_temp.equipamento_id">
                Adicionar
            </button>
        </div>
    </div>

    <div class="tabela_simples">
        <div class="cabecalho_tabela">
            <span>Recurso</span>
            <span>Tempo</span>
            <span>Custo Energia/Gás</span>
            <span>Depreciação</span>
            <span>Total</span>
            <span>Ação</span>
        </div>
        
        <div v-for="(item, index) in lista" :key="index" class="linha_tabela">
            <span>{{ item.nome }}</span>
            <span>{{ item.minutos }} min</span>
            <span>R$ {{ item.custo_energia.toFixed(2) }}</span>
            <span>R$ {{ item.custo_depreciacao.toFixed(2) }}</span>
            <strong style="color: #10b981;">R$ {{ item.total.toFixed(2) }}</strong>
            <button class="btn_del" @click="remover_uso(index)">🗑️</button>
        </div>

        <div v-if="lista.length === 0" class="aviso_tabela">
            Nenhum equipamento adicionado a esta receita.
        </div>
    </div>

    <div v-if="modal_tarifas_aberto" class="modal_overlay">
        <div class="modal_content">
            <h3>Configurar Tarifas Locais</h3>
            <p class="desc">Esses valores são usados para calcular o custo hora.</p>
            
            <div class="grupo_input">
                <label>Energia Elétrica (R$ / kWh)</label>
                <input type="number" step="0.01" v-model="tarifas.energia" class="input_padrao">
            </div>
            <div class="grupo_input">
                <label>Gás (R$ / kg)</label>
                <input type="number" step="0.01" v-model="tarifas.gas" class="input_padrao">
            </div>
            <div class="grupo_input">
                <label>Mão de Obra (R$ / hora)</label>
                <input type="number" step="0.01" v-model="tarifas.mao_obra" class="input_padrao">
            </div>
            
            <div class="modal_actions">
                <button @click="modal_tarifas_aberto = false" class="btn_primario">OK</button>
            </div>
        </div>
    </div>

    <div v-if="modal_equipamento_aberto" class="modal_overlay">
        <div class="modal_content grande">
            <h3>Cadastrar Novo Equipamento</h3>
            
            <div class="grupo_input">
                <label>Nome do Equipamento</label>
                <input type="text" v-model="novo_eq.nome" class="input_padrao" placeholder="Ex: Forno Turbo">
            </div>
            
            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Tipo de Energia</label>
                    <select v-model="novo_eq.tipo_energia" class="input_padrao">
                        <option value="ELETRICO">Elétrico</option>
                        <option value="GAS">Gás</option>
                    </select>
                </div>
                
                <div class="grupo_input" v-if="novo_eq.tipo_energia === 'ELETRICO'">
                    <label>Potência (Watts)</label>
                    <input type="number" v-model="novo_eq.potencia_watts" class="input_padrao">
                </div>
                <div class="grupo_input" v-if="novo_eq.tipo_energia === 'GAS'">
                    <label>Consumo Gás (kg/h)</label>
                    <input type="number" step="0.001" v-model="novo_eq.consumo_gas_kg_h" class="input_padrao">
                </div>
            </div>

            <hr class="divisor">
            <h4>Cálculo de Depreciação</h4>
            
            <div class="linha_tripla">
                <div class="grupo_input">
                    <label>Valor Compra (R$)</label>
                    <input type="number" v-model="novo_eq.valor_aquisicao" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Valor Residual (Final)</label>
                    <input type="number" v-model="novo_eq.valor_residual" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Vida Útil (Anos)</label>
                    <input type="number" v-model="novo_eq.vida_util_anos" class="input_padrao">
                </div>
            </div>

            <div class="box_resultado_depreciacao">
                Depreciação Mensal: <strong>R$ {{ calc_deprec_mensal }}</strong>
            </div>

            <div class="modal_actions">
                <button @click="modal_equipamento_aberto = false" class="btn_secundario">Cancelar</button>
                <button @click="salvar_no_banco" class="btn_primario">Salvar no Banco</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// --- PROPS & EMITS (Comunicação com o Pai) ---
const props = defineProps(['lista']);
const emit = defineEmits(['atualizar-total']);

// --- ESTADO ---
const lista_equipamentos_db = ref([]);
const modal_tarifas_aberto = ref(false);
const modal_equipamento_aberto = ref(false);

// Tarifas (Padrão, mas editáveis no modal localmente)
const tarifas = ref({ energia: 0.95, gas: 9.50, mao_obra: 15.00 });

// Form Novo Equipamento
const novo_eq = ref({ 
    nome: '', 
    tipo_energia: 'ELETRICO', 
    potencia_watts: 0, 
    consumo_gas_kg_h: 0, 
    valor_aquisicao: 0, 
    valor_residual: 0, 
    vida_util_anos: 10 
});

// Form Uso na Receita
const uso_temp = ref({ equipamento_id: '', minutos: 0, dados_maquina: null });

// --- API: BUSCAR E SALVAR ---
const buscar_equipamentos = async () => {
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/equipamentos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        lista_equipamentos_db.value = res.data;
    } catch (e) {
        console.error("Erro ao buscar equipamentos:", e);
    }
};

const salvar_no_banco = async () => {
    // Validação básica
    if(!novo_eq.value.nome) return alert("Digite o nome do equipamento.");

    // Envia o cálculo mensal já pronto para facilitar, ou o backend calcula
    const payload = {
        ...novo_eq.value,
        depreciacao_mensal: parseFloat(calc_deprec_mensal.value)
    };

    try {
        await axios.post('http://127.0.0.1:8000/api/equipamentos', payload, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        
        alert('Equipamento Salvo com Sucesso!');
        modal_equipamento_aberto.value = false;
        
        // Limpa form
        novo_eq.value = { nome: '', tipo_energia: 'ELETRICO', potencia_watts: 0, consumo_gas_kg_h: 0, valor_aquisicao: 0, valor_residual: 0, vida_util_anos: 10 };
        
        // Recarrega a lista
        buscar_equipamentos();
    } catch (e) {
        alert("Erro ao salvar: " + (e.response?.data?.message || e.message));
    }
};

// --- CÁLCULOS AUXILIARES ---

// Depreciação Mensal (Visual para o cadastro)
const calc_deprec_mensal = computed(() => {
    const v_compra = parseFloat(novo_eq.value.valor_aquisicao) || 0;
    const v_resid = parseFloat(novo_eq.value.valor_residual) || 0;
    const anos = parseFloat(novo_eq.value.vida_util_anos) || 1;
    
    // (Valor - Residual) / Anos / 12 meses
    const anual = (v_compra - v_resid) / anos;
    return (anual / 12).toFixed(2);
});

// Seleção no Dropdown
const selecionar_maquina = () => {
    const maquina = lista_equipamentos_db.value.find(e => e.id === uso_temp.value.equipamento_id);
    uso_temp.value.dados_maquina = maquina;
};

// Preview do custo antes de adicionar na tabela
const custo_uso_preview = computed(() => {
    const maquina = uso_temp.value.dados_maquina;
    const minutos = parseFloat(uso_temp.value.minutos) || 0;
    
    if (!maquina || minutos <= 0) return "0.00";

    const { custo_energia, custo_depreciacao } = calcular_custos(maquina, minutos);
    return (custo_energia + custo_depreciacao).toFixed(2);
});

// Função Central de Cálculo
const calcular_custos = (maquina, minutos) => {
    const horas = minutos / 60;
    let custo_energia = 0;

    // 1. Custo Combustível (Energia ou Gás)
    if (maquina.tipo_energia === 'ELETRICO') {
        // (Watts / 1000) * Horas * Tarifa kWh
        const kwh = (maquina.potencia_watts / 1000) * horas;
        custo_energia = kwh * tarifas.value.energia;
    } else {
        // kg/h * Horas * Tarifa Gás
        const kg_gas = maquina.consumo_gas_kg_h * horas;
        custo_energia = kg_gas * tarifas.value.gas;
    }

    // 2. Custo Depreciação
    // O backend já deve retornar 'depreciacao_hora' calculado, ou calculamos aqui via mensal / 220
    // Se o backend salvar 'depreciacao_hora', usamos direto.
    // Se não, usamos a lógica mensal/220 (padrão industrial).
    let custo_depreciacao = 0;
    
    // Tentando pegar depreciação hora direto do objeto (se o backend mandar)
    if (maquina.depreciacao_hora) {
        custo_depreciacao = parseFloat(maquina.depreciacao_hora) * horas;
    } else {
        // Fallback: Recalcula na hora se necessário (simulação)
        // Valor Compra... não temos esses dados na lista simples da API a menos que retornem tudo
        // Assumindo que o controller retorna tudo:
        const v_compra = parseFloat(maquina.valor_aquisicao) || 0;
        const v_resid = parseFloat(maquina.valor_residual) || 0;
        const anos = parseFloat(maquina.vida_util_anos) || 10;
        const mensal = ((v_compra - v_resid) / anos) / 12;
        custo_depreciacao = (mensal / 220) * horas;
    }

    return { custo_energia, custo_depreciacao };
};

// --- AÇÕES NA TABELA DE FICHA TÉCNICA ---
const adicionar_uso = () => {
    const maquina = uso_temp.value.dados_maquina;
    const minutos = parseFloat(uso_temp.value.minutos);

    const { custo_energia, custo_depreciacao } = calcular_custos(maquina, minutos);
    const total_item = custo_energia + custo_depreciacao;

    // Adiciona na lista do pai
    props.lista.push({
        id: maquina.id,
        nome: maquina.nome,
        minutos: minutos,
        custo_energia: custo_energia,
        custo_depreciacao: custo_depreciacao,
        total: total_item
    });

    recalcular_total_geral();
    
    // Reset input minutos
    uso_temp.value.minutos = 0;
};

const remover_uso = (index) => {
    props.lista.splice(index, 1);
    recalcular_total_geral();
};

const recalcular_total_geral = () => {
    const total = props.lista.reduce((acc, item) => acc + item.total, 0);
    emit('atualizar-total', total);
};

const abrir_modal_equipamento = () => {
    modal_equipamento_aberto.value = true;
};

onMounted(buscar_equipamentos);

</script>

<style scoped>
/* ESTILOS PADRONIZADOS */
.topo_maquinas { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.botoes_topo { display: flex; gap: 10px; }
.titulo_sub { color: var(--primary-color); margin: 0; }
.desc { color: var(--text-secondary); font-size: 13px; margin: 0; }

.btn_primario { background: var(--primary-color); color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn_secundario { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 15px; border-radius: 6px; cursor: pointer; }

/* Box Cálculo */
.box_calculo { background: var(--bg-page); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; }
.linha_calc { display: flex; gap: 15px; align-items: flex-end; }
.display_valor { padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: #10b981; border-radius: 6px; font-weight: bold; min-width: 100px; text-align: center; }

.botao_add { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; height: 42px; font-weight: bold; }
.botao_add:disabled { opacity: 0.5; cursor: not-allowed; }

/* Tabela */
.tabela_simples { border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
.cabecalho_tabela, .linha_tabela { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr; padding: 10px; }
.cabecalho_tabela { background: var(--bg-page); font-weight: bold; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); }
.linha_tabela { border-bottom: 1px solid var(--border-color); color: var(--text-primary); align-items: center; }
.aviso_tabela { padding: 20px; text-align: center; color: var(--text-secondary); font-style: italic; }
.btn_del { background: none; border: none; cursor: pointer; filter: grayscale(1); }
.btn_del:hover { filter: none; }

/* Modals */
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(2px); }
.modal_content { background: var(--bg-card); padding: 25px; border-radius: 12px; width: 400px; border: 1px solid var(--border-color); color: var(--text-primary); box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
.modal_content.grande { width: 600px; }
.modal_actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; }
.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 5px; font-size: 13px; color: var(--text-secondary); }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; }
.divisor { border: 0; border-top: 1px solid var(--border-color); margin: 20px 0; }
.box_resultado_depreciacao { background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 6px; color: var(--primary-color); text-align: center; font-size: 1.1em; border: 1px solid rgba(59, 130, 246, 0.3); }
</style>