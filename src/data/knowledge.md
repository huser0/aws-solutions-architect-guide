# AWS Certified Solutions Architect — Guia de Estudo (SAA-C03)

> Guia interativo cobrindo os principais serviços cobrados na certificação **AWS Certified Solutions Architect – Associate (SAA-C03)**: IAM, EC2, VPC, S3, RDS, Lambda, DynamoDB e muito mais. Cada serviço é organizado em módulos independentes — navegue pelo sidebar para acessar o conteúdo desejado.

---

## Módulo 01: IAM — Identity and Access Management

### O que é IAM?

O **AWS IAM (Identity and Access Management)** é o serviço que gerencia **quem** (autenticação) pode fazer **o que** (autorização) em quais **recursos** da AWS. É a base de segurança de toda conta.

- **User**: identidade para uma pessoa ou aplicação (credenciais de longo prazo: senha + access keys).
- **Group**: coleção de usuários que herdam as mesmas permissões.
- **Role**: identidade **assumível** por usuários, serviços AWS ou contas externas (credenciais temporárias via STS).
- **Policy**: documento JSON que define permissões (Allow/Deny + Effect + Action + Resource).

### Princípios importantes

- **Least Privilege**: conceda apenas as permissões mínimas necessárias.
- **IAM Policy** pode ser **Managed** (AWS pré-definida ou sua) ou **Inline** (embutida no user/role).
- **Service Control Policies (SCP)**: aplicadas em Organizations para definir limites de permissão em múltiplas contas — não concedem acesso, apenas limitam.
- **IAM Roles** são a forma **recomendada** de dar permissão a serviços AWS (EC2, Lambda, etc.) — evite access keys em instâncias.

> 🎯 **Ponto de atenção:** IAM é **global** (não regional). Policies avaliam Allow + Explicit Deny (Deny sempre vence). Uma entidade sem nenhuma policy tem acesso negado por padrão (implicit deny).

### STS e credenciais temporárias

- **AWS STS (Security Token Service)**: gera credenciais temporárias (access key + secret key + session token) para assumir roles.
- Casos clássicos: EC2 assume role para acessar S3, usuário de outra conta assume role cross-account, Identity Federation (Google, Facebook, SAML 2.0).

### IAM Identity Center vs IAM

| Recurso | IAM tradicional | IAM Identity Center |
|---|---|---|
| Usuários | Criados manualmente no IAM | Sincronizados do seu IdP (Azure AD, Okta, Google Workspace) |
| Multi-conta | Assume role manualmente em cada conta | Acesso centralizado a múltiplas contas via Permission Sets |
| Aplicações | Access keys para CLI/SDK | Portal SSO com acesso temporário |

> 🎯 **Ponto de atenção:** Se a questão menciona "gerenciar acesso de funcionários a múltiplas contas AWS com SSO", a resposta é **IAM Identity Center** (antigo AWS SSO).

### Access Keys e boas práticas

- Access Key ID + Secret Access Key = credenciais de **longa duração**.
- Use **Roles** sempre que possível; access keys só para CLI/SDK fora da AWS.
- **Rotacione** periodicamente; nunca compartilhe em código ou repositórios.

---

## Módulo 02: Amazon EC2

O **Amazon EC2 (Elastic Compute Cloud)** é o serviço de servidores virtuais (instâncias) na AWS. Você escolhe SO, hardware, rede e armazenamento.

### Tipos de instância (famílias)

| Família | Uso | Exemplo |
|---|---|---|
| **General purpose** | Web servers, pequenos bancos | `t3`, `t4g`, `m7g` |
| **Compute optimized** | Processamento intensivo, HPC | `c7g` |
| **Memory optimized** | Bancos em memória, caching | `r7g`, `x2iedn` |
| **Storage optimized** | Data warehouses, logs | `i3`, `d3` |
| **Accelerated computing** | ML, rendering, GPGPU | `p4`, `g5` |

### Purchasing Options

| Opção | Uso | Custo |
|---|---|---|
| **On-Demand** | Workloads imprevisíveis, curtas | Mais caro, sem compromisso |
| **Reserved (Standard)** | Workloads previsíveis, 1-3 anos | Até 72% de desconto |
| **Reserved (Convertible)** | Precisa de flexibilidade de família | Até 54% de desconto |
| **Savings Plans** | Uso consistente (Compute ou EC2 Instance) | Até 72% de desconto |
| **Spot** | Workloads tolerantes a falha, batch | Até 90% de desconto (pode ser interrompida) |
| **Dedicated Host** | Licenciamento próprio (Windows SQL, etc.) | Mais caro |

