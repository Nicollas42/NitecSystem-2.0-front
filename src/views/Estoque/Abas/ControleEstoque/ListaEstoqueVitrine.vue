<template>
  <div>
    <div class="barra_topo">
        <div class="titulo_area">
            <h4 style="color: #d97706; margin: 0;">🏪 Vitrine / Frente de Loja</h4>
        </div>

        <div class="controles_topo">
            <select v-model="filtro_origem" class="select_filtro">
                <option value="local">🏠 Apenas desta Filial</option>
                <option value="todos">🌎 Ver Todos (Rede)</option>
                <option value="externo">👻 Não Cadastrados</option>
            </select>

            <select v-model="filtro_estoque" class="select_filtro">
                <option value="com_estoque">🟢 Em Exposição (>0)</option>
                <option value="zerados">🔴 Sem Exposição (0)</option>
                <option value="todos">📦 Todos</option>
            </select>

            <input type="text" v-model="busca" placeholder="🔍 Buscar na vitrine..." class="input_padrao">
        </div>
    </div>

    <div class="table_container">
        <table class="tabela_produtos">
          <thead>
            <tr>
              <th width="50" class="col_center">ID</th>
              <th class="col_left">Produto</th>
              <th class="col_center">Custo</th>
              <th class="col_center">Venda</th>
              <th class="col_center" width="140">Validade</th>
              <th class="col_center">Depósito</th>
              <th class="col_center">Vitrine</th>
              <th width="50" class="col_center">Ação</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="prod in lista_filtrada" :key="prod.id">
                
                <tr :class="{ 
                    'linha_ativa': id_editando === prod.id,
                    'linha_fantasma': prod.tem_cadastro == 0 
                }">
                    <td class="texto_destaque col_center">#{{ prod.id }}</td>
                    
                    <td class="celula_produto">
                        <div class="nome_principal">{{ prod.nome }}</div>
                        
                        <span v-if="prod.tem_cadastro == 0" class="badge_nao_cadastrado">
                            Não Cadastrado
                        </span>

                        <div class="texto_balanca" v-if="prod.codigo_balanca">
                             ⚖️ Cód: <strong>{{ prod.codigo_balanca }}</strong>
                        </div>
                        <div class="texto_ean" v-else-if="prod.codigo_barras">
                             ||| {{ prod.codigo_barras }}
                        </div>
                        <div class="texto_ean vazio" v-else>---</div>

                        <div class="area_cat">
                            <span class="badge_cat">{{ prod.categoria }}</span>
                        </div>
                    </td>

                    <td class="col_center texto_custo">R$ {{ formatar_valor(prod.preco_custo) }}</td>
                    <td class="col_center texto_venda">R$ {{ formatar_valor(prod.preco_venda) }}</td>
                    
                    <td class="col_center">
                        <div v-if="prod.validade" :class="['box_validade', calcular_situacao_validade(prod.validade).classe]">
                            <span class="dias_restantes">
                                {{ calcular_situacao_validade(prod.validade).dias }} dias
                            </span>
                        </div>
                        <span v-else class="texto_vazio">---</span>
                    </td>
    
                    <td class="col_center" style="opacity: 0.6;">
                        {{ formatar_qtd(prod.estoque_deposito) }}
                        <small class="unidade">{{ prod.unidade_medida }}</small>
                    </td>

                    <td class="coluna_vitrine_ativa col_center">
                        <span :class="{ 'estoque_zerado': parseFloat(prod.estoque_vitrine) <= 0 }">
                            {{ formatar_qtd(prod.estoque_vitrine) }}
                        </span>
                        <small class="unidade">{{ prod.unidade_medida }}</small>
                    </td>

                    <td class="col_center">
                        <button class="botao_acao" @click="iniciar_edicao(prod)" :title="prod.tem_cadastro == 0 ? 'Ativar na Vitrine' : 'Editar'">
                            {{ id_editando === prod.id ? '🔼' : (prod.tem_cadastro == 0 ? '➕' : '✏️') }}
                        </button>
                    </td>
                </tr>
    
                <tr v-if="id_editando === prod.id" class="linha_edicao">
                    <td colspan="8">
                        <div class="box_edicao_expandida">
                            <p v-if="prod.tem_cadastro == 0" class="aviso_novo_cadastro">
                                ✨ <strong>Ativar Produto:</strong> Este item existe na rede. Salve para trazê-lo para sua Vitrine.
                            </p>
                            <p v-else style="margin-bottom:10px; color:var(--text-secondary); font-size:13px;">
                                ℹ️ Ajuste os valores abaixo para transferir do Depósito para Vitrine.
                            </p>
                            
                            <CadastroProduto 
                                :produtoEdicao="prod" 
                                @salvo="finalizar_edicao" 
                                @cancelar="id_editando = null"
                            />
                        </div>
                    </td>
                </tr>
    
            </template>
          </tbody>
        </table>
    </div>
    
    <p v-if="lista_filtrada.length === 0" class="aviso_vazio">
      Nenhum produto encontrado com estes filtros.
    </p>

    <PasswordModal 
        :isOpen="modal_senha_aberto"
        mensagem="Senha para editar estoque:"
        @close="modal_senha_aberto = false"
        @confirm="senha_confirmada"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CadastroProduto from './CadastroProduto.vue';
