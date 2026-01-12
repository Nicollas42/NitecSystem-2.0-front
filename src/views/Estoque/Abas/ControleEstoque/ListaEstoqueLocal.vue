<template>
  <div>
    <div class="barra_topo_dep">
        <div class="titulo_area">
            <h4 class="titulo_texto">📦 Estoque DEP</h4>
        </div>

        <div class="controles_topo">
            <button class="botao_importar" @click="modal_xml_aberto = true" title="Importar XML">
                📄 <span class="texto_btn_mobile">Importar</span>
            </button>

            <select v-model="filtro_categoria" class="select_filtro">
                <option value="todos">📂 Categorias</option>
                <option v-for="cat in categorias_lista" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <select v-model="filtro_origem" class="select_filtro">
                <option value="local">🏠 Local</option>
                <option value="todos">🌎 Rede</option>
                <option value="externo">👻 Fora</option>
            </select>

            <select v-model="filtro_estoque" class="select_filtro">
                <option value="todos">📦 Saldos</option>
                <option value="com_estoque">🟢 > 0</option>
                <option value="zerados">🔴 0</option>
            </select>

            <input type="text" v-model="busca" placeholder="🔍 Buscar..." class="input_padrao">
        </div>
    </div>

    <div class="table_container">
        <table class="tabela_produtos">
          <thead>
            <tr>
              <th width="50" class="col_center">ID</th>
              <th class="col_left">Produto / Detalhes</th>
              <th class="col_left" width="180">Fornecedor</th> 
              <th class="col_center">Custo</th>
              <th class="col_center">Venda</th>
              <th class="col_center" width="140">Validade</th>
              <th class="col_center">Depósito</th>
              <th class="col_center" style="opacity: 0.6;">Vitrine</th>
              <th width="50" class="col_center">Ação</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(prod, idx) in lista_filtrada" :key="prod.id">
                
                <tr :class="{ 
                    'linha_ativa': id_editando === prod.id,
                    'linha_fantasma': prod.tem_cadastro == 0
                }"
                @click="prod.lotes && prod.lotes.length > 0 ? toggle_lotes(prod.id) : null"
                :style="prod.lotes && prod.lotes.length > 0 ? 'cursor: pointer;' : ''">
                    
                    <td class="texto_destaque col_center">
                        <span v-if="prod.lotes && prod.lotes.length > 0" style="font-size: 8px; margin-right: 4px;">
                            {{ ids_lotes_expandidos.includes(prod.id) ? '▼' : '▶' }}
                        </span>
                        #{{ prod.id }}
                    </td>
                    
                    <td class="celula_produto">
                        <div class="nome_principal">{{ prod.nome }}</div>
                        
                        <span v-if="prod.tem_cadastro == 0" class="badge_nao_cadastrado">
                            Não Cadastrado
                        </span>

                        <div class="texto_balanca" v-if="prod.codigo_balanca">
                             ⚖️ Cód: <strong>{{ prod.codigo_balanca }}</strong>
                        </div>
                        <div class="texto_ean" v-else-if="prod.codigo_barras">
                           🏷️ EAN: {{ prod.codigo_barras }}
                        </div>
                        <div class="texto_ean vazio" v-else>---</div>

                        <div class="area_cat">
                            <span class="badge_cat">{{ prod.categoria }}</span>
                        </div>
                    </td>

                    <td>
                        <div v-if="prod.fornecedor_nome" class="box_fornecedor">
                            <div class="nome_fornecedor">{{ prod.fornecedor_nome }}</div>
                            <div class="nome_vendedor" v-if="prod.vendedor_nome">
                                👤 {{ prod.vendedor_nome }}
                            </div>
                        </div>
                        <span v-else class="texto_vazio">--</span>
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
    
                    <td class="coluna_deposito col_center">
                        <span :class="{ 'estoque_baixo': prod.tem_cadastro == 1 && prod.estoque_deposito <= (prod.estoque_minimo || 5) }">
                            {{ formatar_qtd(prod.estoque_deposito) }}
                        </span>
                        <small class="unidade">{{ prod.unidade_medida }}</small>
                    </td>

                    <td class="col_center" style="opacity: 0.6;">
                        {{ formatar_qtd(prod.estoque_vitrine) }}
                        <small class="unidade">{{ prod.unidade_medida }}</small>
                    </td>

                    <td class="col_center">
                        <button class="botao_acao" @click.stop="iniciar_edicao(prod)" :title="prod.tem_cadastro == 0 ? 'Cadastrar nesta Loja' : 'Editar'">
                            {{ id_editando === prod.id ? '🔼' : (prod.tem_cadastro == 0 ? '➕' : '✏️') }}
                        </button>
                    </td>
                </tr>

                <template v-if="ids_lotes_expandidos.includes(prod.id)">
                    <tr v-for="lote in prod.lotes" :key="'lote-'+lote.id" class="agrupamento_lote">
                        <td class="col_center" style="opacity: 0.3;">↳</td>
                        <td colspan="2">
                            <span style="font-weight: 600; font-size: 11px; color: #4b5563;">🏷️ {{ lote.fornecedor_nome }}</span>
                            <small style="font-size: 9px; margin-left: 8px; color: #9ca3af;">(Entrada: {{ formatar_data_simples(lote.data_entrada) }})</small>
                        </td>
                        <td class="col_center" style="font-size: 11px; color: #6b7280;">R$ {{ formatar_valor(lote.preco_custo) }}</td>
                        <td class="col_center">---</td>
                        <td class="col_center">
                            <span :class="['badge_validade_lote', calcular_situacao_validade(lote.validade).classe]">
                                {{ lote.validade ? formatar_data_simples(lote.validade) : 'N/A' }}
                            </span>
                        </td>
                        <td class="col_center">
                            <strong style="font-size: 12px;">{{ formatar_qtd(lote.quantidade_atual) }}</strong>
                        </td>
                        <td colspan="2"></td>
                    </tr>
                </template>
    
                <tr v-if="id_editando === prod.id" class="linha_edicao">
                    <td colspan="9"> <div class="box_edicao_expandida">
                            <p v-if="prod.tem_cadastro == 0" class="aviso_novo_cadastro">
                                ✨ <strong>Novo Cadastro Local:</strong> Este produto existe na rede, mas não nesta filial. Ao salvar, ele será ativado no seu estoque.
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
      Nenhum produto encontrado nestes filtros.
    </p>

    <ModalImportacaoNota 
        v-if="modal_xml_aberto"
        @close="modal_xml_aberto = false"
        @importado="aoImportarNota"
    />

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
import { api_request } from '@/services/api_helper';
import CadastroProduto from './CadastroProduto.vue';
import PasswordModal from '../../../Configuracoes/Components/PasswordModal.vue'; 
import ModalImportacaoNota from './ModalImportacaoNota.vue';

