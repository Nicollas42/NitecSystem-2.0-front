<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  Package, 
  Recycle, 
  LogOut, 
  Menu,
  ChevronLeft,
  Moon,
  Sun,
  Store
} from 'lucide-vue-next';

const router = useRouter();
const menu_expandido = ref(true);
const modo_escuro = ref(false); // Estado do tema

function alternar_menu() {
    menu_expandido.value = !menu_expandido.value;
}

function fazer_logout() {
    localStorage.removeItem('token_erp');
    router.push('/');
}

// --- Lógica do Tema ---
function alternar_tema() {
    modo_escuro.value = !modo_escuro.value;
    localStorage.setItem('tema_erp', modo_escuro.value ? 'dark' : 'light');
}

onMounted(() => {
    // Recupera tema salvo
    const tema_salvo = localStorage.getItem('tema_erp');
    if (tema_salvo === 'dark') {
        modo_escuro.value = true;
    }
});
</script>

<template>
  <div :class="['container_sistema', { 'dark_mode': modo_escuro }]">
    
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
        
        <RouterLink to="/meu-negocio" class="item_menu" active-class="ativo">
            <Store size="22" />
            <span class="texto_link" v-show="menu_expandido">Meu Negócio</span>
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
                <button @click="alternar_tema" class="botao_tema" title="Alternar Tema">
                    <Moon v-if="!modo_escuro" size="20" />
                    <Sun v-else size="20" />
                </button>

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

<style>
/* =========================================
   DEFINIÇÕES GLOBAIS DE TEMA (CSS VARIABLES)
   ========================================= */
:root {
    /* -- MODO CLARO (Padrão) -- */
    --bg-page: #f1f5f9;      
    --bg-card: #ffffff;      
    --text-primary: #1e293b; 
    --text-secondary: #64748b; 
    --border-color: #e2e8f0; 
    --input-bg: #ffffff;     
    --primary-color: #3b82f6; 
    --hover-bg: #f8fafc;

    /* Cores de Status (Validade/Alertas) - Light */
    --status-ok-bg: #f0fdf4;
    --status-ok-text: #15803d;
    --status-warning-bg: #fef9c3;
    --status-warning-text: #a16207;
    --status-danger-bg: #fee2e2;
    --status-danger-text: #991b1b;
    
    /* Destaques (Vitrine/Balança) - Light */
    --highlight-bg: #fffbeb;
    --highlight-text: #d97706;
    --highlight-border: #fcd34d;
}

/* -- MODO ESCURO -- */
.dark_mode {
    --bg-page: #0f172a;      /* Slate 900 */
    --bg-card: #1e293b;      /* Slate 800 */
    --text-primary: #f1f5f9; /* Branco suave */
    --text-secondary: #94a3b8; /* Cinza claro */
    --border-color: #334155; /* Borda escura */
    --input-bg: #0f172a;     /* Input bem escuro */
    --primary-color: #60a5fa; /* Azul claro */
    --hover-bg: #334155;

    /* PALETA "ICE WHITE" COM TRANSPARÊNCIA
       Usamos rgba() para criar o efeito translúcido (vidro)
    */
    
    /* Fundo Base: Branco com 10% de opacidade */
    --transparent-white-bg: rgba(255, 255, 255, 0.1); 

    /* Status OK (Verde Escuro no Fundo Transparente) */
    --status-ok-bg: var(--transparent-white-bg);      
    --status-ok-text: #86efac;    

    /* Status Atenção (Amarelo Escuro no Fundo Transparente) */
    --status-warning-bg: var(--transparent-white-bg); 
    --status-warning-text: #fde047;

    /* Status Crítico (Vermelho Escuro no Fundo Transparente) */
    --status-danger-bg: var(--transparent-white-bg);  
    --status-danger-text: #fca5a5;

    /* Destaques (Balança/Vitrine) - Transparente */
    --highlight-bg: rgba(255, 255, 255, 0.08); /* Ainda mais sutil (8%) */
    --highlight-text: #fcd34d;    /* Dourado legível */
    --highlight-border: rgba(255, 255, 255, 0.2); /* Borda sutil */
}

/* =========================================
   FORÇAR ESTILOS GLOBAIS
   ========================================= */

