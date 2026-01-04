<template>
  <div v-if="isOpen" class="modal_overlay">
    <div class="modal_senha">
        <h3>🛡️ Segurança</h3>
        <p>{{ mensagem || 'Confirme sua senha para continuar.' }}</p>
        
        <input 
            type="password" 
            v-model="senha" 
            placeholder="Sua senha de admin..." 
            class="input_padrao"
            @keyup.enter="confirmar"
            ref="inputSenha"
        >
        
        <div class="modal_actions">
            <button class="btn_cancelar" @click="$emit('close')">Cancelar</button>
            <button class="btn_confirmar" @click="confirmar">Confirmar</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    mensagem: String
});

const emit = defineEmits(['close', 'confirm']);

const senha = ref('');
const inputSenha = ref(null);

// Foca no input quando o modal abre
watch(() => props.isOpen, async (val) => {
    if (val) {
        senha.value = ''; // Limpa senha anterior
        await nextTick();
        if(inputSenha.value) inputSenha.value.focus();
    }
});

const confirmar = () => {
    if (!senha.value) return alert("Digite a senha.");
    emit('confirm', senha.value);
};
</script>

<style scoped>
.modal_overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(3px);
    display: flex; justify-content: center; align-items: center; z-index: 999;
}
.modal_senha {
    background: var(--bg-card); padding: 30px; border-radius: 12px;
    width: 400px; border: 1px solid var(--border-color);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center;
}
.modal_senha h3 { margin-top: 0; color: var(--text-primary); }
.modal_senha p { color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; box-sizing: border-box; }
.modal_actions { display: flex; justify-content: center; gap: 15px; margin-top: 20px; }
.btn_confirmar { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn_cancelar { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>