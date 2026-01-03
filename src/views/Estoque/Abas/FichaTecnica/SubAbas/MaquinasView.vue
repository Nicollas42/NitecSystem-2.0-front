<template>
  <div>
    <div class="topo_maquinas">
        <div>
            <h3 class="titulo_sub">Máquinas e Mão de Obra</h3>
            <p class="desc">Custo operacional para produzir esta receita.</p>
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
                <label>Equipamento</label>
                <select v-model="uso_temp.equipamento_id" class="input_padrao" @change="selecionar_maquina">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="eq in lista_equipamentos" :key="eq.id" :value="eq.id">
                        {{ eq.nome }} ({{ eq.tipo }})
                    </option>
                </select>
            </div>
            
            <div class="grupo_input" style="flex: 1;">
                <label>Tempo (Minutos)</label>
                <input type="number" v-model="uso_temp.minutos" class="input_padrao" placeholder="Ex: 40">
            </div>

            <div class="grupo_input" style="flex: 1;">
                <label>Custo Estimado</label>
                <div class="display_valor">R$ {{ custo_uso_calculado }}</div>
            </div>

            <button class="botao_add" @click="adicionar_uso" :disabled="!uso_temp.equipamento_id">Adicionar</button>
        </div>
    </div>

    <div class="tabela_simples">
        <div class="cabecalho_tabela">
            <span>Recurso</span>
            <span>Tempo</span>
            <span>Energia/Gás</span>
            <span>Depreciação</span>
            <span>Total</span>
            <span>Ação</span>
        </div>
        <div v-for="(item, index) in lista_uso_maquinas" :key="index" class="linha_tabela">
            <span>{{ item.nome }}</span>
            <span>{{ item.minutos }} min</span>
            <span>R$ {{ formatar(item.custo_energia) }}</span>
            <span>R$ {{ formatar(item.custo_depreciacao) }}</span>
            <strong style="color: #10b981;">R$ {{ formatar(item.total) }}</strong>
            <button class="btn_del" @click="remover_uso(index)">🗑️</button>
        </div>
    </div>

    <div v-if="modal_tarifas_aberto" class="modal_overlay">
        <div class="modal_content">
            <h3>Configurar Tarifas</h3>
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
                <button @click="modal_tarifas_aberto = false" class="btn_secundario">Fechar</button>
            </div>
        </div>
    </div>

    <div v-if="modal_equipamento_aberto" class="modal_overlay">
        <div class="modal_content grande">
            <h3>Cadastrar Equipamento</h3>
            
            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Nome do Equipamento</label>
                    <input type="text" v-model="novo_eq.nome" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Tipo de Energia</label>
                    <select v-model="novo_eq.tipo" class="input_padrao">
                        <option value="ELETRICO">Elétrico (Watts)</option>
                        <option value="GAS">Gás (kg/h)</option>
                    </select>
                </div>
            </div>

            <div class="linha_dupla">
                <div class="grupo_input" v-if="novo_eq.tipo === 'ELETRICO'">
                    <label>Potência (Watts)</label>
                    <input type="number" v-model="novo_eq.potencia" class="input_padrao">
                </div>
                <div class="grupo_input" v-if="novo_eq.tipo === 'GAS'">
                    <label>Consumo (kg/h)</label>
                    <input type="number" step="0.001" v-model="novo_eq.consumo_gas" class="input_padrao">
                </div>
            </div>

            <hr class="divisor">
            <h4>Cálculo de Depreciação</h4>
            
            <div class="linha_tripla">
                <div class="grupo_input">
                    <label>Valor Compra (R$)</label>
                    <input type="number" v-model="novo_eq.valor_compra" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Valor Residual (Final)</label>
                    <input type="number" v-model="novo_eq.valor_residual" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Vida Útil (Anos)</label>
                    <input type="number" v-model="novo_eq.vida_util" class="input_padrao">
                </div>
            </div>

            <div class="box_resultado_depreciacao">
                Depreciação Mensal: <strong>R$ {{ calc_depreciacao_mensal }}</strong>
            </div>

            <div class="modal_actions">
                <button @click="modal_equipamento_aberto = false" class="btn_secundario">Cancelar</button>
                <button @click="salvar_equipamento" class="btn_primario">Salvar</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Estado das Tarifas (Ideal vir do Banco/LocalStorage)
const tarifas = ref({ energia: 0.95, gas: 9.50, mao_obra: 15.00 });

// Equipamentos Simulados (Substituir por API depois)
const lista_equipamentos = ref([
    { id: 1, nome: 'Forno Turbo', tipo: 'ELETRICO', potencia: 5000, depreciacao_mensal: 150 },
    { id: 2, nome: 'Fogão Industrial', tipo: 'GAS', consumo_gas: 0.500, depreciacao_mensal: 80 }
]);

const lista_uso_maquinas = ref([]);

// Modals
const modal_tarifas_aberto = ref(false);
const modal_equipamento_aberto = ref(false);

// Form Novo Equipamento
const novo_eq = ref({ nome: '', tipo: 'ELETRICO', potencia: 0, consumo_gas: 0, valor_compra: 0, valor_residual: 0, vida_util: 10 });