> 🎯 **Ponto de atenção:** Spot = "barato mas pode ser interrompida com aviso de 2 minutos". Reserved = "barato mas paga mesmo se não usar". Savings Plans é mais flexível que Reserved.

### User Data e Metadata

- **User Data**: script executado no boot da instância (primeira inicialização apenas).
- **Instance Metadata**: `http://169.254.169.254/latest/meta-data/` — informações sobre a instância (inclui IAM Role credentials).

### Placement Groups

| Tipo | Comportamento | Latência |
|---|---|---|
| **Cluster** | Instâncias no mesmo rack | Máxima (HPC) |
| **Spread** | Instâncias em racks distintos | Maior latência |
| **Partition** | Grupos isolados (topologia) | Moderada |

> 🎯 **Ponto de atenção:** Cluster = baixa latência, mas se o rack falhar, todas as instâncias caem.

### ENI vs ENA vs EFA

- **ENI (Elastic Network Interface)**: interface de rede básica.
- **ENA (Elastic Network Adapter)**: rede aprimorada, até 100 Gbps.
- **EFA (Elastic Fabric Adapter)**: HPC/ML, bypass do kernel, baixíssima latência.

---

## Módulo 03: VPC — Virtual Private Cloud

A **VPC** é sua rede virtual isolada dentro da AWS. Você controla IPs, subnets, rotas e gateways.

### Subnets

- **Public subnet**: tem rota para Internet Gateway.
- **Private subnet**: sem rota direta para internet (usa NAT Gateway para saída).
- **Each subnet = 1 AZ**.

### Gateways

| Gateway | Finalidade |
|---|---|
| **Internet Gateway (IGW)** | Acesso internet para subnets públicas |
| **NAT Gateway** | Saída para internet de subnets privadas (pago) |
| **NAT Instance** | Alternativa mais barata ao NAT Gateway (EC2 configurado) |
| **Egress-Only IGW** | Saída internet apenas IPv6 |
| **VPC Gateway Endpoint** | Acesso a S3 e DynamoDB sem sair da AWS (grátis) |
| **VPC Interface Endpoint (AWS PrivateLink)** | Acesso a outros serviços AWS dentro da VPC (pago por hora/GB) |
| **Transit Gateway** | Conectar múltiplas VPCs e on-premises |

> 🎯 **Ponto de atenção:** NAT Gateway é **pago por hora + GB processado**. VPC Gateway Endpoint para S3/DynamoDB é **gratuito**. Use Gateway Endpoint sempre que possível.

### Security Groups vs NACLs

| Característica | Security Group | NACL (Network ACL) |
|---|---|---|
| **Nível** | Instância (ENI) | Subnet |
| **Stateful?** | Sim (retorno permitido automaticamente) | Não (precisa regra de retorno explícita) |
| **Regras** | Apenas Allow | Allow e Deny |
| **Ordem** | Todas avaliadas | Ordem numérica (menor número = maior precedência) |
| **Padrão** | Deny all inbound, Allow all outbound | Allow all inbound e outbound |

> 🎯 **Ponto de atenção:** Security Group é **stateful** e só tem Allow. NACL é **stateless** e tem Allow + Deny com ordem.

### VPC Peering

- Conecta **duas** VPCs (qualquer região) — sem transitivity (A→B e B→C não implica A→C).
- IPs não podem se sobrepor (CIDR blocks únicos entre VPCs peering).

### VPC Flow Logs

- Registra metadados de tráfego IP (accept/reject) — nível VPC, subnet, ou ENI.
- Não captura payload dos pacotes.
- Destino: CloudWatch Logs ou S3.

---

## Módulo 04: ELB & Auto Scaling

### Elastic Load Balancing (ELB)