import PasswordModal from '../../../Configuracoes/Components/PasswordModal.vue'; 

const lista_produtos = ref([]);
const busca = ref('');
const filtro_origem = ref('local'); 
const filtro_estoque = ref('com_estoque'); // Padrão: Vitrine Limpa (só o que tem saldo)
const modal_senha_aberto = ref(false);
const prod_para_editar = ref(null);
const id_editando = ref(null);

const formatar_valor = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const formatar_qtd = (v) => parseFloat(v).toFixed(3).replace('.', ',').replace(',000', '');

const calcular_situacao_validade = (dataValidade) => {
    if (!dataValidade) return { dias: 0, label: '', classe: '' };
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const validade = new Date(dataValidade + 'T00:00:00');
    const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
    if (dias <= 0) return { dias, label: '❌ Vencido', classe: 'status_vencido' };
    if (dias <= 10) return { dias, label: '🔴 Crítico', classe: 'status_critico' };
    if (dias <= 20) return { dias, label: '🟠 Atenção', classe: 'status_atencao' };
    if (dias <= 29) return { dias, label: '🟡 Próximo', classe: 'status_proximo' };
    return { dias, label: '🟢 OK', classe: 'status_ok' };
};

// --- NOVA LÓGICA DE FILTRO (VITRINE) ---
const lista_filtrada = computed(() => {
    let lista = lista_produtos.value;

    // 1. Filtro de Origem
    if (filtro_origem.value === 'local') {
        lista = lista.filter(p => p.tem_cadastro == 1);
    } else if (filtro_origem.value === 'externo') {
        lista = lista.filter(p => p.tem_cadastro == 0);
    }

    // 2. Filtro de Estoque (VITRINE)
    if (filtro_estoque.value === 'com_estoque') {
        lista = lista.filter(p => parseFloat(p.estoque_vitrine) > 0);
    } else if (filtro_estoque.value === 'zerados') {
        lista = lista.filter(p => parseFloat(p.estoque_vitrine) <= 0);
    }
    // 'todos' não filtra nada

    // 3. Busca Texto
    if(busca.value) {
        const termo = busca.value.toLowerCase();
        lista = lista.filter(p => 
            p.nome.toLowerCase().includes(termo) ||
            String(p.id).includes(termo) ||
            (p.codigo_barras && p.codigo_barras.includes(termo)) ||
            (p.codigo_balanca && String(p.codigo_balanca).includes(termo))
        );
    }
    return lista;
});

const carregar_vitrine = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    if (!lojaId) return;
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        lista_produtos.value = res.data;
    } catch (e) { console.error(e); }
};

