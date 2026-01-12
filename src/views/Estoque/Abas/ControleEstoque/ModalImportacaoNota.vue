<template>
  <div class="modal_overlay">
    <div class="modal_content">
        
        <div class="modal_header_tabs">
            <div class="titulo_area">
                <h3>📥 Entrada de Nota Fiscal</h3>
            </div>
            <div class="tabs_controle">
                <button :class="['tab_btn', modo === 'xml' ? 'ativo' : '']" @click="modo = 'xml'">
                    📄 XML (Automático)
                </button>
                <button :class="['tab_btn', modo === 'manual' ? 'ativo' : '']" @click="ativarModoManual">
                    ⌨️ Digitação Manual
                </button>
            </div>
            <button class="btn_fechar_topo" @click="$emit('close')">✖</button>
        </div>

        <div class="modal_body">
            
            <div v-if="modo === 'xml'">
                <div v-if="etapa === 1" class="area_upload">
                    <div class="icone_upload">📄</div>
                    <p>Selecione ou arraste o arquivo XML da NFe</p>
                    <input type="file" ref="fileInput" accept=".xml" @change="processarArquivo" class="input_arquivo">
                    <div v-if="lendo" class="loading_state"><span class="spinner">↻</span> Lendo XML...</div>
                </div>

                <div v-if="etapa === 2">
                    <div class="info_nota">
                        <div class="info_topo">
                            <span class="label_fornecedor">🏢 {{ dadosNota.fornecedor_nome }}</span>
                            <span class="badge_total">R$ {{ dadosNota.total_nota }}</span>
                        </div>
                        <div class="info_meta">
                            <span>📄 Nota: <strong>{{ dadosNota.numero }}</strong></span>
                            <span>📅 Emissão: <strong>{{ dadosNota.data }}</strong></span>
                        </div>
                    </div>

                    <div class="tabela_scroll">
                        <table class="tabela_vinculo">
                            <thead>
                                <tr>
                                    <th>Produto no XML</th>
                                    <th class="col_center">Qtd</th>
                                    <th class="col_center">Custo Un.</th>
                                    <th>Vincular ao Sistema</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in itensNota" :key="index" :class="{'item_ok': item.produto_sistema_id}">
                                    <td>
                                        <div class="nome_xml">{{ item.nome_produto_xml }}</div>
                                        <div class="cods_xml"><span class="tag_xml">Cód: {{ item.codigo_produto_xml }}</span></div>
                                    </td>
                                    <td class="col_center"><strong>{{ parseFloat(item.quantidade) }}</strong> <small>{{ item.unidade_comercial }}</small></td>
                                    <td class="col_center">R$ {{ parseFloat(item.valor_unitario).toFixed(2) }}</td>
                                    <td>
                                        <select 
                                            :value="item.produto_sistema_id" 
                                            @change="(e) => verificarAcaoSelect(item, e.target.value)"
                                            class="select_vinculo"
                                            :class="{'select_novo': item.produto_sistema_id === 'novo'}"
                                        >
                                            <option :value="null">❓ Selecione...</option>
                                            <option value="novo">✨ CADASTRAR NOVO</option>
                                            <optgroup label="Produtos Existentes">
                                                <option v-for="prod in listaProdutosSistema" :key="prod.id" :value="prod.id">{{ prod.nome }}</option>
                                            </optgroup>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div v-if="modo === 'manual'" class="container_manual">
                
                <FormCabecalhoNota 
                    v-model="notaManual"
                    :fornecedores="listaFornecedores"
                    :total="calcularTotalManual"
                    @novo-fornecedor="abrirModalFornecedor"
                />

                <TabelaItensNotaManual 
                    :itens="itensManuais"
                    :produtos="listaProdutosSistema"
                    @add="adicionarLinhaManual"
                    @remove="removerLinhaManual"
                    @criar-produto="abrirModalCadastroManual" 
                />

            </div>

        </div>

        <div class="modal_footer">
            <template v-if="modo === 'xml' && etapa === 2">
                <button class="btn_voltar" @click="etapa = 1">Voltar</button>
                <button class="btn_confirmar" @click="confirmarImportacaoXML" :disabled="!todosVinculados || salvando">
                    {{ salvando ? 'Processando...' : '✅ Confirmar XML' }}
                </button>
            </template>

            <template v-if="modo === 'manual'">
                <div class="aviso_manual">⚠️ Confira os custos antes de salvar.</div>
                <button class="btn_confirmar" @click="confirmarImportacaoManual" :disabled="itensManuais.length === 0 || salvando">
                    {{ salvando ? 'Salvando...' : '💾 Salvar Nota Manual' }}
                </button>
            </template>
        </div>

        <div v-if="modalCadastroAberto" class="modal_overlay_interno">
            <div class="modal_content_interno">
                <div class="header_interno">
                    <h4>✨ Cadastro Rápido de Produto</h4>
                    <button class="btn_fechar_interno" @click="modalCadastroAberto = false">✖</button>
                </div>
                <div class="body_interno">
                    <p v-if="modo === 'xml'" class="aviso_preenchimento">ℹ️ Dados importados do XML. Confira a conversão.</p>
                    <p v-else class="aviso_preenchimento">ℹ️ Cadastro manual. Preencha os dados do item novo.</p>
                    
                    <CadastroProduto 
                        :produtoEdicao="dadosParaCadastro" 
                        @salvo="produtoCadastradoSucesso"
                        @cancelar="modalCadastroAberto = false"
                    />
                </div>
            </div>
        </div>

        <ModalCadastroFornecedor 
            v-model:visivel="modalFornecedorAberto"
            @salvo="aoSalvarFornecedor"
        />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api_request } from '@/services/api_helper';