const lista_produtos = ref([]);
const busca = ref('');
const filtro_origem = ref('local'); 
const filtro_estoque = ref('todos');
const filtro_categoria = ref('todos');

const categorias_lista = ["Panificação", "Confeitaria", "Bebidas", "Frios", "Insumos", "Outros"];

const modal_senha_aberto = ref(false);
const modal_xml_aberto = ref(false); 
const prod_para_editar = ref(null);
const id_editando = ref(null);
const ids_lotes_expandidos = ref([]);

const formatar_valor = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const formatar_qtd = (v) => parseFloat(v).toFixed(3).replace('.', ',').replace(',000', '');
const formatar_data_simples = (data) => data ? new Date(data).toLocaleDateString('pt-BR') : '--/--/--';

const toggle_lotes = (id) => {
    const index = ids_lotes_expandidos.value.indexOf(id);
    if (index > -1) ids_lotes_expandidos.value.splice(index, 1);
    else ids_lotes_expandidos.value.push(id);
};

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

const aoImportarNota = () => {
    modal_xml_aberto.value = false;
    carregar_produtos_locais();
    alert("✅ Sucesso! O estoque foi atualizado com os itens da nota.");
};

const lista_filtrada = computed(() => {
    let lista = Array.isArray(lista_produtos.value) ? lista_produtos.value : [];
    
    if (filtro_origem.value === 'local') lista = lista.filter(p => p.tem_cadastro == 1);
    else if (filtro_origem.value === 'externo') lista = lista.filter(p => p.tem_cadastro == 0);
    
    if (filtro_estoque.value === 'com_estoque') lista = lista.filter(p => parseFloat(p.estoque_deposito) > 0);
    else if (filtro_estoque.value === 'zerados') lista = lista.filter(p => parseFloat(p.estoque_deposito) <= 0);

    if (filtro_categoria.value !== 'todos') {
        lista = lista.filter(p => p.categoria === filtro_categoria.value);
    }

    if (busca.value) {
        const termo = busca.value.toLowerCase();
        lista = lista.filter(p => 
            p.nome.toLowerCase().includes(termo) || 
            String(p.id).includes(termo) ||
            (p.codigo_barras && p.codigo_barras.includes(termo)) ||
            (p.codigo_balanca && String(p.codigo_balanca).includes(termo)) ||
            (p.fornecedor_nome && p.fornecedor_nome.toLowerCase().includes(termo))
        );
    }
    return lista;
});

const carregar_produtos_locais = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    if (!lojaId) return;
    try {
        const res = await api_request('get', '/produtos', { params: { loja_id: lojaId } });
        lista_produtos.value = res || [];
    } catch (e) { console.error(e); }
};

