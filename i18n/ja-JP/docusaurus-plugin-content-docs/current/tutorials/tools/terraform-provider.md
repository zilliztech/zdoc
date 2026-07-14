---
title: "Terraform Provider | Cloud"
slug: /terraform-provider
sidebar_label: "Terraform Provider"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz はフルマネージドの Milvus サービスを提供しており、セキュリティを考慮しながらベクトル検索アプリケーションのデプロイとスケーリングを簡素化し、Zilliz が提供するクラウドインフラストラクチャとユーザー自身のインフラストラクチャの両方を含む複雑なインフラストラクチャの構築と保守を不要にします。 | Cloud"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Terraform Provider

Zilliz はフルマネージドの Milvus サービスを提供しており、セキュリティを考慮しながらベクトル検索アプリケーションのデプロイとスケーリングを簡素化し、Zilliz が提供するクラウドインフラストラクチャとユーザー自身のインフラストラクチャの両方を含む複雑なインフラストラクチャの構築と保守を不要にします。

[Zilliz Cloud Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) は、Zilliz Cloud リソースを動的に構築、変更、バージョン管理できるオープンソースの Infrastructure as Code（IaC）ソリューションです。使用する前に、適切な権限を持つ Zilliz Cloud API キーなどの適切な認証情報でプロバイダーを設定する必要があります。 

## Authentication\{#authentication}

Terraform を使用してリソースのデプロイを開始する前に、Terraform を Zilliz Cloud プラットフォームで認証する必要があります。この Terraform プロバイダーで操作を行う前に、適切な権限を持つ Zilliz Cloud API キーを使用して認証を完了する必要があります。Zilliz Cloud API キーを作成するには、以下の手順に従ってください。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にサインインします。

1. 上部ナビゲーションバーの右側にある **API Keys** をクリックします。

1. API Keys ページの右上隅にある **+ API Key** をクリックします。

1. 表示される **Create API Key** ダイアログボックスで、API キー名を入力し、アクセス権限を設定して、**Create** をクリックして API キーを生成します。

</Procedures>

API キーの管理に関する詳細は、[API Keys](/docs/byoc/manage-api-keys) を参照してください。

## Manageable Resources\{#manageable-resources}

現在、このプロバイダーを使用して以下の種類のリソースを管理できます。

### Clusters\{#clusters}

[Zilliz Cloud クラスター](/docs/manage-cluster) は、Zilliz Cloud 上で稼働する Milvus インスタンスです。Zilliz Cloud では、クラスターを **Free**、**Serverless**、**Dedicated (Standard)**、**Dedicated (Enterprise)**、**Bring Your Own Cloud (BYOC)** などのさまざまな提供形態に分類しています。これらの提供形態の詳細については、[Detailed Plan Comparison](/docs/select-zilliz-cloud-service-plans) を参照してください。

Zilliz Cloud Terraform Provider を使用して、特定の提供形態のクラスターを作成および管理できます。詳細については、以下のチュートリアルを参照してください。

<Admonition type="info" icon="📘" title="Notes">

Terraform Provider を BYOC で使用する場合、サポートされるのは Dedicated と BYOC のクラスタータイプのみです。BYOC プロジェクトでは Free および Serverless クラスターの作成はできません。

</Admonition>

- [Free クラスターを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Serverless クラスターを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [Dedicated クラスターを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [クラスターをスケールする](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [既存のクラスターを Terraform 管理にインポートする](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### Database\{#database}

Zilliz Cloud では、[データベース](/docs/database) はデータを整理および管理するための論理単位として機能します。これは専用クラスターでのみ使用できます。クラスターの作成時に、デフォルトのデータベースが作成されます。Zilliz Cloud Terraform Provider を使用してデータベースを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください。

- [Database (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [Databases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### Collection & Aliases\{#collection-and-aliases}

[コレクション](/docs/manage-collections) は、固定された列と可変の行を持つ二次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。Zilliz Cloud Terraform Provider を使用してコレクションを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください。

- [Aliases (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [Collection (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [Aliases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [Collections (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### Partition\{#partition}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。このページは、パーティションを管理する方法の理解に役立ちます。Zilliz Cloud Terraform Provider を使用してパーティションを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください。

- [Partitions (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [Partitions (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### Index\{#index}

Zilliz Cloud は、効率的な類似性検索を実現するために [AUTOINDEX](/docs/autoindex-explained) を採用しています。また、ベクトル埋め込み間の距離を測定するために、**Cosine Similarity**（COSINE）、**Euclidean Distance**（L2）、**Inner Product**（IP）、**JACCARD**、**HAMMING** といった [メトリックタイプ](/docs/search-metrics-explained) も提供しています。AUTOINDEX はスカラーフィールドにも適用され、メタデータフィルタリングを高速化します。Zilliz Cloud Terraform Provider を使用してインデックスを管理する方法の詳細については、以下のリソースおよびデータソースを参照してください。

- [Index (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [Indexes (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### Users & Roles\{#users-and-roles}

Zilliz Cloud では、クラスター ユーザーを作成し、それらにクラスター ロールを割り当てて権限を定義することで、データセキュリティを実現できます。ユーザーは適切に設定された認証情報を持つデータベース ユーザーを表し、一連のロールが割り当てられます。一方、ロールは一連の権限をカプセル化するエンティティであり、ユーザーに割り当てることができます。このセクションのリソースおよびデータソースを使用して、ロールベースのアクセス制御（RBAC）を実装できます。詳細については、以下のリソースおよびデータソースを参照してください。

- [User (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [Users (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [Role (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [Roles (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