import axios from 'axios'; 
import CadastroProduto from './CadastroProduto.vue'; 
import ModalCadastroFornecedor from '@/components/ModalCadastroFornecedor.vue';
import FormCabecalhoNota from './Partials/FormCabecalhoNota.vue'; 
import TabelaItensNotaManual from './Partials/TabelaItensNotaManual.vue';

const emit = defineEmits(['close', 'importado']);

// --- ESTADOS GERAIS ---
const modo = ref('xml');
const lendo = ref(false);
const salvando = ref(false);
const fileInput = ref(null);
const modalCadastroAberto = ref(false);
const modalFornecedorAberto = ref(false);
const listaFornecedores = ref([]);
const listaProdutosSistema = ref([]);

// --- ESTADOS XML ---
const etapa = ref(1);
const dadosNota = ref({});
const itensNota = ref([]);
const itemSendoCadastrado = ref(null); // Referência ao item da lista (XML ou Manual) que disparou o cadastro
const dadosParaCadastro = ref(null);

// --- ESTADOS MANUAL ---
const notaManual = ref({ fornecedor_id: '', numero: '', data: new Date().toISOString().substr(0, 10) });
const itensManuais = ref([]);

// --- INICIALIZAÇÃO ---
onMounted(async () => {
    await carregarProdutosSistema();
});

const carregarProdutosSistema = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    const res = await api_request('get', '/produtos', { params: { loja_id: lojaId } });
    listaProdutosSistema.value = res || [];
};

const carregarFornecedores = async () => {
    if (listaFornecedores.value.length > 0) return;
    try {
        const res = await api_request('get', '/fornecedores');
        listaFornecedores.value = res || [];
    } catch (e) { console.error(e); }
};

const ativarModoManual = () => {
    modo.value = 'manual';
    carregarFornecedores();
    if(itensManuais.value.length === 0) adicionarLinhaManual();
};

const abrirModalFornecedor = () => {
    modalFornecedorAberto.value = true;
};

const aoSalvarFornecedor = (novoFornecedor) => {
    listaFornecedores.value.push(novoFornecedor);
    notaManual.value.fornecedor_id = novoFornecedor.id; // Seleciona automaticamente
    modalFornecedorAberto.value = false;
};

// --- LÓGICA MANUAL ---
const adicionarLinhaManual = () => {
    itensManuais.value.push({ produto_id: null, quantidade: 1, valor_unitario: 0 });
};

const removerLinhaManual = (idx) => {
    itensManuais.value.splice(idx, 1);
};

