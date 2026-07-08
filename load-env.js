const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const outputPath = path.join(__dirname, 'src', 'services', 'env.ts');

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  const examplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(examplePath)) {
    envContent = fs.readFileSync(examplePath, 'utf8');
  }
}

const vars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const index = trimmed.indexOf('=');
    if (index !== -1) {
      const key = trimmed.substring(0, index).trim();
      const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
      vars[key] = val;
    }
  }
});

const fileContent = `// Automatically generated from .env - DO NOT EDIT DIRECTLY
export const API_URL_ANDROID = '${vars.API_URL_ANDROID || 'http://10.0.2.2:5000/api'}';
export const API_URL_IOS = '${vars.API_URL_IOS || 'http://localhost:5000/api'}';
export const SOCKET_URL_ANDROID = '${vars.SOCKET_URL_ANDROID || 'http://10.0.2.2:5000'}';
export const SOCKET_URL_IOS = '${vars.SOCKET_URL_IOS || 'http://localhost:5000'}';
`;

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('[load-env] Generated src/services/env.ts from .env');
