---
title: "BYOC の概要 | BYOC"
slug: /byoc-intro
sidebar_key: byoc-intro
sidebar_label: "BYOC の概要"
beta: CONTACT SALES
notebook: FALSE
description: "Bring Your Own Cloud（BYOC）は、組織が Zilliz Cloud のインフラストラクチャを使用する代わりに、自社のクラウドアカウントでアプリケーションやデータをホストするためのデプロイオプションです。このソリューションは、データの完全な制御権を維持する必要がある特定のセキュリティ要件や規制コンプライアンスのニーズを持つ組織に最適です。| BYOC"
type: origin
token: RZqzw4UPkiikHOkdoa4chGDgnWX
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


# BYOC の概要

Bring Your Own Cloud (BYOC) は、組織が Zilliz Cloud のインフラストラクチャを使用する代わりに、自社のクラウドアカウントでアプリケーションとデータをホストするためのデプロイメントオプションです。このソリューションは、データの完全な制御主権を維持する必要がある特定のセキュリティ要件や規制コンプライアンスのニーズを持つ組織に最適です。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>までお問い合わせください。</p>

</Admonition>

## Zilliz BYOC を使用する理由\{#why-use-zilliz-byoc}

Zilliz BYOC は、以下の利点により、運用オーバーヘッドを排除しながらデータに対する完全な制御を維持できる独自のデプロイメントオプションを提供します。

