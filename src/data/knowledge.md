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

### Conexão Híbrida (VPN & Direct Connect)

| Serviço | Uso | Tipo de conexão |
|---|---|---|
| **Site-to-Site VPN** | Conectar VPC a rede on-premises via internet | IPSec criptografado sobre internet pública |
| **AWS Client VPN** | Usuários remotos acessam VPC via OpenVPN | Gerenciado, baseado em OpenVPN |
| **AWS Direct Connect (DX)** | Conexão física dedicada entre datacenter e AWS | Fibra dedicada, baixa latência, consistente |
| **Direct Connect Gateway** | Conectar múltiplas VPCs em múltiplas regiões via DX | Agrega VPCs ao mesmo circuito DX |

> 🎯 **Ponto de atenção:** Site-to-Site VPN é mais barato e rápido de configurar, mas trafega pela internet (latência variável). Direct Connect é caro e demora semanas para provisionar, mas oferece desempenho consistente e não passa pela internet pública. Para backup de DX, use VPN.
>
> **Virtual Private Gateway** é o destino da VPN/DX na VPC. Para DX, você também pode usar **Direct Connect Gateway** para conectar VPCs em múltiplas regiões com o mesmo circuito.

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

### Custo na prática (us-east-1, USD)

| Classe | Preço / GB / mês | Mín. armazenamento | Custo 50 TB/mês |
|---|---|---|---|
| **S3 Standard** | $0.023 | — | ~$1.150 |
| **S3 Standard-IA** | $0.0125 | 30 dias | ~$640 |
| **S3 One Zone-IA** | $0.01 | 30 dias | ~$512 |
| **S3 Glacier Instant Retrieval** | $0.004 | 90 dias | ~$205 |
| **S3 Glacier Flexible Retrieval** | $0.0036 | 90 dias | ~$184 |
| **S3 Glacier Deep Archive** | $0.00099 | 180 dias | ~$51 |
| **S3 Intelligent-Tiering** | $0.023 → $0.0125 → … | — | ~$620* |

> *Intelligent-Tiering: taxa de monitoramento de $0.0025/1.000 objetos. Para 50TB com objetos médios de 1MB (~50M objetos) = ~$125/mês adicionais.

### Cenário real — Logs de aplicação (50TB/mês)

```
📦 50TB de logs mensais, retenção de 12 meses
    ┌─ Standard (dia 0–30):   50TB × $0.023  = $1.150
    ├─ Standard-IA (30–90d):  50TB × $0.0125 =   $640
    └─ Glacier Flex (90–365d): 50TB × $0.0036 =   $184
                                               ──────
                  Média mensal:               ~$380
                  Economia vs Standard só:     **67%**
```

### Cenário real — Objetos pequenos em Glacier (pegadinha)

> ⚠️ **"Migrei 10M de objetos de 10KB para Glacier Flexible e o custo triplicou."**
>
> Motivo: Glacier cobra mínimo de **128KB por objeto**. 10M × 10KB = 100 GB lógicos, mas você paga como 10M × 128KB = 1.28 TB. Custo real: **~$47/mês** em vez de **~$3.70** esperados.
>
> ✅ **Solução:** Agrupe objetos pequenos em arquivos ZIP/TAR antes de arquivar, ou use S3 Lifecycle com filtro de tamanho (`SizeGreaterThan`) para mover apenas objetos >128KB para Glacier.

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

### 4 cenários reais de economia

#### 📘 Cenário 1 — Lifecycle vs Intelligent-Tiering

```
Workload: 20TB de assets de mídia
Acesso: frequente nos primeiros 30 dias, esporádico depois

Tudo em Standard:          20TB × $0.023  = $460/mês
Intelligent-Tiering:       20TB × $0.023 → $0.0125*
                            + taxa monitoramento (20M obj × $0.0025/1K) = $50
                           Total ≈ **$410/mês**
Lifecycle customizado:     30d Standard → 90d IA → Glacier Flex
                           Média ≈ **$290/mês**
Economia:                  **37% vs Standard, 29% vs I-T**
```

> ✅ Lifecycle é mais barato quando o padrão de acesso é previsível. Intelligent-Tiering compensa quando o padrão é desconhecido ou varia muito.

#### 🌐 Cenário 2 — CloudFront reduzindo egress

```
10TB/mês servidos para internet

S3 direto:
  Transfer (egress):  10TB × $0.09* = $900
  Requests GET:       10M × $0.0004  =   $4
  Total ≈ $904

Com CloudFront na frente:
  Transfer CF:         10TB × $0.085 = $850
  Requests CF:         10M × $0.0075 =  $75
  Requests S3 (cache hit 80%): 2M × $0.0004 = $0.80
  Total ≈ $926
  ───
  🤔 "CloudFront é mais caro?" Só na conta isolada.
  Com cache, as requisições ao S3 caem ~80%, reduzindo
  pico de IOPS e custo de origem. Para workloads globais,
  a latência cai de 200ms para ~30ms (p95).

  💡 Real: CloudFront + S3 fica mais barato que S3 puro
  quando o cache hit rate > 70% para transfer, ou quando
  você usa Price Class 100 (apenas EUA/Europa).
```

* Preços de transfer variam por faixa. Simplificado para 10TB.

#### 🐜 Cenário 3 — Small object penalty

```
100M objetos de 5KB arquivados em Deep Archive

Custo esperado (5KB lógico):  100M × 5KB × $0.00099/GB  =  ~$0.47/mês
Custo real (128KB mínimo):    100M × 128KB × $0.00099/GB = ~$12.00/mês
                                ───
                                **25× mais caro que o esperado**
```

> ⚠️ A pegadinha é clássica em prova SAA-C03: a AWS cobra pelo **mínimo de 128KB** para objetos em Glacier e Deep Archive. Objetos menores pagam como se tivessem 128KB. **Solução**: agregue em arquivos maiores antes de arquivar, ou use filtro de tamanho nas Lifecycle Rules.

#### 🔄 Cenário 4 — Versionamento sem lifecycle

```
Bucket de 1TB com versionamento ativo
10% dos objetos alterados por dia (~100GB/dia de novas versões)

Sem regra de expurgo:
  Após 10 dias: 1TB + 1TB = 2TB (custo dobra)
  Após 30 dias: 1TB + 3TB = 4TB → $92/mês

Com NoncurrentVersionExpiration = 30 dias:
  Versões antigas expiram após 30 dias
  Custo adicional máximo: ~100GB × 30 dias = 3TB
  Custo extra estável: ~$69/mês (vs crescer indefinidamente)
```

> 📌 Lifecycle Rule recomendada: `<NoncurrentVersionExpiration days="30"/>` mantém o custo de versionamento previsível. Essential para buckets com alta taxa de alteração (logs, backups incrementais).

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

### Transações e PartiQL

- **DynamoDB Transactions**: operações ACID multi-item e multi-tabela (2 transações por segundo por partição).
- **PartiQL**: SQL compatível com DynamoDB (SELECT, INSERT, UPDATE, DELETE) via Console, CLI ou SDK.

### DAX — DynamoDB Accelerator

- Cache em memória **totalmente gerenciado** para DynamoDB.
- Reduz latência de leitura de milissegundos para **microssegundos** (até 10x).
- **Não é para escrita** — apenas cache de leitura.
- Diferente de ElastiCache (genérico), DAX é específico para DynamoDB e fica na frente da tabela.
- Ideal para workloads **read-heavy** (gamificação, dashboards, sessões).
- TTL do cache configurável por item.

### Hot Keys e Write Sharding

- **Hot Key**: uma única partition key recebe requests desproporcionais → throttling.
- **Write Sharding**: adiciona sufixo aleatório à partition key para distribuir escritas uniformemente.
- **Adaptive Capacity**: DynamoDB ajusta automaticamente throughput para partições "quentes" (a partir de 2021).

### Backup e Restore

- **On-Demand Backup**: backup completo da tabela sem impacto de performance.
- **PITR (Point-in-Time Recovery)**: restaura a tabela para qualquer ponto nos últimos **35 dias** (contínuo).
- Backups são restaurados para **novas tabelas** (não é possível restaurar no lugar).

### Security

- **Encryption at rest**: KMS (AWS managed, Customer managed) ou DynamoDB owned key.
- **Encryption in transit**: HTTPS obrigatório.
- **VPC Endpoints**: Gateway endpoint ou Interface endpoint (com PrivateLink) para acessar DynamoDB dentro da VPC.
- **Fine-Grained Access Control**: IAM conditions baseadas em atributos do item (`dynamodb:LeadingKeys`).

### CLI Examples

```bash
# Criar tabela com autoscaling
aws dynamodb create-table --table-name Orders \
  --attribute-definitions AttributeName=OrderId,AttributeType=S \
  --key-schema AttributeName=OrderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Scan com filter
aws dynamodb scan --table-name Orders \
  --filter-expression "Amount > :val" \
  --expression-attribute-values '{":val":{"N":"100"}}'

# Query
aws dynamodb query --table-name Orders \
  --key-condition-expression "OrderId = :id" \
  --expression-attribute-values '{":id":{"S":"ORD-123"}}'
```

