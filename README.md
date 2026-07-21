<div align="center">

```
███████╗██████╗      ██████╗ ██╗   ██╗██╗██████╗ ███████╗
██╔════╝╚════██╗    ██╔═══██╗██║   ██║██║██╔══██╗██╔════╝
███████╗ █████╔╝    ██║   ██║██║   ██║██║██║  ██║█████╗
╚════██║██╔═══╝     ██║▄▄ ██║██║   ██║██║██║  ██║██╔══╝
███████║███████╗    ╚██████╔╝╚██████╔╝██║██████╔╝███████╗
╚══════╝╚══════╝     ╚══▀▀═╝  ╚═════╝ ╚═╝╚═════╝ ╚══════╝
                  G U I D E
```

**Guia de estudos interativo de Amazon S3 para a certificação AWS SAA-C03**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![AWS](https://img.shields.io/badge/AWS-SAA--C03-FF9900?style=flat-square&logo=amazonaws&logoColor=black)](https://aws.amazon.com/certification/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Sobre o Projeto

O **S3 Solutions Architect Guide** é um guia de estudos interativo construído em React, focado nos pontos mais cobrados sobre o **Amazon S3** na certificação **AWS Certified Solutions Architect — Associate (SAA-C03)**. Inclui:

- Fundamentos de object storage, versionamento e ciclo de vida
- Controle de acesso (IAM, Bucket Policies, ACLs, Access Points, Block Public Access)
- Criptografia (SSE-S3, SSE-KMS, SSE-C, Client-Side)
- Replicação (CRR / SRR) e Batch Operations
- Storage Classes, Intelligent-Tiering e Lifecycle Policies
- Otimização de custos com os 6 fatores de cobrança do S3
- Hospedagem estática com CloudFront + OAC, Presigned URLs, Object Lock / MFA Delete
- Consistência, CORS, Transfer Acceleration, S3 Select, Multi-Region Access Points
- Multipart Upload via AWS CLI e Boto3

Todo o conteúdo vive em **um único arquivo Markdown** (`src/data/knowledge.md`). Para acrescentar novos módulos ou seções, basta editá-lo — a interface se atualiza automaticamente.

---

## Preview

```
┌─────────────────────────────────────────────────────────────┐
│  S3 Solutions Guide        AWS SAA-C03      ☁ S3 Cheat Sheet │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Progresso   │   Módulo 06 de 13                            │
│  ██████░░░░  │                                              │
│  46%         │   Storage Classes                            │
│              │   ──────────────────                         │
│  ⌂ Início    │                                              │
│              │   ▌ Glacier Instant Retrieval                │
│  01 Object   │                                              │
│  02 Version. │   Apesar do nome "Glacier", essa classe       │
│  03 Acesso   │   permite acesso em milissegundos, sem       │
│  04 Cripto.  │   necessidade de restore...                  │
│  05 Replica. │                                              │
│  06 Classes◄─│   ┌─────────────────────────────────────┐    │
│    · Glacier │   │ Glacier Instant Retrieval             │    │
│    · OneZone │   │ Milissegundos · ≥3 AZs · 90d mínimo  │    │
│  07 Custos   │   └─────────────────────────────────────┘    │
│  ...         │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## Conteúdo dos Módulos

| # | Módulo | Tópicos |
|---|--------|---------|
| 01 | **Fundamentos de Object Storage** | O que é S3, problemas que resolve, benefícios, quando usar EFS/EBS/FSx |
| 02 | **Versionamento** | Delete markers, version ID, pré-requisito para replicação |
| 03 | **Controle de Acesso e Segurança** | IAM/Bucket/ACL, Access Points, Block Public Access, Event Notifications |
| 04 | **Criptografia** | SSE-S3, SSE-KMS, SSE-C, Client-Side, KMS throttling |
| 05 | **Replicação de Objetos** | CRR vs SRR, regras, não-retroatividade, S3 Batch Replication |
| 06 | **Storage Classes** | Standard, IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive, Intelligent-Tiering |
| 07 | **Otimização de Custos** | 6 fatores de custo, Lifecycle Policies, estratégias manuais vs automáticas |
| 08 | **S3 Static Website Hosting** | Website endpoint, CloudFront + OAC, bucket privado |
| 09 | **Presigned URLs e Compartilhamento** | URLs temporárias, Requester Pays |
| 10 | **Proteção de Dados (WORM)** | Object Lock (Governance/Compliance), MFA Delete, Legal Hold |
| 11 | **Consistência, CORS e Performance** | Strong consistency, CORS, Transfer Acceleration, S3 Select, MRAP |
| 12 | **Operações em Massa e Uploads Grandes** | S3 Batch Operations, Multipart Upload (CLI + Boto3) |
| 13 | **Resumo Rápido (Cheat Sheet)** | Decisões rápidas para questões de prova |

---

## Tecnologias

- **[React 19](https://react.dev)** — UI
- **[Vite 8](https://vite.dev)** — Build e dev server
- **[react-markdown](https://github.com/remarkjs/react-markdown)** + **[remark-gfm](https://github.com/remarkjs/remark-gfm)** — Renderização do Markdown
- **[oxlint](https://oxc.rs)** — Linter ultrarrápido

---

## Deploy na Vercel

### Opção 1 — Via GitHub (recomendado)

```bash
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/seu-usuario/s3-solutions-architect-guide.git
git push -u origin main
```

Depois acesse vercel.com → **Add New Project** → importe o repositório. As configurações são detectadas automaticamente (Vite + React).

### Opção 2 — Via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

> O arquivo `vercel.json` já está configurado com rewrite para SPA routing.

---

## Desenvolvimento Local

```bash
# Clonar e instalar
git clone https://github.com/seu-usuario/s3-solutions-architect-guide.git
cd s3-solutions-architect-guide
npm install

# Rodar em modo dev (com hot reload)
npm run dev
# → http://localhost:5173

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

---

## Como Adicionar Conteúdo

Todo o conhecimento do guia está em **um único arquivo**:

```
src/data/knowledge.md
```

A estrutura é simples — use `##` para módulos e `###` para seções:

```markdown
## Módulo 14: Tópico Avançado

### Introdução

Conteúdo em Markdown com **negrito**, listas, tabelas e code blocks.

```python
import boto3
s3 = boto3.client("s3")
```
```

A UI detecta novos módulos e seções automaticamente — sem nenhuma alteração no código.

---

## Estrutura do Projeto

```
s3-solutions-architect-guide/
├── src/
│   ├── data/
│   │   └── knowledge.md        ← Edite aqui para adicionar conteúdo
│   ├── utils/
│   │   └── parseKnowledge.js   ← Parser que transforma o .md em módulos
│   ├── App.jsx                 ← Componente principal (layout, sidebar, navegação)
│   ├── main.jsx
│   └── index.css               ← Design system completo (CSS variables, paleta AWS)
├── public/
│   └── favicon.svg             ← Ícone S3 laranja
├── vercel.json                 ← SPA routing para Vercel
├── vite.config.js
└── package.json
```

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/novo-modulo`
3. Edite o `knowledge.md` com o novo conteúdo
4. Commit: `git commit -m "feat: adiciona módulo sobre S3 Object Lambda"`
5. Abra um Pull Request

---

<div align="center">

Feito com ☁ para a comunidade AWS brasileira

</div>
