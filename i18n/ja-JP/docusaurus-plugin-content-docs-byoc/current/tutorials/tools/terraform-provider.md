---
title: "Terraform Provider | BYOC"
slug: /terraform-provider
sidebar_label: "Terraform Provider"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz はフルマネージドの Milvus サービスを提供しており、セキュリティを考慮しながら vector search アプリケーションのデプロイとスケーリングを簡素化し、Zilliz が提供するクラウドインフラストラクチャとお客様自身のインフラストラクチャの両方を含む複雑なインフラストラクチャの構築と保守を不要にします。 | BYOC"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Terraform Provider

Zilliz はフルマネージドの Milvus サービスを提供しており、セキュリティを考慮しながら vector search アプリケーションのデプロイとスケーリングを簡素化し、Zilliz が提供するクラウドインフラストラクチャとお客様自身のインフラストラクチャの両方を含む複雑なインフラストラクチャの構築と保守を不要にします。

[Zilliz Cloud Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) はオープンソースの Infrastructure as Code (IaC) ソリューションであり、Zilliz Cloud リソースを動的に構築、変更、バージョン管理できるようにします。これを使用する前に、適切な権限を持つ Zilliz Cloud API key などの適切な認証情報で provider を設定する必要があります。 

## Authentication\{#authentication}

Terraform を使用してリソースのデプロイを開始する前に、Terraform を Zilliz Cloud プラットフォームで認証する必要があります。この Terraform provider を使用して cloud-plane 操作を行う前に、適切な権限を持つ Zilliz Cloud API key を使用して認証を完了する必要があります。Zilliz Cloud API key を作成するには、以下の手順に従ってください。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にサインインします。

1. 上部ナビゲーションバーの右側にある **API Keys** をクリックします。

1. API Keys ページの右上にある **+ API Key** をクリックします。

1. 表示される **Create API Key** ダイアログボックスで、API key 名を入力してアクセス権限を設定し、**Create** をクリックして API key を生成します。

</Procedures>

API key の管理に関する詳細は、[API Keys](/docs/byoc/manage-api-keys) を参照してください。

collection の操作、search、query などの data-plane 操作を実行するには、対象 cluster のコロン区切りの username と password（形式: `username:password`）を cluster access token として使用する必要があります。

以下に示すリソースのうち、clusters、users & roles、BYOC projects リソースには Zilliz Cloud APIs を使用します。また、database、collection & aliases、partition、index リソースには cluster access token を使用します。

## Manageable Resources\{#manageable-resources}

現在、この provider を使用して以下の種類のリソースを管理できます。

### Clusters\{#clusters}

[Zilliz Cloud cluster](/docs/manage-cluster) は、Zilliz Cloud 上で動作する Milvus インスタンスです。Zilliz Cloud では、clusters を **Free**、**Serverless**、**Dedicated (Standard)**、**Dedicated (Enterprise)**、**Bring Your Own Cloud (BYOC)** などのさまざまな提供形態に分類しています。これらの提供形態の詳細については、[Detailed Plan Comparison](/docs/select-zilliz-cloud-service-plans) を参照してください。

Zilliz Cloud Terraform Provider を使用して、特定の提供形態の clusters を作成および管理できます。詳細については、以下のチュートリアルを参照してください。

<Admonition type="info" icon="📘" title="注意">

BYOC で Terraform Provider を使用する場合、サポートされる cluster タイプは dedicated と BYOC のみです。BYOC projects では Free および Serverless cluster の作成は利用できません。

</Admonition>

- [Free Cluster を作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Serverless Cluster を作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [Dedicated Cluster を作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [Cluster をスケーリングする](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [既存の Clusters を Terraform 管理にインポートする](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### Database\{#database}

Zilliz Cloud では、[database](/docs/database) はデータを整理および管理するための論理単位として機能します。これは dedicated clusters でのみ利用可能です。cluster の作成時に、デフォルトの database が作成されます。Zilliz Cloud Terraform Provider を使用して database を管理する方法の詳細については、以下の resources および data sources を参照してください。

- [Database (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [Databases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### Collection & Aliases\{#collection-and-aliases}

[collection](/docs/manage-collections) は、固定された列と可変の行を持つ二次元テーブルです。各列は field を表し、各行は entity を表します。Zilliz Cloud Terraform Provider を使用して collections を管理する方法の詳細については、以下の resources および data sources を参照してください。

- [Aliases (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [Collection (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [Aliases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [Collections (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### Partition\{#partition}

partition は collection のサブセットです。各 partition は親 collection と同じデータ構造を共有しますが、collection 内のデータの一部のみを含みます。このページは、partitions の管理方法を理解するのに役立ちます。Zilliz Cloud Terraform Provider を使用して partitions を管理する方法の詳細については、以下の resources および data sources を参照してください。

- [Partitions (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [Partitions (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### Index\{#index}

Zilliz Cloud は、効率的な類似性 search を実現するために [AUTOINDEX](/docs/autoindex-explained) を採用しています。また、vector embeddings 間の距離を測定するために、これらの [metric types](/docs/search-metrics-explained) も提供しています: **Cosine Similarity** (COSINE)、**Euclidean Distance** (L2)、**Inner Product** (IP)、**JACCARD**、**HAMMING**。AUTOINDEX は metadata filtering を高速化するために scalar fields にも適用されます。Zilliz Cloud Terraform Provider を使用して indexes を管理する方法の詳細については、以下の resources および data sources を参照してください。

- [Index (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [Indexes (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### Users & Roles\{#users-and-roles}

Zilliz Cloud では、cluster users を作成し、それらに cluster roles を割り当てて権限を定義することで、データセキュリティを実現できます。user は、適切に設定された認証情報を持つ database user を表し、一連の roles が割り当てられます。一方、role は一連の privileges をカプセル化するエンティティであり、users に割り当てることができます。このセクションの resources と data sources を使用して、role-based access control (RBAC) を実装できます。詳細については、以下の resource および data sources を参照してください。

- [User (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [Users (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [Role (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [Roles (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

### BYOC projects\{#byoc-projects}

Zilliz Cloud は、組織が Zilliz Cloud のインフラストラクチャに依存するのではなく、自身のクラウドアカウントでアプリケーションとデータをホストできる BYOC ソリューションも提供しています。BYOC ソリューションは、クロスアカウント権限を通じて Zilliz Cloud がお客様に代わってインフラストラクチャリソースを管理することを許可するかどうかに応じて、BYOC または BYOC-I モードのいずれかでデプロイできます。詳細については、[BYOC Overview](/docs/byoc/byoc-intro) を参照してください。

Zilliz Cloud Terraform Provider を使用して、BYOC または BYOC-I project を作成し、VPC 内に関連する data plane リソースをデプロイできます。詳細については、以下のチュートリアルを参照してください。

- [Zilliz Cloud Console で BYOC Project を作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project-on-console)

- [Terraform を使用して BYOC Project を作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project)

- [Terraform を使用して BYOC-I Project を作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)

- [BYOC 環境で Milvus Cluster を管理する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/managing-milvus-in-byoc)

