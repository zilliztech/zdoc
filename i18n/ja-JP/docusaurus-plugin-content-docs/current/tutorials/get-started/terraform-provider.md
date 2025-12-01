---
title: "Terraform プロバイダー | Cloud"
slug: /terraform-provider
sidebar_label: "Terraform プロバイダー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zillizは完全管理型のMilvusサービスを提供し、セキュリティを考慮したベクトル検索アプリケーションのデプロイとスケーリングを簡略化し、Zillizが提供するクラウドインフラストラクチャと独自のインフラストラクチャの両方を構築および維持する必要性をなくします。 | Cloud"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 14
keywords:
  - zilliz
  - vector database
  - cloud
  - terraform provider
  - terraform
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database

---

import Admonition from '@theme/Admonition';


# Terraform プロバイダー

Zillizは完全管理型のMilvusサービスを提供し、セキュリティを考慮したベクトル検索アプリケーションのデプロイとスケーリングを簡略化し、Zillizが提供するクラウドインフラストラクチャと独自のインフラストラクチャの両方を構築および維持する必要性をなくします。

[Zilliz Cloud Terraform プロバイダー](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest)は、コードによるインフラストラクチャ（IaC）のオープンソースソリューションであり、Zilliz Cloudリソースを動的に構築、変更、およびバージョン管理できるようにします。これを使用する前に、Zilliz Cloud APIキーなどの適切な権限を持つ適切な認証情報を使用してプロバイダーを設定する必要があります。

## 認証\{#authentication}

Terraformを使用してリソースのデプロイを開始する前に、TerraformをZilliz Cloudプラットフォームで認証する必要があります。このTerraformプロバイダーを使用した操作を行う前に、適切な権限を持つZilliz Cloud APIキーを使用して認証を完了する必要があります。Zilliz Cloud APIキーを作成するには、以下の手順を実行してください：

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にサインインします。

1. トップナビゲーションバーの右側にある**APIキー**をクリックします。

1. APIキーのページの右上にある**+ APIキー**をクリックします。

1. 表示される**APIキーの作成**ダイアログボックスで、APIキー名を入力し、アクセス権限を設定して、**作成**をクリックしてAPIキーを生成します。

APIキーの管理に関する詳細については、[APIキー](/docs/byoc/manage-api-keys)を参照してください。

## 管理可能なリソース\{#manageable-resources}

現在、このプロバイダーを使用して、以下のリソースタイプを管理できます：

### クラスター\{#clusters}

[Zilliz Cloudクラスター](/docs/manage-cluster)は、Zilliz Cloud上で動作するMilvusインスタンスです。Zilliz Cloudはクラスターを**無料**、**サーバーレス**、**専用（標準）**、**専用（エンタープライズ）**、および**独自クラウド（BYOC）** などのさまざまなオファリングに分類します。これらのオファリングの詳細については、[詳細プラン比較](/docs/select-zilliz-cloud-service-plans)を参照してください。

Zilliz Cloud Terraformプロバイダーを使用して、任意の特定のオファリングのクラスターを作成および管理できます。詳細については、以下のチュートリアルを参照してください：

- [無料クラスターの作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [サーバーレスクラスターの作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [専用クラスターの作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [クラスターのスケーリング](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [既存クラスターをTerraform管理にインポート](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### データベース\{#database}

Zilliz Cloudでは、[データベース](/docs/database)はデータを整理および管理するための論理単位として機能します。専用クラスターでのみ利用可能です。クラスターの作成時に、デフォルトのデータベースが作成されます。Zilliz Cloud Terraformプロバイダーを使用したデータベース管理方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [データベース（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [データベース（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### コレクションとエイリアス\{#collection-and-aliases}

[コレクション](/docs/manage-collections)は、固定された列と可変の行を持つ二次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。Zilliz Cloud Terraformプロバイダーを使用したコレクション管理方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [エイリアス（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [コレクション（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [エイリアス（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [コレクション（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### パーティション\{#partition}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータのサブセットのみを含みます。このページでは、パーティションの管理方法を理解するのに役立ちます。Zilliz Cloud Terraformプロバイダーを使用したパーティション管理方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [パーティション（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [パーティション（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### インデックス\{#index}

Zilliz Cloudは、効率的な類似度検索を可能にするために[AUTOINDEX](/docs/autoindex-explained)を採用しています。また、ベクトル埋め込み間の距離を測定するためのこれらの[メトリックタイプ](/docs/search-metrics-explained)を提供しています：**コサイン類似度**（COSINE）、**ユークリッド距離**（L2）、**内積**（IP）、**JACCARD**、および**HAMMING**。AUTOINDEXはメタデータフィルタリングを高速化するためにスカラー（数値）フィールドにも適用されます。Zilliz Cloud Terraformプロバイダーを使用したインデックス管理方法の詳細については、以下のリソースおよびデータソースを参照してください：

- [インデックス（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [インデックス（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### ユーザーとロール\{#users-and-roles}

Zilliz Cloudでは、クラスターユーザーを作成し、クラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。ユーザーは適切に設定された認証情報を持つデータベースユーザーを表し、一連のロールが割り当てられます。一方、ロールは権限のセットをカプセル化するエンティティであり、ユーザーに割り当てることができます。このセクションのリソースおよびデータソースを使用して、ロールベースのアクセス制御（RBAC）を実装できます。詳細については、以下のリソースおよびデータソースを参照してください：

- [ユーザー（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [ユーザー（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [ロール（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [ロール（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)