/* Inputs Globais */
input, select, textarea {
    background-color: var(--input-bg) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
}

/* Tabelas Globais (Adaptação Dark Mode) */
.dark_mode table th {
    background-color: var(--bg-card);
    color: var(--text-secondary);
    border-bottom-color: var(--border-color);
}
.dark_mode table td {
    border-bottom-color: var(--border-color);
    color: var(--text-primary);
}

/* Etiquetas de Validade (Classes Globais) */
.status_ok      { background-color: var(--status-ok-bg) !important; color: var(--status-ok-text) !important; font-weight: 700 !important; }
.status_proximo { background-color: var(--status-warning-bg) !important; color: var(--status-warning-text) !important; font-weight: 700 !important; }
.status_atencao { background-color: var(--status-warning-bg) !important; color: var(--status-warning-text) !important; border: 1px solid var(--status-warning-text) !important; font-weight: 700 !important; }
.status_critico, 
.status_vencido { background-color: var(--status-danger-bg) !important; color: var(--status-danger-text) !important; font-weight: 700 !important; }

/* Destaques (Vitrine / Balança) */
.coluna_vitrine_ativa, 
.texto_balanca, 
.destaque_vitrine,
.destaque_balanca {
    background-color: var(--highlight-bg) !important;
    color: var(--highlight-text) !important;
    border-color: var(--highlight-border) !important;
    font-weight: 700;
}

/* Cards de Edição e Avisos */
.dark_mode .box_edicao_expandida,
.dark_mode .modo_edicao {
    background-color: var(--bg-card) !important;
    border-color: var(--border-color) !important;
}

.dark_mode .box_aviso_producao {
    background-color: #172554 !important; /* Azul muito escuro */
    border-color: #1e3a8a !important;
    color: #dbeafe !important;
}
</style>

<style scoped>
/* (Estrutura do layout mantém-se original) */
.container_sistema {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-page);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
  overflow: hidden;
}

.menu_lateral {
  width: 260px;
  background-color: #1e293b; 
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out;
  z-index: 10;
}
.menu_lateral.recolhido { width: 80px; }

.cabecalho_menu {
    height: 70px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; border-bottom: 1px solid #334155;
}
.menu_lateral.recolhido .cabecalho_menu { justify-content: center; padding: 0; }
.texto_logo { font-size: 1.5rem; font-weight: bold; color: white; letter-spacing: 1px; }
.botao_toggle { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; }
.botao_toggle:hover { color: white; }

.navegacao { flex: 1; padding-top: 20px; display: flex; flex-direction: column; gap: 8px; padding-left: 10px; padding-right: 10px; }
.item_menu {
    display: flex; align-items: center; gap: 12px; padding: 12px 15px;
    color: #cbd5e1; text-decoration: none; border-radius: 8px; transition: all 0.2s; white-space: nowrap;
}
.item_menu:hover { background-color: #334155; color: white; }
.item_menu.ativo { background-color: var(--primary-color); color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); }
.menu_lateral.recolhido .item_menu { justify-content: center; }

.rodape_menu { padding: 20px; border-top: 1px solid #334155; }
.botao_sair {
    width: 100%; display: flex; align-items: center; gap: 10px;
    background-color: rgba(239, 68, 68, 0.1); color: #fca5a5;
    border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;
}
.botao_sair:hover { background-color: #ef4444; color: white; }
.menu_lateral.recolhido .botao_sair { justify-content: center; }

.conteudo_principal { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.barra_topo {
    height: 70px;
    background-color: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 30px; transition: background-color 0.3s;
}

.titulo_secao { font-size: 1.25rem; color: var(--text-primary); font-weight: 600; }

.usuario_info { display: flex; align-items: center; gap: 15px; }

.botao_tema {
    background: none; border: none; cursor: pointer;
    color: var(--text-secondary); padding: 8px; border-radius: 50%;
    transition: background 0.2s; display: flex; align-items: center;
}
.botao_tema:hover { background-color: var(--border-color); color: var(--primary-color); }

.avatar_usuario {
    width: 40px; height: 40px;
    background-color: var(--primary-color);
    color: white; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-weight: bold;
}

.area_router { flex: 1; padding: 30px; overflow-y: auto; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>