| Conceito | O que é? |
|---|---|
| **Global Tables** | Replicação multi-região ativo-ativo (baseada em Streams) |
| **DAX** | Cache em memória específico DynamoDB (microssegundos) |
| **PartiQL** | SQL compatível para DynamoDB |
| **Transactions** | ACID multi-item |
| **TTL** | Expiração automática de itens sem custo |
| **PITR** | Restore point-in-time (35 dias) |
| **Write Sharding** | Técnica para distribuir hot keys |
| **Adaptive Capacity** | Ajuste automático de throughput por partição |

> 🎯 **Ponto de atenção:** DynamoDB é NoSQL — não suporta joins, consultas complexas ou transações multi-item. Para queries SQL, use RDS. **DAX** vs **ElastiCache**: DAX é específico para DynamoDB e transparente para o aplicativo; ElastiCache (Redis/Memcached) é genérico e requer cacheagem manual.

---

## Módulo 21: Amazon SQS & SNS

### Amazon SQS (Simple Queue Service)

Serviço de filas gerenciado para desacoplamento de microsserviços.

- **Standard Queue**: throughput ilimitado, mas ordem **não garantida** e entrega **pelo menos uma vez** (duplicatas possíveis).
- **FIFO Queue**: ordem garantida (first-in-first-out) e **exatamente uma vez**. Sufixo `.fifo`. 300 msg/s (ou 3000 com batch).

### SQS — Conceitos Avançados

- **Visibility Timeout**: período em que uma mensagem fica invisível após ser lida (30s padrão, max 12h). Se o consumer não a deletar dentro do timeout, a mensagem volta para a fila.
- **Dead Letter Queue (DLQ)**: fila para onde mensagens são redirecionadas após falharem `maxReceiveCount` vezes. Ideal para debugging.
- **Delay Queue**: atraso inicial na entrega de mensagens (0s a 15min). No FIFO, delay é por fila (não por mensagem).
- **Long Polling**: consumer espera até `WaitTimeSeconds` (1-20s) por mensagens. Reduz custo (menos polls vazios). Rec `ReceiveMessageWaitTimeSeconds`.
- **Short Polling**: retorna imediatamente (pode vir vazio). Mais requisições, maior custo.
- **Message Attributes**: metadados estruturados junto com o body (nome, tipo, valor).
- **SQS Extended Client Library**: mensagens grandes (>256KB) são armazenadas no S3, SQS carrega apenas o pointer.
- **Encryption**: KMS at rest; HTTPS in transit; **requer permissão `kms:Decrypt` no consumer**.

### SQS vs SQS FIFO

| Característica | Standard | FIFO |
|---|---|---|
| Ordem | Não garantida | Garantida (first-in-first-out) |
| Entrega | At least once | Exactly once |
| Throughput | Ilimitado | 300 msg/s (ou 3000 com batch) |
| DLQ | Sim | Sim |
| Sufixo | — | `.fifo` |
| Custo | Menor | Maior |

### Amazon SNS (Simple Notification Service)

Serviço de Pub/Sub gerenciado. Mensagens são empurradas para subscribers (SQS, Lambda, HTTP, email, SMS).

- **Fan-out pattern**: SNS + SQS para entregar a mesma mensagem a múltiplos consumidores de forma confiável e desacoplada.
- **Message Filtering**: filtra mensagens por policy (atributos) para que subscribers recebam apenas o que interessa.
- **SNS FIFO**: tópico FIFO com SQS FIFO como subscriber — ordem garantida e exatamente uma vez em topologias fan-out.
- **Message Durability**: SNS tenta entregar com retry exponencial (3 retries para HTTP, depois DLQ possível).
- **SMS**: enviar SMS globalmente com remetente configurável (origination identity).

### SNS vs SQS

| Aspecto | SNS | SQS |
|---|---|---|
| Modelo | Pub/Sub (push) | Queue (polling) |
| Consumer | Múltiplos subscribers ativos | Mensagem consumida por 1 consumer |
| Entrega | Push (SNS envia) | Pull (consumer puxa) |
| Persistência | Não armazena mensagens | Mensagens persistem (até 14 dias) |
| Caso típico | Notificações, alertas, fan-out | Desacoplamento, buffer, DLQ |

### CLI Examples

```bash
# Criar fila Standard
aws sqs create-queue --queue-name MinhaFila

# Criar fila FIFO
aws sqs create-queue --queue-name MinhaFila.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true

# Enviar mensagem
aws sqs send-message --queue-url <url> --message-body "Hello"

# Receber mensagem (Long Poll)
aws sqs receive-message --queue-url <url> --wait-time-seconds 20

# Deletar mensagem
aws sqs delete-message --queue-url <url> --receipt-handle <handle>

# Criar tópico SNS
aws sns create-topic --name MeuTopico

# Inscrever SQS no SNS
aws sns subscribe --topic-arn <arn> --protocol sqs \
  --notification-endpoint <sqs-arn>
```

> 🎯 **Ponto de atenção:** SQS = polling (consumer puxa). SNS = push (SNS empurra). O padrão **SNS → SQS** é o mais comum para processamento assíncrono confiável. **Long Polling** reduz custo — sempre configure `WaitTimeSeconds`.

---

## Módulo 22: AWS Lambda

### O que é Lambda?

**AWS Lambda** é computação **serverless** — você executa código sem provisionar servidores. Paga apenas pelo tempo de execução e número de requisições.

- **Trigger**: S3, DynamoDB Streams, SQS, SNS, API Gateway (ver Módulo 31), CloudWatch Events / EventBridge, etc.
- **Limites importantes**:
  - Tempo máximo de execução: **15 minutos** (900s).
  - Memória: 128 MB a 10.240 MB.
  - Disco temporário `/tmp`: 512 MB a 10.240 MB.
  - Payload de requisição: 6 MB (síncrono), 256 KB (assíncrono).
- **Stateless**: o ambiente é efêmero; para estado compartilhado, use DynamoDB ou ElastiCache.
- **Runtimes**: Node.js, Python, Java, Go, .NET, Ruby, Custom Runtime (provides your own).

### Concorrência e Scaling

- **Reserved Concurrency**: garante um número fixo de execuções simultâneas. Útil para evitar que uma função consuma toda a concorrência da conta (limite regional: 1.000 execuções simultâneas).
- **Provisioned Concurrency**: mantém ambientes "quentes" para baixa latência (importante para latência crítica). Cobrado mesmo quando não está em uso.
- **Burst concurrency**: primeira vez que uma função é invocada, Lambda aloca subitamente (500-3000 execuções dependendo da região). Após o burst, cresce 500/minuto.

### Versions & Aliases

- **Versions**: snapshot imutável do código + configuração (`$LATEST`, `1`, `2`, ...).
- **Aliases**: ponteiros para uma versão específica (ex: `prod` → versão 2, `staging` → versão 1). Permite **weighted routing** (canary deployments).

### Lambda Layers

- Camada ZIP com dependências, bibliotecas ou runtime extensions.
- Montada em `/opt` — compartilhável entre múltiplas funções.
- **Limite**: 5 layers por função, até 250 MB (descompactado).

### SnapStart (Java)

- Lançado para reduzir **cold start** em Java (até 10x mais rápido).
- Tira um snapshot do ambiente após inicialização (`Init`) e o retoma sob demanda.
- Não suportado para `tmp` stateful ou streams efêmeros.

### Container Support

- Lambda suporta imagens de container (até 10 GB) via ECR.
- Deve implementar **Lambda Runtime API**.
- Útil para deployments consistentes com ECS/ECS Fargate.

### Lambda@Edge

- Executa funções Lambda em **edge locations** do CloudFront.
- Útil para manipular requests/respostas na borda (rewrite headers, redirect, A/B testing, authentication).
- Tempo máximo: **5 segundos** (viewer-request/viewer-response) ou 30s (origin-request/origin-response).

### VPC Networking

- Por padrão, Lambda roda no **VPC padrão da AWS** mas **não tem acesso** a recursos em VPC privada (RDS, ElastiCache, ENI interno).
- Para acessar VPC privada: configure `VPC_CONFIG` com subnets + security group → Lambda cria um ENI em cada subnet.
- **Consequência**: cold start mais lento (criação de ENI). Use **Provisioned Concurrency** ou **RDS Proxy** (para RDS) para mitigar.

### Destinations e DLQ

- **Destinations (Assíncrono)**: configura rotas para sucesso ou falha após invocação assíncrona (SQS, SNS, Lambda, EventBridge).
- **DLQ (SQS/SNS)**: similar a Destinations, mas legado. Nova funções devem usar Destinations.

### Environment Variables & Secrets

- **Environment Variables**: até 4 KB. Criptografadas em repouso via KMS.
- **Secrets Manager / Parameter Store**: use SDK para buscar secrets no runtime (não exponha em env vars).
- **Code Signing**: assina código para garantir que apenas código confiável seja executado (Signer).

