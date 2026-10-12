const fs = require('fs');
const path = require('path');
const { runBuild, itemsToCopy, rootDir } = require('./build');

let debounceTimer = null;
const watchers = [];

function scheduleBuild(trigger) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        console.log(`\n[watch] Mudanca detectada em: ${trigger}`);
        runBuild();
    }, 250);
}

function attachWatcher(relativePath) {
    const targetPath = path.join(rootDir, relativePath);

    if (!fs.existsSync(targetPath)) {
        console.warn(`[watch] Caminho nao encontrado, ignorando: ${relativePath}`);
        return;
    }

    const stat = fs.statSync(targetPath);

    if (stat.isDirectory()) {
        const watcher = fs.watch(targetPath, { recursive: true }, (_eventType, filename) => {
            const changed = filename ? path.join(relativePath, filename.toString()) : relativePath;
            scheduleBuild(changed);
        });
        watchers.push(watcher);
        console.log(`[watch] Monitorando pasta: ${relativePath}`);
        return;
    }

    const watcher = fs.watch(targetPath, () => {
        scheduleBuild(relativePath);
    });
    watchers.push(watcher);
    console.log(`[watch] Monitorando arquivo: ${relativePath}`);
}

function closeWatchersAndExit() {
    watchers.forEach((watcher) => watcher.close());
    console.log('\n[watch] Encerrado.');
    process.exit(0);
}

function runWatch() {
    console.log('[watch] Build inicial...');
    runBuild();

    itemsToCopy.forEach(attachWatcher);

    console.log('\n[watch] Aguardando alteracoes. Use Ctrl+C para sair.');
}

process.on('SIGINT', closeWatchersAndExit);
process.on('SIGTERM', closeWatchersAndExit);

runWatch();
