<template>
  <div>
    <h3 style="color: var(--primary-color); margin-bottom: 15px;">📜 Histórico de Lotes Produzidos</h3>
    
    <div class="table_container">
        <table class="tabela_hist">
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>ID Lote</th>
                    <th>Produto Fabricado</th>
                    <th>Qtd. Produzida</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in historico" :key="item.id">
                    <td>{{ formatar_data(item.created_at) }}</td>
                    <td class="col_id">#{{ item.id }}</td>
                    <td><strong>{{ item.produto_nome }}</strong></td>
                    <td class="col_qtd">{{ formatar_qtd(item.quantidade) }} {{ item.unidade_medida }}</td>
                </tr>
            </tbody>
        </table>
        
        <div v-if="historico.length === 0" class="aviso_vazio">
            Nenhuma produção registrada ainda.
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api_request } from '@/services/api_helper';

const historico = ref([]);

const carregar_historico = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        // CORREÇÃO: URL curta
        const res = await api_request('get', '/producao/historico', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        // CORREÇÃO: Blindagem. Se vier array direto, usa. Se vier em .data, usa.
        if (Array.isArray(res)) {
            historico.value = res;
        } else if (res.data && Array.isArray(res.data)) {
            historico.value = res.data;
        } else {
            historico.value = [];
        }

    } catch (e) { console.error(e); }
};

const formatar_data = (iso) => new Date(iso).toLocaleString('pt-BR');
const formatar_qtd = (v) => parseFloat(v).toFixed(3).replace('.', ',');

onMounted(carregar_historico);
</script>

<style scoped>
.table_container { background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.tabela_hist { width: 100%; border-collapse: collapse; }
.tabela_hist th { text-align: left; padding: 12px; background: var(--bg-page); color: var(--text-secondary); font-size: 13px; border-bottom: 1px solid var(--border-color); }
.tabela_hist td { padding: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
.col_id { color: var(--text-secondary); font-family: monospace; }
.col_qtd { font-weight: bold; color: #10b981; }
.aviso_vazio { padding: 30px; text-align: center; color: var(--text-secondary); font-style: italic; }
</style>