/**
 * Script para padronizar imports do api_helper
 * Para rodar: node fix_imports.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de diretórios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, 'src'); // Onde ele vai procurar

// O novo padrão que queremos em todos os arquivos
const NEW_IMPORT = "import { api_request } from '@/services/api_helper';";

// Regex poderosa:
// 1. Procura por "import"
// 2. Aceita "{ api_request }" OU "api_request" (import default antigo)
// 3. Procura "from"
// 4. Pega qualquer caminho que termine em "api_helper" ('../api_helper', './utils/api_helper', etc)
const REGEX_OLD_IMPORT = /import\s+(?:\{?\s*api_request\s*\}?|api_request)\s+from\s+['"].*\/api_helper['"];?/g;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

console.log('--- Iniciando Varredura de Imports ---');

walkDir(rootDir, (filePath) => {
    // Só nos interessam arquivos .js, .vue ou .ts
    if (!filePath.match(/\.(vue|js|ts)$/)) return;

    // Ignora o próprio arquivo de definição (o novo api_helper) para não estragar ele
    if (filePath.includes('services\\api_helper.js') || filePath.includes('services/api_helper.js')) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Verifica se tem o import antigo
        if (REGEX_OLD_IMPORT.test(content)) {
            console.log(`Corrigindo: ${filePath}`);
            
            // Faz a substituição
            const newContent = content.replace(REGEX_OLD_IMPORT, NEW_IMPORT);
            
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    } catch (err) {
        console.error(`Erro ao ler arquivo ${filePath}:`, err);
    }
});

console.log('--- Concluído! ---');