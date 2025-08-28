/**
 * Servidor HTTP para Manychat Display
 * Responsável por servir arquivos estáticos e configurar cabeçalhos adequados
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Estatísticas para monitoramento de saúde
const healthStats = {
    startTime: Date.now(),
    requestsTotal: 0,
    requestsSuccess: 0,
    requestsError: 0,
    lastError: null,
    videoStreamsTotal: 0,
    videoStreamsActive: 0
};

// Mapeamento de extensões de arquivo para tipos MIME
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
};

// Pasta raiz para servir arquivos estáticos
const PUBLIC_DIR = path.join(__dirname, 'public');

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    healthStats.requestsTotal++;
    
    // Analisar a URL da requisição
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Endpoint de verificação de saúde para Docker Swarm
    if (pathname === '/health') {
        const uptime = Math.floor((Date.now() - healthStats.startTime) / 1000);
        const healthStatus = {
            status: 'UP',
            uptime: `${uptime} segundos`,
            version: '1.0',
            stats: {
                requests: {
                    total: healthStats.requestsTotal,
                    success: healthStats.requestsSuccess,
                    error: healthStats.requestsError
                },
                videoStreams: {
                    total: healthStats.videoStreamsTotal,
                    active: healthStats.videoStreamsActive
                }
            },
            memory: process.memoryUsage()
        };
        
        // Verifica se houve muitos erros em sequência
        const errorRate = healthStats.requestsError / Math.max(1, healthStats.requestsTotal);
        if (errorRate > 0.5 && healthStats.requestsTotal > 10) {
            healthStatus.status = 'DEGRADED';
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthStatus, null, 2));
        return;
    }
    
    // Redirecionar '/' para '/index.html'
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construir o caminho do arquivo no sistema de arquivos
    const filePath = path.join(PUBLIC_DIR, pathname);
    
    // Verificar se o arquivo existe
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // Se o arquivo não existe, retornar 404
            if (err.code === 'ENOENT') {
                console.error(`Arquivo não encontrado: ${filePath}`);
                healthStats.requestsError++;
                healthStats.lastError = `Arquivo não encontrado: ${pathname}`;
                
                // Retornar página 404 personalizada
                fs.readFile(path.join(PUBLIC_DIR, '404.html'), (err, data) => {
                    if (err) {
                        // Se a página 404 não existe, retornar resposta simples
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 - Não Encontrado');
                        return;
                    }
                    
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(data);
                });
                return;
            }
            
            // Para outros erros, retornar 500
            console.error(`Erro ao acessar o arquivo: ${err}`);
            healthStats.requestsError++;
            healthStats.lastError = `Erro ao acessar o arquivo: ${err.message}`;
            
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 - Erro Interno do Servidor');
            return;
        }
        
        // Se for um diretório, redirecionar para index.html nesse diretório
        if (stats.isDirectory()) {
            const indexPath = path.join(filePath, 'index.html');
            
            fs.stat(indexPath, (err, stats) => {
                if (err || !stats.isFile()) {
                    // Se index.html não existe no diretório, retornar 404
                    healthStats.requestsError++;
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 - Diretório sem arquivo index');
                    return;
                }
                
                // Redirecionar para o index.html com uma barra no final
                if (!pathname.endsWith('/')) {
                    res.writeHead(301, { 'Location': `${pathname}/` });
                    res.end();
                    return;
                }
                
                // Servir o arquivo index.html
                serveFile(indexPath, req, res);
            });
            return;
        }
        
        // Servir o arquivo encontrado
        serveFile(filePath, req, res);
    });
});

/**
 * Serve um arquivo para o cliente
 * @param {string} filePath - Caminho do arquivo
 * @param {http.IncomingMessage} req - Objeto de requisição HTTP
 * @param {http.ServerResponse} res - Objeto de resposta HTTP
 */
function serveFile(filePath, req, res) {
    // Determinar o tipo MIME com base na extensão do arquivo
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Configurações para streaming de vídeo
    const isVideo = contentType.startsWith('video/');
    
    // Abrir o arquivo como stream
    let fileStream;
    
    try {
        fileStream = fs.createReadStream(filePath);
    } catch (err) {
        console.error(`Erro ao abrir o arquivo: ${err}`);
        healthStats.requestsError++;
        healthStats.lastError = `Erro ao abrir o arquivo: ${err.message}`;
        
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Erro Interno do Servidor');
        return;
    }
    
    // Manipular erros do stream
    fileStream.on('error', (err) => {
        console.error(`Erro no stream de arquivo: ${err}`);
        healthStats.requestsError++;
        healthStats.lastError = `Erro no stream de arquivo: ${err.message}`;
        
        // Se o cliente já recebeu cabeçalhos, não podemos enviar um novo código de status
        if (res.headersSent) {
            res.end();
            return;
        }
        
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Erro Interno do Servidor');
    });
    
    // Configurar cabeçalhos comuns
    const headers = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache de 1 dia
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
    };
    
    // Suporte a streaming de vídeo com range requests
    if (isVideo) {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        // Incrementar contador de streams de vídeo
        healthStats.videoStreamsTotal++;
        healthStats.videoStreamsActive++;
        
        // Diminuir contador quando o stream terminar
        res.on('close', () => {
            healthStats.videoStreamsActive = Math.max(0, healthStats.videoStreamsActive - 1);
        });
        
        if (range) {
            // Extrair start e end do header Range
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            
            fileStream = fs.createReadStream(filePath, { start, end });
            
            headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
            headers['Accept-Ranges'] = 'bytes';
            headers['Content-Length'] = chunkSize;
            
            res.writeHead(206, headers); // Status 206 Partial Content
        } else {
            // Se não houver range, enviar o arquivo inteiro
            headers['Content-Length'] = fileSize;
            headers['Accept-Ranges'] = 'bytes';
            
            res.writeHead(200, headers);
        }
    } else {
        // Para arquivos não-vídeo, enviar cabeçalhos normais
        res.writeHead(200, headers);
    }
    
    // Enviar o arquivo como stream para o cliente
    fileStream.pipe(res);
    
    // Incrementar contador de sucesso quando a resposta for enviada
    fileStream.on('end', () => {
        healthStats.requestsSuccess++;
    });
}

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor Manychat Display rodando em http://localhost:${PORT}`);
    console.log(`Servindo arquivos de: ${PUBLIC_DIR}`);
    console.log(`Endpoint de saúde disponível em: http://localhost:${PORT}/health`);
});

// Lidar com erros do servidor
server.on('error', (err) => {
    console.error('Erro no servidor:', err);
    healthStats.lastError = `Erro no servidor: ${err.message}`;
    
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Tente outra porta.`);
        process.exit(1);
    }
});

// Lidar com encerramento do processo
process.on('SIGINT', () => {
    console.log('Servidor sendo desligado...');
    server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
    });
});