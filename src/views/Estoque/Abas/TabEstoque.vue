<template>
  <div>
    <div class="navegacao_abas">
      <button 
        :class="['aba_botao', { ativo: aba_atual === 'lista' }]" 
        @click="aba_atual = 'lista'"
      >
        📦 Estoque Atual
      </button>
      <button 
        :class="['aba_botao', { ativo: aba_atual === 'cadastro' }]" 
        @click="aba_atual = 'cadastro'"
      >
        ➕ Novo Cadastro
      </button>
    </div>

    <div v-if="aba_atual === 'lista'" class="conteudo_aba">
      <div class="barra_ferramentas">
        <input type="text" placeholder="🔍 Buscar produto..." class="input_busca input_padrao">
      </div>

      <table class="tabela_produtos">
        <thead>
          <tr>
            <th>Cód. (ID)</th>
            <th>EAN</th>
            <th>Tipo</th>
            <th>Nome / Categoria</th>
            <th>Preço Venda</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in lista_produtos" :key="prod.id">
            <td class="texto_destaque">#{{ prod.id }}</td>
            <td style="font-family: monospace; letter-spacing: 1px;">
                {{ prod.codigo_barras || '---' }}
            </td>
            <td>
                <span :class="['badge_tipo', `tipo_${prod.tipo_item.toLowerCase()}`]">
                    {{ prod.tipo_item }}
                </span>
            </td>
            <td>
                <div class="nome_principal">{{ prod.nome }}</div>
                <small class="texto_secundario">{{ prod.categoria }}</small>
            </td>
            <td>R$ {{ formatar_valor(prod.preco_venda) }}</td>
            <td>
                <span :class="{ 'estoque_baixo': prod.estoque_atual <= prod.estoque_minimo }">
                    {{ formatar_quantidade_inteligente(prod) }} {{ prod.unidade_medida }}
                </span>
            </td>
            <td>
                <button class="botao_acao">✏️</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p v-if="lista_produtos.length === 0" class="aviso_vazio">
        Nenhum produto encontrado.
      </p>
    </div>

    <div v-if="aba_atual === 'cadastro'" class="conteudo_aba">
      <form @submit.prevent="salvar_produto" class="form_cadastro">
        
        <div class="secao_form">
            <h3 class="subtitulo_form">1. Classificação</h3>
            <div class="grupo_radio_tipos">
                <label :class="['card_radio', { selecionado: form.tipo_item === 'REVENDA' }]">
                    <input type="radio" value="REVENDA" v-model="form.tipo_item">
                    <span>🛒 Revenda</span>
                </label>
                <label :class="['card_radio', { selecionado: form.tipo_item === 'INSUMOS' }]">
                    <input type="radio" value="INSUMOS" v-model="form.tipo_item">
                    <span>🌾 Insumos</span>
                </label>
                <label :class="['card_radio', { selecionado: form.tipo_item === 'INTERNO' }]">
                    <input type="radio" value="INTERNO" v-model="form.tipo_item">
                    <span>🧹 Uso Interno (Fabricação)</span>
                </label>
            </div>
        </div>

        <div class="secao_form">
            <h3 class="subtitulo_form">2. Identificação</h3>
            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Código Interno (ID Manual) *</label>
                    <input type="number" v-model="form.id" required placeholder="Ex: 1005" class="input_padrao input_codigo">
                </div>
                <div class="grupo_input">
                    <label>Código de Barras (EAN)</label>
                    <input type="text" v-model="form.codigo_barras" placeholder="Leitor..." class="input_padrao">
                </div>
            </div>

            <div class="grupo_input">
                <label>Nome do Produto *</label>
                <input type="text" v-model="form.nome" required placeholder="Ex: Pão Francês" class="input_padrao">
            </div>

            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Categoria *</label>
                    <select v-model="categoria_selecionada" class="input_padrao" required>
                        <option value="" disabled>Selecione...</option>
                        <option v-for="cat in LISTA_CATEGORIAS" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>

                <div class="grupo_input" v-if="categoria_selecionada === 'Outros'">
                    <label>Qual a nova categoria?</label>
                    <input type="text" v-model="categoria_nova" placeholder="Digite o nome..." class="input_padrao destaque_input">
                </div>
            </div>

            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Unidade *</label>
                    <select v-model="form.unidade_medida" required class="input_padrao">
                        <option v-for="u in LISTA_UNIDADES" :key="u.codigo" :value="u.codigo">
                            {{ u.codigo }} - {{ u.nome }}
                        </option>
                    </select>
                </div>
                <div class="grupo_input">
                    <label>Grupo / Família</label>
                    <input type="text" v-model="form.grupo_familia" placeholder="Ex: Refrigerantes" class="input_padrao">
                </div>
            </div>
        </div>

        <div class="secao_form destaque_financeiro">
            <h3 class="subtitulo_form">3. Valores</h3>
            <div class="linha_tripla">
                <div class="grupo_input">
                    <label>Preço Custo (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      v-model="form.preco_custo" 
                      class="input_padrao"
                      :disabled="form.tipo_item === 'INTERNO'"
                      :placeholder="form.tipo_item === 'INTERNO' ? 'Calculado na Ficha' : '0.00'"
                    >
                </div>

                <div class="grupo_input" v-if="form.tipo_item === 'REVENDA' || form.tipo_item === 'INTERNO'">
                    <label>Preço Venda (R$) *</label>
                    <input type="number" step="0.01" v-model="form.preco_venda" required class="input_padrao">
                </div>

                <div class="grupo_input" v-if="form.tipo_item === 'REVENDA'">
                    <label>Margem Estimada</label>
                    <div class="display_valor_fixo">{{ calcular_margem }}%</div>
                </div>
            </div>
        </div>

        <div class="secao_form">
            <h3 class="subtitulo_form">4. Estoque</h3>
            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Qtd. Atual</label>
                    <input type="number" step="0.001" v-model="form.estoque_atual" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Mínimo (Alerta)</label>
                    <input type="number" step="0.001" v-model="form.estoque_minimo" class="input_padrao">
                </div>
            </div>
        </div>

        <div class="area_botoes">
            <button type="button" class="botao_cancelar" @click="aba_atual = 'lista'">Cancelar</button>
            <button type="submit" class="botao_salvar">💾 Salvar Produto</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/produtos';

const LISTA_UNIDADES = [
    { codigo: 'UN',  nome: 'Unidade' }, { codigo: 'KG',  nome: 'Quilograma' },
    { codigo: 'L',   nome: 'Litro' },   { codigo: 'CX',  nome: 'Caixa' },
    { codigo: 'PCT', nome: 'Pacote' },  { codigo: 'M',   nome: 'Metro' },
];

const LISTA_CATEGORIAS = [
    "Panificação", "Confeitaria", "Bebidas", "Frios", 
    "Insumos", "Embalagens", "Laticínios", "Hortifruti", "Outros"
];

const aba_atual = ref('lista');
const lista_produtos = ref([]);
const categoria_selecionada = ref('');
const categoria_nova = ref('');

const form = ref({
    id: '', tipo_item: 'REVENDA', nome: '', grupo_familia: '', 
    codigo_barras: '', unidade_medida: 'UN', preco_custo: '', 
    preco_venda: '', estoque_atual: '', estoque_minimo: 5
});

const calcular_margem = computed(() => {
    const venda = parseFloat(form.value.preco_venda) || 0;
    const custo = parseFloat(form.value.preco_custo) || 0;
    if (!venda || !custo) return 0;
    return ((venda - custo) / custo * 100).toFixed(1);
});

const get_auth_header = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` } });
const formatar_valor = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

// --- NOVA FUNÇÃO DE FORMATAÇÃO INTELIGENTE ---
// Remove zeros desnecessários: 120.000 -> 120 | 0.500 -> 0,5
const formatar_quantidade_inteligente = (prod) => {
    const valor = parseFloat(prod.estoque_atual);
    
    // Se for inteiro, mostra sem vírgula
    if (Number.isInteger(valor)) {
        return valor.toString(); 
    }
    
    // Se tiver decimal, usa até 3 casas, mas parseFloat remove zeros à direita automaticamente
    // Ex: parseFloat("0.500") = 0.5
    // Depois trocamos ponto por vírgula para o padrão BR
    return parseFloat(valor.toFixed(3)).toString().replace('.', ',');
};

const carregar_produtos = async () => {
    try {
        const res = await axios.get(API_URL, get_auth_header());
        lista_produtos.value = res.data;
    } catch (e) { console.error(e); }
};

const salvar_produto = async () => {
    if (!form.value.id || !form.value.nome) return alert("ID e Nome são obrigatórios!");
    let categoria_final = categoria_selecionada.value;
    if (categoria_final === 'Outros') {
        if(!categoria_nova.value) return alert("Digite a nova categoria!");
        categoria_final = categoria_nova.value;
    }
    try {
        const payload = {
            ...form.value, categoria: categoria_final,
            preco_custo: parseFloat(form.value.preco_custo) || 0,
            preco_venda: parseFloat(form.value.preco_venda) || 0,
            estoque_atual: parseFloat(form.value.estoque_atual) || 0,
            estoque_minimo: parseFloat(form.value.estoque_minimo) || 0,
        };
        await axios.post(API_URL, payload, get_auth_header());
        alert('Produto salvo!');
        await carregar_produtos();
        form.value = { 
            id: '', tipo_item: 'REVENDA', nome: '', grupo_familia: '', 
            codigo_barras: '', unidade_medida: 'UN', preco_custo: '', 
            preco_venda: '', estoque_atual: '', estoque_minimo: 5 
        };
        categoria_selecionada.value = ''; categoria_nova.value = ''; aba_atual.value = 'lista';
    } catch (erro) {
        alert("Erro: " + (erro.response?.data?.mensagem || erro.message));
    }
};

onMounted(carregar_produtos);
</script>

<style scoped>
/* ESTILOS (Mesmos do anterior) */
.navegacao_abas { display: flex; gap: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; }
.aba_botao {
    background: none; border: none; padding: 10px 20px;
    color: var(--text-secondary); cursor: pointer; font-size: 16px;
    border-bottom: 2px solid transparent; transition: color 0.2s;
}
.aba_botao:hover { color: var(--text-primary); }
.aba_botao.ativo { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: bold; }

.conteudo_aba {
    background-color: var(--bg-card);
    padding: 25px; border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.subtitulo_form {
    color: var(--primary-color);
    border-left: 4px solid var(--primary-color);
    padding-left: 10px; margin-bottom: 20px; margin-top: 10px;
}
.grupo_input { margin-bottom: 15px; }
.grupo_input label { display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 500; font-size: 14px; }

.input_padrao {
    width: 100%; padding: 10px;
    background-color: var(--input-bg);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    border-radius: 6px;
}
.input_padrao:focus { outline: none; border-color: var(--primary-color); }
.destaque_input { border-color: var(--primary-color); }

.display_valor_fixo {
    padding: 10px; background-color: var(--bg-page);
    color: var(--text-primary); border-radius: 6px; font-weight: bold;
    border: 1px solid var(--border-color);
}

.tabela_produtos { width: 100%; border-collapse: collapse; margin-top: 10px; }
.tabela_produtos th {
    text-align: left; padding: 12px;
    background-color: var(--bg-page);
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
}
.tabela_produtos td { padding: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }

.texto_destaque { color: var(--primary-color); font-weight: bold; }
.texto_secundario { display: block; font-size: 12px; color: var(--text-secondary); }
.aviso_vazio { text-align: center; padding: 30px; color: var(--text-secondary); }
.estoque_baixo { color: #ef4444; font-weight: bold; }

.botao_acao {
    background: none; border: 1px solid var(--border-color);
    color: var(--text-secondary); cursor: pointer; padding: 5px 10px; border-radius: 4px;
}
.botao_acao:hover { background: var(--bg-page); color: var(--text-primary); }

.botao_salvar {
    background-color: var(--primary-color); color: white; padding: 12px 24px;
    border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
}
.botao_salvar:hover { opacity: 0.9; }

.botao_cancelar {
    background: transparent; border: 1px solid var(--border-color); color: var(--text-primary);
    padding: 12px 24px; border-radius: 6px; cursor: pointer;
}
.botao_cancelar:hover { background-color: var(--bg-page); }

.grupo_radio_tipos { display: flex; gap: 10px; }
.card_radio {
    flex: 1; padding: 15px; border: 1px solid var(--border-color);
    border-radius: 8px; cursor: pointer; text-align: center;
    background-color: var(--input-bg); color: var(--text-secondary); transition: all 0.2s;
}
.card_radio:hover { border-color: var(--text-secondary); }
.card_radio.selecionado {
    border-color: var(--primary-color); color: var(--primary-color);
    background-color: rgba(59, 130, 246, 0.1); font-weight: bold;
}
.card_radio input { display: none; }

.badge_tipo { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
.tipo_revenda { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.tipo_insumos { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.tipo_interno { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }

.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px; }
.area_botoes { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
</style>