| Conceito | Descrição |
|---|---|
| **Reserved Concurrency** | Garante N execuções simultâneas |
| **Provisioned Concurrency** | Mantém ambientes quentes |
| **SnapStart** | Reduz cold start Java (~10x) |
| **Lambda@Edge** | Lambda na borda do CloudFront |
| **Destinations** | Rotas pós-invocação (sucesso/falha) |
| **Layers** | Dependências compartilhadas |
| **VPC Config** | ENI para acessar recursos em VPC |
| **Container Image** | Até 10 GB via ECR |
| **Code Signing** | Garante integridade do código |

### CLI Examples

```bash
# Listar funções
aws lambda list-functions

# Invocar função (síncrono)
aws lambda invoke --function-name MinhaFuncao --payload '{"key":"val"}' output.json

# Invocar (assíncrono)
aws lambda invoke --function-name MinhaFuncao --invocation-type Event output.json

# Criar função
aws lambda create-function \
  --function-name MinhaFuncao \
  --runtime python3.12 \
  --role arn:aws:iam::<account>:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip

# Publicar versão
aws lambda publish-version --function-name MinhaFuncao

# Criar alias
aws lambda create-alias --function-name MinhaFuncao \
  --name prod --function-version 2
```

> 🎯 **Ponto de atenção:** Lambda não é adequado para workloads de longa duração (>15 min) ou stateful. Para streaming contínuo, prefira ECS Fargate ou EC2. **Cold start** é crítico para Java e .NET; use SnapStart (Java) ou Provisioned Concurrency. **Lambda@Edge** tem limite de 5s e roda em regiões edge.

---

## Módulo 23: Amazon CloudFront

### O que é CloudFront?

**Amazon CloudFront** é uma rede de entrega de conteúdo (CDN) que acelera a distribuição de conteúdo estático e dinâmico via **edge locations** globalmente.

### Price Classes

| Classe | Edge Locations | Custo |
|---|---|---|
| **Price Class All** | Todas (EUA, Europa, Ásia, América do Sul, etc.) | Mais caro |
| **Price Class 200** | EUA + Europa + Ásia (exclui América do Sul, Austrália) | Intermediário |
| **Price Class 100** | Apenas EUA + Europa | Mais barato |

### Origins

- **S3 Bucket**: conteúdo estático, websites.
- **Custom Origin**: ALB, EC2, servidor HTTP on-premises.
- **AWS Media Services**: vídeo streaming.

### Regional Edge Cache

- Camada adicional de cache entre a origin e as edge locations.
- Reduz carga na origin para objetos que são menos populares globalmente.
- **Não desabilitável** — sempre presente.

### Comportamentos e Cache (Behaviors)

- **Cache Policies** e **Origin Request Policies** definem o que e por quanto tempo cachear.
- **TTL padrão**: 24h. Ajustável via headers `Cache-Control` / `Expires`.
- **Invalidation**: remove objetos do cache das edge locations (cobrado por caminho). Alternativa barata: usar versioned filenames (ex: `style.v2.css`).
- **Signed URLs / Signed Cookies**: acesso controlado a conteúdo premium (Signed URLs = arquivo específico, Signed Cookies = múltiplos arquivos).
- **Multiple origins + behaviors**: um único distribution pode rotear `/api/*` para ALB e `/*` para S3.

### Segurança

- **OAC (Origin Access Control)**: restringe acesso ao S3 **apenas** via CloudFront — bucket fica privado (substitui OAI).
- **AWS WAF**: integrado ao CloudFront para proteção contra DDoS e ataques web.
- **Field-Level Encryption**: criptografa campos sensíveis no POST (ex: cartão de crédito) antes de chegar à origin.
- **Geo Restriction**: permite ou bloqueia países (whitelist/blacklist). Usa geolocalização do request.
- **CNAMEs / SSL**: até 10 domínios customizados por distribution. SSL gratuito via ACM (Virginia) + SNI.

### Origin Shield

- Camada de cache centralizada adicional (regional) que reduz custo de transferência da origin.
- Útil para origins que têm muitos requests para o mesmo objeto de regiões diferentes.

### Lambda@Edge

- Executa funções Lambda nas edge locations para modificar requests/responses.
- **4 eventos**: viewer-request, viewer-response, origin-request, origin-response.
- **Limite**: 5s (viewer) / 30s (origin) de execução.
- Casos de uso: rewrite URL, A/B testing, authentication, header injection.

### Real-time Logs

- Logs de acesso em tempo real para Kinesis Data Streams.
- Útil para análise de comportamento do usuário, segurança, monitoramento.

### Origin Failover

- Configura origin groups com primary + secondary.
- Se primary falhar (5xx, timeout, connection error), CloudFront automaticamente roteia para secondary.

| Conceito | Descrição |
|---|---|
| **OAC** | Restringe S3 a apenas CloudFront |
| **Price Classes** | Controla quais edge locations usar (custo vs performance) |
| **Regional Edge Cache** | Cache intermediário entre edge e origin |
| **Origin Shield** | Cache regional centralizado para reduzir custo |
| **Lambda@Edge** | Lambda na borda para manipular requests |
| **Field-Level Encryption** | Criptografia de campos sensíveis no POST |
| **Geo Restriction** | Bloqueia/permite países |
| **Origin Failover** | Redundância automática de origin |
| **Signed URLs/Cookies** | Acesso controlado a conteúdo premium |
| **Real-time Logs** | Logs via Kinesis Data Streams |

> 🎯 **Ponto de atenção:** CloudFront reduz **custo de transferência** (egress) do S3 e melhora latência global. Use **OAC** para manter bucket privado. Use **Signed URLs** para conteúdo restrito. **Price Class 100** é o suficiente se seu público é EUA/Europa. Para invalidations frequentes, prefira **versioned filenames** (mais barato).

---

## Módulo 24: CloudWatch & CloudTrail

### Amazon CloudWatch

Serviço de **monitoramento e observabilidade**:

- **Metrics**: métricas padrão (CPU, Network, Status Check) e customizadas (até 10 segundos de resolução).
- **Logs**: coleta de logs de EC2, Lambda, CloudTrail, etc. via CloudWatch Agent.
- **Alarms**: dispara ações baseadas em thresholds de métricas (ex: CPU > 80% → SNS → scaling).
- **Dashboards**: visão consolidada de métricas em uma única página (cross-region e cross-account).
- **CloudWatch Events / EventBridge**: reage a mudanças no ambiente AWS (schedule, service events, custom events).

### CloudWatch Agent

- **Unified CloudWatch Agent**: coleta **métricas do OS** (CPU, memory, disk, swap) + **logs** em um único agente.
- Substitui o antigo **CloudWatch Logs Agent** (apenas logs).
- Suporta métricas customizadas via `procstat`, `netstat`, etc.

### CloudWatch Alarms — Tipos

| Tipo | Descrição |
|---|---|
| **Static** | Threshold fixo (CPU > 80%) |
| **Anomaly Detection** | Threshold dinâmico baseado em aprendizado de máquina |
| **Composite Alarm** | Combina múltiplos alarms com AND/OR (reduz noise) |

### Metric Math

- Permite fazer cálculos com métricas no gráfico ou alarme (`METRICS()`, `FILL()`, `SUM()`, `AVG()`, etc).
- Exemplo: `SUM([m1, m2])` para agregar tráfego de múltiplas interfaces.

### CloudWatch Logs Insights

- Query SQL-like para analisar logs armazenados no CloudWatch Logs.
- Sintaxe: `fields @timestamp, @message`, `filter`, `stats count() by bin(5m)`.
- Útil para debugging, análise de erros, performance.

### Contributor Insights

- Analisa **top contributors** em logs (ex: IPs que mais fazem requests, endpoints mais chamados).
- Gera métricas baseadas em logs automaticamente.

### Container Insights & Lambda Insights

- **Container Insights**: métricas de ECS, EKS, Fargate (CPU, memory, network, disk aggregated).
- **Lambda Insights**: métricas detalhadas de Lambda (cold starts, custo por invocação, duração).

### AWS CloudTrail

Serviço de **auditoria** que registra todas as chamadas de API na conta AWS (console, CLI, SDK, IAM).

- **Management Events**: ações de gerenciamento (CreateVPC, TerminateInstances). Habilitado por padrão, retido 90 dias no **Event History** (gratuito).
- **Data Events**: ações em S3 (GetObject, PutObject) e Lambda (Invoke). **Não habilitado por padrão** — precisa ser configurado. Cobrado por evento.
- **CloudTrail Insights**: detecta atividades incomuns (ex: aumento anormal de TerminateInstances). Cobrado adicional.
- **CloudTrail Lake**: armazena eventos em formato de dados otimizado para análise e consultas SQL. Retenção por até 7 anos.

### Trail vs Event History

| | Event History | Trail |
|---|---|---|
| **Cobertura** | Management events apenas | Management + Data + Insights |
| **Retenção** | 90 dias (gratuito) | Configurável (até 7 anos no S3) |
| **Destino** | Console AWS | S3 + CloudWatch Logs (opcional) |
| **Custo** | Gratuito | Pago (S3 + Logs) |
| **Multi-região** | Todas as regiões | Configurável (single ou all) |
| **Organization Trail** | — | Trail para toda a AWS Organization |

