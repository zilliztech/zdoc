---
title: "BYOC の概要 | BYOC"
slug: /byoc-intro
sidebar_label: "BYOC の概要"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Bring Your Own Cloud (BYOC) は、Zilliz Cloud のインフラストラクチャを使用する代わりに、組織が自社のクラウドアカウントでアプリケーションとデータをホストするためのデプロイメントオプションです。このソリューションは、データに対する完全な管理主権を維持する必要がある、特定のセキュリティ要件や規制コンプライアンス要件を持つ組織に最適です。 | BYOC"
type: origin
token: RZqzw4UPkiikHOkdoa4chGDgnWX
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# BYOC の概要

Bring Your Own Cloud (BYOC) は、Zilliz Cloud のインフラストラクチャを使用する代わりに、組織が自社のクラウドアカウントでアプリケーションとデータをホストするためのデプロイメントオプションです。このソリューションは、データに対する完全な管理主権を維持する必要がある、特定のセキュリティ要件や規制コンプライアンス要件を持つ組織に最適です。

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud サポート](https://zilliz.com/contact-sales) にお問い合わせください。

</Admonition>

## Zilliz BYOC を使用する理由\{#why-use-zilliz-byoc}

Zilliz BYOC は、以下の利点により運用オーバーヘッドを排除しながら、データを完全に管理できる独自のデプロイメントオプションを提供します。

- **運用**

    - [Zilliz Cloud コンソール](https://cloud.zilliz.com) で BYOC project を作成し、インフラストラクチャをデプロイできます。

    - project 内の BYOC cluster を監視するために、適切に調整されたメトリクスとアラート設定を利用できます。

- **スケーラビリティ**

    - さらにライセンスを購入することで、いつでも BYOC project をスケールできます。

    - BYOC project 内の cluster も、手動および自動のスケーリングメカニズムでスケーラブルです。

- **データ管理とセキュリティ**

    - organization、project、cluster レベルでのロールベースアクセス制御（RBAC）。

    - すべてのデータは、お客様のクラウドアカウント内で安全に保存および処理されます。

## 仕組み\{#how-it-works}

BYOC では、Milvus を、アップグレードワークフロー、リソーススケジューラ、Open API サービス、Web コンソールなどの Zilliz 管理バックエンドサービスとともに、お客様のクラウド環境内、通常はお客様自身の Virtual Private Cloud (VPC) 内にデプロイします。この構成により、データはお客様自身のインフラストラクチャ内で保存および処理されます。 

Zilliz BYOC は、多様なエンタープライズガバナンス要件に対応するために 2 つのデプロイメントモードを実装しており、それは次のとおりです。

- [BYOC](./byoc-intro#byoc)

- [BYOC-I](./byoc-intro#byoc-i)

### BYOC\{#byoc}

この完全マネージド型の Zilliz BYOC モードでは、クラウドプロバイダーが提供するクロスアカウントロール引き受けメカニズムを使用し、Zilliz Cloud がお客様に代わって EKS cluster と EC2 インスタンスを管理するための権限を引き受けます。

![PCAOw33vKhCLHubzOiCciDDMnGg](https://zdoc-images.s3.us-west-2.amazonaws.com/PCAOw33vKhCLHubzOiCciDDMnGg.png)

上記のアーキテクチャに従うと、Zilliz Cloud がお客様に代わって EKS cluster を起動し、Milvus Operator、Import/Backup ツール、Grafana と Prometheus を含む monitoring stack、そして Milvus インスタンスなどの必要なコンポーネントをデプロイできるようにするために、VPC、S3 bucket、および最小限の権限を提供する必要があります。 

monitoring stack は Zilliz Cloud control plane を介するのではなく、お客様の BYOC インフラストラクチャ内にローカル統合される点に注意してください。監視統合を有効化および設定するには、[Zilliz Technical Support](https://support.zilliz.com/hc/en-us) にお問い合わせください。

さらに、Zilliz Cloud は、お客様の VPC にデプロイされたコンポーネントと通信するために 2 つの独立したプレーンを確立します。それは次のとおりです。

- **Control Plane**

    control plane は、リソースのスケジューリング、Milvus インスタンスのアップグレード、および Zilliz Cloud コンソールと control-plane open API サービスへのアクセスを提供するために、Zilliz Cloud とお客様の VPC にデプロイされたコンポーネント間の通信を仲介します。

- **Data Plane**

    data plane は、お客様のアプリケーション/サービスとお客様の VPC にデプロイされた Milvus インスタンス間の通信を可能にし、特にデータの保存と取得に使用されます。

### BYOC-I\{#byoc-i}

このモードでは、完全マネージド型の Zilliz BYOC デプロイメントでクロスアカウントロール引き受け方式を使用する代わりに、お客様の環境に BYOC agent をデプロイして包括的な運用および保守機能を提供します。通信セキュリティを向上させるために、Cloud Plane と BYOC agent の間に暗号化されたポイントツーポイント (P2P) リバーストンネルが作成されます。

![UyVBwtva2hZaAMbP1zicQeRHnah](https://zdoc-images.s3.us-west-2.amazonaws.com/UyVBwtva2hZaAMbP1zicQeRHnah.png)

BYOC-I モードでは、お客様に代わってインフラストラクチャリソースを管理するためのクロスアカウント権限を要求する代わりに、Zilliz はインフラストラクチャ管理を完全にお客様の手に委ねることで、データ管理主権を強化します。

ただし、必要に応じて Zilliz がお客様のインフラストラクチャ管理を支援できるように、agent に必要な権限を付与することもできます。

## セキュリティ保証\{#security-assurance}

Zilliz Cloud は、包括的な暗号化と厳格なアクセス制御により、ネットワーク境界をまたぐ安全な通信を確保します。

### ネットワークセキュリティ\{#network-security}

- **内部トラフィック**: cluster セキュリティグループ内での完全な TCP/UDP 通信。

- **外部トラフィック**: ポート 443 上の暗号化されたアウトバウンド専用 TCP 接続により、以下を実現します。 

    - Zilliz control plane への接続。

    - データソースおよびイメージリポジトリへのアクセス。

- **同一セキュリティグループ**: cluster 内通信のために TCP/UDP 接続を許可。

### アクセス制御\{#access-control}

- Zilliz エンジニア向けの安全な VPN とジャストインタイムの証明書ベース認証。

- すべてのアクセスには承認が必要であり、監査のために記録されます。

- control plane は、アウトバウンド専用 TCP 接続を通じて監視およびメトリクス収集を行います。

これらの強力な対策により、データの完全性と機密性が保護され、クラウドでの安全かつ信頼性の高い運用が保証されます。

### 転送中の暗号化\{#encryption-in-transit}

クライアントは Zilliz Cluster への HTTPS または gRPC 接続を確立します。HTTPS/gRPC 接続では、転送中のユーザーデータを暗号化するために、AES-256（256 ビット Advanced Encryption Standard）を使用した TLS 1.2（またはそれ以上）プロトコルを使用します。

### 保存時の暗号化\{#encryption-at-rest}

Zilliz Cloud の data plane は、AWS S3 に保存されたデータを AES-256（256 ビット Advanced Encryption Standard）暗号化アルゴリズムで暗号化します。

## コスト管理\{#cost-management}

Zilliz BYOC では、リソース管理を通じて BYOC project で使用したサービスに対して課金されます。ただし、次の図に示すように、クラウドサービスプロバイダーからのインフラストラクチャ費用は引き続き発生します。

![TudFwgMGthlQmvbeH9qcXx0jnzn](https://zdoc-images.s3.us-west-2.amazonaws.com/TudFwgMGthlQmvbeH9qcXx0jnzn.png)

