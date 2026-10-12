const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const buildVersion = Date.now().toString();

const itemsToCopy = [
    'index.html',
    'cadastro.html',
    'consulta-pessoas.html',
    'esqueci-senha.html',
    'fa-clube.html',
    'fans.html',
    'oficializar-fa-clube.html',
    'perfil.html',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
    '.htaccess',
    'css',
    'js',
    'images',
    'videos'
];

function clearDist() {
    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });
}

function copyItem(relativePath) {
    const sourcePath = path.join(rootDir, relativePath);
    const targetPath = path.join(distDir, relativePath);

    if (!fs.existsSync(sourcePath)) {
        console.warn(`[build] Arquivo/pasta não encontrado: ${relativePath}`);
        return;
    }

    fs.cpSync(sourcePath, targetPath, { recursive: true });
    console.log(`[build] Copiado: ${relativePath}`);
}

function addVersionToUrl(url) {
    if (!url || /^(https?:|\/\/|data:|mailto:|tel:|#)/i.test(url)) {
        return url;
    }

    const [base, hash = ''] = url.split('#');
    const [pathname, query = ''] = base.split('?');
    const shouldVersion = /\.(css|js|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(pathname);

    if (!shouldVersion) {
        return url;
    }

    const params = new URLSearchParams(query);
    params.set('v', buildVersion);
    const newQuery = params.toString();
    const withQuery = newQuery ? `${pathname}?${newQuery}` : pathname;

    return hash ? `${withQuery}#${hash}` : withQuery;
}

function applyCacheBustingToHtml() {
    const htmlFiles = fs
        .readdirSync(distDir)
        .filter((fileName) => fileName.toLowerCase().endsWith('.html'));

    htmlFiles.forEach((fileName) => {
        const htmlPath = path.join(distDir, fileName);
        let content = fs.readFileSync(htmlPath, 'utf8');

        content = content.replace(/\b(href|src)=(["'])([^"']+)\2/gi, (full, attr, quote, url) => {
            const updatedUrl = addVersionToUrl(url);
            return `${attr}=${quote}${updatedUrl}${quote}`;
        });

        fs.writeFileSync(htmlPath, content, 'utf8');
        console.log(`[build] Versionado: ${fileName}`);
    });
}

function runBuild() {
    clearDist();
    itemsToCopy.forEach(copyItem);
    applyCacheBustingToHtml();
    console.log(`\n[build] Finalizado. Pasta de saída: ${distDir}`);
}

if (require.main === module) {
    runBuild();
}

module.exports = {
    runBuild,
    itemsToCopy,
    rootDir,
    distDir
};
