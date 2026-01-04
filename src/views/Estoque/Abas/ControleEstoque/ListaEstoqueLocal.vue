<template>
  <div>
    <div class="barra_ferramentas">
      <input type="text" v-model="busca" placeholder="🔍 Buscar por nome, EAN ou ID..." class="input_padrao">
    </div>

    <div class="table_container">
        <table class="tabela_produtos">
          <thead>
            <tr>
              <th width="50">ID</th>
              <th>Produto / Detalhes</th>
              <th>Custo</th>
              <th>Venda</th>
              <th>Validade</th>
              <th>Depósito</th> <th>Vitrine</th>  <th width="50">Ação</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="prod in lista_filtrada" :key="prod.id">
                
                <tr :class="{ 'linha_ativa': id_editando === prod.id }">
                    <td class="texto_destaque">#{{ prod.id }}</td>
                    
                    <td class="celula_produto">
                        <div class="nome_principal">{{ prod.nome }}</div>
                        <div class="texto_ean" v-if="prod.codigo_barras">||| {{ prod.codigo_barras }}</div>
                        <div class="texto_ean vazio" v-else>---</div>
                        <div class="area_cat"><span class="badge_cat">{{ prod.categoria }}</span></div>
                    </td>

                    <td class="texto_custo">R$ {{ formatar_valor(prod.preco_custo) }}</td>
                    <td class="texto_venda">R$ {{ formatar_valor(prod.preco_venda) }}</td>
                    
                    <td><span :class="verificar_validade(prod.validade)">{{ formatar_data(prod.validade) }}</span></td>

                    <td>
                        <span :class="{ 'estoque_baixo': prod.estoque_deposito <= (prod.estoque_minimo || 5) }">
                            {{ formatar_qtd(prod.estoque_deposito) }}
                        </span>
                        <small class="unidade">{{ prod.unidade_medida }}</small>
                    </td>

                    <td class="coluna_vitrine">
                        <span :class="{ 'vitrine_vazia': prod.estoque_vitrine <= 0 }">
                            {{ formatar_qtd(prod.estoque_vitrine) }}
                        </span>
                    </td>

                    <td>
                        <button class="botao_acao" @click="iniciar_edicao(prod)" title="Editar">
                            {{ id_editando === prod.id ? '🔼' : '✏️' }}
                        </button>
                    </td>
                </tr>
    
                <tr v-if="id_editando === prod.id" class="linha_edicao">
                    <td colspan="8"> <div class="box_edicao_expandida">
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
    
    <p v-if="lista_produtos.length === 0" class="aviso_vazio">
      Nenhum produto encontrado nesta loja.
    </p>

    <PasswordModal 
        :isOpen="modal_senha_aberto"
        mensagem="Senha para editar produto:"
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
const modal_senha_aberto = ref(false);
const prod_para_editar = ref(null);
const id_editando = ref(null);

const formatar_valor = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const formatar_qtd = (v) => parseFloat(v).toFixed(3).replace('.', ',').replace(',000', '');

const formatar_data = (data) => {
    if(!data) return '---';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
};

const verificar_validade = (data) => {
    if(!data) return 'tag_neutra';
    const hoje = new Date();
    const validade = new Date(data);
    const diffDias = (validade - hoje) / (1000 * 60 * 60 * 24);
    
    if (diffDias < 0) return 'tag_vencido'; 
    if (diffDias < 30) return 'tag_alerta'; 
    return 'tag_ok';
};

const lista_filtrada = computed(() => {
    if(!busca.value) return lista_produtos.value;
    const termo = busca.value.toLowerCase();
    return lista_produtos.value.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        String(p.id).includes(termo) ||
        (p.codigo_barras && p.codigo_barras.includes(termo))
    );
});

const carregar_produtos_locais = async () => {
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
    modal_senha_aberto.value = true;
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
    await carregar_produtos_locais();
};

onMounted(carregar_produtos_locais);
</script>

<style scoped>
.barra_ferramentas { margin-bottom: 15px; }
.input_padrao { width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--text-primary); }
.table_container { overflow-x: auto; }
.tabela_produtos { width: 100%; border-collapse: collapse; min-width: 800px; }
.tabela_produtos th { text-align: left; padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.tabela_produtos td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; vertical-align: middle; }

/* ESTILO COLUNA PRODUTO CONSOLIDADA */
.celula_produto { vertical-align: top; }
.nome_principal { font-weight: 600; font-size: 14px; color: var(--text-primary); margin-bottom: 3px; }
.texto_ean { font-family: monospace; font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
.texto_ean.vazio { opacity: 0.3; }
.area_cat { display: block; }
.badge_cat { background: var(--bg-page); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border-color); display: inline-block; }

/* FINANCEIRO */
.texto_custo { color: var(--text-secondary); font-size: 13px; }
.texto_venda { font-weight: bold; color: var(--text-primary); }

/* ESTILOS VITRINE */
.coluna_vitrine { font-weight: bold; color: #d97706; background-color: #fffbeb; text-align: center; }
.vitrine_vazia { color: #ef4444; opacity: 0.7; }
.unidade { font-size: 10px; color: #999; margin-left: 2px; }

/* Validade e Estoque */
.texto_destaque { color: var(--primary-color); font-weight: bold; font-size: 12px; }
.estoque_baixo { color: #ef4444; font-weight: bold; }
.botao_acao { background: none; border: 1px solid var(--border-color); padding: 5px; border-radius: 4px; cursor: pointer; }
.botao_acao:hover { background: var(--bg-page); }

/* Tags Validade */
.tag_vencido { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
.tag_alerta { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
.tag_neutra { color: var(--text-secondary); font-size: 11px; }
.tag_ok { color: #10b981; font-weight: 500; }

.linha_ativa { background-color: rgba(59, 130, 246, 0.05); }
.linha_edicao td { padding: 0; border: none; }
.box_edicao_expandida { background-color: white; border-bottom: 2px solid var(--primary-color); padding: 15px; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); }
.aviso_vazio { text-align: center; padding: 30px; color: var(--text-secondary); }
</style>