// Abre o modal de cadastro vindo da tabela manual (Evento 'criar-produto')
const abrirModalCadastroManual = (itemLinha) => {
    itemSendoCadastrado.value = itemLinha; // Guarda a referência da linha
    
    // Prepara formulário limpo para o novo produto
    dadosParaCadastro.value = {
        nome: '',
        codigo_barras: '',
        preco_custo: itemLinha.valor_unitario || 0,
        unidade_medida: 'UN', 
        tipo_item: 'REVENDA',
        categoria: 'Outros',
        fornecedor_id: notaManual.value.fornecedor_id || null, // Tenta usar o fornecedor do cabeçalho
        id: null 
    };
    
    modalCadastroAberto.value = true;
};

const calcularTotalManual = computed(() => {
    return itensManuais.value.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
});

const confirmarImportacaoManual = async () => {
    if (!notaManual.value.fornecedor_id) return alert("Selecione um fornecedor.");
    if (itensManuais.value.some(i => !i.produto_id || i.quantidade <= 0)) return alert("Preencha todos os produtos e quantidades.");

    if(!confirm("Confirma a entrada manual destes itens no estoque?")) return;
    
    salvando.value = true;
    try {
        const lojaId = localStorage.getItem('loja_ativa_id');
        await api_request('post', '/notas/confirmar', {
            modo: 'manual',
            loja_id: lojaId,
            cabecalho: notaManual.value,
            itens: itensManuais.value.map(i => ({
                produto_destino_id: i.produto_id,
                quantidade: i.quantidade,
                valor_unitario: i.valor_unitario
            }))
        });
        emit('importado'); 
    } catch (e) {
        alert("Erro: " + (e.response?.data?.mensagem || e.message));
    } finally {
        salvando.value = false;
    }
};

