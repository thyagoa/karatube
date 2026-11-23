# Modo Festa (fila compartilhada) — como ligar e usar

O Modo Festa junta todos os aparelhos numa **fila só**. Quem cria a festa é o **dono**; seus outros aparelhos entram como **moderadores**; os amigos entram como **convidados**, só com o link (ou o QR code), e pedem músicas pelo próprio celular.

Ele usa um Worker **separado** do proxy da TV (o `worker.js` continua como está). O Worker guarda a fila de cada festa num Durable Object e avisa todos os aparelhos na hora, por WebSocket. É grátis na Cloudflare.

## 1. Instalar o Worker (uma vez só)
1. Conta grátis em <https://dash.cloudflare.com> (a mesma da TV serve).
2. No computador, na pasta com os arquivos do KaraTube (`worker-sala.js` e `wrangler-sala.toml`):
   ```
   npx wrangler login
   npx wrangler deploy -c wrangler-sala.toml
   ```
3. Ele mostra o endereço, algo como `https://karatube-sala.seunome.workers.dev`. Abra esse endereço no navegador: deve aparecer `karatube-sala ok`.

A primeira instalação precisa do `wrangler` (é ele que cria o Durable Object). Pelo painel da Cloudflare dá para **atualizar** depois, mas não instalar do zero.

## 2. Atualizar o Worker quando o app pedir
Algumas versões do app mudam o `worker-sala.js`. Quando isso acontece, o app novo continua abrindo, mas os recursos novos da festa só funcionam depois de atualizar o Worker:

1. Abra o `worker-sala.js` atual: <https://raw.githubusercontent.com/thyagoa/karatube/main/worker-sala.js> (ou o arquivo da sua cópia) e copie tudo.
2. Cloudflare › Workers & Pages › **karatube-sala** › **Edit code**.
3. Apague o código que está lá, cole o novo e clique em **Deploy**. Não mexa em mais nada (o arquivo `wrangler-sala.toml` não é usado aqui).

| Versão do app | O que depende do Worker novo |
|---|---|
| 1.21 | Convidado navegar no catálogo, filtros, limite de pedidos configurável, nome do dono, tema herdado e aviso de catálogo novo |

Durante o Deploy as conexões podem cair por alguns segundos; os aparelhos reconectam sozinhos e a fila da festa é mantida.

## 3. Criar a festa
1. No aparelho que vai ser o **dono** (o que está pareado com a TV): **Ajustes › Modo Festa** › cole o endereço do Worker › **Criar sala**. Aparece o código (10 letras e números).
2. Convide com **Copiar link**, **Compartilhar** (abre a lista de apps do Android) ou **QR code** (o amigo aponta a câmera e cai direto na tela de entrada).
3. O nome que aparece para os convidados ("Festa de ...") é o seu **Nome na sala** (ou o apelido do aparelho).

### Opções do dono (Ajustes › Modo Festa)
- **Convidados podem pesquisar:** mostra a caixa de busca (título, cantor ou código).
- **Convidados podem navegar:** mostra a lista do catálogo, com filtros e ordem. Se as duas opções ficarem desligadas, o convidado só pede digitando o código da música (ex.: `000123-01`).
- **Pedidos por pessoa:** de 1 a 5, ou sem limite.
- **Trocar código:** todos saem e entram de novo com o código novo (a fila é mantida).
- **Encerrar sala:** todos saem e o código deixa de valer.
- **Tema:** o convidado usa o tema (claro ou escuro) que você escolheu em Ajustes › Aparência. Em "Sistema", cada convidado segue o tema do próprio aparelho.

## 4. Moderadores
São aparelhos que acessam o seu repositório de dados do GitHub (cada um pode ter o seu token). Em Ajustes › Modo Festa, cole o endereço do Worker e digite o código da festa. Eles viram moderadores sozinhos: podem tudo na fila, marcar Cantei e abrir no YouTube. Para enviar à TV, o aparelho do **dono** precisa estar aberto e conectado: é ele que fala com a TV.

Ao sair da festa, o moderador volta à fila que tinha antes de entrar. O dono, ao sair ou encerrar, fica com uma cópia da fila daquele momento.

## 5. O que o convidado vê
- **Topo:** "Festa de" e o nome do dono, quantas pessoas estão conectadas, o ícone de **sincronização** e o **mini QR** (toque para mostrar o QR da festa para outras pessoas).
- **Lista de músicas:** cada música mostra capa (ou a miniatura do vídeo), título, cantor, idioma e ano. Ao tocar, a sanfona abre com a origem, as tags e as **versões**; cada versão tem o botão **Pedir**. Música com uma só versão tem o Pedir direto na linha.
- **Filtros:** idioma, década, origem, voz, tipo de vídeo e tags, mais a ordem (título, cantor ou mais cantadas). Os filtros pessoais (favoritas, nunca cantadas, nota, status do link) não aparecem.
- **Barra de baixo:** o que está tocando agora e a fila; o convidado pode tirar os próprios pedidos.
- **Catálogo novo:** se o dono cadastrar músicas durante a festa, o ícone de sincronização fica rosa e aparece "Há músicas novas no catálogo". Um toque em **Atualizar** baixa de novo.
- **Sem puxar para recarregar e sem zoom de pinça**, para a tela não sair do lugar sem querer.
- **Sem conexão:** uma barra laranja avisa; o que já foi baixado continua na tela, e o Pedir volta quando a conexão voltar. Se a festa acabar, aparece "A festa acabou".

