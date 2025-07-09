---
title: "BYOCの概要 | BYOC"
slug: /byoc-intro
sidebar_label: "BYOCの概要"
beta: CONTACT SALES
notebook: FALSE
description: "Bring Your Own Cloud(BYOC)は、Zilliz Cloudのインフラストラクチャを使用する代わりに、組織が独自のクラウドアカウントでアプリケーションやデータをホストするための展開オプションです。このソリューションは、特定のセキュリティ要件や規制遵守ニーズを持つ組織に最適であり、完全なデータ制御主権を維持する必要があります。 | BYOC"
type: origin
token: RZqzw4UPkiikHOkdoa4chGDgnWX
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - milvus
  - vector database
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


# BYOCの概要

Bring Your Own Cloud(BYOC)は、Zilliz Cloudのインフラストラクチャを使用する代わりに、組織が独自のクラウドアカウントでアプリケーションやデータをホストするための展開オプションです。このソリューションは、特定のセキュリティ要件や規制遵守ニーズを持つ組織に最適であり、完全なデータ制御主権を維持する必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## Zilliz BYOCのメリット{#why-use-zilliz-byoc}

Zilliz BYOCは、以下の利点により、運用オーバーヘッドを排除しながらデータを完全に制御できる独自の展開オプションを提供します。

- **オペレーション**

    - BYOCプロジェクトを作成し、[Zilliz Cloudコンソール](https://cloud.zilliz.com)にインフラストラクチャをデプロイできます。

    - プロジェクト内のBYOCクラスターを監視するために、適切に調整されたメトリックとアラート設定を使用できます。

- **スケーラビリティ**

    - ライセンスを追加購入することで、いつでもBYOCプロジェクトを拡大できます。

    - BYOCプロジェクトのクラスターは、手動および自動スケーリングメカニズムでもスケーラブルです。

- **データ管理とセキュリティ**

    - 組織、プロジェクト、クラスターレベルでのロールベースのアクセス制御(RBAC)。

    - すべてのデータは、クラウドアカウント内で安全に保存および処理されます。

## どのように動作するか{#how-it-works}

BYOCは、アップグレードワークフロー、リソーススケジューラー、オープンAPIサービス、Webコンソールなど、Zillizが管理するバックエンドサービスと一緒にMilvusをクラウド環境内に展開することを含みます。通常、あなた自身のVirtual Private Cloud(VPC)内にあります。このセットアップにより、あなたのデータがあなた自身のインフラストラクチャ内で保存および処理されることが保証されます。 

Zilliz BYOCは、多様な企業ガバナンス要件に適応するために2つの展開モードを実装しています。

- [BYOC](./byoc-intro#byoc)

- [BYOC-Iについて](./byoc-intro#byoc-i)

![SFKlb1M7ho3r5wxx2BBcN1H6npb](/img/SFKlb1M7ho3r5wxx2BBcN1H6npb.png)

</include>

### BYOC{#byoc}

Zilliz BYOCのこのフルマネージドモードでは、クラウドプロバイダーが提供するクロスアカウントの役割仮定メカニズムを使用して、Zilliz CloudがEKSクラスターとEC 2インスタンスを管理する権限を取得できます。

![PCAOw33vKhCLHubzOiCciDDMnGg](/img/PCAOw33vKhCLHubzOiCciDDMnGg.png)

上記のアーキテクチャに従うと、Zilliz CloudがEKSクラスターを開始し、必要なコンポーネント(Milvus Operator、Import/Backupツール、GrafanaおよびPrometheusを含む監視スタック、およびMilvusインスタンスなど)を展開するために、VPC、S 3バケット、および最小限の権限を提供する必要があります。

さらに、Zilliz Cloudは、VPCにデプロイされたコンポーネントとの通信のために2つの別々のプレーンを確立します。

- **コントロールプレーン**

    コントロールプレーンは、リソースのスケジューリング、Milvusインスタンスのアップグレード、Zilliz CloudコンソールとコントロールプレーンのオープンAPIサービスへのアクセスを提供するために、Zilliz CloudとVPCにデプロイされたコンポーネント間の通信を容易にします。

- **データプレーン**

    データプレーンは、VPCにデプロイされたMilvusインスタンスとアプリケーション/サービス間の通信を可能にし、データの保存と取得に特化しています。

### BYOC-Iについて{#byoc-i}

このモードでは、完全に管理されたZilliz BYOC展開でクロスアカウントの役割仮定方法を使用する代わりに、包括的な運用およびメンテナンス機能のためにBYOCエージェントを環境に展開します。クラウドプレーンとBYOCエージェントの間に暗号化されたポイントツーポイント(P 2 P)逆トンネルが作成され、通信セキュリティが向上します。

![UyVBwtva2hZaAMbP1zicQeRHnah](/img/UyVBwtva2hZaAMbP1zicQeRHnah.png)

BYOC-Iモードでは、インフラストラクチャリソースを管理するためにクロスアカウント権限を要求する代わりに、Zillizはインフラストラクチャ管理を完全にあなたの手に委ねることで、データ制御主権を強化します。

ただし、必要に応じてZillizがインフラストラクチャ管理を支援できるように、エージェントに必要な権限を付与することもできます。

## セキュリティ保証{#security-assurance}

Zilliz Cloudは、包括的な暗号化と厳格なアクセス制御により、ネットワーク境界を越えた安全な通信を保証します。

### ネットワークセキュリティ{#network-security}

- **内部トラフィック**:クラスターセキュリティグループ内での完全なTCP/UDP通信。

- **外部トラフィック**:ポート443での暗号化された送信専用TCP接続により、次のことが可能になります: 

    - Zillizコントロールプレーンへの接続。

    - データソースと画像リポジトリへのアクセス。

- **同じセキュリティグループ**:クラスタ内通信に対してTCP/UDP接続が許可されています。

### アクセス制御{#access-control}

- Zillizエンジニアのための安全なVPNと、ジャストインタイムの証明書ベースの認証。

- すべてのアクセスには承認が必要であり、監査のために記録されます。

- コントロールプレーンは、アウトバウンド専用のTCP接続を介してメトリックを監視および収集します。

これらの堅牢な対策により、データの整合性と機密性が保護され、クラウドでの安全で信頼性の高い操作が確保されます。

### 輸送中の暗号化{#encryption-in-transit}

クライアントは、ZillizクラスターへのHTTPSまたはgRPC接続を確立します。HTTPS/gRPC接続では、TLS 1.2（またはそれ以上）プロトコルとAES-256（256ビット高度暗号化標準）を使用して、転送中のユーザーデータを暗号化します。

### 保存時の暗号化{#encryption-at-rest}

Zilliz Cloudのデータプレーンは、AES-256(256ビット高度暗号化標準)暗号化アルゴリズムを使用して、AWS S 3に保存されたデータを暗号化します。

## コスト管理{#cost-management}

Zilliz BYOCは、リソース管理を通じてBYOCプロジェクトで使用するサービスに対して料金を請求します。ただし、次の図に示すように、クラウドサービスプロバイダーからインフラストラクチャ費用が発生します。

![TudFwgMGthlQmvbeH9qcXx0jnzn](/img/TudFwgMGthlQmvbeH9qcXx0jnzn.png)

BYOCプロジェクトのコストを見積もる方法の詳細については、Estimate Cost(BYOC)を参照してください。