### Data Protection

- **CloudTrail Log File Validation**: assinatura digital (SHA-256) dos arquivos de log — detecta alterações.
- **KMS Encryption**: criptografa logs no S3 com chave gerenciada.
- **CloudTrail digest files**: arquivos usados para validation de integridade (únicos por bucket).

| Conceito | CloudWatch | CloudTrail |
|---|---|---|
| **Finalidade** | Monitoramento & observabilidade | Auditoria & compliance |
| **Dados** | Métricas, logs, alarms | Chamadas de API |
| **Retenção** | Logs: 1 dia a vitalício (S3 export) | Event History: 90d gratuito; Trail: até 7 anos |
| **Insights** | Logs Insights, Contributor Insights | CloudTrail Insights |
| **Caso típico** | "CPU está em 90%", "App está errando" | "Quem deletou o bucket?", "Quando?" |

> 🎯 **Ponto de atenção:** CloudWatch = **monitoramento** (métricas, logs, alarms). CloudTrail = **auditoria** (quem fez o quê, quando, de onde). Ambos se complementam, mas são serviços diferentes. **Unified CloudWatch Agent** coleta métricas do sistema operacional (CPU, memory, disk). **CloudTrail Insights** é pago adicional — ative apenas se precisar de detecção de anomalias.

---

## Módulo 25: Armazenamento em Bloco e Arquivos — EBS & EFS

### Amazon EBS — Elastic Block Store

O **Amazon EBS** é o serviço de armazenamento em bloco para uso com EC2. Cada volume EBS é um dispositivo persistente que pode ser anexado a uma instância EC2 na mesma AZ.

#### Tipos de Volume EBS

| Tipo | Família | Max IOPS | Max Throughput | Custo/GB-mês | Uso típico |
|---|---|---|---|---|---|
| **gp3** | General Purpose SSD | 16.000 (3.000 base) | 1.000 MB/s (125 MB/s base) | $0.08 | Boot volumes, workloads gerais, baixa latência |
| **io2 / io2 Block Express** | Provisioned IOPS SSD | 64K / 256K | 1.000 / 4.000 MB/s | $0.125 | Bancos críticos (Oracle, SQL Server), SAP, latency-sensitive |
| **st1** | Throughput Optimized HDD | 500 | 500 MB/s | $0.045 | Big data, data warehouses, logs — sequential access |
| **sc1** | Cold HDD | 250 | 250 MB/s | $0.015 | Dados raramente acessados, backups — sequential access |

> 🎯 **Ponto de atenção:** gp3 é o padrão atual — você paga só pelo storage e pode aumentar IOPS/throughput independentemente sem desanexar. io2 é para workloads que exigem IOPS consistentes e alta disponibilidade (Multi-Attach). st1 e sc1 são **HDD** — não use para boot volumes ou acesso aleatório frequente.

#### EBS Snapshots

- **Incrementais**: apenas os blocos alterados desde o último snapshot são salvos.
- Salvos no S3 (gerenciado pela AWS, invisível para o usuário).
- Compartilháveis entre contas (snapshots criptografados exigem compartilhamento da KMS key).
- **Copiáveis entre regiões** (DR, migração).
- **Fast Snapshot Restore (FSR)**: snapshots restaurados sem latência de inicialização (pago).
- **Recycle Bin**: recupera snapshots deletados acidentalmente (retenção de 1 dia a 1 ano).

```bash
# Criar snapshot
aws ec2 create-snapshot --volume-id vol-1234567890abcdef0 --description "Backup before update"

# Copiar para outra região
aws ec2 copy-snapshot --source-region us-east-1 --source-snapshot-id snap-123 --region eu-west-1

# Criar volume de snapshot
aws ec2 create-volume --snapshot-id snap-123 --availability-zone us-east-1a
```

> 🎯 **Pegadinha:** Snapshots são incrementais, mas deletar um snapshot antigo **não** libera espaço se snapshots mais recentes referenciarem blocos dele. A AWS gerencia isso automaticamente — você paga pelo armazenamento único dos blocos. **Snapshots são salvos no S3** por padrão, cobrados a $0.05/GB-mês.

#### EBS Encryption

- Pode ativar **EBS Encryption by Default** por região (recomendado).
- Usa **KMS** (Customer Managed Key ou AWS Managed Key).
- Criptografa: data at rest, dados em trânsito instância-volume, snapshots e volumes derivados.
- Snapshots criptografados só são compartilháveis com contas autorizadas na KMS key.
- **Não é possível "descriptografar"** — crie uma cópia não-criptografada se necessário.

#### Instance Store

- Armazenamento **temporário** anexado fisicamente ao host da EC2.
- **Não persistente**: se a instância parar (stop/terminate/fail), os dados são perdidos.
- Performance extremamente alta (NVMe local).
- Ideal para: cache, buffers, dados temporários, processamento batch.
- Tamanho varia por tipo de instância (ex: `i3.8xlarge` tem 4 × 1.900 GB NVMe).

> 🎯 **Ponto de atenção:** Se a questão descreve "dados recriáveis, máxima performance, sem necessidade de persistência" → **Instance Store**. Se precisa de persistência e backups → **EBS**.

---

### Amazon EFS — Elastic File System

Sistema de arquivos **NFSv4 gerenciado**, elástico e compartilhado entre múltiplas EC2 (e on-premises via DX/VPN).

- **POSIX-compliant**: permissões Linux padrão.
- **Escala automaticamente**: de poucos GB a petabytes, paga pelo que usa.
- **Compartilhável**: múltiplas EC2 em múltiplas AZs montam o mesmo EFS simultaneamente.

#### Performance Modes

| Modo | Latência | Throughput | Uso |
|---|---|---|---|
| **General Purpose** | Baixa (~ms) | Moderado | Padrão, web servers, CMS |
| **Max I/O** | Maior | Muito alto | Big data, HPC, mídia |

#### Throughput Modes

| Modo | Comportamento |
|---|---|
| **Bursting** | Throughput proporcional ao storage (50 KB/s por GB base, burst até 100 MB/s/TB) |
| **Provisioned** | Define throughput fixo independente do tamanho |
| **Elastic** | Ajusta throughput automaticamente conforme demanda (paga pelo que usa) |

#### Storage Classes

| Classe | Preço / GB / mês | AZs |
|---|---|---|
| **EFS Standard** | $0.30 | ≥3 |
| **EFS Standard-IA** | $0.025 | ≥3 (raramente acessado) |
| **EFS One Zone** | $0.16 | 1 |
| **EFS One Zone-IA** | $0.013 | 1 (raramente acessado) |

- **Lifecycle Policies**: move entre Standard e IA após N dias sem acesso (30, 60, 90 dias).
- **IA minimum**: 128 KB mínimo faturável por arquivo (mesmo small object penalty do S3 Glacier).

### Cheat Sheet — EBS vs EFS vs S3

| Característica | EBS | EFS | S3 |
|---|---|---|---|
| **Tipo** | Bloco | Sistema de arquivos (POSIX) | Objeto |
| **Acesso** | 1 EC2 (io2 suporta multi-attach) | Múltiplas EC2 simultaneamente | Internet / SDK / CLI |
| **Latência** | Sub-milissegundo | Milissegundos | Dezenas de ms |
| **Persistência** | Persistente (exceto Instance Store) | Persistente | Persistente |
| **Escala** | 64 TB por volume | Automática até PB | Ilimitada |
| **Preço médio** | $0.08–0.125/GB | $0.30/GB (Standard) | $0.023/GB (Standard) |
| **Caso típico** | Banco de dados, boot volume | Home dirs, CMS compartilhado | Data lake, logs, estático |

> 🎯 **Ponto de atenção:** **"Sistema de arquivos compartilhado entre múltiplas EC2"** → EFS. **"Banco relacional com alta IOPS"** → EBS io2. **"Data lake com acesso HTTP e baixo custo"** → S3. **"Cache temporário de alta performance"** → Instance Store.

---

## Módulo 26: Containers na AWS — ECS, Fargate & EKS

### Amazon ECS — Elastic Container Service

Orquestração de containers gerenciada. Você define **Task Definitions** e o ECS executa as **tasks**.

#### Conceitos-chave

| Termo | Definição |
|---|---|
| **Cluster** | Grupo lógico onde as tasks rodam (EC2 ou Fargate) |
| **Task Definition** | Blueprint do container: imagem, CPU, memória, porta, env vars, papel IAM |
| **Task** | Execução única de uma Task Definition (1+ containers) |
| **Service** | Mantém N tasks rodando, integra com ALB, auto scaling, rolling updates |

#### Fargate vs EC2 Launch Type

| Característica | EC2 Launch Type | Fargate (Serverless) |
|---|---|---|
| **Gerenciamento** | Você gerencia as EC2 | AWS gerencia totalmente |
| **Pricing** | Paga pelas EC2 (reserved/spot possíveis) | Paga por CPU/memória por segundo |
| **Isolamento** | Nível de instância | Nível de task (kernel isolado por task) |
| **Escalabilidade** | Precisa gerenciar ASG + cluster | Escala automaticamente |
| **GPU** | Suportado | Não suportado |
| **Custo fixo** | EC2 24/7 mesmo sem tasks rodando | Só paga quando a task roda |