| Tipo | Camada | Características |
|---|---|---|
| **ALB (Application)** | 7 (HTTP/HTTPS) | Roteamento por path, host, query string. Suporte a WebSocket, gRPC |
| **NLB (Network)** | 4 (TCP/UDP) | Altíssima performance, IPs estáticos (Elastic IP), latência ultrabaixa |
| **CLB (Classic)** | 4/7 | Legado. Evite usar em novas arquiteturas |
| **Gateway LB** | 3 (IP) | Inline para appliances (firewalls, IDS/IPS) |

> 🎯 **Ponto de atenção:** ALB roteia por **conteúdo** (path, host). NLB roteia por **IP/porta** com performance máxima. CLB é legado.

### Auto Scaling Group (ASG)

- Mantém número mínimo/máximo de instâncias.
- Scaling policies: **Simple**, **Step**, **Target Tracking**, **Scheduled**.
- **Health Checks**: EC2 status check e/ou ELB health check.
- **Launch Template** ou **Launch Configuration** (legado).

> 🎯 **Ponto de atenção:** ASG + ALB = distribuído entre AZs. ASG substitui instâncias unhealthy automaticamente.

### Padrão: ALB + ASG + Multi-AZ

A arquitetura clássica:
- ALB distribui tráfego entre AZs.
- ASG em múltiplas AZs substitui instâncias com falha.
- Scaling baseado em CPU, request count, ou schedule.

---

## Módulo 05: RDS & Aurora

### Amazon RDS

Banco de dados relacional gerenciado: **MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2, Aurora**.

#### Recursos gerenciados

- **Multi-AZ**: standby síncrono em outra AZ para alta disponibilidade (failover automático).
- **Read Replicas**: até 15 réplicas assíncronas para escalar leitura (cross-region possível).
- **Automated Backups**: retention de 1-35 dias, point-in-time recovery.
- **Snapshots manuais**: retenção ilimitada.
- **Storage Auto Scaling**: cresce automaticamente até o máximo configurado.

> 🎯 **Ponto de atenção:** Multi-AZ = **alta disponibilidade** (standby, failover automático). Read Replicas = **escalar leitura** (até 15 réplicas, cross-region). Não confunda os dois.

### Amazon Aurora

- Compatível com **MySQL** e **PostgreSQL**.
- **6 cópias de dados em 3 AZs** (perde só 1 AZ sem impacto em write).
- **Failover em segundos** (não minutos).
- **Aurora Serverless v2**: escala frações de ACU em milissegundos, paga por segundo.
- **Aurora Global Database**: 1 região primária + até 5 secundárias, latência <1s, DR em segundos.
- **Backtrack**: "volta no tempo" sem precisar restaurar.

> 🎯 **Ponto de atenção:** Aurora é **MySQL/PostgreSQL compatível** mas com performance muito superior. Serverless v2 escala de 0.5 ACU. Global Database = DR cross-region com latência <1s.

### RDS Custom

Para Oracle e SQL Server: acesso ao SO subjacente (SSH, RDP, customizar Banco de dados).

---

## Módulo 06: Route 53

**Amazon Route 53** é o serviço de DNS gerenciado da AWS. Nome "53" = porta 53 (DNS).

### Tipos de Hosted Zone

| Tipo | Uso |
|---|---|
| **Public Hosted Zone** | Domínios públicos (ex: meusite.com) |
| **Private Hosted Zone** | Resolução interna na VPC (ex: meuapp.internal) |

### Routing Policies

| Policy | Funcionamento |
|---|---|
| **Simple** | Retorna um único IP para cada nome |
| **Weighted** | Distribui tráfego em proporções (pesos) |
| **Latency-based** | Roteia para a região com menor latência |
| **Failover** | Health check aponta para primário ou secundário |
| **Geolocation** | Roteia baseado na localização do usuário |
| **Geoproximity** | Roteia baseado em localização + bias |
| **Multi-value** | Retorna múltiplos IPs com health check |

> 🎯 **Ponto de atenção:** Se a questão pede "rotear usuários para a região mais próxima com melhor performance", a resposta é **Latency-based routing**. Se pede "failover automático entre regiões", é **Failover routing**.

---

## Módulo 07: S3 — Fundamentos de Object Storage

O **Amazon S3 (Simple Storage Service)** é um serviço de armazenamento de objetos (não é sistema de arquivos nem bloco de disco). Cada item é um **objeto** composto por Key, Value (até 5TB), Version ID, Metadata e Subresources.