const iniciar_edicao = (prod) => {
    if (id_editando.value === prod.id) { id_editando.value = null; return; }
    prod_para_editar.value = prod;
    
    // Se for cadastro novo, pula senha
    if (prod.tem_cadastro == 0) {
        id_editando.value = prod.id;
    } else {
        modal_senha_aberto.value = true;
    }
};

const senha_confirmada = async (senha) => {
    try {
        await axios.post('http://127.0.0.1:8000/api/verificar-senha', { password: senha }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        modal_senha_aberto.value = false;
        id_editando.value = prod_para_editar.value.id;
        prod_para_editar.value = null;
    } catch (error) { alert("Senha incorreta!"); }
};

const finalizar_edicao = async () => {
    id_editando.value = null;
    await carregar_vitrine();
};

onMounted(carregar_vitrine);
</script>

<style scoped>
.barra_topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
.titulo_area { display: flex; align-items: center; gap: 10px; }
.controles_topo { display: flex; gap: 10px; align-items: center; }

/* Selects */
.select_filtro { padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-page); color: var(--text-primary); font-weight: 500; cursor: pointer; min-width: 160px; }
.input_padrao { width: 200px; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); }

/* TABELA */
.table_container { overflow-x: auto; }
.tabela_produtos { width: 100%; border-collapse: collapse; min-width: 900px; }
.tabela_produtos th { padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.tabela_produtos td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; vertical-align: middle; }

/* VISUAL FANTASMA */
.linha_fantasma { background-color: rgba(0,0,0,0.02); opacity: 0.6; filter: grayscale(0.8); }
.linha_fantasma:hover { opacity: 1; filter: grayscale(0); background-color: white; transition: all 0.2s; }

.badge_nao_cadastrado { display: inline-block; font-size: 10px; background: #e5e7eb; color: #6b7280; padding: 2px 6px; border-radius: 4px; margin-bottom: 3px; border: 1px dashed #9ca3af; }
.aviso_novo_cadastro { color: #059669; background: #d1fae5; padding: 10px; border-radius: 6px; border: 1px dashed #10b981; margin-bottom: 10px; font-size: 13px; }

.col_center { text-align: center; }
.col_left { text-align: left; }
.celula_produto { text-align: left; }
.nome_principal { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
.texto_balanca { font-size: 11px; color: #d97706; background: #fffbeb; padding: 2px 5px; border-radius: 4px; border: 1px solid #fcd34d; display: inline-block; margin-bottom: 4px; }
.texto_ean { font-family: monospace; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; }
.badge_cat { background: var(--bg-page); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border-color); }
.texto_custo { color: var(--text-secondary); }
.texto_venda { font-weight: bold; }
.texto_destaque { color: var(--primary-color); font-weight: bold; }
.texto_vazio { color: #ccc; font-size: 12px; }

/* Validade */
.box_validade { display: flex; flex-direction: column; align-items: center; padding: 4px; border-radius: 6px; width: 100px; margin: 0 auto; }
.dias_restantes { font-weight: 800; font-size: 13px; }
.status_validade { font-size: 10px; font-weight: 600; text-transform: uppercase; }
.status_vencido { background: #fee2e2; color: #991b1b; } .status_critico { background: #fee2e2; color: #ef4444; } .status_atencao { background: #ffedd5; color: #c2410c; } .status_proximo { background: #fef9c3; color: #a16207; } .status_ok { background: #f0fdf4; color: #15803d; }

.coluna_vitrine_ativa { background: #fffbeb; color: #d97706; font-weight: bold; border-radius: 4px; }
.estoque_zerado { color: #9ca3af; font-weight: normal; } /* Cinza se zerado */

.unidade { font-size: 10px; color: #999; margin-left: 2px; }
.botao_acao { border: 1px solid var(--border-color); background: none; padding: 5px; border-radius: 4px; cursor: pointer; }
.linha_ativa { background: rgba(59, 130, 246, 0.05); opacity: 1 !important; filter: none !important; }
.box_edicao_expandida { background: white; border-bottom: 2px solid #d97706; padding: 15px; }
.aviso_vazio { text-align: center; padding: 30px; color: var(--text-secondary); }
</style>