> 🎯 **Ponto de atenção:** Fargate = "serverless, sem gerenciar servidores, paga por execução". EC2 Launch Type = "controle sobre instâncias, GPU, spot instances para reduzir custo".

#### Exemplo de Task Definition

```json
{
  "family": "minha-app",
  "containerDefinitions": [{
    "name": "app",
    "image": "nginx:latest",
    "memory": 512,
    "cpu": 256,
    "portMappings": [{ "containerPort": 80, "protocol": "tcp" }],
    "environment": [{ "name": "ENV", "value": "production" }]
  }],
  "executionRoleArn": "arn:aws:iam::...",
  "networkMode": "awsvpc"
}
```

#### ECS Service Auto Scaling

Usa **Application Auto Scaling** com Target Tracking:
- CPU / Memory Utilization
- ALB Request Count Per Target
- Custom CloudWatch Metric

#### ECR — Elastic Container Registry

- Repositório de imagens Docker gerenciado.
- Integração nativa com ECS/EKS (sem credenciais para pull).
- **Image scanning**: varredura de vulnerabilidades.
- **Cross-region replication**: réplica de imagens entre regiões.
- **Lifecycle policies**: expurga imagens antigas automaticamente.

---

### Amazon EKS — Elastic Kubernetes Service

**Kubernetes gerenciado** pela AWS.

- **Control plane**: AWS gerencia o master (HA, multi-AZ, $0.10/hora).
- **Data plane**:
  - **Managed Node Groups** (EC2 auto scaling).
  - **Fargate** (cada pod executa em Fargate).
  - **Self-managed nodes** (você gerencia as EC2).
- **Integrações**: IAM Roles for Service Accounts (IRSA), ALB Ingress Controller, EBS CSI, EFS CSI.

> 🎯 **Ponto de atenção:** EKS é mais caro que ECS ($0.10/hora pelo control plane). Use EKS se você já usa Kubernetes ou precisa de portabilidade. Use ECS se quer simplicidade e integração nativa AWS.

### Containers vs Lambda — Quando Usar

| Aspecto | Lambda | ECS/Fargate | EKS |
|---|---|---|---|
| **Modelo** | Serverless (function) | Container | Container (Kubernetes) |
| **Duração** | Até 15 min | Ilimitada | Ilimitada |
| **Memória** | Até 10 GB | Até 120 GB (Fargate) | Limitado pela instância |
| **Cold start** | Sim (ms a s) | Não | Não |
| **GPU** | Não | Via EC2 Launch Type | Via node groups |
| **Custo** | Por execução | Por recurso/tempo | Control plane + nós |

> 🎯 **Ponto de atenção:** Workload **event-driven, curta, esporádica** → Lambda. Workload **24/7, GPU, >15 min** → ECS/Fargate. **Orquestração avançada ou portabilidade K8s** → EKS.

---

## Módulo 27: Disaster Recovery (DR)

### Conceitos Fundamentais

- **RTO (Recovery Time Objective)**: quanto tempo o sistema pode ficar indisponível.
- **RPO (Recovery Point Objective)**: quantos dados podem ser perdidos.
- Quanto menores RTO e RPO, mais caro e complexo.

### Os 4 Padrões de DR

| Padrão | RTO | RPO | Custo | Complexidade |
|---|---|---|---|---|
| **Backup & Restore** | Horas a dias | Horas (último backup) | $ (só storage) | Baixa |
| **Pilot Light** | Minutos a horas | Minutos | $$ | Média |
| **Warm Standby** | Minutos | Segundos | $$$ | Alta |
| **Multi-Site Active-Active** | Segundos a zero | Zero (síncrono) | $$$$ | Muito alta |

---

### Backup & Restore

- Menor custo, maior RTO/RPO.
- Backup periódico de dados; restaura em região secundária em DR.
- **Serviços**: S3 (CRR), RDS snapshots + cross-region copy, AWS Backup.
- **Infra**: provisionada sob demanda via CloudFormation.

> 🎯 **Ponto de atenção:** Backup & Restore = "menor custo, maior downtime, dados de até horas atrás". Ideal para workloads não-críticas ou dev/test.

---

### Pilot Light

- Região primária completa + região secundária com apenas **serviços essenciais** (banco replicado + core compute mínimo).
- Em DR: o "pilot light" acende → provisiona o resto da infra na secundária.
- **Banco**: Aurora Global Database ou RDS Cross-Region Read Replica.
- **Compute**: AMIs copiadas, CloudFormation para provisionar rapidamente.
- **DNS**: Route 53 failover routing.

> 🎯 **Ponto de atenção:** Pilot Light é o padrão mais comum na prova para "balancear custo e recuperação rápida". Você paga pelo banco + alguns serviços mínimos na secundária; o resto é provisionado só no failover.

---

### Warm Standby

- Ambiente **reduzido** rodando 24/7 na secundária (ex: ASG com min=1, bando rodando).
- Em DR: escala o ASG para o tamanho de produção + muda o DNS.
- **Failover mais rápido** que Pilot Light porque a infra já está rodando.

> 🎯 **Ponto de atenção:** Warm Standby difere de Pilot Light porque o ambiente secundário já está **rodando e escalável**, não precisa ser provisionado do zero.

---

### Multi-Site Active-Active

- Tráfego distribuído entre duas ou mais regiões ativamente.
- **Zero RTO, zero RPO** (com replicação síncrona).
- **Serviços**: Route 53 (Latency/Weighted), DynamoDB Global Tables, Aurora Global Database, S3 Multi-Region Access Points.
- Aplicação deve ser **stateless** ou tratar conflitos de escrita.

> 🎯 **Ponto de atenção:** Active-Active é o padrão mais caro e complexo. Cenário típico: "aplicação global com disponibilidade máxima e zero perda de dados".

### Cheat Sheet — DR

| Cenário | Resposta |
|---|---|
| "Menor custo, tolera horas de downtime" | **Backup & Restore** |
| "Custo moderado, minutos de RTO, serviços essenciais replicados" | **Pilot Light** |
| "Ambiente secundário rodando 24/7, escala rápido" | **Warm Standby** |
| "Zero downtime, zero data loss, tráfego distribuído" | **Multi-Site Active-Active** |
| "Replicação de banco cross-region" | **Aurora Global DB** ou **RDS Cross-Region Read Replica** |
| "Infra como código para DR rápido" | **CloudFormation StackSets** |

---

## Módulo 28: AWS Well-Architected Framework

O **AWS Well-Architected Framework (WAF)** é um conjunto de boas práticas para projetar e operar arquiteturas na nuvem. Baseia-se em **6 pilares**.

### Os 6 Pilares

| Pilar | Foco | Pergunta-chave |
|---|---|---|
| **Operational Excellence** | Operar e monitorar sistemas, melhorar continuamente | "Como você monitora sistemas e melhora processos?" |
| **Security** | Proteger dados, sistemas e ativos | "Como você protege dados e controla acesso?" |
| **Reliability** | Recuperar de falhas, escalar corretamente | "Como garante que o sistema funciona como esperado?" |
| **Performance Efficiency** | Usar recursos computacionais eficientemente | "Como você otimiza recursos para performance?" |
| **Cost Optimization** | Evitar custos desnecessários | "Como minimiza custos enquanto atende requisitos?" |
| **Sustainability** | Reduzir impacto ambiental | "Como você minimiza o impacto ambiental?" |

---

### Operational Excellence

**Princípios de design:**
- Perform operations as code (IaC — CloudFormation, CDK)
- Make frequent, small, reversible changes
- Refine operations procedures frequently
- Anticipate failure
- Learn from all operational failures

**Serviços-chave:** CloudFormation, CloudWatch, AWS Config, Systems Manager, X-Ray.

> 🎯 **Ponto de atenção:** "Equipe quer documentar procedimentos operacionais, responder a incidentes e melhorar processos continuamente" → **Operational Excellence**.

---

### Security

**Princípios de design:**
- Implement a strong identity foundation (IAM, least privilege)
- Enable traceability (CloudTrail, Config, GuardDuty)
- Apply security at all layers (VPC, WAF, Shield, encryption)
- Automate security best practices
- Protect data in transit and at rest
- Keep people away from data (use managed services)

**Serviços-chave:** IAM, KMS, WAF, Shield, GuardDuty, Inspector, Security Hub, Cognito, Secrets Manager.

> 🎯 **Ponto de atenção:** "Criptografia, controle de acesso, segurança em camadas" → **Security pillar**.

---

### Reliability

**Princípios de design:**
- Automatically recover from failure
- Test recovery procedures
- Scale horizontally to increase aggregate workload availability
- Stop guessing capacity (Auto Scaling, on-demand)
- Manage change through automation

**Serviços-chave:** Route 53, ASG, ELB, Multi-AZ RDS/Aurora, SQS, DynamoDB, AWS Backup.