Diferente de EBS (bloco) ou EFS (POSIX), o S3 tem **flat namespace** dentro de um bucket — "pastas" são apenas prefixos simulados na key.

### Benefícios e capacidades

- **Durabilidade de 99.999999999% (11 noves)** — todas as classes (exceto One Zone-IA, que replica em 1 AZ apenas).
- **Disponibilidade** varia conforme a classe (99.99% Standard).
- Escalabilidade **automática e ilimitada**.
- Suporte a versionamento, lifecycle, replicação, criptografia, logging e event notifications.

### Bucket e Object

- Nome de bucket é **único globalmente** (DNS-compatible: minúsculas, sem underscore, 3-63 caracteres).
- Bucket é criado em **uma região específica**.
- Objects até **5 TB**; Multipart Upload obrigatório >5GB, recomendado >100MB.

> 🎯 **Ponto de atenção:** S3 é **objeto**, não monte como sistema de arquivos (use EFS). Multipart obrigatório >5GB. Bucket name é globalmente único.

---

## Módulo 08: S3 — Versionamento

- Habilitado **no nível do bucket**.
- Cada sobrescrita com a mesma key cria uma **nova versão**, preservando a antiga.
- "Delete" normal insere um **delete marker** (não remove os dados) — reversível.
- **Uma vez habilitado, não pode ser desabilitado**, apenas **suspenso**.
- Objetos anteriores ao versionamento recebem `version ID = null`.

> 🎯 **Ponto de atenção:** Versionamento é pré-requisito para **replicação entre buckets**. Custo: você paga por **todas as versões** — combine com Lifecycle Rules.

---

## Módulo 09: S3 — Controle de Acesso e Segurança

Camadas de controle (do mais ao menos recomendado):

1. **IAM Policies** — controla usuários/roles da sua conta.
2. **Bucket Policies** — JSON no nível do bucket, permite acesso **cross-account**.
3. **ACLs (Access Control Lists)** — legado. AWS recomenda desabilitar e usar Policies.
4. **Access Points** — endpoints nomeados com política própria, úteis para múltiplas aplicações com permissões diferentes no mesmo bucket.

### Block Public Access

- Configuração que **sobrepõe** qualquer Policy/ACL que torne o bucket público.
- Ativado **por padrão** em novos buckets desde 2023.
- Mantenha ativo a menos que tenha necessidade explícita (ex: site estático).

### Event Notifications

Dispara eventos (`s3:ObjectCreated:*`, `s3:ObjectRemoved:*`) para:
- **SNS** (fan-out)
- **SQS** (processamento assíncrono)
- **Lambda** (serverless)
- **EventBridge** (filtragem avançada, múltiplos destinos, replay até 24h)

> 🎯 **Ponto de atenção:** Para acesso cross-account, use **Bucket Policy**. Para filtragem avançada de eventos, use **EventBridge**.

---

## Módulo 10: S3 — Criptografia

| Tipo | Gerencia a chave | Uso |
|---|---|---|
| **SSE-S3** (AES-256) | AWS | Padrão, simples |
| **SSE-KMS** | KMS (você controla policies, rotação, auditoria) | Auditoria granular |
| **SSE-C** | Você fornece a chave (AWS não armazena) | Compliance rígido |
| **Client-Side** | Você criptografa antes do upload | AWS não acessa os dados |

> 🎯 **Pegadinha:** SSE-KMS tem **limites de API do KMS** — em altas cargas de upload pode gerar throttling (`KMS request rate limit exceeded`). Use **S3 Bucket Keys** para reduzir chamadas ao KMS. SSE-C exige **HTTPS obrigatório**.

---

## Módulo 11: S3 — Replicação de Objetos

Dois tipos:

- **CRR (Cross-Region Replication)**: para outra região — compliance, DR, redundância geográfica.
- **SRR (Same-Region Replication)**: mesma região — agregação de logs, ambientes separados.

### Requisitos importantes

- **Versionamento habilitado** em origem e destino.
- **Não é retroativa**: replica apenas objetos criados **após** a configuração.
- Não replica em cadeia (A→B→C não implica A→C, a menos que configurado).
- Delete markers são replicáveis (opcional); deleções permanentes **não**.

> 🎯 **Ponto de atenção:** A replicação não é retroativa. Para objetos existentes, use **S3 Batch Operations**.