- **運用**

    - [Zilliz Cloud コンソール](https://cloud.zilliz.com) で BYOC プロジェクトを作成し、インフラストラクチャをデプロイできます。

    - プロジェクト内の BYOC クラスターを監視するために、適切に調整されたメトリクスとアラート設定を使用できます。

- **スケーラビリティ**

    - ライセンスを追加購入することで、BYOC プロジェクトを常にスケールアップできます。

    - BYOC プロジェクト内のクラスターも、手動および自動スケーリングメカニズムによってスケーリング可能です。

- **データ管理とセキュリティ**

    - 組織、プロジェクト、およびクラスターレベルでのロールベースアクセス制御 (RBAC)。

    - すべてのデータは、お客様のクラウドアカウント内で安全に保存および処理されます。

## 仕組み\{#how-it-works}

BYOC では、Milvus を Zilliz が管理するバックエンドサービス（アップグレードワークフロー、リソーススケジューラ、Open API サービス、Web コンソールなど）と共に、通常はお客様自身の Virtual プライベート Cloud (VPC) 内にあるクラウド環境にデプロイします。この構成により、データはお客様自身のインフラストラクチャ内で保存および処理されることが保証されます。

Zilliz BYOC は、多様なエンタープライズガバナンス要件に適応するために、2 つのデプロイメントモードを実装しています。

- [BYOC](./byoc-intro#byoc)

- [BYOC-I](./byoc-intro#byoc-i)

### BYOC\{#byoc}

この Zilliz BYOC のフルマネージドモードでは、クラウドプロバイダーが提供するクロスアカウントロール仮定メカニズムを採用し、Zilliz Cloud が EKS クラスターと EC2 インスタンスを管理するための権限を取得できるようにします。

![PCAOw33vKhCLHubzOiCciDDMnGg](https://zdoc-images.s3.us-west-2.amazonaws.com/PCAOw33vKhCLHubzOiCciDDMnGg.png)

上記のアーキテクチャに従い、Zilliz Cloud に代わって EKS クラスターを起動し、Milvus Operator、Import/Backup ツール、Grafana や Prometheus を含む監視スタック、および Milvus インスタンスなどの必要なコンポーネントをデプロイするために、VPC、S3 バケット、および最小限の権限を提供する必要があります。

監視スタックは Zilliz Cloud コントロールプレーンを介さず、BYOC インフラストラクチャ内にローカルに統合されている点にご注意ください。監視統合を有効化および構成するには、[Zilliz テクニカルサポート](https://support.zilliz.com/hc/en-us) までお問い合わせください。

さらに、Zilliz Cloud は VPC 内にデプロイされたコンポーネントとの通信のために、2 つの個別のプレーンを確立します。

- **コントロールプレーン**

    コントロールプレーンは、リソースのスケジューリング、Milvus インスタンスのアップグレード、Zilliz Cloud コンソールおよびコントロールプレーン Open API サービスへのアクセスを提供するために、Zilliz Cloud と VPC 内にデプロイされたコンポーネント間の通信を可能にします。

- **データプレーン**

    データプレーンは、お客様のアプリケーション/サービスと VPC 内にデプロイされた Milvus インスタンス間の通信を可能にし、特にデータの保存と取得に使用されます。

### BYOC-I\{#byoc-i}

このモードでは、フルマネージドの Zilliz BYOC デプロイメントで採用されるクロスアカウントロール仮定方法の代わりに、包括的な運用・保守機能を提供するために、お客様の環境に BYOC エージェントをデプロイします。クラウドプレーンと BYOC エージェントの間には、通信セキュリティを向上させるために、暗号化されたポイントツーポイント (P2P) 逆トンネルが作成されます。

![UyVBwtva2hZaAMbP1zicQeRHnah](https://zdoc-images.s3.us-west-2.amazonaws.com/UyVBwtva2hZaAMbP1zicQeRHnah.png)

BYOC-I モードでは、インフラストラクチャリソースを代行管理するためのクロスアカウント権限を要求するのではなく、インフラストラクチャ管理を完全にお客様の手に委ねることで、データ制御の主権を強化します。

ただし、必要に応じてインフラストラクチャ管理を Zilliz が支援できるよう、エージェントに必要な権限を付与することを選択することもできます。

## セキュリティ保証\{#security-assurance}

Zilliz Cloud は、包括的な暗号化と厳格なアクセス制御を通じて、ネットワーク境界を越えた安全な通信を保証します。

### ネットワークセキュリティ\{#network-security}

- **内部トラフィック**: クラスターセキュリティグループ内での完全な TCP/UDP 通信。

- **外部トラフィック**: ポート 443 での暗号化された送信専用 TCP 接続により、以下が可能になります。

    - Zilliz コントロールプレーンへの接続。

    - データソースおよびイメージリポジトリへのアクセス。

- **同じセキュリティグループ**: クラスター内通信のために許可される TCP/UDP 接続。

### アクセス制御\{#access-control}

- Zilliz エンジニア向けの安全な VPN およびジャストインタイムの証明書ベース認証。

- すべてのアクセスには承認が必要であり、監査のためにログ記録されます。

- コントロールプレーンは、送信専用 TCP 接続を通じてメトリクスを監視および収集します。

これらの堅牢な対策はデータの整合性と機密性を保護し、クラウドにおける安全で信頼性の高い運用を保証します。

### 転送中の暗号化\{#encryption-in-transit}

クライアントは Zilliz クラスターに対して HTTPS または gRPC 接続を確立します。HTTPS/gRPC 接続は、転送中のユーザーデータを暗号化するために、AES-256（256 ビット Advanced Encryption Standard）を使用した TLS 1.2（またはそれ以上）プロトコルを使用します。

### 保存時の暗号化\{#encryption-at-rest}

Zilliz Cloud のデータプレーンは、AES-256（256 ビット Advanced Encryption Standard）暗号化アルゴリズムを使用して、AWS S3 上の保存データを暗号化します。

## コスト管理\{#cost-management}

Zilliz BYOC は、リソース管理を通じて BYOC プロジェクトで使用したサービスに対して課金します。ただし、以下の図に示すように、クラウドサービスプロバイダーからのインフラストラクチャ費用も引き続き発生します。

![TudFwgMGthlQmvbeH9qcXx0jnzn](https://zdoc-images.s3.us-west-2.amazonaws.com/TudFwgMGthlQmvbeH9qcXx0jnzn.png)