> 🎯 **Ponto de atenção:** "Failover automático, alta disponibilidade, DR" → **Reliability pillar**. Não confunda DR (Reliability) com Security.

---

### Performance Efficiency

**Princípios de design:**
- Democratize advanced technologies (use managed services)
- Go global in minutes (CloudFront, Global Accelerator)
- Use serverless architectures
- Experiment more often
- Consider mechanical sympathy (ferramenta certa para cada tarefa)

**Serviços-chave:** Lambda, ElastiCache, CloudFront, RDS, DynamoDB DAX, S3 Select, Compute Optimizer.

> 🎯 **Ponto de atenção:** "Escolher o tipo de instância certo, usar cache, otimizar latência" → **Performance Efficiency**.

---

### Cost Optimization

**Princípios de design:**
- Implement Cloud Financial Management
- Adopt a consumption model (pay-as-you-go)
- Measure overall efficiency
- Stop spending money on undifferentiated heavy lifting
- Analyze and attribute expenditure

**Serviços-chave:** Cost Explorer, Budgets, Savings Plans, Spot Instances, S3 Lifecycle, Compute Optimizer, Trusted Advisor.

> 🎯 **Ponto de atenção:** "Savings Plans, Spot Instances, Lifecycle Rules para reduzir custo de storage" → **Cost Optimization**.

---

### Sustainability

Pilar mais recente (2021). Foco em reduzir o impacto ambiental.

**Princípios de design:**
- Understand your impact
- Establish sustainability goals
- Maximize utilization (consolidar workloads ociosas)
- Anticipate and adopt new, more efficient hardware
- Use managed services
- Reduce downstream impact

> 🎯 **Ponto de atenção:** "Reduzir emissão de carbono, eficiência energética, consolidar recursos ociosos" → **Sustainability**. Pode aparecer como "qual pilar trata de impacto ambiental?"

### Well-Architected Review

- Ferramenta no Console AWS que avalia a workload contra os 6 pilares.
- Gera relatório com **riscos identificados** e **recomendações**.
- Respostas documentam a arquitetura; **Milestones** marcam snapshots da evolução.

> 🎯 **Ponto de atenção:** A Well-Architected Review **não certifica** arquiteturas — é um guia de melhoria contínua (diferente de compliance como PCI, HIPAA).

---

## Módulo 29: Migração & Conectividade Híbrida

### AWS Site-to-Site VPN

- Conecta VPC a rede on-premises via **IPSec** sobre internet.
- **Virtual Private Gateway (VGW)** na VPC + **Customer Gateway (CGW)** on-premises.
- **2 túneis** por conexão (HA automática).
- Suporta **BGP** (dynamic routing) ou static routing.
- Throughput: até ~1.25 Gbps por túnel.
- **VPN CloudHub**: múltiplos sites conectados via VPN (hub-and-spoke).

> 🎯 **Ponto de atenção:** VPN é rápida de configurar (horas) e barata (paga por conexão + tráfego). Mas a latência varia com a internet. Para performance consistente, use Direct Connect.

---

### AWS Direct Connect (DX)

Conexão **física dedicada** via parceiro de rede.

- **Velocidades**: 50 Mbps a 100 Gbps.
- **Virtual Interfaces (VIFs)**:
  - **Private VIF**: acesso à VPC (via VGW).
  - **Public VIF**: acesso a serviços AWS públicos (S3, DynamoDB) sem internet.
  - **Transit VIF**: acesso a Transit Gateway (múltiplas VPCs).
- **Direct Connect Gateway**: conecta VPCs em múltiplas regiões com o mesmo circuito DX.
- **Provisionamento**: semanas a meses (depende do parceiro).

| DX vs VPN | Direct Connect | Site-to-Site VPN |
|---|---|---|
| **Latência** | Consistente, baixa | Variável (passa pela internet) |
| **Throughput** | Até 100 Gbps | Até ~1.25 Gbps |
| **Setup** | Semanas a meses | Horas |
| **Custo** | Alto (circuito + porta) | Baixo (só trânsito) |

> 🎯 **Ponto de atenção:** DX = "latência consistente, grande volume, conexão dedicada". VPN = "setup rápido, baixo custo, criptografado". Podem ser combinados (DX principal + VPN de backup).

---

### AWS Client VPN

- VPN **OpenVPN gerenciada** para usuários remotos acessarem a VPC.
- Autenticação: SAML, Active Directory, certificates, MFA.
- Ideal para: força de trabalho remota, acesso administrativo seguro.

---

### AWS Snow Family

Dispositivos físicos para transferência offline quando a rede é muito lenta ou cara.

| Dispositivo | Storage | Uso |
|---|---|---|
| **Snowcone** | 8 TB HDD + 14 TB SSD | Pequenos volumes, borda, 2.2 kg |
| **Snowball Edge Storage Optimized** | 80 TB HDD | Migração grande, data center shutdown |
| **Snowball Edge Compute Optimized** | 42 TB HDD + 7.68 TB NVMe | Borda com processamento local (EC2, Lambda) |
| **Snowmobile** | 100 PB | Caminhão — exabytes, data center completo |

> 🎯 **Ponto de atenção:** Use Snow Family quando a transferência por internet levaria **mais de 1 semana** (cálculo: tamanho ÷ largura de banda). Snowmobile é para >10 PB.

---

### AWS DataSync

- Transferência de dados **online** entre on-premises e AWS.
- **Agente** instalado on-premises (VMware, Hyper-V, Linux).
- Destinos: S3, EFS, FSx.
- **Incremental**: transfere apenas o que mudou.
- **Schedule**: execução recorrente; **validação**: checksum automático.
- **Velocidade**: até 10 Gbps por agente.

> 🎯 **Ponto de atenção:** DataSync = online, contínuo, datasets < 100 TB. Snowball = offline, físico, datasets grandes ou largura de banda insuficiente.

---

### AWS Storage Gateway

Bridge entre storage on-premises e AWS.

| Tipo | Acesso on-prem | Armazenamento AWS | Caso |
|---|---|---|---|
| **File Gateway** | NFS / SMB | S3 | Compartilhamento híbrido, backup on-prem no S3 |
| **Volume Gateway** | iSCSI | S3 + EBS Snapshots | Backups de servidores, DR |
| **Tape Gateway** | iSCSI VTL | S3 / Glacier | Substituir fitas físicas sem alterar software de backup |

> 🎯 **Ponto de atenção:** File Gateway = NFS/SMB → S3. Tape Gateway = backup de fita → S3/Glacier (sem mudar software legacy).

---

### Estratégias de Migração (Os 7 Rs)

| Estratégia | Descrição | Ferramentas |
|---|---|---|
| **Rehost (Lift & Shift)** | Migra como está, sem alterações | AWS MGN (Application Migration Service) |
| **Replatform** | Pequenas otimizações (ex: MySQL → RDS) | AWS DMS (Database Migration Service) |
| **Refactor / Re-architect** | Reescreve usando serviços nativos cloud | Lambda, DynamoDB, CloudFormation |
| **Repurchase** | Troca por SaaS (ex: Salesforce) | — |
| **Retain** | Mantém como está (não migra) | — |
| **Retire** | Descontinua aplicações obsoletas | — |
| **Relocate** | Move porta (hipervisor-level) | AWS MGN |

> 🎯 **Ponto de atenção:** A prova cobra os 3 principais: **Rehost** = mais rápido/menos risco (lift & shift). **Replatform** = muda banco para RDS. **Refactor** = reescreve para serverless.

---

## Módulo 30: Analytics & Big Data

### Amazon Kinesis

Plataforma de **streaming de dados** em tempo real.

| Serviço | Função | Retenção |
|---|---|---|
| **Kinesis Data Streams (KDS)** | Ingestão de streams (produtores → consumidores) | 24h a 365 dias |
| **Kinesis Data Firehose** | Entrega automatizada para destinos (S3, Redshift, OpenSearch, Splunk) | Near real-time (~60s) |
| **Kinesis Data Analytics** | SQL e Apache Flink para processar streams | — |
| **Kinesis Video Streams** | Streaming de vídeo (câmeras, drones) | — |

**Kinesis Data Streams:**
- **Shard**: unidade de throughput (1 MB/s write, 2 MB/s read por shard).
- Modos: **Provisioned** (escolhe shards) ou **On-Demand** (escala automática).
- Dados no mesmo shard são ordenados.
- Consumidores: EC2, Lambda, Kinesis Data Analytics.

**Kinesis Data Firehose:**
- Serverless — não precisa provisionar shards.
- Destinos: S3, Redshift (COPY), OpenSearch, Splunk, HTTP.
- Transformação opcional com Lambda.
- Compressão: GZIP, Snappy, ZSTD.

> 🎯 **Ponto de atenção:** KDS = você gerencia os consumidores (EC2/Lambda lêem os shards). Firehose = entrega automática para destinos sem código de consumidor.

---

### Amazon Redshift

Data warehouse **colunar** baseado em PostgreSQL.

