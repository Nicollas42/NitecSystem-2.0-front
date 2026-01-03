<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frente de Caixa</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        /* Exemplo CSS snake_case */
        .btn_instalar_app {
            display: none; /* Oculto por padrão, aparece se instalável */
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <div class="container_principal">
        <h1>PDV Offline</h1>
        
        <button id="btn_download_app" class="btn_instalar_app">
            Instalar Sistema no Computador
        </button>

        <div class="area_vendas">
            </div>
    </div>

    <script>
        // Variável para guardar o evento de instalação
        let deferred_prompt;
        const btn_download = document.getElementById('btn_download_app');

        /**
         * Registra o Service Worker ao carregar a página.
         */
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then((registration) => {
                        console.log('Service Worker registrado com sucesso:', registration.scope);
                    })
                    .catch((error) => {
                        console.log('Falha ao registrar Service Worker:', error);
                    });
            });
        }

        /**
         * Escuta o evento 'beforeinstallprompt'.
         * O navegador dispara isso se o app atender aos critérios de PWA.
         */
        window.addEventListener('beforeinstallprompt', (e) => {
            // Previne o navegador de mostrar o prompt padrão imediatamente
            e.preventDefault();
            // Guarda o evento para acionar depois
            deferred_prompt = e;
            // Mostra nosso botão personalizado
            btn_download.style.display = 'block';
        });

        /**
         * Ação de clique no botão de instalação.
         */
        btn_download.addEventListener('click', async () => {
            if (deferred_prompt) {
                // Mostra o prompt de instalação nativo
                deferred_prompt.prompt();
                
                // Espera a escolha do usuário
                const choice_result = await deferred_prompt.userChoice;
                
                if (choice_result.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação');
                } else {
                    console.log('Usuário recusou a instalação');
                }
                
                // Limpa a variável
                deferred_prompt = null;
            }
        });
    </script>
</body>
</html>