---

## Módulo 12: S3 — Storage Classes

O termo "Glacier" pode enganar. **Glacier Instant Retrieval** (desde nov/2021) permite acesso em **milissegundos sem restore**, diferentemente de Glacier Flexible Retrieval e Deep Archive que exigem job de restore.

| Classe | Durabilidade | AZs | Acesso | Mín. armazenamento |
|---|---|---|---|---|
| **S3 Standard** | 11 noves | ≥3 | Milissegundos | — |
| **S3 Standard-IA** | 11 noves | ≥3 | Milissegundos | 30 dias |
| **S3 One Zone-IA** | 11 noves (1 AZ) | 1 | Milissegundos | 30 dias |
| **S3 Glacier Instant Retrieval** | 11 noves | ≥3 | Milissegundos | 90 dias |
| **S3 Glacier Flexible Retrieval** | 11 noves | ≥3 | Minutos a horas (restore) | 90 dias |
| **S3 Glacier Deep Archive** | 11 noves | ≥3 | 12-48h (restore) | 180 dias |
| **S3 Intelligent-Tiering** | 11 noves | ≥3 | Imediato (tiers frequentes) | — |

> 🎯 **Atenção:** One Zone-IA = 1 AZ → não use para dados críticos. Intelligent-Tiering tem **taxa de monitoramento** por objeto, mas **sem custo de recuperação** nos tiers padrão.

### Se você conhece o padrão de acesso

| Acesso | Classe |
|---|---|
| Frequente | Standard |
| Raro, resposta rápida | Standard-IA |
| Dado recriável, 1 AZ | One Zone-IA |
| Arquivamento, acesso minutos | Glacier Instant Retrieval |
| Arquivamento, tolera horas | Glacier Flexible Retrieval |
| Arquivamento longo prazo | Glacier Deep Archive |
| Desconhecido/mutável | Intelligent-Tiering |

---

## Módulo 13: S3 — Otimização de Custos

### 6 componentes de custo do S3

| Fator | O que é | Como otimizar |
|---|---|---|
| **1. Storage Type** | Preço/GB/mês por storage class | Lifecycle Rules / Intelligent-Tiering |
| **2. Requests & Retrievals** | PUT > GET; custo extra em IA/Glacier | CloudFront cache; reduzir chamadas |
| **3. Data Transfer** | Saída para internet é paga; entrada é grátis | CloudFront reduz egress; VPC Endpoints |
| **4. Management & Analytics** | Inventory, Storage Lens, etc. | Ativar só onde há valor |
| **5. Replication** | Armazenamento duplicado + PUTs + transferência | Filtrar por prefix/tag |
| **6. Versioning** | Cada versão armazenada integralmente | Lifecycle Rules de noncurrent expiration |

### Estratégias

- **Conhece o padrão** → Lifecycle Rules (mais barato que Intelligent-Tiering).
- **Não conhece** → Intelligent-Tiering (monitora e move automaticamente, sem custo de recuperação).
- **CloudFront** na frente do S3 reduz requisições e transferência.
- **VPC Endpoints** evitam NAT Gateway para acesso privado.

> 🎯 **Pegadinha:** "milhões de objetos pequenos movidos para Glacier" pode **aumentar** o custo devido ao mínimo faturável de 128 KB e cobrança mínima de dias.

### Lifecycle Policies

Use quando você **sabe o padrão de acesso futuro**. Critérios de filtro: Age, Version, Size, Tag, Prefix (combináveis com "E" lógico).

Exemplo clássico:
```
Standard (dia 0) → Standard-IA (30d) → Glacier Flexible (365d) → Deep Archive (10 anos) → Expire
```

> 🎯 **Atenção:** Transition só vai "do quente para o frio" (não volta). Durações mínimas: 30d IA, 90d Glacier, 180d Deep Archive. Versionamento habilitado → regras separadas para current e noncurrent.

---

## Módulo 14: S3 — Static Website Hosting

- S3 serve site **estático** (HTML/CSS/JS) sem servidor.
- Index document + error document.
- Website endpoint: `http://<bucket>.s3-website-<region>.amazonaws.com` (apenas HTTP).
- Para HTTPS + domínio próprio + cache global: **CloudFront na frente**.

