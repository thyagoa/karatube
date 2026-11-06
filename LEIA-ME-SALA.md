# Fila compartilhada (sala) — como ligar

É um Worker **separado** do proxy da TV (o `worker.js` continua como está). Ele guarda a fila de cada sala num Durable Object e avisa todos os aparelhos na hora, por WebSocket.

## Instalar o Worker (uma vez só)
1. Conta grátis em https://dash.cloudflare.com (a mesma da TV serve).
2. No computador, na pasta com os arquivos do KaraTube (`worker-sala.js` e `wrangler-sala.toml`):
   ```
   npx wrangler login
   npx wrangler deploy -c wrangler-sala.toml
   ```
3. Ele mostra o endereço, algo como `https://karatube-sala.seunome.workers.dev`. Abra esse endereço no navegador: deve aparecer `karatube-sala ok`.

## Usar
1. No aparelho que vai ser o **dono** (o que está pareado com a TV): Ajustes › Fila compartilhada › cole o endereço do Worker › **Criar sala**. Aparece o código (10 letras e números).
2. **Moderadores**: aparelhos que acessam o repositório de dados do GitHub (cada um pode ter o seu token). Em Ajustes › Fila compartilhada, cole o endereço do Worker e digite o código da sala. Eles viram moderadores sozinhos: podem tudo na fila, marcar Cantei e abrir no YouTube. Para enviar à TV, o aparelho do dono precisa estar aberto e conectado.
3. **Convidados**: mande o link (Copiar link ou Compartilhar). Ele abre uma tela só com busca, fila e pedido. O convidado digita o nome, procura a música (ou digita o código, como `000123-01`) e toca em Pedir. Máximo de 3 pedidos na fila por pessoa, e o mesmo código não entra duas vezes (outra versão da mesma música pode).
4. O dono pode desligar a busca dos convidados (aí só pedem pelo código), trocar o código (todos saem) ou encerrar a sala.

## Como funciona e limites
- O código da sala é o segredo. Sem ele ninguém entra. Quem tem o código é, no mínimo, convidado; trocar o código tira todos.
- O dono tem uma chave guardada só no aparelho dele. Se ele limpar os dados do aparelho, perde o comando da sala; a sala some sozinha depois de 3 dias sem uso.
- O moderador é reconhecido por um segredo guardado no seu repositório privado de dados (arquivo `sala.json`, criado pelo dono ao criar a sala). Quem consegue ler o repositório consegue o segredo. O token do GitHub não sai do aparelho. Se o repositório de dados não estiver ligado no dono, a sala não tem moderadores.
- O Worker guarda um índice resumido do catálogo (código, título, cantor, miniatura e chaves de busca) só para validar códigos e buscar. O convidado nunca baixa esse índice; recebe no máximo 15 resultados por busca.
- Códigos errados seguidos fazem o convidado esperar 30 segundos; as buscas têm limite por minuto.
- Se a conexão cair, o app tenta reconectar sozinho. Sem conexão, dono e moderadores não alteram a fila (o app avisa).
- Ao sair ou encerrar, o aparelho fica com uma cópia da fila daquele momento.
