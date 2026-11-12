# Rota Leve

Aplicativo mobile da solução **Rota Leve** (Global Solution 2026.2 · CitizenTech · FIAP), disciplina **Mobile Application Development**.

## A solução

Gestantes, pessoas com carrinho de bebê, idosos, cadeirantes e pessoas com mobilidade reduzida temporária (perna engessada, pós-cirurgia) sofrem com rotas de transporte público que ignoram escadas, elevadores quebrados, longas caminhadas e ladeiras.

> A Júlia está grávida de 8 meses e precisa ir ao pré-natal. O app comum manda ela pela estação com o elevador quebrado há dias. No Rota Leve, essa rota vai para o fim da lista e ela recebe uma alternativa com elevador funcionando e pouca caminhada.

O Rota Leve:

1. **Perfil de mobilidade**: a pessoa informa a sua situação ("estou grávida", "uso cadeira de rodas", "ando com carrinho"…) e o que pesa na rota: evitar escadas, priorizar elevador, precisar de assento, evitar ladeiras e o limite de caminhada.
2. **Rotas reordenadas com nota**: o app busca as opções de transporte público e dá a cada uma uma **nota de acessibilidade de 0 a 100**, com os pontos de atenção, os pontos a favor e um resumo em linguagem natural ("Esta rota tem 400 m de caminhada plana, elevador funcionando em Tatuapé e República. O ponto final tem banco.").
3. **Relatos da comunidade**: usuários relatam "elevador quebrado", "calçada esburacada", "ponto sem cobertura", com foto. Outros usuários confirmam, e o relato **expira em 48h** se ninguém confirmar (cada confirmação renova por mais 24h).
4. **Avisos em rotas salvas**: se surgir um relato em uma estação, ponto ou rua de uma rota salva, o app avisa ("O elevador da Sé está fora de serviço") e oferece **Ver alternativas**.

ODS 10 (redução das desigualdades) e ODS 11 (cidades e comunidades sustentáveis).

## Stack

- **React Native com Expo** (SDK 58) + **TypeScript**
- **React Navigation** (native stack + abas, com menu sanduíche no celular e barra superior no desktop)
- **AsyncStorage** (`@react-native-async-storage/async-storage`) para a persistência local
- **expo-image-picker** para a foto do relato (câmera no celular, arquivo no navegador)

> As rotas candidatas são **simuladas** em `src/services/routeProvider.ts` no formato que viria da Google Directions API (modo `transit`, com alternativas) ou da API Olho Vivo da SPTrans. Assim o app roda offline, no navegador e sem chave de API. O produto é a **camada de acessibilidade** (`src/services/accessibility.ts`), que avalia e reordena essas rotas.

## Como executar

Pré-requisitos: Node.js 20+ e npm.

```bash
git clone https://github.com/phestalise/rota_leve.git
cd rota_leve
npm install
npx expo start
```

Com o servidor rodando, aperte **`w`** para abrir no navegador. Se preferir, leia o QR Code com o app Expo Go no celular.

## Usuário de teste

| E-mail | Senha | Perfil |
|---|---|---|
| `julia@rotaleve.com` | `123456` | Gestante (já tem uma rota salva passando pela Sé) |
| `carlos@rotaleve.com` | `123456` | Cadeirante (use para confirmar os relatos da Júlia) |

Na tela de login, o botão **"Preencher dados de teste"** preenche e-mail e senha automaticamente. Também é possível criar uma conta nova em **Criar conta**.

Na primeira execução o app grava no AsyncStorage os usuários de teste, alguns relatos (elevador da Sé quebrado, calçada na Rua Domingos de Morais etc.) e uma rota salva, para a demonstração já mostrar avisos.

## Telas

| Tela | O que faz |
|---|---|
| Login | Entrada com e-mail e senha, com validação |
| Cadastro | Criação de conta (nome, e-mail, senha e confirmação) |
| Perfil de mobilidade | Situação + preferências (escadas, elevador, assento, ladeiras, caminhada máxima) |
| Buscar rota | Origem/destino com sugestões e aviso de rota salva com problema |
| Rotas encontradas | **Lista** das opções reordenadas pela nota, com aviso quando nenhuma é acessível |
| Detalhe da rota | Nota, resumo, pontos de atenção, mapa do trajeto, link para o Google Maps, salvar rota |
| Relatos | **Lista** dos relatos com filtros (ativos, meus, todos) e busca |
| Novo relato | **Formulário de cadastro** com tipo, local, descrição e foto (obrigatória) |
| Detalhe do relato | **Consulta** do registro: foto, validade, confirmações, rotas salvas afetadas, confirmar, resolver e excluir |
| Minhas rotas | Rotas salvas com a nota recalculada e avisos, com o botão "Ver alternativas" |
| Perfil | Dados do usuário, perfil de mobilidade, Sobre o App e Sair |
| Sobre o App | Explicação da solução, ODS e tecnologia |

## Requisitos da disciplina

- [x] Login com usuário e senha de teste informados neste README
- [x] Lista dos registros (relatos e rotas)
- [x] Formulário de cadastro (novo relato e cadastro de usuário)
- [x] Tela de consulta/detalhe de um registro (detalhe do relato e da rota)
- [x] Navegação entre as telas (stack + abas, menu sanduíche no celular)
- [x] Persistência local com AsyncStorage (usuários, sessão, perfil, relatos e rotas salvas)

## Regras de negócio implementadas

- **Nota de acessibilidade** (`accessibility.ts`): penaliza estações sem elevador ou com elevador relatado como quebrado (inviável para cadeirante), caminhada acima do limite, ladeiras, calçadas relatadas, pontos sem banco ou cobertura, baldeações e tempo de viagem.
- **Ordenação**: rotas viáveis primeiro, depois a maior nota e, no empate, o menor tempo.
- **Confirmação idempotente**: o mesmo usuário não confirma duas vezes e o autor não confirma o próprio relato.
- **Expiração**: relatos ativos com validade vencida passam para "expirado" sempre que a lista é lida.
- **Casos negativos tratados**: login vazio ou inválido, e-mail já cadastrado, perfil sem situação escolhida, relato sem foto, origem igual ao destino, nenhuma rota acessível.

## Estrutura

```
src/
  components/   UI reutilizável (botões, campos, cards, nota, mapa do trajeto)
  context/      AuthContext (sessão e perfil)
  navigation/   Navegadores e tipos das rotas
  screens/      Telas do app
  services/     Rotas candidatas, camada de acessibilidade, avisos, perfis
  storage/      Acesso ao AsyncStorage (usuários, relatos, rotas, dados iniciais)
  utils/        Helpers (ids, datas, diálogos web/nativo)
```

## Vídeo

Link do vídeo (até 3 min): **_adicionar link do YouTube aqui_**

## Integrantes

| Nome | RM |
|---|---|
| Emanuel Italo | RM561337 |
| Enzo Monteiro | RM563734 |
| Gabriel Bebe | RM562012 |
| Matheus De Almeida | RM563557 |
| Paulo Estalise | RM563811 |
