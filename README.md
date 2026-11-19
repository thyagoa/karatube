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
6. [Modo Festa (fila compartilhada)](#6-modo-festa-fila-compartilhada)
7. [Trocar músicas com um amigo](#7-trocar-músicas-com-um-amigo)
8. [Perguntas e problemas](#8-perguntas-e-problemas)

Também: [Listador de canais do YouTube](#listador-de-canais-do-youtube).

---

## 1. O que ele faz

- **Códigos:** cada música tem um código `123456` e cada versão (vídeo, tom ou voz diferente) `123456-01`, `123456-02`…
- **Cadastro rápido:** cole o link do YouTube e ele preenche o título e o canal. Dá para buscar capa, ano, origem (anime, jogo…) e grafias do cantor em bases online sem chave (MusicBrainz, AnimeThemes, AniList, Jikan, VocaDB, LRCLIB, iTunes, Deezer, Cover Art Archive, Wikidata/Wikipedia). Em **Ajustes › Fontes de dados** você liga e desliga cada uma, vendo que tipo de dado ela traz. Quando uma fonte acha mais de um resultado (até 10), aparece um seletor **‹ 2 de 5 ›** para navegar entre eles antes de importar os campos.
- **Romaji:** gera o título e a letra inicial em romaji a partir do japonês.
- **Busca e filtros:** a busca olha título, cantor, letra, origem e versões; entre aspas (`"Hey Ho"`) procura a frase exata. Os filtros combinam idioma (vários), década, origem, voz, tipo de vídeo, tags, nota e status do link.
- **Fila:** monte a fila da noite; a música sai da fila quando você marca "Cantei". A lista do catálogo carrega sozinha conforme você rola.
- **Listas e histórico:** listas de músicas e o histórico do que foi cantado, com notas.
- **Sincronização (obrigatória para cadastrar):** celular, tablet e computador ficam iguais, com cópia no seu repositório privado do GitHub.
- **Modo Festa:** uma fila compartilhada em que os amigos entram por link ou QR code e pedem músicas pelo celular deles, navegando pelo catálogo com filtros (veja a [seção 6](#6-modo-festa-fila-compartilhada)).
- **Trocar músicas com um amigo:** exporta o seu catálogo e importa o dele, adicionando só o que é novo e mostrando um relatório do que entrou e do que ficou de fora (veja a [seção 7](#7-trocar-músicas-com-um-amigo)).
- **Enviar para a TV:** opcional (recurso não oficial do YouTube). Na lista de versões, o ícone de TV também coloca aquela versão como a música da vez (a que estava vai para a próxima), com **Desfazer**.

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
- **Card da música:** capa com o total de vezes cantada (`♪×n`), ano, título, cantor, origem, favorito no canto, e no rodapé o código, o idioma e quantas versões tem. Cada versão tem o seu card, com status do link, nota, etiquetas e os botões de abrir no YouTube, TV, fila e mais ações.
- **Filtros e ordenação:** idioma (marque quantos quiser), década (calculada pelo ano), origem, voz, tipo de vídeo, tags, nota, status do link. O campo de busca tem um X para limpar o texto.
- **Ajustes › Idiomas:** lista os idiomas com a contagem de músicas, permite criar e remover os seus e ligar a categoria "Sem idioma". A lista é sincronizada entre os aparelhos.
- **Ajustes › Ícone da fila:** escolhe o desenho do botão de adicionar à fila.
- **Botão Sync** (barra de baixo / trilho): sincroniza na hora. Verde = em dia, vermelho = erro.
- **Ajustes › Organizar códigos:** tira os buracos da numeração (000001, 000002, 000003…). Por segurança o botão fica escondido: toque em **Mostrar opção de reorganizar** para ele aparecer. Sincronize os outros aparelhos antes de cadastrar depois disso.
- **Ajustes › Backup (só para você):** salva uma cópia completa (Drive, WhatsApp…) e importa de volta. Para dar músicas a um amigo use **Exportar para outra pessoa** (veja a [seção 7](#7-trocar-músicas-com-um-amigo)).

**Como os códigos não se repetem:** cada aparelho recebe uma faixa de 100.000 números (o 1º usa `000001–099999`, o 2º `100000–199999`, o 3º `200000–299999`…). A faixa é escolhida na primeira sincronização e dá para ver/trocar em Ajustes › Este aparelho.

## 3. Gerenciador no computador

Uma página só (`gerenciador.html`) para cadastrar e editar com teclado e tela grande, gravando direto no seu repositório de dados.

- Abra `https://thyagoa.github.io/karatube/gerenciador.html` (ou o `gerenciador.html` do seu fork), ou baixe o arquivo e abra com duplo clique no Chrome. Ele também exige a sincronização: sem repositório e token, nada é cadastrado.
- Na primeira vez informe: apelido, repositório de dados e token (mesmo da seção 4).
- Cadastro igual ao do app (música, versão, busca online, romaji). **Ctrl+S** salva; em ~2 segundos já está no GitHub.
- O computador entra como mais um aparelho, com a própria faixa de códigos.

## Listador de canais do YouTube

Uma página à parte, `listador.html` (<https://thyagoa.github.io/karatube/listador.html>), para listar todos os vídeos de um canal de karaokê e copiar os links para cadastrar no KaraTube. Você informa o canal (`@nome`, endereço ou ID) e a **sua** chave da YouTube Data API v3 (gratuita; o passo a passo está na própria página). A chave fica só no navegador de quem usa, nunca no site.

- Lista do mais novo ao mais antigo, com título, data, duração, views e link; filtro por título, copiar link por linha, copiar todos os links, copiar tabela para planilha e baixar CSV.
- Títulos em **japonês** aparecem com **furigana** sobre os kanjis e o **romaji** embaixo; o filtro também acha pelo romaji. A caixinha "Furigana e romaji" liga e desliga (a primeira vez baixa o dicionário, ~17 MB). O furigana e o romaji já calculados ficam guardados no aparelho, então reabrir um canal grande é rápido. A tabela mostra só as linhas visíveis, por isso canais com mais de 20 mil vídeos rolam leves.
- Canais muito grandes (mais de ~20.000 vídeos): um botão busca os mais antigos além do limite da API.
- **Ligação com o gerenciador:** cada vídeo mostra, na coluna **Catálogo**, o selo **✓ código** se já está cadastrado no KaraTube, ou um botão **Cadastrar**. O botão abre a tela de nova música do gerenciador já preenchida (URL, sugestão de música e cantor a partir do título, romaji e idioma), para você conferir e salvar; o listador não cria música sozinho. O gerenciador precisa estar no mesmo site (GitHub Pages) e ligado ao GitHub. Os vídeos já cadastrados ficam com a linha inteira em **verde**, e o filtro **Só não cadastrados** esconde o que já está no catálogo.
- **Cache no GitHub:** os canais já baixados ficam guardados no seu repositório privado de dados (pasta `youtube/`), com o mesmo repositório e token do KaraTube. Em qualquer aparelho, o seletor **"Canais já baixados"** abre o canal sem gastar cota e sem precisar da chave da API. A chave só é necessária para listar ou atualizar, e pode ficar só no computador. **Atualizar** lê só os vídeos novos (cerca de 3 unidades de cota); **Recarregar tudo** refaz a listagem completa, pedindo confirmação.

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
Se já tem um backup do KaraTube: **Ajustes › Backup (só para você) › Importar**. Depois que a sincronização estiver ligada, ele sobe para o GitHub. O mesmo botão importa o catálogo exportado por um amigo (veja a [seção 7](#7-trocar-músicas-com-um-amigo)).

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
| Idiomas criados por você | `catalogo.json` no repositório de dados (sincronizam) |
| Segredo dos moderadores do Modo Festa | `sala.json` no repositório de dados |
| Canais já baixados no listador | pasta `youtube/` no repositório de dados |
| Fila e demais ajustes (fontes de dados, ícone da fila, endereço e nome do Modo Festa…) | Só no aparelho (não sincronizam) |
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

No Modo Festa, o moderador também manda músicas para a TV: o pedido passa pelo aparelho do dono, que é o pareado com a TV.

Esse recurso não é oficial; se o YouTube mudar algo, pode parar de funcionar um dia.

## 6. Modo Festa (fila compartilhada)

Uma fila só para todos os aparelhos, com os amigos pedindo músicas pelo celular deles. Quem cria a festa é o **dono**; os seus outros aparelhos entram como **moderadores**; os amigos entram como **convidados**, só com um link ou QR code (sem instalar nada e sem conta).

Precisa de um Worker gratuito na Cloudflare, separado do da TV. O passo a passo completo (instalar, atualizar e resolver problemas) está no [LEIA-ME-SALA.md](LEIA-ME-SALA.md).

**Resumo:**
1. Instale o Worker da festa (uma vez) e copie o endereço dele.
2. No aparelho do dono: **Ajustes › Modo Festa** › cole o endereço › **Criar sala**.
3. Convide com **Copiar link**, **Compartilhar** ou **QR code**.
4. Escolha o que o convidado pode fazer: **pesquisar**, **navegar** pelo catálogo (com filtros) e quantos **pedidos por pessoa** (1 a 5 ou sem limite).

**O convidado vê:** "Festa de *nome do dono*", a lista de músicas (toque para abrir a sanfona com origem, tags e as versões e escolher qual **Pedir**), filtros, a fila e o que está tocando. Ele usa o mesmo tema (claro ou escuro) do dono. Se o dono cadastrar músicas durante a festa, aparece o aviso para atualizar o catálogo.

**Dicas:** o app mantém a tela ligada durante a festa (o Android derruba a conexão quando a tela apaga). Para enviar à TV, o aparelho do dono precisa estar aberto e conectado: os moderadores pedem e o dono executa.

## 7. Trocar músicas com um amigo

Cada um tem a **sua** base, mas dá para trocar arquivos e as duas bases crescerem juntas. Há dois recursos diferentes em Ajustes:

| | Para quê | O que leva |
|---|---|---|
| **Backup (só para você)** | Guardar uma cópia sua ou levar para outro aparelho seu | Tudo: músicas, versões, listas, histórico, notas, quantas vezes cantou. Os códigos continuam os mesmos |
| **Exportar para outra pessoa** | Dar músicas a um amigo | Só o catálogo: títulos, cantores, links dos vídeos, tom, voz, tags, letra e capa. Sem notas, favoritas, listas, histórico nem vezes cantadas, e sem os seus códigos |

**Exportar:** Ajustes › **Exportar para outra pessoa**. Há dois caminhos:
- **Escolher músicas…:** busque, marque a música inteira ou abra a música e marque só as versões que quiser (a caixa fica "pela metade" quando só parte vai). Cada versão mostra a miniatura do vídeo, o canal e as estrelas, para você saber qual é qual. Os botões **Marcar todas** e **Limpar** valem para o que está na lista.
- **Exportar tudo:** leva o catálogo inteiro.

Nos dois casos aparece uma tela de **conferência** com a contagem, o que vai e o que fica de fora, e o tamanho do arquivo. Aí você toca em **Enviar** (abre a lista de apps do Android: WhatsApp, e-mail, Drive, Quick Share…) ou em **Salvar em Downloads**.

**Importar:** Ajustes › **Backup (só para você)** › **Importar** e escolha o arquivo. O app reconhece sozinho que é um catálogo de outra pessoa e mostra, antes de gravar qualquer coisa:
- **Músicas novas:** entram com um código livre da **sua** base.
- **Já existem:** a música (mesmo vídeo, ou mesmo título e primeiro cantor) já está na sua base. Entram **só as versões (vídeos) que você ainda não tem**, como a próxima versão daquela música. Os seus dados dela ficam intactos.
- **Parecidas:** a música não é igual a nenhuma sua, mas lembra alguma (por exemplo "Gurenge (TV Size)" e a sua "Gurenge", ou o mesmo título com o cantor escrito de outro jeito). O app pergunta, para cada uma: **é uma destas que você já tem** (entram só as versões que faltam nela), **é uma música nova** ou **não importar**. O botão Importar só libera depois de você decidir todas, para não criar músicas duplicadas sem querer.
- **Nada de novo:** tudo ali você já tem; fica de fora.

Vídeo repetido dentro do arquivo é unificado, e as versões importadas entram como **não verificado** (o "funcionando" ou "quebrado" do seu amigo não vem junto). Você pode desmarcar o que não quiser.

**Relatório:** depois de importar, uma tela mostra o que foi **cadastrado** (com os códigos novos), as **versões adicionadas** a músicas que você já tinha e tudo o que foi **ignorado, com o motivo** (por exemplo "o vídeo já existe em 000123-01"). O que veio de uma decisão sua nas músicas parecidas aparece com a etiqueta **Decisão sua**. O botão **Copiar relatório** copia tudo em texto.

Para trocar nos dois sentidos, é só repetir: cada um exporta e importa o do outro, e o que já existe não duplica.

## 8. Perguntas e problemas

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

**"Não consegui ler o vídeo" ou "O YouTube não deixa ler os dados deste vídeo".**
Alguns donos desativam a incorporação; o vídeo continua tocando normalmente, só não dá para preencher título e canal sozinho. Preencha à mão. Se a mensagem for "(sem internet?)", confira a conexão.

**Importei o arquivo de um amigo e uma música não entrou.**
Veja o relatório que aparece depois da importação: ele lista tudo o que foi ignorado, com o motivo (o vídeo já existia, estava repetido no arquivo, você desmarcou…). Música que você já tem só recebe as versões que faltam.

**"Sala não encontrada" ou "A festa acabou".**
O código está errado ou o dono encerrou a festa. Peça o link ou o QR code de novo. Mais problemas do Modo Festa (convidado que não consegue navegar, Worker desatualizado…) estão no [LEIA-ME-SALA.md](LEIA-ME-SALA.md).

**O romaji não funciona.**
Precisa de internet na primeira vez para baixar o dicionário (~17 MB). Depois fica guardado no aparelho.

**"Abrir no YouTube" não abre o app.**
Funciona no Android com o app do YouTube instalado. No computador abre numa nova aba.

---

Projeto pessoal do Thyago, compartilhado como está. Sugestões e problemas: abra uma *issue* neste repositório.
