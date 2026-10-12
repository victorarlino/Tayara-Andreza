const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipPath = path.join(rootDir, 'dist.zip');

function runBuild() {
    execFileSync(process.execPath, [path.join(__dirname, 'build.js')], {
        stdio: 'inherit'
    });
}

function zipOnWindows() {
    const distEscaped = distDir.replace(/'/g, "''");
    const zipEscaped = zipPath.replace(/'/g, "''");

    const script = [
        "Add-Type -AssemblyName 'System.IO.Compression.FileSystem'",
        `$dist = '${distEscaped}'`,
        `$zip = '${zipEscaped}'`,
        'if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }',
        '[System.IO.Compression.ZipFile]::CreateFromDirectory($dist, $zip)'
    ].join('; ');

    execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
        stdio: 'inherit'
    });
}

function zipOnUnix() {
    if (fs.existsSync(zipPath)) {
        fs.rmSync(zipPath, { force: true });
    }

    execFileSync('zip', ['-r', zipPath, '.'], {
        cwd: distDir,
        stdio: 'inherit'
    });
}

function run() {
    runBuild();

    if (!fs.existsSync(distDir)) {
        throw new Error('Pasta dist não encontrada após o build.');
    }

    if (process.platform === 'win32') {
        zipOnWindows();
    } else {
        zipOnUnix();
    }

    console.log(`\n[build:zip] Finalizado. Arquivo gerado: ${zipPath}`);
}

run();
