import { ref, computed, unref } from 'vue';

export function useBuscaProduto(lista_fonte) {
    const termo_busca = ref('');
    const mostrar_lista = ref(false);

    const lista_filtrada = computed(() => {
        // unref garante que pegamos o valor seja ref ou prop
        const lista = unref(lista_fonte); 
        if (!lista) return [];

        if (!termo_busca.value) {
            return lista.slice(0, 10);
        }

        const t = termo_busca.value.toLowerCase();

        return lista.filter(p => 
            p.nome.toLowerCase().includes(t) || 
            String(p.id).includes(t) ||
            (p.codigo_barras && p.codigo_barras.includes(t))
        ).slice(0, 10);
    });

    const fechar_lista_delay = () => { setTimeout(() => { mostrar_lista.value = false; }, 200); };
    const limpar_busca = () => { termo_busca.value = ''; mostrar_lista.value = false; };

    return { termo_busca, mostrar_lista, lista_filtrada, fechar_lista_delay, limpar_busca };
}