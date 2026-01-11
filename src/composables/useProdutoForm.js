import { ref } from 'vue';
import axios from 'axios';

export function useProdutoForm() {
    
    const form = ref({
        id: '', tipo_item: 'REVENDA', nome: '', categoria: 'Outros',
        fornecedor_id: null, codigo_barras: '', codigo_balanca: '', 
        unidade_medida: 'UN', preco_custo: '', preco_venda: '', 
        estoque_deposito: '', estoque_vitrine: '', 
        validade: '', estoque_infinito: false,
        imagem_path_banco: null, imagem_arquivo_raw: null
    });

    // Lógica de preenchimento (Edição vs Novo)
    const inicializarFormulario = (produtoEdicao) => {
        if (produtoEdicao) {
            // Mapeia os campos do objeto vindo do banco para o form
            form.value = {
                ...form.value, // Mantém defaults
                ...produtoEdicao, // Sobrescreve com dados do banco
                estoque_infinito: produtoEdicao.estoque_infinito == 1 || produtoEdicao.estoque_infinito == true,
                imagem_path_banco: produtoEdicao.imagem_path,
                imagem_arquivo_raw: null
            };
            // Tratamento especial para nulos
            if(!form.value.categoria) form.value.categoria = 'Outros';
        } else {
            // Reset total
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

    // Lógica de Envio (FormData)
    const prepararFormData = (lojaId) => {
        let formData = new FormData();
        formData.append('loja_id', lojaId);
        
        // Loop simples para adicionar tudo que não for arquivo ou especial
        for (const key in form.value) {
            if (key !== 'imagem_arquivo_raw' && key !== 'imagem_path_banco' && form.value[key] !== null) {
                // Converte booleano para 1/0
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
        const formData = prepararFormData(lojaId);
        let url = 'http://127.0.0.1:8000/api/produtos';
        
        if (isEdicao) {
            url += `/${form.value.id}`;
            formData.append('_method', 'PUT');
        }

        await axios.post(url, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}`, 'Content-Type': 'multipart/form-data' }
        });
    };

    return {
        form,
        inicializarFormulario,
        salvarProduto
    };
}