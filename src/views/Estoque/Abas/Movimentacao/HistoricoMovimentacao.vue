<template>
  <div>
    <div class="topo_filtros">
        <h4 style="color: #6366f1; margin: 0 0 10px 0;">Histórico de Movimentações</h4>
        
        <div class="linha_filtros">
            <div class="grupo">
                <label>Data Início</label>
                <input type="date" v-model="filtros.data_inicio" class="input_pequeno">
            </div>
            <div class="grupo">
                <label>Data Fim</label>
                <input type="date" v-model="filtros.data_fim" class="input_pequeno">
            </div>
            <div class="grupo">
                <label>Tipo</label>
                <select v-model="filtros.tipo" class="input_pequeno">
                    <option value="">Todos</option>
                    <option value="ENTRADA">Entrada</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                    <option value="PERDA">Perda</option>
                </select>
            </div>
            <div class="grupo" style="flex: 2;">
                <BuscaProdutoInput 
                    label="Filtrar por Produto"
                    placeholder="Todos os produtos..."
                    :lista="lista_produtos"
                    v-model="texto_busca"
                    @selecionado="selecionar_produto"
                />
            </div>

            <button class="btn_filtrar" @click="buscar_historico">🔎 Filtrar</button>
        </div>
    </div>

    <div class="table_container">
        <table class="tabela_hist">
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Produto</th>
                    <th>Operação</th>
                    <th>Origem -> Destino</th>
                    <th>Qtd</th>
                    <th>Motivo / Obs</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in historico" :key="item.id">
                    <td>{{ formatar_data(item.created_at) }}</td>
                    <td>{{ item.produto_nome }}</td>
                    <td>
                        <span :class="['badge_tipo', item.tipo_operacao.toLowerCase()]">
                            {{ item.tipo_operacao }}
                        </span>
                    </td>
                    <td class="fluxo">
                        {{ item.origem }} ➝ {{ item.destino }}
                    </td>
                    <td style="font-weight: bold;">
                        {{ parseFloat(item.quantidade).toFixed(3).replace('.',',') }} {{ item.unidade_medida }}
                    </td>
                    
                    <td 
                        class="celula_clicavel" 
                        @click="abrir_modal_observacao(item.motivo)"
                        title="Clique para ler completo"
                    >
                        {{ truncarTexto(item.motivo) }}
                        <span v-if="item.motivo && item.motivo.length > 40" style="font-size:10px; opacity:0.7;">(ver mais)</span>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div v-if="historico.length === 0" class="aviso_vazio">
            Nenhum registro encontrado para este filtro.
        </div>
    </div>

    <ModalLeitura 
        v-model:visivel="modalObs.aberto"
        titulo="Detalhe da Movimentação"
        :conteudo="modalObs.texto"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import axios from 'axios';
import BuscaProdutoInput from '@/components/BuscaProdutoInput.vue';
import ModalLeitura from '@/components/ModalLeitura.vue'; // <--- IMPORTAR

const lista_produtos = ref([]);
const historico = ref([]);
const texto_busca = ref('');

const filtros = ref({
    data_inicio: '',
    data_fim: '',
    tipo: '',
    produto_id: ''
});

// Estado do Modal
const modalObs = reactive({
    aberto: false,
    texto: ''
});

watch(texto_busca, (val) => {
    if (!val) filtros.value.produto_id = '';
});

const carregar_produtos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        lista_produtos.value = res.data;
    } catch (e) { console.error(e); }
};

const selecionar_produto = (prod) => {
    filtros.value.produto_id = prod.id;
};

const buscar_historico = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/movimentacao/historico', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { 
                loja_id: lojaId,
                ...filtros.value
            }
        });
        historico.value = res.data;
    } catch (e) { console.error(e); }
};

const formatar_data = (dataIso) => {
    const d = new Date(dataIso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// --- NOVAS FUNÇÕES ---
const truncarTexto = (texto) => {
    if (!texto) return '---';
    if (texto.length > 40) {
        return texto.substring(0, 40) + '...';
    }
    return texto;
};

const abrir_modal_observacao = (texto) => {
    if (!texto) return;
    modalObs.texto = texto;
    modalObs.aberto = true;
};

onMounted(() => {
    carregar_produtos();
    buscar_historico();
});
</script>

<style scoped>
.topo_filtros { background: var(--bg-card); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; }
.linha_filtros { display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; }
.grupo { flex: 1; min-width: 150px; }
.grupo label { display: block; font-size: 11px; font-weight: bold; margin-bottom: 4px; color: var(--text-secondary); }
.input_pequeno { width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--input-bg); color: var(--text-primary); font-size: 13px; }

.btn_filtrar { padding: 8px 20px; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer; height: 35px; font-weight: bold; margin-bottom: 2px; }

.table_container { overflow-x: auto; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); }
.tabela_hist { width: 100%; border-collapse: collapse; min-width: 800px; }
.tabela_hist th { text-align: left; padding: 12px; background: var(--bg-page); color: var(--text-secondary); font-size: 12px; border-bottom: 1px solid var(--border-color); }
.tabela_hist td { padding: 10px 12px; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-primary); }

.badge_tipo { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
.badge_tipo.entrada { background: #dcfce7; color: #166534; }
.badge_tipo.transferencia { background: #dbeafe; color: #1e40af; }
.badge_tipo.perda { background: #fee2e2; color: #991b1b; }

.fluxo { font-family: monospace; color: var(--text-primary); }
.aviso_vazio { padding: 30px; text-align: center; color: var(--text-secondary); font-style: italic; }

/* ESTILO DA CÉLULA CLICÁVEL */
.celula_clicavel { cursor: pointer; color: var(--text-secondary); font-style: italic; transition: color 0.2s; max-width: 250px; }
.celula_clicavel:hover { color: var(--primary-color); text-decoration: underline; background: var(--hover-bg); }
</style>