# Gerador de Boletim Diário AESA

Projeto web estático para editar, visualizar e exportar o Boletim Diário de Monitoramento Hidrológico da AESA.

## Como rodar

O projeto não exige backend nem etapa de build. Use qualquer servidor estático local, por exemplo:

```bash
npx serve .
```

Ou, com Python:

```bash
python -m http.server 4173
```

Depois acesse `http://127.0.0.1:4173`.

## Como editar os dados

Use o painel à esquerda para alterar data, horário, situação geral, destaques, texto informativo, fonte, contato e a lista de estações. A prévia do boletim é atualizada automaticamente, e o botão **Atualizar boletim** força uma nova renderização.

Cada estação permite editar:

- estação
- município
- cota/nível
- status
- tendência
- posição X e Y no mapa

Ao selecionar uma estação em **Editar estação**, clique no mapa da prévia para reposicionar o marcador.

## Status e tendências

Os status disponíveis são:

- Cota de Estiagem
- Nível normal
- Cota de atenção
- Cota de alerta
- Cota de inundação
- Sem dados

As tendências disponíveis são:

- Subindo
- Descendo
- Estável

As contagens dos cards superiores, as cores dos marcadores e os selos da tabela são recalculados automaticamente.

## Trocar logos e mapa

Use os campos **Trocar logo AESA**, **Trocar logo Governo** e **Trocar mapa**. As imagens são carregadas no navegador e podem ser salvas junto com os dados usando **Salvar dados**.

## Salvar, carregar e importar dados

- **Salvar dados** grava o boletim no `localStorage` do navegador.
- **Carregar salvos** recupera o último boletim salvo.
- **Restaurar modelo** volta aos dados iniciais do modelo.
- **Baixar JSON** gera um arquivo com todos os dados.
- **Importar JSON** carrega dados exportados anteriormente.

## Exportações

Os botões de exportação geram:

- PDF com a área visual do boletim
- PNG com a área visual do boletim
- XLSX com estações e totais
- DOCX com uma versão editável do boletim

As exportações usam bibliotecas via CDN:

- html2canvas
- jsPDF
- SheetJS/xlsx
- docx.js

## GitHub Pages

Publique todos os arquivos do projeto no repositório e ative o GitHub Pages apontando para a branch principal e a pasta raiz. Como o projeto é estático, ele funciona diretamente sem configuração extra.
