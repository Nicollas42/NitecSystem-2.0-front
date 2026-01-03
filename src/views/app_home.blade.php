<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#4F46E5">
    <title>Meu App Laravel</title>

    <link rel="manifest" href="{{ asset('manifest.json') }}">

    <style>
        /* Estilos usando Snake Case */
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            background_color: #f3f4f6;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .container_principal {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 90%;
        }

        .titulo_app {
            color: #333;
        }

        /* Botão de Instalação (Escondido por padrão) */
        .botao_instalar {
            display: none; /* Só aparece se o navegador permitir instalação */
            background-color: #4F46E5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        }

        .botao_instalar:hover {
            background-color: #4338ca;
        }
    </style>
</head>
<body>

    <div class="container_principal">
        <h1 class="titulo_app">Bem-vindo ao App</h1>
        <p>Esta é a versão PWA do seu sistema Laravel.</p>

        <button id="btn_instalar" class="botao_instalar">
            📲 Instalar Aplicativo
        </button>
    </div>

    <script>
        // Variável para guardar o evento de instalação
        let evento_instalacao_diferido;
        const btn_instalar = document.getElementById('btn_instalar');

        /**
         * Registra o Service Worker ao carregar a página
         */
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registro) {
                        console.log('Service Worker registrado com sucesso:', registro.scope);
                    }, function(erro) {
                        console.log('Falha ao registrar Service Worker:', erro);
                    });
            });
        }

        /**
         * Escuta o evento que navegador dispara quando o app pode ser instalado
         */
        window.addEventListener('beforeinstallprompt', (e) => {
            // Previne o comportamento padrão do Chrome (mini-infobar)
            e.preventDefault();
            // Salva o evento para usar depois
            evento_instalacao_diferido = e;
            // Mostra o botão de instalação
            btn_instalar.style.display = 'block';
        });

        /**
         * Ação de clique no botão de instalar
         */
        btn_instalar.addEventListener('click', async () => {
            if (evento_instalacao_diferido) {
                // Mostra o prompt nativo do navegador
                evento_instalacao_diferido.prompt();
                
                // Espera a escolha do usuário
                const { outcome } = await evento_instalacao_diferido.userChoice;
                
                console.log(`Usuário escolheu: ${outcome}`);
                
                // Limpa a variável
                evento_instalacao_diferido = null;
                // Esconde o botão novamente
                btn_instalar.style.display = 'none';
            }
        });
    </script>
</body>
</html>