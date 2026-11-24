# Enviar para a TV — como ligar (uma vez só)

O YouTube não deixa um site falar direto com a TV pelo navegador. Por isso você cria um "proxy" grátis:

1. Crie conta grátis em https://dash.cloudflare.com (não precisa cartão).
2. Workers & Pages > Create > Create Worker > dê um nome (ex.: karatube) > Deploy.
3. Edit code > apague tudo > cole o conteúdo de worker.js > Deploy.
4. Copie o endereço (ex.: https://karatube.seunome.workers.dev).
5. No KaraTube: Ajustes > Enviar para a TV > cole o endereço em "Endereço do proxy".
6. Na TV: YouTube > Configurações > Vincular com código da TV. Digite os 12 dígitos no KaraTube e toque em Parear.
7. Pronto: o botão de TV na fila e nas versões envia o vídeo para a TV.

Se parar de funcionar um dia, é porque o YouTube mudou o recurso (não é oficial). "Abrir no YouTube" continua valendo.
Faça isso nos dois aparelhos (celular e tablet): use o mesmo proxy.


## Atualizar o proxy (v1.27.0)
O botão **Diagnóstico da TV** (Ajustes › Enviar para a TV) precisa do `worker.js` novo, que aceita também GET e repassa os eventos da TV ao vivo. No painel da Cloudflare: Workers & Pages › seu proxy › **Edit code** › apague, cole o `worker.js` novo e **Deploy**. O envio de vídeos continua igual com o proxy antigo.