// --- LÓGICA XML ---
const processarArquivo = async () => {
    const arquivo = fileInput.value.files[0];
    if (!arquivo) return;
    lendo.value = true;
    const formData = new FormData();
    formData.append('arquivo_xml', arquivo);
    formData.append('loja_id', localStorage.getItem('loja_ativa_id'));

    try {
        const res = await axios.post('http://127.0.0.1:8000/api/notas/upload', formData, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token_erp')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        const { cabecalho, itens } = res.data;
        dadosNota.value = {
            id: cabecalho.id,
            fornecedor_id: cabecalho.fornecedor_id,
            fornecedor_nome: cabecalho.fornecedor ? cabecalho.fornecedor.nome_fantasia : 'Fornecedor Desconhecido',
            numero: cabecalho.numero_nota,
            data: new Date(cabecalho.data_emissao).toLocaleDateString('pt-BR'),
            total_nota: Number(cabecalho.valor_total_nota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        };
        itensNota.value = itens.map(i => ({ ...i, produto_sistema_id: i.produto_id ? i.produto_id : null }));
        etapa.value = 2;
    } catch (e) {
        alert("Erro XML: " + (e.response?.data?.mensagem || e.message));
        etapa.value = 1; 
    } finally {
        lendo.value = false;
        if(fileInput.value) fileInput.value.value = ''; 
    }
};

const verificarAcaoSelect = (item, valor) => {
    if (valor === 'novo') abrirModalCadastroXML(item);
    else item.produto_sistema_id = valor; 
};

// Abre o modal de cadastro vindo da tabela XML
const abrirModalCadastroXML = (item) => {
    itemSendoCadastrado.value = item;
    const unXml = item.unidade_comercial ? item.unidade_comercial.toUpperCase() : 'UN';
    const unidadeFinal = ['KG','L','CX'].includes(unXml) ? unXml : 'UN';

    dadosParaCadastro.value = {
        nome: item.nome_produto_xml,
        codigo_barras: item.ean_comercial,
        preco_custo: item.valor_unitario,
        unidade_medida: unidadeFinal, 
        tipo_item: 'REVENDA',
        categoria: 'Outros',
        fornecedor_id: dadosNota.value.fornecedor_id,
        id: null 
    };
    modalCadastroAberto.value = true;
};

// CALLBACK DE SUCESSO (UNIFICADO XML/MANUAL)
const produtoCadastradoSucesso = async () => {
    // 1. Recarrega a lista de produtos do sistema
    await carregarProdutosSistema(); 
    
    // 2. Pega o último produto cadastrado (o ID novo)
    const ultimoProd = listaProdutosSistema.value[listaProdutosSistema.value.length - 1]; 
    
    // 3. Atualiza a referência correta dependendo do modo
    if (itemSendoCadastrado.value && ultimoProd) {
        if (modo.value === 'xml') {
            itemSendoCadastrado.value.produto_sistema_id = ultimoProd.id;
        } else {
            // MODO MANUAL: Atualiza o produto_id na linha da tabela
            itemSendoCadastrado.value.produto_id = ultimoProd.id;
        }
    }
    
    modalCadastroAberto.value = false;
    // Opcional: Feedback visual rápido
};

const todosVinculados = computed(() => {
    return itensNota.value.every(i => i.produto_sistema_id && i.produto_sistema_id !== 'novo');
});

const confirmarImportacaoXML = async () => {
    if(!confirm("Confirma a entrada via XML?")) return;
    salvando.value = true;
    try {
        await api_request('post', '/notas/confirmar', {
            modo: 'xml', 
            itens: itensNota.value.map(i => ({
                item_id: i.id, // ID temporário do XML
                produto_destino_id: i.produto_sistema_id
            }))
        });
        emit('importado'); 
    } catch (e) {
        alert("Erro: " + e.message);
    } finally {
        salvando.value = false;
    }
};
</script>

<style scoped>
/* =========================================
   ESTILOS GERAIS
   ========================================= */
.modal_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal_content { background: white; border-radius: 12px; width: 950px; max-width: 98%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; }

/* HEADER TABS */
.modal_header_tabs { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; height: 60px; }
.titulo_area h3 { margin: 0; color: #111827; font-size: 1.1rem; }
.tabs_controle { display: flex; gap: 5px; background: #e5e7eb; padding: 4px; border-radius: 8px; }
.tab_btn { padding: 6px 16px; border: none; background: transparent; color: #4b5563; font-weight: 600; font-size: 0.9rem; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
.tab_btn.ativo { background: white; color: var(--primary-color); box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
.btn_fechar_topo { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #9ca3af; }
.btn_fechar_topo:hover { color: #ef4444; }

.modal_body { flex: 1; overflow-y: auto; padding: 25px; background: #f9fafb; }
.modal_footer { padding: 20px 25px; display: flex; justify-content: flex-end; align-items: center; gap: 12px; background: #ffffff; border-top: 1px solid #f3f4f6; }

.container_manual { display: flex; flex-direction: column; height: 100%; }

/* XML STYLES (MANTIDOS) */
.area_upload { border: 2px dashed #d1d5db; padding: 40px; text-align: center; border-radius: 12px; background: white; color: #6b7280; cursor: pointer; }
.info_nota { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
.info_topo { display: flex; justify-content: space-between; font-weight: bold; color: #166534; }
.tabela_scroll { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: white; max-height: 450px; overflow-y: auto; }
.tabela_vinculo { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabela_vinculo th { background: #f9fafb; padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; }
.tabela_vinculo td { padding: 10px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.select_vinculo { width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }

.btn_confirmar { background: #16a34a; color: white; padding: 10px 24px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
.btn_confirmar:disabled { background: #d1d5db; cursor: not-allowed; }
.btn_voltar { background: white; border: 1px solid #d1d5db; padding: 10px 24px; border-radius: 6px; cursor: pointer; }

/* MODAL INTERNO */
.modal_overlay_interno { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1100; display: flex; justify-content: center; align-items: center; }
.modal_content_interno { background: #f3f4f6; width: 90vw; height: 90vh; max-width: 1200px; border-radius: 12px; display: flex; flex-direction: column; }
.header_interno { background: white; padding: 15px; display: flex; justify-content: space-between; border-radius: 12px 12px 0 0; }
.body_interno { flex: 1; padding: 20px; overflow-y: auto; }
.aviso_manual { font-size: 0.8rem; color: #d97706; margin-right: 15px; font-weight: bold; }
.btn_fechar_interno { background: #fee2e2; color: #ef4444; border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; }
.col_center { text-align: center; }
.nome_xml { font-weight: 600; color: #111827; }
</style>