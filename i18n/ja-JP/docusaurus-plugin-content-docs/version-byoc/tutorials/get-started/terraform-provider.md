---
title: "Terraform Provider | BYOC"
slug: /terraform-provider
sidebar_key: terraform-provider
sidebar_label: "Terraform Provider"
beta: FALSE
notebook: FALSE
description: "Zilliz は、セキュリティを考慮したベクトル検索アプリケーションのデプロイとスケーリングを合理化し、Zilliz が提供するクラウドインフラストラクチャとお客様ご自身のインフラストラクチャの両方を含む複雑なインフラの構築・維持の必要性を排除する、フルマネージド型の Milvus サービスを提供します。| BYOC"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 18
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - terraform provider
  - terraform

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Terraform Provider

Zilliz は、セキュリティを考慮したベクトル検索アプリケーションのデプロイとスケーリングを合理化し、Zilliz が提供するクラウドインフラストラクチャとお客様自身のインフラストラクチャの両方を含む複雑なインフラストラクチャの構築および維持の必要性を排除する、完全に管理された Milvus サービスを提供します。

[Zilliz Cloud Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) は、Zilliz Cloud リソースを動的に構築、変更、バージョン管理できるようにするオープンソースの Infrastructure as Code (IaC) ソリューションです。使用前に、適切な権限を持つ Zilliz Cloud API キーなどの適切な認証情報でプロバイダーを構成する必要があります。

## Authentication\{#authentication}

Terraform を使用してリソースをデプロイする前に、Terraform を Zilliz Cloud プラットフォームで認証する必要があります。この Terraform プロバイダーを使用したクラウドプレーン操作を実行する前に、適切な権限を持つ Zilliz Cloud API キーを使用して認証を完了する必要があります。Zilliz Cloud API キーを作成するには、次の手順に従います。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にサインインします。

1. 上部ナビゲーションバーの右側にある **APIキーs** をクリックします。

1. APIキーs ページの右上隅にある **+ APIキー** をクリックします。

1. 表示される **Create APIキー** ダイアログボックスで、API キー名を入力し、アクセス権限を構成して、**Create** をクリックして API キーを生成します。

</Procedures>

API キーの管理の詳細については、[APIキーs](/docs/byoc/manage-api-keys) を参照してください。

コレクションの操作、検索、クエリなどのデータプレーン操作を実行するには、ターゲットクラスターのユーザー名とパスワードをコロンで区切った `username:password` 形式のクラスターアクセストークンを使用する必要があります。

以下にリストされているリソースの中で、クラスター、ユーザー＆ロール、および BYOC プロジェクトリソースには Zilliz Cloud API を使用します。また、データベース、コレクション＆エイリアス、パーティション、およびインデックスリソースにはクラスターアクセストークンを使用します。

## Manageable リソース\{#manageable-resources}

現在、このプロバイダーを使用して以下のタイプのリソースを管理できます。

### Clusters\{#clusters}

[Zilliz Cloud クラスター](/docs/manage-cluster) は、Zilliz Cloud 上で動作する Milvus インスタンスです。Zilliz Cloud は、そのクラスターを **Free**、**Serverless**、**Dedicated (Standard)**、**Dedicated (Enterprise)**、および **Bring Your Own Cloud (BYOC)** など、さまざまなオファリングに分類しています。これらのオファリングの詳細については、[詳細なプラン比較](/docs/select-zilliz-cloud-service-plans) を参照してください。

Zilliz Cloud Terraform Provider を使用して、特定のオファリングのクラスターを作成および管理できます。詳細については、以下のチュートリアルを参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Terraform Provider を BYOC と共に使用する場合、サポートされるのは専用クラスターと BYOC クラスタータイプのみです。BYOC プロジェクトでは、Free および Serverless クラスターの作成は利用できません。</p>

</Admonition>

- [Free クラスターの作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Serverless クラスターの作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [専用クラスターの作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [クラスターのスケーリング](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [既存のクラスターを Terraform 管理にインポートする](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### データベース\{#database}

Zilliz Cloud では、[データベース](/docs/database) がデータを整理および管理するための論理ユニットとして機能します。これは専用クラスターでのみ利用可能です。クラスターが作成されると、デフォルトのデータベースが作成されます。Zilliz Cloud Terraform Provider を使用してデータベースを管理する方法の詳細については、以下のリソースとデータソースを参照してください。

- [データベース (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [データベースs (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### Collection & エイリアスes\{#collection-and-aliases}

[コレクション](/docs/manage-collections) は、固定された列と可変の行を持つ 2 次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。Zilliz Cloud Terraform Provider を使用してコレクションを管理する方法の詳細については、以下のリソースとデータソースを参照してください。

- [エイリアスes (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [Collection (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [エイリアスes (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [Collections (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### Partition\{#partition}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータのサブセットのみを含みます。このページでは、パーティションを管理する方法を理解するのに役立ちます。Zilliz Cloud Terraform Provider を使用してパーティションを管理する方法の詳細については、以下のリソースとデータソースを参照してください。

- [パーティション (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [パーティション (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### Index\{#index}

Zilliz Cloud は、効率的な類似度検索を可能にするために [AUTOINDEX](/docs/autoindex-explained) を採用しています。また、ベクトル埋め込み間の距離を測定するために、**コサイン類似度** (COSINE)、**ユークリッド距離** (L2)、**内積** (IP)、**JACCARD**、および **HAMMING** といったこれらの [メトリックタイプ](/docs/search-metrics-explained) も提供しています。AUTOINDEX はメタデータフィルタリングを加速するために スカラーフィールド にも適用されます。Zilliz Cloud Terraform Provider を使用してインデックスを管理する方法の詳細については、以下のリソースとデータソースを参照してください。

- [Index (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [Indexes (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### Users & ロールs\{#users-and-roles}

Zilliz Cloud では、クラスターユーザーを作成し、クラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。ユーザーは適切に構成された認証情報を持つデータベースユーザーを表し、一連のロールが割り当てられます。一方、ロールは一連の権限をカプセル化するエンティティであり、ユーザーに割り当てることができます。このセクションのリソースとデータソースを使用して、ロールベースアクセス制御 (RBAC) を実装できます。詳細については、以下のリソースとデータソースを参照してください。

- [User (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [Users (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [ロール (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [ロールs (データ Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

### BYOC projects\{#byoc-projects}

Zilliz Cloud は、Zilliz Cloud のインフラストラクチャに依存するのではなく、組織が自社のクラウドアカウントでアプリケーションとデータをホストできるようにする BYOC ソリューションも提供しています。BYOC ソリューションは、クロスアカウント権限を通じて Zilliz Cloud が代わりにインフラストラクチャリソースを管理することを許可するかどうかによって、BYOC または BYOC-I モードのいずれかでデプロイできます。詳細については、[BYOC 概要](/docs/byoc/byoc-intro) を参照してください。

Zilliz Cloud Terraform Provider を使用して、BYOC または BYOC-I プロジェクトを作成し、VPC 内で関連するデータプレーンリソースをデプロイできます。詳細については、以下のチュートリアルを参照してください。

- [Zilliz Cloud コンソールで BYOC プロジェクトを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project-on-console)

- [Terraform を使用して BYOC プロジェクトを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project)

- [Terraform を使用して BYOC-I プロジェクトを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)

- [BYOC 環境で Milvus クラスターを管理する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/managing-milvus-in-byoc)

