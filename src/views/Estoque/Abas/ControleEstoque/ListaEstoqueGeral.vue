<template>
  <div>
    <div class="header_geral">
      <h3>Visão Global da Rede</h3>
      <p>Listando estoque unificado de todas as unidades.</p>
    </div>

    <div class="table_container">
        <table class="tabela_produtos tabela_geral">
          <thead>
            <tr>
              <th width="50">ID</th>
              <th>Produto / Detalhes</th>
              <th>Filial</th>
              <th>Custo</th>
              <th>Venda</th>
              <th>Validade</th>
              <th>Depósito</th>
              <th>Vitrine</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in lista_geral" :key="idx">
              <td class="texto_destaque">#{{ item.prod_id }}</td>
              
              <td class="celula_produto">
                  <div class="nome_principal">{{ item.produto_nome }}</div>
                  <div class="texto_ean" v-if="item.codigo_barras">||| {{ item.codigo_barras }}</div>
                  <div class="texto_ean vazio" v-else>---</div>
                  <div class="area_cat"><span class="badge_cat">{{ item.categoria }}</span></div>
              </td>

              <td>
                  <span :class="['tag_loja', item.eh_matriz ? 'matriz' : 'filial']">
                      {{ item.filial_nome }}
                  </span>
              </td>
              
              <td class="texto_custo">R$ {{ formatar_valor(item.preco_custo) }}</td>
              <td class="texto_venda">R$ {{ formatar_valor(item.preco_venda) }}</td>
              
              <td>
                  <span :class="verificar_validade(item.validade)">
                      {{ formatar_data(item.validade) }}
                  </span>
              </td>
              
              <td><strong>{{ formatar_qtd(item.estoque_deposito) }}</strong></td>
              
              <td style="font-weight:bold; color:#d97706;">
                  {{ formatar_qtd(item.estoque_vitrine) }}
              </td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const lista_geral = ref([]);

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

const carregar_estoque_geral = async () => {
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/estoque-geral', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        lista_geral.value = res.data;
    } catch (e) { console.error(e); }
};

onMounted(carregar_estoque_geral);
</script>

<style scoped>
.header_geral { margin-bottom: 15px; border-left: 4px solid #8b5cf6; padding-left: 10px; }
.header_geral h3 { margin: 0; color: var(--text-primary); }
.header_geral p { margin: 0; font-size: 13px; color: var(--text-secondary); }

.table_container { overflow-x: auto; }
.tabela_produtos { width: 100%; border-collapse: collapse; min-width: 900px; }
.tabela_produtos th { text-align: left; padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.tabela_produtos td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 13px; vertical-align: middle; }

/* LAYOUT VERTICAL IGUAL AO LOCAL */
.celula_produto { vertical-align: top; }
.nome_principal { font-weight: 600; font-size: 14px; color: var(--text-primary); margin-bottom: 3px; }
.texto_ean { font-family: monospace; font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
.texto_ean.vazio { opacity: 0.3; }
.area_cat { display: block; }
.badge_cat { background: var(--bg-page); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border-color); display: inline-block; }

.texto_custo { color: var(--text-secondary); font-size: 13px; }
.texto_venda { font-weight: bold; color: var(--text-primary); }

.tag_loja { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.tag_loja.matriz { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.tag_loja.filial { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }

/* Status Validade */
.tag_vencido { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
.tag_alerta { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
.tag_neutra { color: var(--text-secondary); font-size: 11px; }
.tag_ok { color: #10b981; font-weight: 500; }

.texto_destaque { color: var(--primary-color); font-weight: bold; font-size: 12px; }
</style>