> 🎯 **Pegadinha:** CloudFront + **OAC (Origin Access Control)** + bucket privado é a resposta "certa" para servir conteúdo estático com segurança. Sem CloudFront, o bucket precisa estar público.

---

## Módulo 15: S3 — Presigned URLs e Compartilhamento

### Presigned URLs

- URL temporária que concede acesso limitado no tempo a um objeto (GET ou PUT), sem tornar o bucket público.
- Herda as permissões de quem assina. Expiração configurável.
- Casos: upload direto do navegador, download de arquivo privado com expiração.

> 🎯 **Ponto de atenção:** "Acesso temporário e controlado sem mudar permissões" → **Presigned URL**.

### Requester Pays

- Quem faz o download paga pela transferência e requisições (storage segue com o dono).
- Útil para compartilhar datasets grandes com parceiros.

---

## Módulo 16: S3 — Proteção de Dados (WORM)

### S3 Object Lock

Modelo **WORM (Write Once, Read Many)** com versionamento habilitado.

- **Retention Period**: protege por dias/anos.
- **Legal Hold**: trava independente de prazo, até remover explicitamente.
- Modos:
  - **Governance**: usuários com `s3:BypassGovernanceRetention` podem alterar.
  - **Compliance**: **ninguém** pode alterar/deletar, nem o root.

### MFA Delete

Exige MFA para deletar permanentemente uma versão ou suspender o versionamento.

> 🎯 **Ponto de atenção:** Compliance regulatório + "ninguém pode deletar" → **Object Lock em Compliance Mode**.

---

## Módulo 17: S3 — Consistência, CORS e Performance

### Consistência

Desde **dezembro de 2020**, o S3 oferece **strong read-after-write consistency** para todas as operações (PUT, DELETE, GET, LIST) — inclusive overwrites e deletes. Não existe mais eventual consistency.

> 🎯 **Pegadinha:** Se a questão menciona "eventual consistency no S3" como problema, desconfie — hoje o S3 é fortemente consistente.

### CORS

Configure **CORS no bucket** quando houver erro "blocked by CORS policy" no navegador ao carregar recursos do S3 de outro domínio.

### S3 Transfer Acceleration

- Acelera uploads usando edge locations da CloudFront (backbone privado da AWS).
- Endpoint: `<bucket>.s3-accelerate.amazonaws.com`.
- **Bucket não pode conter pontos (`.`)** no nome.
- Antes de habilitar, use a Speed Comparison Tool para medir ganho.

> 🎯 **Ponto de atenção:** Transfer Acceleration ≠ Multi-Region Access Points. O primeiro acelera rota até 1 bucket; o segundo roteia entre buckets em múltiplas regiões.

### S3 Select

Query SQL diretamente sobre CSV/JSON/Parquet, retornando **apenas os dados filtrados** sem baixar o objeto inteiro. **Glacier Select** faz o mesmo sem restaurar.

### Multi-Region Access Points

Endpoint global que roteia requisições para o bucket replicado mais próximo, combinado com replicação bidirecional.

---

## Módulo 18: S3 — Operações em Massa e Uploads

### S3 Batch Operations

Ações em massa sobre milhões de objetos via manifest (S3 Inventory ou CSV). Ações: copiar, invocar Lambda, restaurar do Glacier, aplicar tags, replicação retroativa.

> 🎯 **Ponto de atenção:** Operações sobre objetos **já existentes** → **S3 Batch Operations**.

### Multipart Upload

- **Obrigatório** para objetos >5GB, **recomendado** >100MB.
- Cada parte ≥5MB, máximo 10.000 partes, objeto final até 5TB.
- Vantagens: paralelismo, resiliência (reenvia só a parte), pausar/retomar.

```python
import boto3
from boto3.s3.transfer import TransferConfig

s3 = boto3.client("s3")
config = TransferConfig(
    multipart_threshold=1024 * 1024 * 25,
    max_concurrency=10,
    multipart_chunksize=1024 * 1024 * 25
)
s3.upload_file("video.mp4", "meu-bucket", "uploads/video.mp4", Config=config)
```

> 🎯 **Pegadinha:** Multiparts **abandonados** geram custo. Configure `AbortIncompleteMultipartUpload` na Lifecycle Rule para limpar partes órfãs.

---

## Módulo 19: S3 — Cheat Sheet

