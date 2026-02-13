# Site Tayara Andreza - Artista de Forró

Site moderno, responsivo de página única (single-page) com design elegante preto e branco para divulgação e contratação da artista.

## 📁 Estrutura do Projeto

```
TAYARA ANDREZA/
├── index.html          # Página única com todas as seções
├── css/                # Pasta de estilos
│   └── style.css       # Estilos unificados
├── js/                 # Pasta de scripts
│   └── script.js       # JavaScript principal
├── images/             # Pasta de imagens
│   ├── fotos/          # Fotos da artista (foto1.jpg a foto6.jpg)
│   └── logo/           # Logos do site (TAYARA_logo01.png, TAYARA_logo02.png)
└── README.md           # Este arquivo
```

## 🎨 Características

- ✅ Design elegante em preto e branco
- ✅ **Site de página única** com navegação suave por âncoras
- ✅ Totalmente responsivo (mobile-first)
- ✅ Menu hambúrguer animado
- ✅ Header transparente com efeito ao scroll
- ✅ Galeria compacta com 4 fotos e lightbox animado
- ✅ Player de músicas integrado
- ✅ **Integração com Spotify** - Botão destacado e link no footer
- ✅ Formulário que integra com WhatsApp
- ✅ **Animações avançadas**: fade-in, slide, zoom, bounce, pulse, float, glow
- ✅ **Morcegos voando** - 8 morcegos animados + efeito interativo na logo
- ✅ Efeitos hover em cards, botões e imagens
- ✅ Logo personalizada de 120px com animação
- ✅ Seções: Início, Fotos, Músicas, Sobre, Agenda, Contato

## 🌟 Vantagens da Página Única

1. **Navegação Rápida** - Todas as informações em um só lugar
2. **Experiência Fluida** - Scroll suave entre seções
3. **Mobile-Friendly** - Perfeito para dispositivos móveis
4. **Fácil Manutenção** - Apenas um arquivo HTML para editar
5. **Carregamento Único** - Tudo carrega de uma vez

## 🚀 Como Usar

1. **Abrir o site**: Clique duas vezes em `index.html`

2. **Navegação**: O site possui seções que podem ser acessadas pelo menu:
   - **#inicio** - Banner principal com destaque
   - **#fotos** - Galeria completa de fotos
   - **#musicas** - Player de músicas interativo
   - **#sobre** - Biografia e estatísticas
   - **#agenda** - Shows e eventos agendados
   - **#contato** - Formulário de contratação

3. **Personalizar informações**:
   - Edite o arquivo `index.html` para alterar textos
   - Adicione fotos na pasta `images/fotos/`
   - A logo já está configurada em `images/logo/TAYARA_logo01.png`

4. **Configurar contatos**:
   - **WhatsApp**: No arquivo `js/script.js`, linha 317, altere o número
   - **Instagram**: No `index.html`, altere o link @
   - **E-mail**: No `index.html`, altere o endereço

## 📱 Seções do Site

