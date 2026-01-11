<template>
    <div class="secao_form destaque_info">
        <h3 class="subtitulo_form">2. Configuração de Produção</h3>
        <div class="box_aviso_producao">
            <p><strong>Este é um produto de Fabricação Própria.</strong></p>
            <ul>
                <li>💰 <strong>Custo:</strong> Será calculado na aba "Ficha Técnica".</li>
                <li>🏷️ <strong>Venda:</strong> Definido na aba "Precificação".</li>
                <li>📦 <strong>Estoque:</strong> Alimentado pela "Produção Diária".</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.secao_form { margin-bottom: 20px; }
.subtitulo_form { color: var(--primary-color); font-size: 14px; margin-bottom: 15px; font-weight: bold; }
.destaque_info { background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; }
.box_aviso_producao { font-size: 14px; color: var(--text-primary); }
.box_aviso_producao ul { margin-top: 10px; padding-left: 20px; }
.box_aviso_producao li { margin-bottom: 5px; }
</style>