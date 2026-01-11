import { ref } from 'vue';
import { api_request } from '@/services/api_helper'; // Ajuste o caminho conforme onde este arquivo está (src/composables/...)

export function useProdutoForm() {
    
    const form = ref({
        id: '', tipo_item: 'REVENDA', nome: '', categoria: 'Outros',
        fornecedor_id: null, codigo_barras: '', codigo_balanca: '', 
        unidade_medida: 'UN', preco_custo: '', preco_venda: '', 
        estoque_deposito: '', estoque_vitrine: '', 
        validade: '', estoque_infinito: false,
        imagem_path_banco: null, imagem_arquivo_raw: null
    });

    const inicializarFormulario = (produtoEdicao) => {
        if (produtoEdicao) {
            form.value = {
                ...form.value, 
                ...produtoEdicao,
                estoque_infinito: produtoEdicao.estoque_infinito == 1 || produtoEdicao.estoque_infinito == true,
                imagem_path_banco: produtoEdicao.imagem_path,
                imagem_arquivo_raw: null
            };
            if(!form.value.categoria) form.value.categoria = 'Outros';
        } else {
            form.value = { 
                id: '', tipo_item: 'REVENDA', nome: '', categoria: 'Outros',
                fornecedor_id: null, codigo_barras: '', codigo_balanca: '', 
                unidade_medida: 'UN', preco_custo: '', preco_venda: '', 
                estoque_deposito: '', estoque_vitrine: '', 
                validade: '', estoque_infinito: false,
                imagem_path_banco: null, imagem_arquivo_raw: null
            };
        }
    };

    const prepararFormData = (lojaId) => {
        let formData = new FormData();
        // Garante que loja_id vá como string se existir
        if (lojaId) formData.append('loja_id', lojaId);
        
        for (const key in form.value) {
            if (key !== 'imagem_arquivo_raw' && key !== 'imagem_path_banco' && form.value[key] !== null && form.value[key] !== undefined) {
                if (key === 'estoque_infinito') {
                    formData.append(key, form.value[key] ? '1' : '0');
                } else {
                    formData.append(key, form.value[key]);
                }
            }
        }

        if (form.value.imagem_arquivo_raw) {
            formData.append('imagem_arquivo', form.value.imagem_arquivo_raw);
        }

        return formData;
    };

    const salvarProduto = async (lojaId, isEdicao) => {
        if (!lojaId) throw new Error("ID da Loja não identificado. Selecione uma loja primeiro.");

        const formData = prepararFormData(lojaId);
        let url = '/produtos';
        
        if (isEdicao) {
            url += `/${form.value.id}`;
            // Laravel exige POST com _method=PUT para upload de arquivos em edição
            formData.append('_method', 'PUT');
        }

        // CORREÇÃO:
        // 1. Enviamos sempre como 'post' (por causa do FormData/Laravel)
        // 2. Não passamos headers manuais, o helper cuida disso
        await api_request('post', url, formData);
    };

    return {
        form,
        inicializarFormulario,
        salvarProduto
    };
}