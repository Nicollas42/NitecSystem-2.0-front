const fs = require('fs');
const path = require('path');

// Configurações
const root_dir = 'C:\\NitecSystem\\frontend'; 
const helper_absolute_path = 'C:\\NitecSystem\\frontend\\api_helper.js';

function process_directory(current_dir) {
    if (current_dir.includes('node_modules') || current_dir.includes('.git')) return;

    const files = fs.readdirSync(current_dir);

    files.forEach(file_name => {
        const full_path = path.join(current_dir, file_name);
        const stat = fs.statSync(full_path);

        if (stat.isDirectory()) {
            process_directory(full_path);
        } else if (/\.(js|ts|vue|jsx)$/.test(file_name)) {
            if (full_path !== helper_absolute_path && !full_path.includes('migrate_smart')) {
                replace_axios_in_file(full_path);
            }
        }
    });
}

function replace_axios_in_file(file_path) {
    let content = fs.readFileSync(file_path, 'utf8');
    let original_content = content;

    // Detecta se usa axios ou o antigo api.js
    const uses_axios = content.includes("from 'axios'") || content.includes('from "axios"');
    // Detecta se importa o antigo api_erp (ex: import api from './api')
    const uses_old_api = /import\s+(\w+)\s+from\s+['"].*\/api['"]/.test(content);

    if (!uses_axios && !uses_old_api) return;

    console.log(`[PROCESSANDO] ${file_path}`);

    // Calcular caminho relativo para o novo helper
    const dir_of_file = path.dirname(file_path);
    let relative_path = path.relative(dir_of_file, helper_absolute_path).replace(/\\/g, '/').replace('.js', '');
    if (!relative_path.startsWith('.')) relative_path = './' + relative_path;

    // 1. Substituir Imports
    // Remove import do axios
    content = content.replace(/import\s+axios\s+from\s+['"]axios['"];?/g, `import { api_request } from '${relative_path}';`);
    
    // Substitui import do antigo api.js (se houver)
    // Ex: import api_erp from './services/api' vira import { api_request } ...
    content = content.replace(/import\s+(\w+)\s+from\s+['"].*\/api['"];?/g, (match, var_name) => {
        // Se o arquivo usava "api_erp.get", vamos ter que substituir "api_erp" por "api_request" no código depois? 
        // Sim, mas o jeito mais fácil é substituir o import e mudar o nome da variável usada.
        // Estrategia: Trocamos o import e depois substituimos "nome_da_var.get"
        return `import { api_request } from '${relative_path}';`;
    });

    // 2. Substituir chamadas diretas do axios (axios.get)
    content = content.replace(/axios\.(get|delete|head)\(([^)]+)\)/g, "api_request('$1', $2)");
    content = content.replace(/axios\.(post|put|patch)\(([^)]+)\)/g, "api_request('$1', $2)");

    // 3. Substituir chamadas da instância antiga (ex: api_erp.get ou api.get)
    // Isso pega qualquer coisa antes do .get que pareça uma variavel de api
    content = content.replace(/(\w+)\.(get|delete|head)\(([^)]+)\)/g, (match, var_name, method, args) => {
        if (var_name === 'axios' || var_name === 'api_erp' || var_name === 'api') {
            return `api_request('${method}', ${args})`;
        }
        return match; // Se for "console.log", ignora
    });

    content = content.replace(/(\w+)\.(post|put|patch)\(([^)]+)\)/g, (match, var_name, method, args) => {
        if (var_name === 'axios' || var_name === 'api_erp' || var_name === 'api') {
            return `api_request('${method}', ${args})`;
        }
        return match;
    });

    if (content !== original_content) {
        fs.writeFileSync(file_path, content, 'utf8');
        console.log(`   -> [SALVO]`);
    }
}

process_directory(root_dir);