// Form Uso
const uso_temp = ref({ equipamento_id: '', minutos: 0, dados_eq: null });

// --- LÓGICA DEPRECIAÇÃO ---
const calc_depreciacao_mensal = computed(() => {
    const v_compra = parseFloat(novo_eq.value.valor_compra) || 0;
    const v_resid = parseFloat(novo_eq.value.valor_residual) || 0;
    const anos = parseFloat(novo_eq.value.vida_util) || 1;
    
    // (Valor - Residual) / Anos / 12 meses
    const anual = (v_compra - v_resid) / anos;
    return (anual / 12).toFixed(2);
});

// --- LÓGICA CÁLCULO CUSTO ---
const selecionar_maquina = () => {
    uso_temp.value.dados_eq = lista_equipamentos.value.find(e => e.id === uso_temp.value.equipamento_id);
};

const custo_uso_calculado = computed(() => {
    if (!uso_temp.value.dados_eq || !uso_temp.value.minutos) return "0.00";
    
    const eq = uso_temp.value.dados_eq;
    const horas = uso_temp.value.minutos / 60;
    
    let custo_combustivel = 0;
    if (eq.tipo === 'ELETRICO') {
        // (Watts / 1000) * Horas * Tarifa kWh
        custo_combustivel = (eq.potencia / 1000) * horas * tarifas.value.energia;
    } else {
        // kg/h * Horas * Tarifa kg
        custo_combustivel = eq.consumo_gas * horas * tarifas.value.gas;
    }

    // Depreciação proporcional às horas usadas (considerando mês de 220h comerciais ou 720h corridas? Vamos usar 220h úteis)
    const custo_depreciacao = (eq.depreciacao_mensal / 220) * horas;

    return (custo_combustivel + custo_depreciacao).toFixed(2);
});

// --- AÇÕES ---
const adicionar_uso = () => {
    const eq = uso_temp.value.dados_eq;
    const horas = uso_temp.value.minutos / 60;
    
    let custo_energia = 0;
    if (eq.tipo === 'ELETRICO') custo_energia = (eq.potencia / 1000) * horas * tarifas.value.energia;
    else custo_energia = eq.consumo_gas * horas * tarifas.value.gas;

    const custo_depreciacao = (eq.depreciacao_mensal / 220) * horas;

    lista_uso_maquinas.value.push({
        nome: eq.nome,
        minutos: uso_temp.value.minutos,
        custo_energia: custo_energia,
        custo_depreciacao: custo_depreciacao,
        total: custo_energia + custo_depreciacao
    });
    
    uso_temp.value.minutos = 0;
};

const remover_uso = (i) => lista_uso_maquinas.value.splice(i, 1);

const salvar_equipamento = () => {
    // Aqui você enviaria para o Banco de Dados (API Laravel)
    lista_equipamentos.value.push({
        id: Date.now(),
        nome: novo_eq.value.nome,
        tipo: novo_eq.value.tipo,
        potencia: novo_eq.value.potencia,
        consumo_gas: novo_eq.value.consumo_gas,
        depreciacao_mensal: parseFloat(calc_depreciacao_mensal.value)
    });
    modal_equipamento_aberto.value = false;
};

const abrir_modal_equipamento = () => {
    novo_eq.value = { nome: '', tipo: 'ELETRICO', potencia: 0, consumo_gas: 0, valor_compra: 0, valor_residual: 0, vida_util: 10 };
    modal_equipamento_aberto.value = true;
};

const formatar = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>

<style scoped>
.topo_maquinas { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.botoes_topo { display: flex; gap: 10px; }
.titulo_sub { color: var(--primary-color); margin: 0; }
.desc { color: var(--text-secondary); font-size: 13px; margin: 0; }

.btn_primario { background: var(--primary-color); color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn_secundario { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 15px; border-radius: 6px; cursor: pointer; }

/* Box Cálculo */
.box_calculo { background: var(--bg-page); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; }
.linha_calc { display: flex; gap: 15px; align-items: flex-end; }
.display_valor { padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: #10b981; border-radius: 6px; font-weight: bold; }
.botao_add { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; height: 42px; font-weight: bold; }
.botao_add:disabled { opacity: 0.5; }

/* Tabela */
.tabela_simples { border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
.cabecalho_tabela, .linha_tabela { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr; padding: 10px; }
.cabecalho_tabela { background: var(--bg-page); font-weight: bold; color: var(--text-secondary); }
.linha_tabela { border-top: 1px solid var(--border-color); color: var(--text-primary); align-items: center; }
.btn_del { background: none; border: none; cursor: pointer; filter: grayscale(1); }

/* Modals */
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal_content { background: var(--bg-card); padding: 25px; border-radius: 12px; width: 400px; border: 1px solid var(--border-color); color: var(--text-primary); }
.modal_content.grande { width: 600px; }
.modal_actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; }
.grupo_input label { display: block; margin-bottom: 5px; font-size: 13px; color: var(--text-secondary); }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; }
.divisor { border: 0; border-top: 1px solid var(--border-color); margin: 20px 0; }
.box_resultado_depreciacao { background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 6px; color: var(--primary-color); text-align: center; font-size: 1.1em; }
</style>