- **Cluster**: leader node (coordena queries) + compute nodes (armazenam e processam).
- **Node types**: DC2 (SSD local), RA3 (storage separado do compute — escala independente).
- **Redshift Spectrum**: consulta dados no S3 sem carregar no Redshift.
- **Redshift Serverless**: sem provisionar cluster, paga por RPU/segundo.
- **Concurrency Scaling**: escala automaticamente para queries simultâneas.
- **Redshift ML**: cria modelos ML com SQL (CREATE MODEL).

> 🎯 **Ponto de atenção:** Redshift é para **OLAP** (consultas analíticas sobre grandes volumes). Não é para OLTP — use RDS para transações. **Spectrum** consulta S3 sem carregar dados.

---

### Amazon Athena

- **SQL serverless** diretamente no S3 — sem infraestrutura.
- Baseado em Presto/Trino. Paga por **dado escaneado** ($5/TB).
- Formatos recomendados: **Parquet, ORC, Avro** (colunares reduzem custo).
- **Partitioning**: particione dados por data/região para escanear apenas partições relevantes.
- **Workgroups**: separam queries por equipe, controlam custos.
- **Federated Query**: consulta DynamoDB, Redshift, RDS, CloudWatch Logs via Lambda connectors.

> 🎯 **Ponto de atenção:** Athena vs Redshift Spectrum: ambos consultam S3 com SQL. Athena é mais simples e não precisa de cluster. Spectrum usa o engine do Redshift e pode combinar S3 + tabelas locais.

---

### AWS Glue

Serviço **ETL serverless**.

- **Glue Crawlers**: varrem fontes de dados e populam o **Glue Data Catalog** (metadados).
- **Glue ETL Jobs**: scripts Python (Apache Spark) para transformar dados.
- **Glue Data Quality**: monitora qualidade dos dados.
- **Glue Studio**: interface visual para pipelines ETL.
- **Glue Schema Registry**: gerencia schemas para Kafka/MSK/KDS.

> 🎯 **Ponto de atenção:** Glue é o **hub de metadados** da AWS. Athena, Redshift Spectrum e EMR consultam o Glue Catalog para descobrir tabelas.

---

### Amazon EMR

Plataforma gerenciada para **big data** com Spark, Hadoop, Hive, HBase, Presto, Flink.

- **Cluster modes**: Long-running (permanente) ou Transient (encerra após job).
- **EMR Serverless**: sem gerenciar cluster.
- **EMR on EKS**: roda no Amazon EKS.
- Suporta Spot Instances para reduzir custo.

> 🎯 **Ponto de atenção:** EMR é para **frameworks específicos** (Spark, Hive, HBase). Glue é ETL serverless mais simples. Se a questão menciona Spark com controle total do cluster → EMR.

### Cheat Sheet — Analytics

| Cenário | Serviço |
|---|---|
| "Streaming em tempo real, múltiplos consumidores customizados" | **Kinesis Data Streams** |
| "Streaming para S3/Redshift sem código de consumidor" | **Kinesis Data Firehose** |
| "SQL ad-hoc em dados no S3" | **Athena** |
| "Data warehouse para BI e relatórios" | **Redshift** |
| "ETL serverless com crawlers e catálogo de dados" | **Glue** |
| "Big data com Spark/Hive — controle total" | **EMR** |
| "Apache Kafka gerenciado (migração)" | **MSK** |

---

## Módulo 31: Integração de Aplicações — API Gateway & Step Functions

### Amazon API Gateway

Serviço gerenciado para criar, publicar e gerenciar APIs.

#### Tipos de API

| Tipo | Caso | Características |
|---|---|---|
| **REST API** | APIs tradicionais, recursos RESTful | Validação, throttling, caching, transformação, WAF, usage plans |
| **HTTP API** | APIs mais simples, menor latência | Mais barato, performance superior, integração Lambda nativa |
| **WebSocket API** | Comunicação bidirecional | Chat, notificações, streaming |

> 🎯 **Ponto de atenção:** HTTP API é mais barato e rápido que REST API. REST API tem mais recursos (validação, WAF, usage plans). WebSocket é para conexões persistentes.

#### Endpoint Types

| Tipo | Destino | Latência |
|---|---|---|
| **Edge-Optimized** | CloudFront edge locations | Mínima global |
| **Regional** | Região da API | Menor regional |
| **Private** | Dentro da VPC via PrivateLink | Interna |

#### Recursos

- **Stages**: ambientes (dev, prod, canary) — cada stage tem endpoint e config próprios.
- **Canary Deployments**: direciona % do tráfego para testar alterações.
- **Usage Plans & API Keys**: controla quem chama a API e com que frequência.
- **Throttling**: limita requests/segundo (account-level e method-level).
- **Caching**: cacheia respostas (TTL configurável) — reduz latência e carga no backend.
- **CORS**: configurado no API Gateway (não precisa configurar no backend).
- **Request Validation**: valida body, query params e headers automaticamente.
- **SDK Generation**: gera SDKs para iOS, Android, JavaScript.

```bash
# Criar API REST
aws apigateway create-rest-api --name "MinhaAPI" --region us-east-1

# Criar recurso
aws apigateway create-resource --rest-api-id <id> --parent-id <root> --path-part "items"

# Deploy
aws apigateway create-deployment --rest-api-id <id> --stage-name prod
```

> 🎯 **Ponto de atenção:** API Gateway + Lambda = **arquitetura serverless mais comum na AWS**. API Gateway faz roteamento HTTP, autenticação, throttling, caching; Lambda executa a lógica.

---

### AWS Step Functions

Serviço de **orquestração serverless** para coordenar múltiplos serviços em workflows.

#### Standard vs Express Workflows

| Característica | Standard | Express |
|---|---|---|
| **Duração máxima** | 1 ano | 5 minutos |
| **Garantia** | At-least-once | At-most-once |
| **Rate** | 2.000/s | 100.000/s |
| **Custo** | Por transição de estado | Por execução + duração |
| **Uso** | Workflows longos, auditáveis | Alto throughput, curtas |

#### Estados (States)

| Estado | Função |
|---|---|
| **Task** | Executa uma unidade de trabalho (Lambda, ECS, DynamoDB, SQS) |
| **Choice** | Escolhe caminho por condição (if/else) |
| **Parallel** | Executa branches em paralelo e aguarda todas |
| **Map** | Itera sobre array e executa sub-workflow para cada item |
| **Wait** | Espera tempo determinado ou até uma data |
| **Pass** | Transforma input/output |
| **Succeed / Fail** | Termina com sucesso ou falha |

#### Error Handling

- **Retry**: tenta novamente com backoff exponencial (`MaxAttempts`, `IntervalSeconds`, `BackoffRate`).
- **Catch**: captura erro e redireciona para estado alternativo.

```json
{
  "Retry": [{
    "ErrorEquals": ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
    "IntervalSeconds": 2,
    "MaxAttempts": 3,
    "BackoffRate": 2
  }],
  "Catch": [{
    "ErrorEquals": ["States.ALL"],
    "Next": "TratarErro"
  }]
}
```

#### Padrões de Integração

- **Request Response**: chama serviço e espera (default).
- **Run a Job**: inicia job e espera completar (ex: ECS RunTask).
- **Wait for Callback with Task Token**: pausa e espera callback externo (aprovação humana, SQS).
- **Sync**: executa serviço e espera síncrono (Express).

> 🎯 **Ponto de atenção:** Step Functions é a resposta para "orquestrar múltiplos serviços em um workflow", "coordenar steps de um processo", "lidar com erros com retry/catch".

---

## Módulo 32: Segurança e Identidade

### Amazon Cognito

Serviço de identidade, autenticação e autorização para aplicações web e mobile.

#### Cognito User Pools

- **Diretório de usuários** gerenciado (sign-up, sign-in, MFA, recuperação de senha).
- **Identity Federation**: Google, Facebook, Apple, Amazon, SAML, OIDC.
- **Hosted UI**: página de login pronta (customizável).
- **Adaptive Authentication**: bloqueia logins suspeitos baseado em risco.
- **Triggers**: Lambda hooks (pré-registro, pós-autenticação, etc.).

#### Cognito Identity Pools

- Fornece **credenciais temporárias AWS (STS)** para usuários autenticados.
- Usuários podem vir de User Pools, federados (Google, Facebook, SAML) ou não autenticados.
- Usa **IAM roles** para controlar acesso a S3, DynamoDB, API Gateway.

> 🎯 **Ponto de atenção:** **User Pool** = autenticação (login). **Identity Pool** = autorização AWS (credenciais temporárias). Frequentemente usados juntos.

```
User Pool → autentica (JWT token)
    ↓
Identity Pool → troca JWT por credenciais AWS (STS)
    ↓
Acessa S3, DynamoDB, API Gateway
```

---

### AWS Secrets Manager vs SSM Parameter Store

| Característica | Secrets Manager | SSM Parameter Store |
|---|---|---|
| **Tipo** | Secrets (senhas, API keys, tokens) | Parâmetros (configs, secrets) |
| **Criptografia** | Automática (KMS) | Simples ou KMS (SecureString) |
| **Rotação automática** | Sim (RDS, Redshift, DocumentDB) | Não |
| **Cross-account** | Sim (resource-based policy) | Sim (via KMS key share) |
| **Preço** | $0.40/segredo/mês + chamadas | Standard: grátis (10K). Advanced: $0.05/parâmetro/mês |
| **Tamanho** | 64 KB | 8 KB |

