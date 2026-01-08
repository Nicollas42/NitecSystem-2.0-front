<template>
    <div v-if="visivel" class="modal_overlay" @click.self="fechar">
        <div class="modal_box">
            <div class="modal_header">
                <h3>{{ titulo }}</h3>
                <button class="btn_fechar_x" @click="fechar">×</button>
            </div>
            
            <div class="modal_body">
                <p>{{ conteudo }}</p>
            </div>

            <div class="modal_footer">
                <button class="btn_ok" @click="fechar">Entendi</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    visivel: { type: Boolean, required: true },
    titulo: { type: String, default: 'Observação' },
    conteudo: { type: String, default: '' }
});

const emit = defineEmits(['update:visivel']);

const fechar = () => {
    emit('update:visivel', false);
};
</script>

<style scoped>
.modal_overlay { 
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; 
    z-index: 1000; backdrop-filter: blur(2px); animation: fadeIn 0.2s ease;
}

.modal_box { 
    background: var(--bg-card); padding: 25px; border-radius: 12px; width: 500px; max-width: 90%;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid var(--border-color);
    display: flex; flex-direction: column; gap: 15px; animation: slideUp 0.2s ease;
}

.modal_header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
.modal_header h3 { margin: 0; color: var(--primary-color); }

.btn_fechar_x { background: none; border: none; font-size: 24px; color: var(--text-secondary); cursor: pointer; }
.btn_fechar_x:hover { color: var(--text-primary); }

.modal_body { 
    max-height: 300px; 
    overflow-y: auto; 
    color: var(--text-primary); 
    line-height: 1.6; 
    font-size: 14px; 
    
    /* ESSAS DUAS PROPRIEDADES GARANTEM A QUEBRA: */
    white-space: pre-wrap;       /* Respeita os 'Enters' que o usuário deu */
    overflow-wrap: break-word;   /* Força a quebra de linha se a palavra for muito longa */
    word-break: break-word;      /* Compatibilidade extra para navegadores antigos */
}

.modal_footer { display: flex; justify-content: flex-end; padding-top: 10px; border-top: 1px solid var(--border-color); }

.btn_ok { 
    background: var(--primary-color); color: white; border: none; 
    padding: 10px 25px; border-radius: 6px; font-weight: bold; cursor: pointer; 
}
.btn_ok:hover { opacity: 0.9; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>