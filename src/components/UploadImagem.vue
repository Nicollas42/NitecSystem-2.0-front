<template>
    <div class="upload_wrapper">
        <label class="titulo_upload">{{ label }}</label>
        
        <div 
            class="image_preview_box" 
            @click="tratarCliquePrincipal" 
            :class="{ 'tem_imagem': previewUrl }"
            title="Clique para visualizar ou adicionar"
        >
            <img v-if="previewUrl" :src="previewUrl" class="imagem_mini" alt="Preview">
            
            <div v-else class="placeholder_box">
                <span class="icone_camera">📷</span>
                <span class="texto_add">+ Foto</span>
            </div>
        </div>

        <input 
            type="file" 
            ref="fileInput" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            style="display: none;"
            @change="handleFileChange"
        >

        <div v-if="modalAberto" class="modal_overlay" @click.self="modalAberto = false">
            <div class="modal_view_content">
                <button class="btn_fechar" @click="modalAberto = false">×</button>
                
                <div class="area_imagem_full">
                    <img :src="previewUrl" class="imagem_full">
                </div>

                <div class="area_botoes_modal">
                    <button class="btn_trocar" @click="acionarInput">🔄 Trocar Imagem</button>
                    </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    label: { type: String, default: 'Foto' },
    imagemAtualPath: { type: String, default: null }
});

const emit = defineEmits(['arquivo-selecionado']);

const fileInput = ref(null);
const novoArquivoPreview = ref(null);
const modalAberto = ref(false);

const previewUrl = computed(() => {
    if (novoArquivoPreview.value) return URL.createObjectURL(novoArquivoPreview.value);
    if (props.imagemAtualPath) return `http://127.0.0.1:8000/storage/${props.imagemAtualPath}`;
    return null;
});

// Lógica do Clique:
// 1. Se não tem imagem -> Abre seletor direto.
// 2. Se tem imagem -> Abre o modal para ver grande.
const tratarCliquePrincipal = () => {
    if (!previewUrl.value) {
        acionarInput();
    } else {
        modalAberto.value = true;
    }
};

const acionarInput = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
             alert("A imagem deve ter no máximo 2MB.");
             return;
        }
        novoArquivoPreview.value = file;
        emit('arquivo-selecionado', file);
        modalAberto.value = false; // Fecha o modal se estiver aberto
    }
};

// Reseta se mudar o produto pai
watch(() => props.imagemAtualPath, () => {
    novoArquivoPreview.value = null;
});
</script>

<style scoped>
.upload_wrapper { width: 100%; }
.titulo_upload { font-weight: 600; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 5px; display: block; }

/* MINIATURA (NOVA - MENOR E MAIS COMPACTA) */
.image_preview_box {
    width: 150px; /* Tamanho fixo e menor para alinhar com inputs */
    height: 140px;
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
    background: var(--bg-page);
    transition: all 0.2s ease;
    position: relative;
}
.image_preview_box:hover { border-color: var(--primary-color); background: var(--hover-bg); }
.image_preview_box.tem_imagem { border-style: solid; border: 1px solid var(--border-color); }

.imagem_mini { width: 100%; height: 100%; object-fit: cover; }

.placeholder_box { display: flex; flex-direction: column; align-items: center; color: var(--text-secondary); gap: 5px; }
.icone_camera { font-size: 24px; opacity: 0.5; }
.texto_add { font-size: 11px; font-weight: 600; }

/* MODAL / LIGHTBOX */
.modal_overlay { 
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.85); z-index: 1000; 
    display: flex; justify-content: center; align-items: center; 
    backdrop-filter: blur(3px); animation: fadeIn 0.2s;
}

.modal_view_content { 
    background: transparent; max-width: 90%; max-height: 90%; 
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 15px; 
}

.area_imagem_full { 
    border-radius: 8px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); 
    max-height: 80vh; border: 2px solid white; background: #000;
}
.imagem_full { max-width: 100%; max-height: 80vh; display: block; }

.area_botoes_modal { display: flex; gap: 10px; }
.btn_trocar { 
    background: white; color: #333; border: none; padding: 10px 20px; 
    border-radius: 30px; font-weight: bold; cursor: pointer; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s;
}
.btn_trocar:hover { transform: scale(1.05); background: #f0f0f0; }

.btn_fechar { 
    position: absolute; top: -40px; right: -40px; 
    background: none; border: none; color: white; font-size: 30px; cursor: pointer; 
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>