const iniciar_edicao = (prod) => {
    if (id_editando.value === prod.id) { id_editando.value = null; return; }
    prod_para_editar.value = prod;
    if (prod.tem_cadastro == 0) id_editando.value = prod.id;
    else modal_senha_aberto.value = true;
};

const senha_confirmada = async (senha) => {
    try {
        await api_request('post', '/verificar-senha', { password: senha });
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
/* AQUI ESTÁ A MÁGICA PARA DEIXAR TUDO NA MESMA LINHA */
.barra_topo_dep { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 15px; 
    gap: 10px; 
    white-space: nowrap; /* Evita quebra de linha do texto */
}

.titulo_area { flex-shrink: 0; margin-right: 10px; }
.titulo_texto { color: var(--primary-color); margin: 0; font-size: 1.1rem; }

/* Controles alinhados e compactos */
.controles_topo { 
    display: flex; 
    gap: 8px; 
    align-items: center; 
    flex-wrap: nowrap; /* Força ficar na mesma linha em desktop */
    overflow-x: auto; /* Permite scroll horizontal em mobile se estourar */
    padding-bottom: 2px; /* Espaço para scrollbar */
}

.botao_importar { 
    background-color: #0ea5e9; color: white; border: none; 
    padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; 
    display: flex; align-items: center; gap: 5px; font-size: 13px; 
    flex-shrink: 0;
}
.botao_importar:hover { background-color: #0284c7; }

/* Inputs mais compactos para caber tudo */
.select_filtro { 
    padding: 6px 4px; border: 1px solid var(--border-color); border-radius: 6px; 
    background: var(--bg-page); color: var(--text-primary); font-weight: 500; 
    cursor: pointer; font-size: 13px; 
    min-width: 100px; /* Reduzido de 140px */
}

.input_padrao { 
    width: 140px; /* Reduzido de 200px */
    padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; 
    background: var(--input-bg); color: var(--text-primary); font-size: 13px;
}

/* Responsividade para telas muito pequenas */
@media (max-width: 768px) {
    .barra_topo_dep { flex-direction: column; align-items: flex-start; }
    .controles_topo { width: 100%; justify-content: space-between; }
    .input_padrao { width: 100%; }
    .texto_btn_mobile { display: none; } /* Opcional: Esconde texto do botão em mobile */
}

/* Restante dos estilos mantido */
.table_container { overflow-x: auto; }
.tabela_produtos { width: 100%; border-collapse: collapse; min-width: 900px; }
.tabela_produtos th { padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.tabela_produtos td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; vertical-align: middle; }

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
.badge_cat { background: var(--bg-page); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border-color); margin-top: 2px; display: inline-block; }
.texto_custo { color: var(--text-secondary); }
.texto_venda { font-weight: bold; }
.texto_destaque { color: var(--primary-color); font-weight: bold; }
.texto_vazio { color: #ccc; font-size: 12px; }

.box_validade { display: flex; flex-direction: column; align-items: center; padding: 4px; border-radius: 6px; width: 100px; margin: 0 auto; }
.dias_restantes { font-weight: 800; font-size: 13px; }
.status_validade { font-size: 10px; font-weight: 600; text-transform: uppercase; }
.status_vencido { background: #fee2e2; color: #991b1b; } .status_critico { background: #fee2e2; color: #ef4444; } .status_atencao { background: #ffedd5; color: #c2410c; } .status_proximo { background: #fef9c3; color: #a16207; } .status_ok { background: #f0fdf4; color: #15803d; }
.coluna_deposito { font-weight: bold; background: rgba(59, 130, 246, 0.05); border-radius: 4px; }
.estoque_baixo { color: #ef4444; }
.unidade { font-size: 10px; color: #999; margin-left: 2px; }
.botao_acao { border: 1px solid var(--border-color); background: none; padding: 5px; border-radius: 4px; cursor: pointer; }
.linha_ativa { background: rgba(59, 130, 246, 0.05); opacity: 1 !important; filter: none !important; }
.box_edicao_expandida { background: white; border-bottom: 2px solid var(--primary-color); padding: 15px; }
.aviso_vazio { text-align: center; padding: 30px; color: var(--text-secondary); }

.box_fornecedor { line-height: 1.2; }
.nome_fornecedor { font-weight: 600; color: var(--text-primary); font-size: 13px; }
.nome_vendedor { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }

.agrupamento_lote td { border-top: none !important; padding-top: 2px; padding-bottom: 2px; color: #6b7280; font-size: 11px; }
.agrupamento_lote { background-color: #f9fafb; } 
.agrupamento_lote td:first-child { border-left: 3px solid var(--primary-color); }
.badge_validade_lote { font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: bold; }
</style>