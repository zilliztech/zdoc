---
title: "BYOC 概要 | BYOC"
slug: /byoc-intro
sidebar_label: "BYOC 概要"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Bring Your Own Cloud (BYOC) は、組織が Zilliz Cloud のインフラストラクチャではなく、自身のクラウドアカウントでアプリケーションとデータをホストするための展開オプションです。このソリューションは、完全なデータ管理の主権を維持する必要がある特定のセキュリティ要件や規制遵守が必要な組織に最適です。 | BYOC"
type: origin
token: RZqzw4UPkiikHOkdoa4chGDgnWX
sidebar_position: 1
keywords:
  - zilliz
  - byoc
  - milvus
  - vector database
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search

---

import Admonition from '@theme/Admonition';


# BYOC 概要

Bring Your Own Cloud (BYOC) は、組織が Zilliz Cloud のインフラストラクチャではなく、自身のクラウドアカウントでアプリケーションとデータをホストするための展開オプションです。このソリューションは、完全なデータ管理の主権を維持する必要がある特定のセキュリティ要件や規制遵守が必要な組織に最適です。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>までお問い合わせください。</p>

</Admonition>

## なぜ Zilliz BYOC を使用するのか\{#why-use-zilliz-byoc}

Zilliz BYOC は、データ管理と運用のオーバーヘッドを排除しながらも、データを完全に制御できる独自の展開オプションを提供します。

- **運用**

    - [Zilliz Cloud コンソール](https://cloud.zilliz.com)で BYOC プロジェクトを作成し、インフラストラクチャを展開できます。

    - BYOC クラスターの監視には、調整済みのメトリクスとアラート設定を利用できます。

- **スケーラビリティ**

    - 複数のライセンスを購入することで、いつでも BYOC プロジェクトをスケールアップできます。

    - BYOCプロジェクト内のクラスターも、手動および自動スケーリングメカニズムによりスケーラブルです。

- **データ管理とセキュリティ**

    - 組織、プロジェクト、クラスターレベルでのロールベースのアクセス制御 (RBAC)。

    - すべてのデータは、お客様のクラウドアカウント内で安全に保存および処理されます。

## 仕組み\{#how-it-works}

BYOC は、アップグレードワークフロー、リソーススケジューラ、Open API サービス、および Web コンソールなどの Zilliz 管理サービスとともに、Milvus をクラウド環境に展開します。通常、これはお客様自身の Virtual Private Cloud (VPC) 内で行われます。このセットアップにより、データはお客様自身のインフラストラクチャ内で保存および処理されます。

Zilliz BYOC は、多様化する企業ガバナンス要件に適応するための2つの展開モードを実装しています。それは、

- [BYOC](./byoc-intro#byoc)

- [BYOC-I](./byoc-intro#byoc-i)

### BYOC\{#byoc}

この Zilliz BYOC の完全マネージドモードでは、クラウドプロバイダーが提供するクロスアカウントロールの想定メカニズムを使用して、Zilliz Cloud が EKS クラスターと EC2 インスタンスを管理するための権限を取得します。

![PCAOw33vKhCLHubzOiCciDDMnGg](/img/PCAOw33vKhCLHubzOiCciDDMnGg.png)

上記のアーキテクチャに従い、VPC、S3バケット、および Zilliz Cloud が EKS クラスターを起動し、Milvus Operator、Import/Backup ツール、Grafana や Prometheus などの監視スタック、および Milvus インスタンスなどの必要なコンポーネントを代理で展開するための最小限の権限を提供する必要があります。

さらに、Zilliz Cloud は、VPC に展開されたコンポーネントとの通信に2つの異なるプレーンを確立します。それは、

- **コントロールプレーン**

    コントロールプレーンは、Zilliz Cloud と VPC に展開されたコンポーネント間の通信を促進し、リソースのスケジューリング、Milvus インスタンスのアップグレード、および Zilliz Cloud コンソールおよびコントロールプレーンのオープン API サービスへのアクセスを提供します。

- **データプレーン**

    データプレーンは、アプリケーション/サービスと VPC に展開された Milvus インスタンス間の通信を可能にし、特にデータの保存と取得を実現します。

### BYOC-I\{#byoc-i}

このモードでは、完全マネージド Zilliz BYOC 展開でのクロスアカウントロール想定方式の代わりに、包括的な運用管理機能を持つ BYOC エージェントを環境に展開します。クラウドプレーンと BYOC エージェントの間には暗号化されたポイントツーポイント (P2P) リバーストンネルが作成され、通信セキュリティが向上します。

![UyVBwtva2hZaAMbP1zicQeRHnah](/img/UyVBwtva2hZaAMbP1zicQeRHnah.png)

BYOC-I モードでは、Zilliz にインフラストラクチャリソースを代理で管理するためのクロスアカウント権限を要求する代わりに、Zilliz はインフラストラクチャ管理を完全に顧客に委ねることで、データ制御の主権を強化します。

ただし、必要に応じて Zilliz がインフラストラクチャ管理を支援できるように、エージェントに必要な権限を付与することも可能です。

## セキュリティ保証\{#security-assurance}

Zilliz Cloud は、包括的な暗号化と厳格なアクセス制御を通じて、ネットワーク境界間の安全な通信を確保します。

### ネットワークセキュリティ\{#network-security}

- **内部トラフィック**: クラスターセキュリティグループ内での完全な TCP/UDP 通信。

- **外部トラフィック**: ポート 443 上の暗号化された送信専用 TCP 接続により以下を可能にします。

    - Zilliz コントロールプレーンとの接続。

    - データソースおよびイメージリポジトリへのアクセス。

- **同じセキュリティグループ**: クラスター内通信のための TCP/UDP 接続が許可されています。

### アクセス制御\{#access-control}

- Zilliz エンジニアによる安全な VPN および、即時対応型の証明書ベースの認証。

- すべてのアクセスには承認が必要で、監査用にログに記録されます。

- コントロールプレーンは、送信専用 TCP 接続を介してメトリクスを監視および収集します。

これらの堅牢な measures は、データの完全性と機密性を保護し、クラウドでの安全で信頼性の高い運用を保証します。

### 伝送中の暗号化\{#encryption-in-transit}

クライアントは HTTPS または gRPC 接続を Zilliz クラスターに確立します。HTTPS/gRPC 接続では、TLS 1.2 (またはそれ以上) プロトコルおよび AES-256 (256ビット高度暗号化標準) を使用して、転送中のユーザーデータを暗号化します。

### 保存時の暗号化\{#encryption-at-rest}

Zilliz Cloud のデータプレーンは、AES-256 (256ビット高度暗号化標準) 暗号化アルゴリズムを使用して AWS S3 上に保存されたデータを暗号化します。

## コスト管理\{#cost-management}

Zilliz BYOC は、BYOC プロジェクトで使用するサービスに対してリソース管理を通じて課金されます。ただし、以下のような図に示すように、クラウドサービスプロバイダーからのインフラストラクチャ費用は引き続き発生します。

![TudFwgMGthlQmvbeH9qcXx0jnzn](/img/TudFwgMGthlQmvbeH9qcXx0jnzn.png)