> 🎯 **Ponto de atenção:** **Precisa de rotação automática?** → Secrets Manager. **Config simples sem rotação?** → Parameter Store (mais barato).

---

### AWS KMS — Aprofundamento

- **Customer Master Keys (CMKs)**:
  - **AWS Managed**: AWS gerencia (grátis, sem config policy/rotação).
  - **Customer Managed**: você gerencia ($1/mês + $0.03/10K calls).
  - **Custom Key Store**: CloudHSM dedicado.
- **Automatic Key Rotation**: anual (customer managed).
- **Multi-Region Keys**: mesma chave em múltiplas regiões (DR global).
- **Envelope Encryption**: dados criptografados com Data Key (DEK), DEK criptografada com CMK.
- **S3 Bucket Keys**: reduz chamadas KMS em até 99%.
- **KMS request rate limits**: 5.500/seg (RSA), 10.000/seg (Symmetric). Em alto throughput, use S3 Bucket Keys ou Data Keys.

> 🎯 **Ponto de atenção:** KMS tem **request rate limits** — em workloads de alto upload para SSE-KMS, pode gerar throttling. Solução: **S3 Bucket Keys** ou usar Data Keys com envelope encryption no cliente.

---

### AWS WAF

Protege **CloudFront, API Gateway, ALB, AppSync** contra:
- SQL injection, XSS
- Rate-based rules (bloqueio por número de requests)
- IP sets (whitelist/blacklist), geo-match (bloquear países)
- AWS Managed Rules (OWASP top 10, bots)
- **Bot Control**: detecta/scrapers

### AWS Shield

| Tier | Proteção | Custo |
|---|---|---|
| **Shield Standard** | DDoS L3/L4 (SYN floods, UDP floods) | **Gratuito** (ativado para todos) |
| **Shield Advanced** | DDoS L7, WAF incluso, suporte DRT 24/7 | $3.000/mês + tráfego |

> 🎯 **Ponto de atenção:** Shield Standard = básico (grátis). Shield Advanced = pago, WAF incluso, time de resposta DDoS.

### AWS Artifact

Portal de **relatórios de compliance**: SOC, PCI, ISO, FedRAMP, HIPAA.

> 🎯 **Ponto de atenção:** Artifact fornece relatórios de auditoria (não configura nada). Use para compliance e auditoria.

---

## Módulo 33: Governança e Gerenciamento

### AWS Organizations

Governança centralizada para múltiplas contas.

- **Management Account** (antiga master): controla a organização.
- **Member Accounts**: contas individuais.
- **Organizational Units (OUs)**: agrupam contas para aplicar políticas.
- **Service Control Policies (SCPs)**: definem limites de permissão — **não concedem**, apenas restringem.
- **Consolidated Billing**: fatura única (volume discounts compartilhados).

```
Management Account
    ├── OU: Security
    │   ├── Log Archive
    │   └── Security Tooling (GuardDuty, Security Hub)
    └── OU: Workloads
        ├── OU: Production (SCP: restringe regiões)
        │   └── App-Prod
        └── OU: Dev (SCP: mais flexível)
            └── App-Dev
```

> 🎯 **Ponto de atenção:** SCPs **não concedem acesso** — limitam o que a conta pode fazer. IAM policies ainda são necessárias dentro das contas. "Restringir que contas membro criem recursos fora de determinada região" → **SCP**.

---

### AWS CloudFormation

**Infrastructure as Code (IaC)** — templates JSON/YAML.

- **Template**: declara recursos AWS.
- **Stack**: instância do template (cria, atualiza, deleta recursos).
- **Change Set**: preview das alterações antes de aplicar.
- **StackSets**: deploy em múltiplas contas/regiões.
- **Drift Detection**: detecta alterações manuais fora do CF.
- **Nested Stacks**: reutilização de templates.
- **Cross-Stack Reference**: `Fn::ImportValue` / `Fn::ExportValue`.
- **Deletion Policy**: `Retain`, `Snapshot`, `Delete` — o que acontece com recursos ao deletar a stack.
- **Termination Protection**: impede deleção acidental.

> 🎯 **Ponto de atenção:** CloudFormation é o serviço de IaC nativo da AWS. "Infraestrutura reproduzível, deploy automatizado, templates" → **CloudFormation**.

---

### AWS Elastic Beanstalk

**Platform as a Service (PaaS)** — deploy rápido sem gerenciar infra.

- **Plataformas**: Node.js, Python, Java, .NET, PHP, Ruby, Go, Docker.
- **Environment Tiers**:
  - **Web Server**: HTTP(S) com ALB + ASG.
  - **Worker**: processamento assíncrono com SQS.
- **Deployment Modes**:
  - **All at Once**: atualiza tudo junto (downtime).
  - **Rolling**: lotes (sem downtime completo).
  - **Immutable**: cria novo ASG e troca (seguro, mais demorado).
  - **Blue/Green**: deploy em ambiente separado e troca DNS.

> 🎯 **Ponto de atenção:** Elastic Beanstalk é para **desenvolvedores que não querem gerenciar infra**. Diferente de CloudFormation (IaC genérico), EB é focado em aplicações.

---

### AWS Config

Avaliação de **conformidade contínua** de recursos.

- **Config Rules**: avaliam recursos:
  - **AWS Managed Rules** (prontas: `s3-bucket-public-read-prohibited`, `encrypted-volumes`).
  - **Custom Rules** (Lambda).
- **Remediation**: ação corretiva automática (Systems Manager Automation).
- **Conformance Packs**: pacotes pré-definidos (CIS, PCI, etc.).
- **Aggregator**: centraliza regras de múltiplas contas/regiões.

> 🎯 **Ponto de atenção:** CloudTrail = **quem fez**. Config = **como está configurado**. Use Config para **compliance contínuo**.

---

### AWS Backup

Serviço **centralizado** de backup.

- **Serviços**: EC2 (EBS), RDS, Aurora, DynamoDB, EFS, FSx, Storage Gateway.
- **Backup Plans**: schedule + lifecycle (ex: diário → 7 dias → cold → 1 ano).
- **Backup Vault**: cofre com criptografia e controle de acesso.
- **Backup Vault Lock**: WORM — impede deleção mesmo com credenciais de admin.
- **Cross-Region Copy**: DR.
- **Cross-Account Copy**: isolar backups em conta separada.

> 🎯 **Ponto de atenção:** AWS Backup **centraliza** backups de múltiplos serviços. "Política centralizada de backup, lifecycle, WORM" → **AWS Backup**.

---

### AWS Trusted Advisor

Recomendações para otimizar custo, performance, segurança e tolerância a falhas.

| Categoria | Exemplos | Disponível |
|---|---|---|
| **Custo** | EC2 ociosas, EIP não utilizado | Basic (7 checks) / Full |
| **Performance** | EC2 com IOPS elevado, CloudFront | Basic / Full |
| **Segurança** | Bucket público, SG portas abertas, MFA root | Basic (SGs) / Full |
| **Tolerância a falhas** | Multi-AZ desabilitado, backup ausente | Full |
| **Service Limits** | Aproximação de limites de serviço | Full |

> 🎯 **Ponto de atenção:** Trusted Advisor **recomenda**, mas não executa ações automaticamente. Support Plan define quantos checks: Developer = 7, Business/Enterprise = todos.

---

### AWS Cost Explorer & AWS Budgets

**Cost Explorer:**
- Visualiza e analisa custos/uso ao longo do tempo.
- Filtros: serviço, região, conta, tag.
- **Savings Plans recommendations** baseadas em uso histórico.
- Granularidade: horária, diária, mensal.

**AWS Budgets:**
- Alertas de orçamento (custo ou uso).
- Tipos: Cost Budget, Usage Budget, Savings Plans Budget.
- Ações automáticas: parar EC2/RDS, notificar SNS, aplicar SCP.

> 🎯 **Ponto de atenção:** Cost Explorer = **analisar** custos passados. Budgets = **alertar** sobre gastos futuros. Trusted Advisor = **recomendar** otimizações.

---

### AWS Systems Manager

Central de gerenciamento operacional.

| Recurso | Função |
|---|---|
| **Run Command** | Executa comandos remotamente (sem SSH) |
| **Session Manager** | Acesso shell seguro via IAM (sem bastion, sem SSH keys) |
| **Patch Manager** | Automatiza patches de SO |
| **Automation** | Runbooks para tarefas operacionais |
| **Parameter Store** | Parâmetros e secrets (ver Módulo 32) |
| **Inventory** | Coleta informações de SO e software |
| **State Manager** | Mantém configuração desejada |

> 🎯 **Ponto de atenção:** **Session Manager** = "acesso shell sem abrir portas SSH, sem bastion host, auditoria via CloudTrail". **Patch Manager** = "automatizar atualizações de segurança".