- **Acesso frequente** → Standard
- **Acesso raro, resposta rápida** → Standard-IA ou One Zone-IA (se recriável)
- **Padrão desconhecido** → Intelligent-Tiering
- **Arquivamento, acesso rápido** → Glacier Instant Retrieval
- **Arquivamento, tolera horas** → Glacier Flexible Retrieval
- **Arquivamento anos, sem pressa** → Glacier Deep Archive
- **Site estático + HTTPS** → Static Website + CloudFront + OAC
- **Acesso temporário a objeto privado** → Presigned URL
- **Proteção WORM, nem admin deleta** → Object Lock Compliance Mode
- **Erro CORS no navegador** → configurar CORS no bucket
- **Uploads lentos globais** → Transfer Acceleration
- **Ação em massa em objetos existentes** → S3 Batch Operations
- **Ler parte de arquivo sem baixar tudo** → S3 Select / Glacier Select
- **Compartilhar dataset sem pagar transferência** → Requester Pays
- **Upload >5GB** → Multipart Upload

---

## Módulo 20: Amazon DynamoDB

### O que é DynamoDB?

**Amazon DynamoDB** é um banco de dados NoSQL chave-valor e documento, **totalmente gerenciado**, com latência de milissegundos em qualquer escala.

- **Serverless**: sem provisionamento de servidores (opção provisioned ou on-demand).
- **Auto Scaling**: ajusta capacidade de leitura/escrita automaticamente.
- **Escalabilidade horizontal**: dados particionados automaticamente.

### Table e Itens

- **Table**: coleção de itens. **Item**: conjunto de atributos (até 400KB por item).
- **Primary Key**: pode ser simples (Partition Key) ou composta (Partition Key + Sort Key).
- **Secondary Indexes**: permitem consultas alternativas.
  - **LSI (Local Secondary Index)**: mesma partition key, sort key diferente. Máximo 5 por tabela. Criado apenas na criação da tabela.
  - **GSI (Global Secondary Index)**: partition key diferente. Máximo 20 por tabela. Criado a qualquer momento.

### Capacity Modes

| Modo | Uso | Cobrança |
|---|---|---|
| **Provisioned** | Workloads previsíveis | Paga por RCU/WCU provisionados (com Auto Scaling opcional) |
| **On-Demand** | Workloads imprevisíveis | Paga por requisição individual (mais caro) |

- **RCU (Read Capacity Unit)**: 1 leitura fortemente consistente de 4KB/s ou 2 leituras eventualmente consistentes de 4KB/s.
- **WCU (Write Capacity Unit)**: 1 escrita de 1KB/s.

### Consistência

- **Eventually Consistent Read**: padrão, metade do custo de RCU.
- **Strongly Consistent Read**: sempre lê o dado mais recente, dobra o custo de RCU.

> 🎯 **Ponto de atenção:** **DAX (DynamoDB Accelerator)** é um cache em memória para DynamoDB que reduz latência para microssegundos. Diferente de ElastiCache, o DAX é específico para DynamoDB e funciona como um cache transparente (get/query/batch).

### Streams e TTL

- **DynamoDB Streams**: captura modificações na tabela em ordem temporal (24h de retenção). Gatilho para Lambda.
- **TTL (Time to Live)**: expira itens automaticamente sem custo adicional (útil para sessions, logs temporários).

> 🎯 **Ponto de atenção:** DynamoDB é NoSQL — não suporta joins, consultas complexas ou transações multi-item. Para queries SQL, use RDS.

---

## Módulo 21: Amazon SQS & SNS

### Amazon SQS (Simple Queue Service)

Serviço de filas gerenciado para desacoplamento de microsserviços.

- **Standard Queue**: throughput ilimitado, mas ordem **não garantida** e entrega **pelo menos uma vez** (duplicatas possíveis).
- **FIFO Queue**: ordem garantida (first-in-first-out) e **exatamente uma vez**. Sufixo `.fifo`. 300 msg/s (ou 3000 com batch).

### Amazon SNS (Simple Notification Service)

Serviço de Pub/Sub gerenciado. Mensagens são empurradas para subscribers (SQS, Lambda, HTTP, email, SMS).

