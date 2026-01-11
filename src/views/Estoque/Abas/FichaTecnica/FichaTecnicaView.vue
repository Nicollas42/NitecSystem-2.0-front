<template>
  <div class="container_ficha">
    
    <div class="selecao_produto">
        <label>Selecione o Produto para editar a Ficha:</label>
        <select v-model="produto_id" class="input_padrao" @change="carregar_dados_completos_ficha">
            <option value="" disabled>Selecione um produto de fabricação própria...</option>
            <option v-for="prod in lista_produtos_internos" :key="prod.id" :value="prod.id">
                #{{ prod.id }} - {{ prod.nome }}
            </option>
        </select>
    </div>

    <div v-if="produto_id">
        <div class="navegacao_sub">
            <button :class="['aba_sub', { ativo: sub_aba === 'ingredientes' }]" @click="sub_aba = 'ingredientes'">
                🥕 Ingredientes (R$ {{ dados_ficha.total_ingredientes.toFixed(2) }})
            </button>
            <button :class="['aba_sub', { ativo: sub_aba === 'maquinas' }]" @click="sub_aba = 'maquinas'">
                ⚙️ Máquinas (R$ {{ dados_ficha.total_operacional.toFixed(2) }})
            </button>
            <button :class="['aba_sub', { ativo: sub_aba === 'precificacao' }]" @click="sub_aba = 'precificacao'">
                💰 Precificação (R$ {{ dados_ficha.preco_venda.toFixed(2) }})
            </button>
        </div>

        <div class="conteudo_ficha">
            <IngredientesView 
                v-if="sub_aba === 'ingredientes'" 
                :lista="dados_ficha.ingredientes"
                @atualizar-total="(v) => dados_ficha.total_ingredientes = v"
            />
            
            <MaquinasView 
                v-if="sub_aba === 'maquinas'" 
                :lista="dados_ficha.maquinas"
                @atualizar-total="(v) => dados_ficha.total_operacional = v"
            />
            
            <PrecificacaoView 
                v-if="sub_aba === 'precificacao'" 
                :produto_id="produto_id"
                :custo_ingredientes="dados_ficha.total_ingredientes"
                :custo_operacional="dados_ficha.total_operacional"
                @salvar-completo="executar_salvamento"
            />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { api_request } from '@/services/api_helper';
import IngredientesView from './SubAbas/IngredientesView.vue';
import MaquinasView from './SubAbas/MaquinasView.vue';
import PrecificacaoView from './SubAbas/PrecificacaoView.vue';

const emit = defineEmits(['voltar-estoque']);

const produto_id = ref('');
const sub_aba = ref('ingredientes');
const lista_produtos_internos = ref([]);

const dados_ficha = reactive({
    ingredientes: [], 
    maquinas: [], 
    total_ingredientes: 0, 
    total_operacional: 0,
    preco_venda: 0 
});

const carregar_produtos_internos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    
    // VERIFICAÇÃO DE SEGURANÇA
    if (!lojaId) {
        console.error("⛔ ERRO: ID da Loja não encontrado no LocalStorage.");
        return;
    }

    try {
        // CORREÇÃO AQUI: Use apenas '/produtos' em vez da URL completa
        const res = await api_request('get', '/produtos', { 
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });

        console.log("📦 Resposta API:", res);

        let lista_bruta = [];
        if (Array.isArray(res)) lista_bruta = res;
        else if (res.data && Array.isArray(res.data)) lista_bruta = res.data;

        // Filtra os produtos
        lista_produtos_internos.value = lista_bruta.filter(p => p.tipo_item === 'INTERNO');

    } catch (e) { console.error("Erro ao buscar produtos:", e); }
};

const carregar_dados_completos_ficha = async () => {
    dados_ficha.ingredientes = [];
    dados_ficha.maquinas = [];
    dados_ficha.total_ingredientes = 0;
    dados_ficha.total_operacional = 0;
    dados_ficha.preco_venda = 0;
    
    if(!produto_id.value) return;
    
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await api_request('get', `/produtos/${produto_id.value}/ficha`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });

        // CORREÇÃO: Removido .data nas linhas abaixo
        if (res.produto) {
            dados_ficha.preco_venda = parseFloat(res.produto.preco_venda) || 0;
        }

        dados_ficha.ingredientes = res.ingredientes.map(i => ({
            ...i,
            subtotal: parseFloat(i.custo_unitario) * parseFloat(i.qtd)
        }));

        dados_ficha.maquinas = res.maquinas.map(m => ({
            ...m,
            custo_energia: 0, 
            custo_depreciacao: 0, 
            total: 0
        }));

    } catch (e) { console.error("Erro ao carregar ficha:", e); }
};

const executar_salvamento = async (dadosPrecificacao) => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    
    // Atualiza o preço visualmente antes de salvar
    dados_ficha.preco_venda = dadosPrecificacao.preco_venda;

    const payload = {
        loja_id: lojaId,
        ...dadosPrecificacao,
        ingredientes: dados_ficha.ingredientes,
        maquinas: dados_ficha.maquinas
    };

    try {
        console.log("💾 Salvando Ficha para Produto ID:", produto_id.value);
        
        // CORREÇÃO: Uso de CRASE (`) para interpolar a variável ${produto_id.value}
        await api_request('put', `/produtos/${produto_id.value}/ficha`, payload, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });

        alert('✅ Ficha Técnica salva com sucesso! Estoque atualizado.');
        emit('voltar-estoque');

    } catch (e) {
        console.error(e);
        alert('Erro ao salvar: ' + (e.response?.data?.mensagem || e.message));
    }
};

onMounted(carregar_produtos_internos);
</script>

<style scoped>
.container_ficha { background: var(--bg-card); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); }
.selecao_produto { margin-bottom: 20px; }
.selecao_produto label { display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: bold; }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; font-size: 16px; }
.navegacao_sub { display: flex; gap: 5px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
.aba_sub { background: none; border: none; padding: 10px 15px; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500; }
.aba_sub.ativo { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: bold; }
.aba_sub:hover { color: var(--text-primary); }
</style>