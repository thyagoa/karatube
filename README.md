# KaraTube

Catálogo pessoal de karaokê que roda no navegador (PWA), feito para o celular, o tablet e o computador. Você cadastra os vídeos de karaokê do YouTube, cada música ganha um **código** (como numa máquina de karaokê), monta uma fila e abre o vídeo no app do YouTube ou manda para a TV.

Não tem servidor: o catálogo fica no seu aparelho e em um **repositório privado seu no GitHub** (conta gratuita). A sincronização com esse repositório é **obrigatória para cadastrar músicas**; é ela que mantém celular, tablet e computador iguais e impede códigos repetidos. Sem ela, o app só deixa consultar e importar um backup.

- App: <https://thyagoa.github.io/karatube/>
- Gerenciador para o computador: <https://thyagoa.github.io/karatube/gerenciador.html>

---

## Índice
1. [O que ele faz](#1-o-que-ele-faz)
2. [Usando o app no dia a dia](#2-usando-o-app-no-dia-a-dia)
3. [Gerenciador no computador](#3-gerenciador-no-computador)
4. [Montar o seu próprio KaraTube (para um amigo)](#4-montar-o-seu-próprio-karatube)
5. [Enviar para a TV (opcional)](#5-enviar-para-a-tv-opcional)
6. [Perguntas e problemas](#6-perguntas-e-problemas)

---

## 1. O que ele faz

- **Códigos:** cada música tem um código `123456` e cada versão (vídeo, tom ou voz diferente) `123456-01`, `123456-02`…
- **Cadastro rápido:** cole o link do YouTube e ele preenche o título e o canal. Dá para buscar capa, ano, origem (anime, jogo…) e grafias do cantor em bases online (MusicBrainz, AnimeThemes, AniList, Jikan, VocaDB, LRCLIB, iTunes).
- **Romaji:** gera o título e a letra inicial em romaji a partir do japonês.
- **Fila:** monte a fila da noite; a música sai da fila quando você marca "Cantei".
- **Listas e histórico:** listas de músicas e o histórico do que foi cantado, com notas.
- **Sincronização (obrigatória para cadastrar):** celular, tablet e computador ficam iguais, com cópia no seu repositório privado do GitHub.
- **Enviar para a TV:** opcional (recurso não oficial do YouTube).

## 2. Usando o app no dia a dia

**Instalar:** abra o endereço do app no Chrome do celular ou tablet › menu ⋮ › *Adicionar à tela inicial* (ou *Criar atalho*).

**Primeira abertura:** digite um apelido para o aparelho (ex.: "Celular do João"). Depois ligue a sincronização com o seu repositório de dados (veja a [seção 4](#4-montar-o-seu-próprio-karatube)). Sem ela o app não deixa cadastrar músicas nem versões novas, de propósito, para que dois aparelhos nunca criem o mesmo código ou se sobrescrevam. Editar o que já existe e importar backup continuam liberados.

**Cadastrar uma música:**
1. Aba **Cadastrar** › cole a URL do YouTube.
2. Confira título, cantor e idioma. Use **Buscar online** para trazer capa, ano e grafias, e **Gerar romaji** se o título for japonês.
3. Preencha a versão (tom, voz, tipo de vídeo, tags) e toque em **Salvar**.
4. Para outro vídeo da mesma música: abra a música › **Nova versão**.

**Cantar:**
1. No catálogo, toque no ícone de fila da música (ou da versão) para adicionar.
2. Na fila, **Abrir no YouTube** (ou o botão da TV).
3. Ao terminar, **Cantei** (sai da fila e vai para o histórico) ou **Não cantei**.

**Outras coisas úteis:**
- **Nº** no catálogo: vai direto a um código.
- **Filtros e ordenação:** idioma, origem, voz, tipo de vídeo, tags, nota, status do link.
- **Botão Sync** (barra de baixo / trilho): sincroniza na hora. Verde = em dia, vermelho = erro.
- **Ajustes › Organizar códigos:** tira os buracos da numeração (000001, 000002, 000003…). Sincronize os outros aparelhos antes de cadastrar depois disso.
- **Ajustes › Compartilhar e backup:** salva um arquivo de backup (Drive, WhatsApp…) e importa de volta.

**Como os códigos não se repetem:** cada aparelho recebe uma faixa de 100.000 números (o 1º usa `000001–099999`, o 2º `100000–199999`, o 3º `200000–299999`…). A faixa é escolhida na primeira sincronização e dá para ver/trocar em Ajustes › Este aparelho.

## 3. Gerenciador no computador

Uma página só (`gerenciador.html`) para cadastrar e editar com teclado e tela grande, gravando direto no seu repositório de dados.

- Abra `https://SEU-USUARIO.github.io/karatube/gerenciador.html` (ou o `gerenciador.html` do seu fork), ou baixe o arquivo e abra com duplo clique no Chrome. Ele também exige a sincronização: sem repositório e token, nada é cadastrado.
- Na primeira vez informe: apelido, repositório de dados e token (mesmo da seção 4).
- Cadastro igual ao do app (música, versão, busca online, romaji). **Ctrl+S** salva; em ~2 segundos já está no GitHub.
- O computador entra como mais um aparelho, com a própria faixa de códigos.

## 4. Montar o seu próprio KaraTube

Cada pessoa tem o próprio catálogo, em contas separadas. Você precisa de uma conta gratuita no GitHub. Leva uns 15 minutos.

**O que é indispensável:** o seu **repositório de dados privado** e o seu **token** (passos 2 a 4). Sem eles o cadastro fica bloqueado.

**O que é opcional:** o fork (passo 1). Duas formas de ter o app:
- **Usar o app que já está no ar** (`thyagoa.github.io/karatube`): pule o passo 1. Você usa o app do Thyago, mas liga a *sua* sincronização, com o *seu* repositório e o *seu* token; os dados ficam no seu aparelho e no seu repositório, nunca no dele. Quando ele atualiza o app, você recebe a atualização.
- **Ter a sua própria cópia** (passo 1): o app passa a morar na sua conta e só muda quando você quiser. Serve se você quer independência do Thyago, ou mudar o app.

### Passo 1 (opcional) — Copiar o app para a sua conta
1. Entre em <https://github.com/thyagoa/karatube> e clique em **Fork** (canto superior direito) › **Create fork**.
2. No seu fork: **Settings › Pages**. Em *Build and deployment*, escolha *Deploy from a branch*, branch **main**, pasta **/ (root)**, e **Save**.
3. Em 1–2 minutos o app estará em `https://SEU-USUARIO.github.io/karatube/` (a página de Pages mostra o endereço). O gerenciador fica em `.../gerenciador.html`.

### Passo 2 — Criar o repositório de dados (privado)
É onde o seu catálogo fica guardado e sincronizado.
1. GitHub › **New repository**.
2. Nome: `karatube-dados` (pode ser outro). Marque **Private**.
3. Marque *Add a README file* (assim o repositório já nasce com a branch principal). **Create repository**.

### Passo 3 — Gerar o token de acesso
O token é a "senha" que deixa o app ler e gravar só nesse repositório.
1. GitHub › sua foto › **Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token**.
2. Nome: `KaraTube celular` (faça um por aparelho, assim dá para revogar um sozinho).
3. Expiration: 1 ano, ou o prazo que preferir.
4. Repository access: **Only select repositories** › escolha o `karatube-dados`.
5. Permissions › Repository permissions › **Contents: Read and write**. Deixe o resto sem acesso.
6. **Generate token** e copie o valor (começa com `github_pat_`). Ele só aparece uma vez.

### Passo 4 — Ligar no app
1. Abra o app (do seu fork ou o do Thyago), dê um apelido ao aparelho.
2. **Ajustes › Sincronizar com o GitHub**.
3. Em *Repositório de dados* escreva **`seu-usuario/karatube-dados`**. O campo vem vazio de propósito; use o nome exato do repositório que você criou.
4. Cole o token › **Conectar e sincronizar**.
5. Quando o ponto ficar verde e a mensagem disser "Tudo em dia", o cadastro de músicas está liberado.

Repita nos outros aparelhos com **outro token** (passo 3) e o mesmo repositório. Eles se juntam sozinhos: o catálogo aparece igual e cada um recebe a sua faixa de códigos.

### Passo 5 — Importar um catálogo existente (opcional)
Se já tem um backup do KaraTube: **Ajustes › Compartilhar e backup › Importar**. Depois que a sincronização estiver ligada, ele sobe para o GitHub.

### Segurança e cuidados
- O token fica guardado **só no navegador** do aparelho (fora dos backups). Não o publique nem o mande por mensagem.
- Perdeu um aparelho? Revogue o token dele em *Developer settings*. Nada mais é afetado.
- Mantenha o repositório de dados **privado**.
- O GitHub guarda todo o histórico do arquivo `catalogo.json`: dá para recuperar versões antigas pelo próprio site, se precisar.
- Limpar os dados do site no navegador apaga a cópia local; com a sincronização ligada, o catálogo volta ao reconectar.

### O que fica em cada lugar
| O quê | Onde |
|---|---|
| Músicas, versões, listas, histórico | No aparelho + `catalogo.json` no repositório de dados |
| Capas | `capas/*.txt` no repositório de dados |
| Aparelhos e faixas de códigos | `dispositivos.json` no repositório de dados |
| Fila e ajustes | Só no aparelho (não sincronizam) |
| Token | Só no navegador do aparelho |

## 5. Enviar para a TV (opcional)

O YouTube não deixa um site falar direto com a TV, então você cria um proxy gratuito (leva 5 minutos). Faça uma vez; vale para todos os seus aparelhos. Sem isso, o botão **Abrir no YouTube** continua funcionando normalmente.

1. Crie uma conta grátis em <https://dash.cloudflare.com> (não precisa de cartão).
2. **Workers & Pages › Create › Create Worker**, dê um nome (ex.: `karatube`) › **Deploy**.
3. **Edit code**, apague tudo e cole o conteúdo de [`worker.js`](worker.js) › **Deploy**.
4. Copie o endereço do worker (ex.: `https://karatube.seunome.workers.dev`).
5. No KaraTube: **Ajustes › Enviar para a TV** › cole o endereço em *Endereço do proxy*.
6. Na TV: YouTube › Configurações › **Vincular com código da TV**. Digite os 12 dígitos no KaraTube e toque em **Parear**.
7. O botão de TV da fila e das versões passa a enviar o vídeo.

Esse recurso não é oficial; se o YouTube mudar algo, pode parar de funcionar um dia.

## 6. Perguntas e problemas

**"Cadastro de músicas bloqueado até a primeira sincronização."**
A sincronização ainda não foi ligada ou nunca terminou com sucesso. Ligue em Ajustes e toque em *Sincronizar agora*.

**Erro 404 / "Repositório não encontrado".**
O nome do repositório está errado (lembre de trocar `thyagoa` pelo seu usuário) ou o token não tem acesso a ele (passo 3, item 4).

**Erro 401 / "Token inválido".**
O token expirou ou foi colado errado. Gere outro e cole em Ajustes › Sincronizar.

**Erro 403.**
O token não tem a permissão *Contents: Read and write*, ou o GitHub limitou o uso por um tempo.

**O app não atualiza.**
Ajustes › Versão do app › *Verificar atualização* › *Atualizar agora*. No fork, as atualizações do projeto original chegam com *Sync fork* na página do seu fork.

**Dois aparelhos com o mesmo código?**
Não deveria acontecer: cada aparelho tem a sua faixa. Se algum aparelho foi instalado antes de a sincronização estar ligada, ligue-a e sincronize antes de cadastrar.

**O romaji não funciona.**
Precisa de internet na primeira vez para baixar o dicionário (~17 MB). Depois fica guardado no aparelho.

**"Abrir no YouTube" não abre o app.**
Funciona no Android com o app do YouTube instalado. No computador abre numa nova aba.

---

Projeto pessoal do Thyago, compartilhado como está. Sugestões e problemas: abra uma *issue* neste repositório.
