<template>
  <div>
    <div class="header_geral">
      <div>
          <h3>Visão Global da Rede</h3>
          <p>Listando estoque unificado de todas as unidades.</p>
      </div>
      <div class="area_busca">
          <input type="text" v-model="busca" placeholder="🔍 Buscar na rede..." class="input_padrao_geral">
      </div>
    </div>

    <div class="table_container">
        <table class="tabela_produtos tabela_geral">
          <thead>
            <tr>
              <th width="50" class="col_center">ID</th>
              <th class="col_left">Produto / Detalhes</th>
              <th class="col_left" width="160">Fornecedor</th> <th class="col_left">Filial</th>
              <th class="col_center">Custo</th>
              <th class="col_center">Venda</th>
              <th class="col_center" width="140">Validade (Dias)</th>
              <th class="col_center">Depósito</th>
              <th class="col_center">Vitrine</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in lista_filtrada_geral" :key="idx">
              <td class="texto_destaque col_center">#{{ item.prod_id }}</td>
              
              <td class="celula_produto">
                  <div class="nome_principal">{{ item.produto_nome }}</div>
                  
                  <div class="texto_balanca" v-if="item.codigo_balanca">
                      ⚖️ Cód: <strong>{{ item.codigo_balanca }}</strong>
                  </div>
                  <div class="texto_ean" v-else-if="item.codigo_barras">
                      ||| {{ item.codigo_barras }}
                  </div>
                  <div class="texto_ean vazio" v-else>---</div>

                  <div class="area_cat">
                      <span class="badge_cat">{{ item.categoria }}</span>
                  </div>
              </td>

              <td>
                <div v-if="item.fornecedor_nome" class="box_fornecedor_geral">
                    <span class="nome_f">{{ item.fornecedor_nome }}</span>
                    <small class="nome_v" v-if="item.vendedor_nome">👤 {{ item.vendedor_nome }}</small>
                </div>
                <span v-else class="texto_vazio">--</span>
              </td>

              <td>
                  <span :class="['tag_loja', item.eh_matriz ? 'matriz' : 'filial']">
                      {{ item.filial_nome }}
                  </span>
              </td>
              
              <td class="col_center texto_custo">R$ {{ formatar_valor(item.preco_custo) }}</td>
              <td class="col_center texto_venda">R$ {{ formatar_valor(item.preco_venda) }}</td>
              
              <td class="col_center">
                  <div v-if="item.validade" :class="['box_validade', calcular_situacao_validade(item.validade).classe]">
                      <span class="dias_restantes">
                          {{ calcular_situacao_validade(item.validade).dias }} dias
                      </span>
                      <small class="status_validade">
                          {{ calcular_situacao_validade(item.validade).label }}
                      </small>
                  </div>
                  <span v-else class="texto_vazio">---</span>
              </td>
              
              <td class="col_center">
                  <strong>{{ formatar_qtd(item.estoque_deposito) }}</strong>
                  <small class="unidade">{{ item.unidade_medida }}</small>
              </td>
              
              <td class="col_center" style="font-weight:bold; color:#d97706;">
                  {{ formatar_qtd(item.estoque_vitrine) }}
                  <small class="unidade">{{ item.unidade_medida }}</small>
              </td>
            </tr>
          </tbody>
        </table>
    </div>

    <p v-if="lista_filtrada_geral.length === 0" class="aviso_vazio">
        Nenhum produto encontrado.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api_request } from '@/services/api_helper';

const lista_geral = ref([]);
const busca = ref('');

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

const lista_filtrada_geral = computed(() => {
    // Garante que lista_geral é um array
    const lista = Array.isArray(lista_geral.value) ? lista_geral.value : [];
    
    if(!busca.value) return lista;
    const termo = busca.value.toLowerCase();
    
    return lista.filter(p => 
        p.produto_nome.toLowerCase().includes(termo) ||
        String(p.prod_id).includes(termo) ||
        (p.codigo_barras && p.codigo_barras.includes(termo)) ||
        (p.codigo_balanca && String(p.codigo_balanca).includes(termo)) ||
        p.filial_nome.toLowerCase().includes(termo) ||
        (p.fornecedor_nome && p.fornecedor_nome.toLowerCase().includes(termo))
    );
});

const carregar_estoque_geral = async () => {
    try {
        // CORREÇÃO: Removida URL completa e headers manuais
        const res = await api_request('get', '/estoque-geral');
        
        // CORREÇÃO: Atribuição direta
        lista_geral.value = res || [];

    } catch (e) { console.error("Erro ao carregar estoque geral:", e); }
};

onMounted(carregar_estoque_geral);
</script>

<style scoped>
.header_geral { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-left: 4px solid #8b5cf6; padding-left: 10px; }
.header_geral h3 { margin: 0; color: var(--text-primary); }
.header_geral p { margin: 0; font-size: 13px; color: var(--text-secondary); }
.input_padrao_geral { padding: 8px; width: 300px; border: 1px solid var(--border-color); border-radius: 6px; }

.table_container { overflow-x: auto; }
.tabela_produtos { width: 100%; border-collapse: collapse; min-width: 900px; }
.tabela_produtos th { padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.tabela_produtos td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; vertical-align: middle; }

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

.tag_loja { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.tag_loja.matriz { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.tag_loja.filial { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }

.box_validade { display: flex; flex-direction: column; align-items: center; padding: 4px; border-radius: 6px; width: 100px; margin: 0 auto; }
.dias_restantes { font-weight: 800; font-size: 13px; }
.status_validade { font-size: 10px; font-weight: 600; text-transform: uppercase; }
.status_vencido { background: #fee2e2; color: #991b1b; } .status_critico { background: #fee2e2; color: #ef4444; } .status_atencao { background: #ffedd5; color: #c2410c; } .status_proximo { background: #fef9c3; color: #a16207; } .status_ok { background: #f0fdf4; color: #15803d; }

.unidade { font-size: 10px; color: #999; margin-left: 2px; }
.aviso_vazio { text-align: center; padding: 30px; color: var(--text-secondary); }

/* --- NOVOS ESTILOS PARA ESTOQUE GERAL --- */
.box_fornecedor_geral { display: flex; flex-direction: column; }
.nome_f { font-weight: 600; color: #4b5563; font-size: 12px; }
.nome_v { font-size: 10px; color: #9ca3af; }
</style>