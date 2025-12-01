---
title: "Terraform プロバイダー | BYOC"
slug: /terraform-provider
sidebar_label: "Terraform プロバイダー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz は完全マネージド Milvus サービスを提供しており、セキュリティを念頭に置いてベクトル検索アプリケーションの展開とスケーリングを効率化し、Zilliz が提供するクラウドインフラストラクチャと顧客自身のクラウドインフラストラクチャの両方を含む複雑なインフラストラクチャの構築と維持の必要性を排除します。 | BYOC"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 14
keywords:
  - zilliz
  - vector database
  - cloud
  - terraform provider
  - terraform
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


# Terraform プロバイダー

Zilliz は完全マネージド Milvus サービスを提供しており、セキュリティを念頭に置いてベクトル検索アプリケーションの展開とスケーリングを効率化し、Zilliz が提供するクラウドインフラストラクチャと顧客自身のクラウドインフラストラクチャの両方を含む複雑なインフラストラクチャの構築と維持の必要性を排除します。

[Zilliz Cloud Terraform プロバイダー](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) は、オープンソースの Infrastructure as Code (IaC) ソリューションであり、Zilliz Cloud リソースを動的にビルド、変更、およびバージョン管理できるようにします。これを使用する前に、Zilliz Cloud API キーなどの適切な認証情報を使用してプロバイダーを設定する必要があります。

## 認証\{#authentication}

Terraform を使用したリソース展開を開始する前に、Zilliz Cloud プラットフォームで Terraform の認証を行う必要があります。この Terraform プロバイダーで操作を行う前に、適切な権限を持つ Zilliz Cloud API キーを使用して認証を完了する必要があります。Zilliz Cloud API キーを作成するには、以下の手順に従ってください：

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にサインインします。

1. トップナビゲーションバーの右側にある **API キー** をクリックします。

1. API キー ページの右上にある **+ API キー** をクリックします。

1. 表示される **API キーの作成** ダイアログ ボックスで、API キー名を入力し、アクセス権限を設定し、**作成** をクリックして API キーを生成します。

API キーの管理の詳細については、[API キー](/docs/byoc/manage-api-keys) を参照してください。

## 管理可能なリソース\{#manageable-resources}

現在、このプロバイダーを使用して、以下のタイプのリソースを管理できます：

### クラスター\{#clusters}

[Zilliz Cloud クラスター](/docs/manage-cluster) は、Zilliz Cloud で動作する Milvus インスタンスです。Zilliz Cloud は、クラスターを **Free**、**Serverless**、**Dedicated (Standard)**、**Dedicated (Enterprise)**、および **Bring Your Own Cloud (BYOC)** など、さまざまなオファリングに分類します。これらのオファリングの詳細については、[詳細プラン比較](/docs/select-zilliz-cloud-service-plans) を参照してください。

Zilliz Cloud Terraform プロバイダーを使用して、特定のオファリングのクラスターを作成および管理できます。詳細については、以下のチュートリアルを参照してください：

- [無料クラスターを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Serverless クラスターを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [専用クラスターを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [クラスターをスケーリング](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [既存のクラスターを Terraform 管理にインポート](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### データベース\{#database}

Zilliz Cloud では、[データベース](/docs/database) はデータを整理および管理するための論理単位として機能します。これは専用クラスターでのみ利用可能です。クラスター作成時に、デフォルトのデータベースが作成されます。Zilliz Cloud Terraform プロバイダーを使用してデータベースを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [データベース (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [データベース (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### コレクションおよびエイリアス\{#collection-and-aliases}

[コレクション](/docs/manage-collections) は、固定された列と可変の行を持つ二次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。Zilliz Cloud Terraform プロバイダーを使用してコレクションを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [エイリアス (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [コレクション (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [エイリアス (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [コレクション (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### パーティション\{#partition}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。このページでは、パーティションを管理する方法について説明します。Zilliz Cloud Terraform プロバイダーを使用してパーティションを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [パーティション (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [パーティション (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### インデックス\{#index}

Zilliz Cloud は [AUTOINDEX](/docs/autoindex-explained) を採用して効率的な類似性検索を可能にしています。また、ベクトル埋め込み間の距離を測定するためにこれらの [メトリックタイプ](/docs/search-metrics-explained) を提供しています：**Cosine Similarity** (COSINE)、**Euclidean Distance** (L2)、**Inner Product** (IP)、**JACCARD**、および **HAMMING**。AUTOINDEX はメタデータフィルタリングを高速化するためにスカラー（数値）フィールドにも適用されます。Zilliz Cloud Terraform プロバイダーを使用してインデックスを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [インデックス (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [インデックス (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### ユーザーおよびロール\{#users-and-roles}

Zilliz Cloud では、クラスターユーザーを作成し、クラスターロールを割り当てることで権限を定義し、データセキュリティを実現できます。ユーザーは適切に構成された認証情報を持つデータベースユーザーを表し、一連のロールが割り当てられます。一方、ロールは一連の権限をカプセル化するエンティティであり、ユーザーに割り当てることができます。このセクションのリソースおよびデータソースを使用して、ロールベースのアクセス制御 (RBAC) を実装できます。詳細については、以下のリソースおよびデータソースを参照してください：

- [ユーザー (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [ユーザー (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [ロール (リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [ロール (データソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

### BYOC プロジェクト\{#byoc-projects}

Zilliz Cloud は、組織が Zilliz Cloud のインフラストラクチャではなく自身のクラウドアカウントでアプリケーションとデータをホストできるようにする BYOC ソリューションも提供しています。BYOC ソリューションは、クロスアカウント権限を通じて Zilliz Cloud がインフラストラクチャリソースを代理で管理することを許可するかどうかに応じて、BYOC モードまたは BYOC-I モードで展開できます。詳細については、[BYOC 概要](/docs/byoc/byoc-intro) を参照してください。

Zilliz Cloud Terraform プロバイダーを使用して、BYOC または BYOC-I プロジェクトを作成し、VPC 内に関連するデータプレーンリソースを展開できます。詳細については、以下のチュートリアルを参照してください：

- [Zilliz Cloud コンソールで BYOC プロジェクトを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project-on-console)

- [Terraform を使用して BYOC プロジェクトを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project)

- [Terraform を使用して BYOC-I プロジェクトを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)

- [BYOC 環境で Milvus クラスターを管理](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/managing-milvus-in-byoc)
