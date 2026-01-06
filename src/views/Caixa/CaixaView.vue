<template>
  <div class="container_pdv">
    
    <div class="area_produtos">
      <div class="cabecalho_busca">
        <h2 class="titulo_secao">Produtos</h2>
        <input 
          type="text" 
          v-model="termo_busca" 
          class="input_busca" 
          placeholder="Buscar produto (código ou nome)..."
        >
      </div>

      <div class="grid_produtos">
        <div 
          v-for="produto in produtos_filtrados" 
          :key="produto.id" 
          class="card_produto"
          @click="adicionar_ao_carrinho(produto)"
        >
          <div class="imagem_produto_placeholder">
             {{ produto.unidade_medida }}
          </div>
          <div class="info_produto">
            <span class="nome_produto">{{ produto.nome }}</span>
            <span class="preco_produto">R$ {{ formatar_valor(produto.preco) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="area_carrinho">
      <div class="cabecalho_carrinho">
        <h2 class="titulo_secao">Cupom de Venda</h2>
        <button class="botao_voltar" @click="voltar_para_home">Sair</button>
      </div>

      <div class="lista_itens">
        <div v-if="carrinho.length === 0" class="carrinho_vazio">
          Nenhum item adicionado.
        </div>
        
        <div 
          v-for="(item, index) in carrinho" 
          :key="index" 
          class="item_carrinho"
        >
          <div class="detalhe_item">
            <strong>{{ formatar_quantidade(item) }} {{ item.unidade_medida }}</strong> - {{ item.nome }}
          </div>
          <div class="preco_item">
            R$ {{ formatar_valor(item.preco * item.quantidade) }}
            <button class="botao_remover" @click="remover_item(index)">X</button>
          </div>
        </div>
      </div>

      <div class="rodape_carrinho">
        <div class="linha_total">
          <span>TOTAL</span>
          <span class="valor_total">R$ {{ formatar_valor(total_venda) }}</span>
        </div>
        <button class="botao_finalizar" @click="finalizar_venda">
          Finalizar Venda (F10)
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * --- CONFIGURAÇÕES ---
 */
const LISTA_UNIDADES = [
    { codigo: 'UN',  nome: 'Unidade (1, 2...)',   fracionado: false },
    { codigo: 'KG',  nome: 'Quilograma (Peso)',   fracionado: true },
    { codigo: 'L',   nome: 'Litro (Granel)',      fracionado: true },
    { codigo: 'CX',  nome: 'Caixa Fechada',       fracionado: false },
    { codigo: 'PCT', nome: 'Pacote',              fracionado: false },
    { codigo: 'GAR', nome: 'Garrafa',             fracionado: false },
    { codigo: 'LAT', nome: 'Lata',                fracionado: false },
    { codigo: 'M',   nome: 'Metro',               fracionado: true },
];

/**
 * --- DADOS (ESTADO) ---
 */
const termo_busca = ref('');
const carrinho = ref([]);

// Dados Fictícios atualizados com 'unidade_medida'
const lista_produtos = ref([
    { id: 1, nome: 'Refrigerante Cola 2L', preco: 12.50, unidade_medida: 'UN' },
    { id: 2, nome: 'Pão Francês', preco: 15.90, unidade_medida: 'KG' },
    { id: 3, nome: 'Manteiga 500g', preco: 28.00, unidade_medida: 'UN' }, // Vende por pote
    { id: 4, nome: 'Mussarela', preco: 55.00, unidade_medida: 'KG' },
    { id: 5, nome: 'Leite Integral 1L', preco: 6.20, unidade_medida: 'CX' },
    { id: 6, nome: 'Café Expresso', preco: 5.00, unidade_medida: 'UN' },
]);

/**
 * --- LÓGICA (COMPUTED & METHODS) ---
 */

const produtos_filtrados = computed(() => {
    if (!termo_busca.value) return lista_produtos.value;
    const termo = termo_busca.value.toLowerCase();
    return lista_produtos.value.filter(p => 
        p.nome.toLowerCase().includes(termo)
    );
});

const total_venda = computed(() => {
    return carrinho.value.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
});

// Funções Auxiliares
const voltar_para_home = () => router.push({ name: 'home' });

const formatar_valor = (valor) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatar_quantidade = (item) => {
    // Busca se é fracionado
    const unidade = LISTA_UNIDADES.find(u => u.codigo === item.unidade_medida);
    if (unidade && unidade.fracionado) {
        return item.quantidade.toFixed(3).replace('.', ','); // Ex: 0,350
    }
    return item.quantidade; // Ex: 1
};

// Lógica principal de venda
const adicionar_ao_carrinho = (produto) => {
    // 1. Verifica se a unidade permite fração (KG, L, M)
    const info_unidade = LISTA_UNIDADES.find(u => u.codigo === produto.unidade_medida);
    const eh_fracionado = info_unidade ? info_unidade.fracionado : false;

    let qtd_adicionar = 1;

    // 2. Se for KG, pergunta o peso
    if (eh_fracionado) {
        const texto = `Informe a quantidade para ${produto.nome} (${produto.unidade_medida}):`;
        const input = prompt(texto, '0.500'); 
        
        if (input === null || input === '') return;
        
        // Trata vírgula e converte
        qtd_adicionar = parseFloat(input.replace(',', '.'));
        
        if (isNaN(qtd_adicionar) || qtd_adicionar <= 0) {
            alert('Quantidade inválida!');
            return;
        }
    }

    // 3. Adiciona ou Soma
    const item_existente = carrinho.value.find(item => item.id === produto.id);
    
    if (item_existente) {
        item_existente.quantidade += qtd_adicionar;
    } else {
        carrinho.value.push({ ...produto, quantidade: qtd_adicionar });
    }
};

const remover_item = (index) => {
    carrinho.value.splice(index, 1);
};

const finalizar_venda = () => {
    if (carrinho.value.length === 0) {
        alert('O carrinho está vazio!');
        return;
    }
    console.log("JSON da Venda:", JSON.stringify(carrinho.value));
    alert('Venda finalizada! (Verifique o console)');
    carrinho.value = [];
};
</script>

<style scoped>
/* Layout Geral em Snake Case */
.container_pdv {
    display: flex;
    height: 100vh;
    background_color: #f1f5f9;
    font-family: 'Segoe UI', sans-serif;
    overflow: hidden;
}

/* Lado Esquerdo */
.area_produtos {
    flex: 2; 
    padding: 20px;
    overflow-y: auto;
    border-right: 1px solid #cbd5e1;
}

.cabecalho_busca {
    margin-bottom: 20px;
}

.input_busca {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
}

.grid_produtos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
}

.card_produto {
    background: white;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.1s;
    text-align: center;
    border: 1px solid #e2e8f0;
}

.card_produto:active {
    transform: scale(0.95);
    background-color: #eef2ff;
}

.imagem_produto_placeholder {
    height: 60px;
    background-color: #f1f5f9;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 12px;
}

.nome_produto {
    display: block;
    font-size: 14px;
    color: #334155;
    margin-bottom: 5px;
    font-weight: 600;
}

.preco_produto {
    display: block;
    font-weight: bold;
    color: #4f46e5;
}

/* Lado Direito */
.area_carrinho {
    flex: 1; 
    background: white;
    display: flex;
    flex-direction: column;
    box-shadow: -2px 0 10px rgba(0,0,0,0.05);
}

.cabecalho_carrinho {
    padding: 15px 20px;
    background-color: #1e293b;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.titulo_secao {
    margin: 0;
    font-size: 18px;
}

.botao_voltar {
    background: #ef4444;
    color: white;
    border: none;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
}

.carrinho_vazio {
    text-align: center;
    color: #94a3b8;
    margin-top: 50px;
}

.lista_itens {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.item_carrinho {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
}

.detalhe_item {
    font-size: 14px;
    color: #334155;
}

.preco_item {
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 10px;
}

.botao_remover {
    background: #fee2e2;
    border: none;
    color: #ef4444;
    cursor: pointer;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.rodape_carrinho {
    padding: 20px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.linha_total {
    display: flex;
    justify-content: space-between;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #0f172a;
}

.botao_finalizar {
    width: 100%;
    padding: 15px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.botao_finalizar:hover {
    background-color: #059669;
}
</style>