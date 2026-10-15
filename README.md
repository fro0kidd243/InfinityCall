# InfinityCall VoIP

Projeto inicial com interface HTML e servidor Node.js. As chamadas reais **não funcionam imediatamente**: é preciso ter uma conta num provedor de telefonia, credenciais válidas, um número habilitado e uma URL TwiML/Voice pública configurada no provedor. O provedor pode cobrar pelas chamadas.

## Arquivos
- `public/index.html`: interface web.
- `server.js`: API que recebe os pedidos de ligação.
- `.env.example`: modelo de configuração; copie para `.env` e preencha em privado.

## Rodar no Windows
1. Instale Node.js LTS.
2. Abra o CMD dentro da pasta do projeto.
3. Execute `npm install`.
4. Copie `.env.example` para `.env` e preencha os dados do seu provedor.
5. Execute `npm start`.
6. Abra `http://localhost:3000`.

Sem configurar `.env`, o site abre, mas o botão de ligar responde que faltam credenciais. Para testar num telefone ou permitir acesso externo, o servidor precisa estar publicado com HTTPS e o provedor deve conseguir acessar a URL de voz. Não coloque chaves secretas no HTML.