1. **Início (#inicio)** - Banner principal com destaque para contratação
2. **Fotos (#fotos)** - Galeria completa em grade moderna com lightbox
3. **Músicas (#musicas)** - Player interativo com playlist
4. **Sobre (#sobre)** - Biografia e estatísticas
5. **Agenda (#agenda)** - Próximos shows e eventos
6. **Contato (#contato)** - Formulário de contratação integrado ao WhatsApp

## 🎵 Adicionar Músicas

Para adicionar músicas ao player:

1. Adicione os arquivos MP3 na pasta raiz ou em uma pasta `musicas/`
2. No `index.html`, localize a seção `#musicas` (playlist)
3. Edite os atributos `data-src` com o caminho dos arquivos
4. Atualize o nome e duração das músicas

Exemplo:
```html
<div class="playlist-item" data-src="musicas/minha-musica.mp3">
    <div class="playlist-info">
        <h3>Nome da Música</h3>
        <p>Tayara Andreza</p>
    </div>
    <span class="playlist-duration">3:45</span>
</div>
```

## 🖼️ Adicionar Fotos

1. Coloque as fotos na pasta `images/fotos/`
2. No `index.html`, localize a seção `#fotos` (galeria)
3. A galeria atual possui 4 fotos: `foto1.jpg` até `foto4.jpg`
4. Adicione ou remova itens da galeria conforme necessário

Exemplo de item da galeria:
```html
<div class="gallery-item animate-fade-in">
    <img src="images/fotos/foto5.jpg" alt="Tayara Andreza 5">
    <div class="gallery-overlay">
        <i class="fas fa-search-plus"></i>
    </div>
</div>
```

## ✨ Animações Disponíveis

O site conta com diversas animações que podem ser aplicadas aos elementos. Basta adicionar as classes CSS correspondentes:

**Classes de Animação:**
- `animate-fade-in` - Fade suave com movimento para cima
- `animate-slide-up` - Desliza de baixo para cima
- `animate-slide-left` - Desliza da esquerda
- `animate-slide-right` - Desliza da direita
- `animate-zoom-in` - Efeito zoom de entrada
- `animate-bounce` - Pula continuamente
- `animate-pulse` - Pulsa (aumenta/diminui)
- `animate-float` - Flutua suavemente
- `animate-glow` - Efeito brilho pulsante
- `animate-rotate` - Rotação contínua

**Classes de Delay:**
- `delay-1` até `delay-6` - Adiciona atraso de 0.1s a 0.6s

Exemplo de uso:
```html
<div class="highlight-card animate-zoom-in delay-2">
    <!-- Conteúdo -->
</div>
```

## 📞 Configurar WhatsApp

No arquivo `js/script.js`, localize a linha com `whatsappNumber`:

```javascript
const whatsappNumber = '5581999999999'; // Substitua pelo número real
// Formato: Código do país (55) + DDD + número
// Exemplo: 5581987654321
```

## 🎨 Personalizar Cores

No arquivo `css/style.css`, no início do arquivo (variáveis CSS):

```css
--primary-pink: #000000;      /* Preto principal */
--secondary-orange: #333333;   /* Cinza escuro */
--accent-gold: #ffffff;        /* Branco de destaque */
```

## 📝 Atualizar Agenda de Shows

No `index.html`, localize a seção `#agenda` e edite os itens da agenda:

```html
<div class="schedule-item">
    <div class="schedule-date">
        <span class="date-day">15</span>
        <span class="date-month">FEV</span>
    </div>
    <div class="schedule-info">
        <h3>Nome do Evento</h3>
        <p><i class="fas fa-map-marker-alt"></i> Cidade - UF</p>
        <p><i class="fas fa-clock"></i> Horário</p>
    </div>
</div>
```

## 🌐 Colocar Online

Para publicar o site:

1. **GitHub Pages** (gratuito):
   - Crie um repositório no GitHub
   - Faça upload dos arquivos
   - Ative GitHub Pages nas configurações

2. **Netlify** (gratuito):
   - Arraste a pasta para netlify.com/drop
   - Seu site estará online em segundos

3. **Hospedagem tradicional**:
   - Faça upload via FTP
   - Configure o domínio

## 💡 Dicas

- Use imagens de boa qualidade (mas otimizadas)
- Atualize a agenda regularmente
- Teste em diferentes dispositivos
- Mantenha os links de redes sociais atualizados

## 📱 Redes Sociais

Atualize os links sociais no arquivo `index.html`:
- **WhatsApp** - Seção footer (linha ~338)
- **Instagram** - Seção footer (linha ~341)
- **Spotify** - Seção footer (linha ~344) e botão na seção "Sobre" (linha ~214)
- **E-mail** - Seção footer (linha ~347)

**Link do Spotify:** `https://open.spotify.com/intl-pt/artist/0N78z4PhvpchRlJhXNVrKh`

Como o site é de página única, você só precisa editar o `index.html` uma vez.

## 🐛 Resolução de Problemas

**Fotos não aparecem?**
- Verifique os nomes dos arquivos
- Certifique-se de que estão na pasta correta
- Verifique a extensão (.jpg, .png)

**Músicas não tocam?**
- Verifique o caminho dos arquivos
- Use formato MP3
- Teste em navegadores diferentes

**Menu não abre?**
- Limpe o cache do navegador
- Verifique se o JavaScript está habilitado

## � SEO - Otimização para Mecanismos de Busca

O site foi otimizado completamente para aparecer em primeiro lugar quando alguém buscar "Tayara Andreza" no Google:

### ✅ Otimizações Implementadas

1. **Meta Tags SEO**
   - Descrição otimizada com palavras-chave
   - Keywords estratégicas (forró, artista, cantora, eventos)
   - Author e theme color configurados
   - Robots directives para melhor indexação

2. **Open Graph & Twitter Cards**
   - Compartilhamento otimizado em Facebook, Instagram, WhatsApp
   - Twitter Card para melhor visualização no Twitter
   - Imagem padrão para compartilhamento social

3. **Dados Estruturados (JSON-LD)**
   - Schema.org Person (para artista)
   - Schema.org PerformingGroup (para performances)
   - Google reconhece como artista profissional

4. **Sitemap.xml**
   - Arquivo criado para submeter ao Google Search Console
   - Ajuda o Google a descobrir todas as páginas
   - Arquivo: `/sitemap.xml`

5. **Robots.txt**
   - Configurado para permitir indexação completa
   - Arquivo: `/robots.txt`

6. **Canonical URL**
   - Define `https://tayaraandreza.com/` como versão oficial
   - Evita problemas de páginas duplicadas

7. **Performance**
   - Imagens com lazy loading
   - Compressão Gzip ativada
   - Browser caching configurado
   - CSS e JavaScript otimizados

8. **Links Sociais**
   - YouTube oficial
   - Instagram
   - Spotify
   - WhatsApp Business

## 🚀 Instruções de Deploy

### Passo 1: Registrar Domínio
1. Compre o domínio `tayaraandreza.com` em registrador como:
   - Godaddy
   - Namecheap
   - Registro.br
   - Hostinger

### Passo 2: Contratar Hospedagem
Escolha uma hospedagem que suporte:
- ✅ PHP 7.4+
- ✅ HTTPS/SSL (obrigatório)
- ✅ Mod_rewrite (para .htaccess)
- ✅ Sugestões: Hostinger, Bluehost, A2Hosting

### Passo 3: Upload dos Arquivos
1. Acesse o cPanel/Hosting via FTP ou File Manager
2. Faça upload de **todos** estes arquivos para a raiz (public_html):
   ```
   ✅ index.html
   ✅ sitemap.xml
   ✅ robots.txt
   ✅ .htaccess
   ✅ css/style.css
   ✅ js/script.js
   ✅ images/ (todas as pastas)
   ```

3. Verifique se as pastas ficaram assim:
   ```
   public_html/
   ├── index.html
   ├── sitemap.xml
   ├── robots.txt
   ├── .htaccess
   ├── css/style.css
   ├── js/script.js
   └── images/
   ```

### Passo 4: Configurar SSL/HTTPS
1. Ativa automaticamente em Hostinger/Bluehost
2. Certifique-se que `https://tayaraandreza.com` está ativo
3. O .htaccess força redirecionamento de HTTP → HTTPS

### Passo 5: Submeter ao Google
1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Adicione propriedade: `https://tayaraandreza.com`
3. Verifique propriedade (escolha um método disponível)
4. Envie o sitemap: `/sitemap.xml`
5. Monitore erros de rastreamento

### Passo 6: Google Analytics
1. Crie conta em [Google Analytics 4](https://analytics.google.com)
2. Copie o código de rastreamento
3. Cole antes de `</head>` no `index.html`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXX');
   </script>
   ```

## 📊 Checklist Pós-Deployment

- [ ] Domínio registrado e apontando para hospedagem
- [ ] Todos os arquivos fizeram upload correto
- [ ] HTTPS está funcionando (cadeado verde)
- [ ] `https://tayaraandreza.com` carrega perfeitamente
- [ ] Login funciona com senha: `tayara123`
- [ ] Fotos carregam sem erros
- [ ] Formulário de contato funciona
- [ ] Sitemap.xml é acessível em `/sitemap.xml`
- [ ] Robots.txt é acessível em `/robots.txt`
- [ ] Propriedade verificada no Google Search Console
- [ ] Sitemap enviado no GSC
- [ ] Google Analytics rastreando visitantes
- [ ] WhatsApp clicável redirecionando para conversas
- [ ] Instagram/YouTube/Spotify links funcionando

## 💡 Dicas de SEO Contínuo

1. **Postar regularmente** em Instagram/YouTube aumenta autoridade
2. **Atualizar biografia/descrição** mantém conteúdo fresco
3. **Usar hashtags relevantes**: #forró #cantora #eventos #contratações
4. **Obter backlinks** pedindo para:
   - Sites de eventos musicais
   - Blogs de música brasileira
   - Portais de contratação de artistas
5. **Monitorar rankings** no Google Search Console mensalmente

## �📄 Licença

Desenvolvido para Tayara Andreza © 2026
# Tayara-Andreza