## 6. Como funciona e limites
- O código da festa é o segredo. Sem ele ninguém entra. Quem tem o código é, no mínimo, convidado; trocar o código tira todos.
- O dono tem uma chave guardada só no aparelho dele. Se ele limpar os dados do aparelho, perde o comando da festa; a sala some sozinha depois de 3 dias sem uso.
- O moderador é reconhecido por um segredo guardado no seu repositório privado de dados (arquivo `sala.json`, criado pelo dono ao criar a sala). Quem consegue ler o repositório consegue o segredo. O token do GitHub não sai do aparelho. Se o repositório de dados não estiver ligado no dono, a festa não tem moderadores.
- O Worker guarda um **índice resumido** do catálogo: código, título, cantor, idioma, ano, origem, tipo de vídeo, tom, voz, etiquetas, quantas vezes foi cantada e a miniatura. Não vão notas, favoritas, listas, histórico nem anotações. A capa só vai se for um link (capas guardadas dentro do app não vão; o convidado vê a miniatura do vídeo).
- O convidado nunca baixa o índice inteiro: recebe 150 músicas por vez na navegação (40 por vez na busca) e guarda o que já viu só enquanto estiver na festa.
- Códigos errados seguidos fazem o convidado esperar 30 segundos; as buscas têm limite por minuto.
- **Tela ligada:** o Android derruba a conexão quando a tela apaga, então durante a festa o app pede para manter a tela ligada. Se o aparelho for bloqueado à mão, o app reconecta ao voltar. Se a conexão ficar muda por mais de 70 segundos, ele a refaz sozinho.
- Sem conexão, dono e moderadores não alteram a fila (o app avisa).

## 6b. Pedidos de cadastro de vídeo (v1.24.0, exige atualizar o Worker da sala)
- Só o **convidado** tem o botão (vídeo com +, ao lado do sync). Ele cola o link de um vídeo do YouTube (e um recado opcional) e acompanha em "Meus pedidos".
- Quem pede o mesmo vídeo entra no **mesmo pedido** (o dono vê uma linha só, com "2 pedidos" e os nomes). Cada convidado vê o próprio pedido e quantos outros pediram o mesmo.
- Dono e moderadores veem o cartão **Pedidos de cadastro** no topo de Cadastrar (celular e tablet). **Cadastrar** preenche o campo URL do YouTube; quando o vídeo aparece no catálogo, a linha mostra "já cadastrado" com o código e o botão vira **Dispensar** (apaga para todos).
- O convidado vê Aguardando cadastro → Cadastrado. Se o catálogo dele está desatualizado aparece **Atualizar**; depois **Procurar** (busca a música) e o X para dispensar só o dele (só depois de cadastrado).
- **Recusar (v1.26.0):** num pedido aguardando, dono e moderador têm o botão **Recusar**, que abre uma folha com o motivo (opcional, até 120 caracteres). Quem pediu vê "Pedido recusado" com o motivo (ou "Sem motivo informado") e dispensa pelo X; o pedido some da caixa do dono/moderador na hora. Pedir de novo o mesmo vídeo depois de recusado abre um pedido novo. Exige atualizar o Worker.
- Um vídeo que já está no catálogo da festa não vira pedido (o convidado recebe o código). Limite: 5 pedidos aguardando por pessoa, 200 no total. Os pedidos ficam guardados no Worker e somem com a festa.
- **Atualização do Worker:** copie o novo `worker-sala.js` e rode de novo o deploy (mesmo passo da seção 2). Sem isso, o botão aparece mas os pedidos não funcionam.

## 7. Problemas comuns
- **"Sala não encontrada. Confira o código."** O código está errado ou a festa foi encerrada.
- **"A festa acabou."** O dono encerrou a festa (ou ela ficou 3 dias sem uso).
- **O convidado não consegue navegar.** O dono precisa ligar "Convidados podem navegar", e o Worker precisa estar atualizado (seção 2).
- **Não aparece o catálogo na festa.** O dono precisa estar com o app aberto e conectado para enviar o índice; o número de versões aparece em Ajustes › Modo Festa.
- **Moderador sem TV.** O aparelho do dono precisa estar aberto, pareado com a TV e conectado à festa.
