<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importando ícones da biblioteca Lucide
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  Package, 
  Recycle, 
  LogOut, 
  Menu,
  ChevronLeft
} from 'lucide-vue-next';

const router = useRouter();

// Estado para controlar se o menu está expandido ou recolhido
// Variável em Snake Case (padrão JS definido por você)
const menu_expandido = ref(true);

function alternar_menu() {
    menu_expandido.value = !menu_expandido.value;
}

function fazer_logout() {
    localStorage.removeItem('token_erp');
    router.push('/');
}
</script>

<template>
  <div class="container_sistema">
    
    <aside :class="['menu_lateral', { 'recolhido': !menu_expandido }]">
      
      <div class="cabecalho_menu">
        <div class="logo_area" v-if="menu_expandido">
          <span class="texto_logo">ERP</span>
        </div>
        
        <button @click="alternar_menu" class="botao_toggle">
            <component :is="menu_expandido ? ChevronLeft : Menu" size="24" />
        </button>
      </div>

      <nav class="navegacao">
        
        <RouterLink to="/dashboard" class="item_menu" active-class="ativo">
            <LayoutDashboard size="22" />
            <span class="texto_link" v-show="menu_expandido">Dashboard</span>
            </RouterLink>
        
        <RouterLink to="/frente-de-caixa" class="item_menu" active-class="ativo">
            <ShoppingCart size="22" />
            <span class="texto_link" v-show="menu_expandido">Caixa (PDV)</span>
        </RouterLink>
        
        <RouterLink to="/financeiro" class="item_menu" active-class="ativo">
            <Wallet size="22" />
            <span class="texto_link" v-show="menu_expandido">Financeiro</span>
        </RouterLink>
        
        <RouterLink to="/estoque" class="item_menu" active-class="ativo">
            <Package size="22" />
            <span class="texto_link" v-show="menu_expandido">Estoque</span>
        </RouterLink>
        
        <RouterLink to="/sobras" class="item_menu" active-class="ativo">
            <Recycle size="22" />
            <span class="texto_link" v-show="menu_expandido">Sobras</span>
        </RouterLink>

      </nav>

      <div class="rodape_menu">
        <button @click="fazer_logout" class="botao_sair" :title="menu_expandido ? '' : 'Sair'">
            <LogOut size="22" />
            <span v-show="menu_expandido">Sair</span>
        </button>
      </div>

    </aside>

    <main class="conteudo_principal">
        <header class="barra_topo">
            <h2 class="titulo_secao">Bem-vindo</h2>
            <div class="usuario_info">
                <div class="avatar_usuario">A</div>
            </div>
        </header>

        <div class="area_router">
            <RouterView v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </RouterView>
        </div>
    </main>
    
  </div>
</template>

<style scoped>
/* Variáveis de cor para facilitar ajustes */
:root {
    --cor-menu-bg: #1e293b;
    --cor-menu-hover: #334155;
    --cor-destaque: #3b82f6;
    --cor-texto: #e2e8f0;
}

.container_sistema {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif; /* Fonte mais moderna se disponível, ou padrão */
  background-color: #f1f5f9;
  overflow: hidden;
}

/* --- Menu Lateral --- */
.menu_lateral {
  width: 260px;
  background-color: #1e293b; /* Slate 800 */
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out; /* A mágica da transição suave */
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
  z-index: 10;
}

/* Estado Recolhido */
.menu_lateral.recolhido {
    width: 80px;
}

/* Itens internos centralizados quando recolhido */
.menu_lateral.recolhido .item_menu,
.menu_lateral.recolhido .botao_sair {
    justify-content: center;
    padding: 15px 0;
}

/* Cabeçalho */
.cabecalho_menu {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #334155;
}

.menu_lateral.recolhido .cabecalho_menu {
    justify-content: center;
    padding: 0;
}

.texto_logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    letter-spacing: 1px;
}

.botao_toggle {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.botao_toggle:hover {
    color: white;
}

/* Navegação */
.navegacao {
    flex: 1;
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 10px;
    padding-right: 10px;
}

.item_menu {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    color: #cbd5e1;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s ease;
    white-space: nowrap; /* Impede que o texto quebre na animação */
}

.item_menu:hover {
    background-color: #334155;
    color: white;
}

.item_menu.ativo {
    background-color: #3b82f6; /* Azul bonito */
    color: white;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
}

.texto_link {
    font-weight: 500;
}

/* Rodapé */
.rodape_menu {
    padding: 20px;
    border-top: 1px solid #334155;
}

.botao_sair {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: rgba(239, 68, 68, 0.1); /* Vermelho bem suave */
    color: #fca5a5;
    border: none;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 600;
}

.botao_sair:hover {
    background-color: #ef4444;
    color: white;
}

/* --- Conteúdo Principal --- */
.conteudo_principal {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.barra_topo {
    height: 70px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.titulo_secao {
    font-size: 1.25rem;
    color: #1e293b;
    font-weight: 600;
}

.avatar_usuario {
    width: 40px;
    height: 40px;
    background-color: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.area_router {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
}

/* Animação de entrada das páginas (Fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>