- **Fan-out pattern**: SNS + SQS para entregar a mesma mensagem a múltiplos consumidores de forma confiável e desacoplada.
- **Message Filtering**: filtra mensagens por policy (atributos) para que subscribers recebam apenas o que interessa.

> 🎯 **Ponto de atenção:** SQS = polling (consumer puxa). SNS = push (SNS empurra). O padrão **SNS → SQS** é o mais comum para processamento assíncrono confiável.

---

## Módulo 22: AWS Lambda

### O que é Lambda?

**AWS Lambda** é computação **serverless** — você executa código sem provisionar servidores. Paga apenas pelo tempo de execução e número de requisições.

- **Trigger**: S3, DynamoDB Streams, SQS, SNS, API Gateway, CloudWatch Events, etc.
- **Limites importantes**:
  - Tempo máximo de execução: **15 minutos** (900s).
  - Memória: 128 MB a 10.240 MB.
  - Disco temporário `/tmp`: 512 MB a 10.240 MB.
  - Payload de requisição: 6 MB (síncrono), 256 KB (assíncrono).
- **Stateless**: o ambiente é efêmero; para estado compartilhado, use DynamoDB ou ElastiCache.

### Concorrência

- **Reserved Concurrency**: garante um número fixo de execuções simultâneas.
- **Provisioned Concurrency**: mantém ambientes "quentes" para baixa latência (importante para latência crítica).

> 🎯 **Ponto de atenção:** Lambda não é adequado para workloads de longa duração (>15 min) ou stateful. Para streaming contínuo, prefira ECS Fargate ou EC2.

---

## Módulo 23: Amazon CloudFront

### O que é CloudFront?

**Amazon CloudFront** é uma rede de entrega de conteúdo (CDN) que acelera a distribuição de conteúdo estático e dinâmico via **edge locations** globalmente.

### Origins

- **S3 Bucket**: conteúdo estático, websites.
- **Custom Origin**: ALB, EC2, servidor HTTP on-premises.
- **AWS Media Services**: vídeo streaming.

### Comportamentos e Cache

- **Cache Policies** e **Origin Request Policies** definem o que e por quanto tempo cachear.
- **TTL padrão**: 24h. Ajustável via headers `Cache-Control` / `Expires`.
- **Invalidation**: remove objetos do cache das edge locations (cobrado por caminho).
- **Signed URLs / Signed Cookies**: acesso controlado a conteúdo premium.

### Segurança

- **OAC (Origin Access Control)**: restringe acesso ao S3 **apenas** via CloudFront — bucket fica privado.
- **AWS WAF**: integrado ao CloudFront para proteção contra DDoS e ataques web.

> 🎯 **Ponto de atenção:** CloudFront reduz **custo de transferência** (egress) do S3 e melhora latência global. Use **OAC** para manter bucket privado. Use **Signed URLs** para conteúdo restrito.

---

## Módulo 24: CloudWatch & CloudTrail

### Amazon CloudWatch

Serviço de **monitoramento e observabilidade**:

- **Metrics**: métricas padrão (CPU, Network, Status Check) e customizadas.
- **Logs**: coleta de logs de EC2, Lambda, CloudTrail, etc. Agent ou CloudWatch Logs Agent.
- **Alarms**: dispara ações baseadas em thresholds de métricas (ex: CPU > 80% → SNS → scaling).
- **Dashboards**: visão consolidada de métricas em uma única página.
- **CloudWatch Events / EventBridge**: reage a mudanças no ambiente AWS.

### CloudWatch Logs Insights

Query SQL-like para analisar logs armazenados no CloudWatch Logs.

### AWS CloudTrail

Serviço de **auditoria** que registra todas as chamadas de API na conta AWS (console, CLI, SDK, IAM).

- **Management Events**: ações de gerenciamento (CreateVPC, TerminateInstances). Habilitado por padrão, retido 90 dias.
- **Data Events**: ações em S3 (GetObject, PutObject) e Lambda (Invoke). **Não habilitado por padrão** — precisa ser configurado.
- **CloudTrail Insights**: detecta atividades incomuns (ex: aumento anormal de TerminateInstances).

> 🎯 **Ponto de atenção:** CloudWatch = **monitoramento** (métricas, logs, alarms). CloudTrail = **auditoria** (quem fez o quê, quando, de onde). Ambos se complementam, mas são serviços diferentes.
