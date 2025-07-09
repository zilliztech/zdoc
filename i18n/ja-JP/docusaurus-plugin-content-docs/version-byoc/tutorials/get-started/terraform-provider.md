---
title: "テラフォームプロバイダName | BYOC"
slug: /terraform-provider
sidebar_label: "テラフォームプロバイダName"
beta: FALSE
notebook: FALSE
description: "Zillizは完全に管理されたMilvusサービスを提供し、セキュリティを考慮してベクトル検索アプリケーションの展開とスケーリングを効率化し、Zillizが提供するクラウドインフラストラクチャと独自のインフラストラクチャの両方を含む複雑なインフラストラクチャを構築および維持する必要がなくなります。 | BYOC"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - terraform provider
  - terraform
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model

---

import Admonition from '@theme/Admonition';


# テラフォームプロバイダName

Zillizは完全に管理されたMilvusサービスを提供し、セキュリティを考慮してベクトル検索アプリケーションの展開とスケーリングを効率化し、Zillizが提供するクラウドインフラストラクチャと独自のインフラストラクチャの両方を含む複雑なインフラストラクチャを構築および維持する必要がなくなります。

[クラウドテラフォームプロバイダーのZilliz](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest)は、オープンソースのInfrastructure as Code(IaC)ソリューションであり、Zilliz Cloudリソースを動的にビルド、変更、バージョン管理できます。使用する前に、適切な権限を持つZilliz Cloud APIキーなどの適切な資格情報をプロバイダーに設定する必要があります。 

## 認証プロセス{#authentication}

Terraformを使用してリソースのデプロイを開始する前に、Zilliz CloudプラットフォームでTerraformを認証する必要があります。このTerraformプロバイダを使用する前に、適切な権限を持つZilliz Cloud APIキーを使用する必要があります。Zilliz Cloud APIキーを作成するには、次の手順に従ってください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にサインインしてください。

1. 上部ナビゲーションバーの右側にある**APIキー**をクリックしてください。

1. APIキーページの右上隅にある**+APIキー**をクリックしてください。

1. 表示される**APIキーの作成**ダイアログボックスで、APIキー名を入力してアクセス権限を設定し、**作成**をクリックしてAPIキーを生成します。

APIキーの管理の詳細については、[APIキー](/docs/byoc/manage-api-keys)を参照してください。

## 管理可能なリソース{#manageable-resources}

現在、このプロバイダーを使用して、次の種類のリソースを管理できます。

### クラスタ{#clusters}

[Zilliz Cloudクラスタ](/docs/manage-cluster)は、Zilliz Cloud上で動作するMilvusインスタンスです。Zilliz Cloudは、Free、Serverless、Dedicated(Standard)、Dedicated(Enterprise)、Bring Your Own Cloud(BYOC)など、さまざまなオファリングにクラスタを分類しています。これらのオファリングの詳細については、[詳細なプラン比較](/docs/select-zilliz-cloud-service-plans)を参照してください。

Zilliz Cloud Terraform Providerを使用すると、特定のオファリングのクラスタを作成および管理できます。詳細については、以下のチュートリアルを参照してください。

- [無料クラスタを作成](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [サーバーレスクラスタを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [専用クラスタを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [スケールクラスタ](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [既存のクラスタをTerraform Managementにインポートする](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### データベース{#database}

Zilliz Cloudでは、[データベース](/docs/database)がデータの整理と管理のための論理ユニットとして機能します。専用クラスターでのみ利用可能です。クラスターが作成されると、デフォルトのデータベースが作成されます。Zilliz Cloud Terraform Providerを使用してデータベースを管理する方法の詳細については、以下のリソースとデータソースを参照してください

- [データベース（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [データベース（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### コレクション{#collection}

[コレクション](/docs/manage-collections)は、固定列とバリアント行を持つ2次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。Zilliz Cloud Terraform Providerを使用してコレクションを管理する方法の詳細については、以下のリソースとデータソースを参照してください

- [コレクション(リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [コレクション（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### パーティション{#partition}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータのサブセットのみを含みます。このページでは、パーティションの管理方法を理解するのに役立ちます。Zilliz Cloud Terraform Providerを使用してパーティションを管理する方法の詳細については、以下のリソースとデータソースを参照してください

- [パーティション（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [パーティション（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### インデックス{#index}

Zilliz Cloudは、効率的な類似検索を可能にするために[AUTOINDEX](/docs/autoindex-explained)を使用しています。また、ベクトル埋め込み間の距離を測定するために、これらの[メートル法の種類](/docs/search-metrics-explained):コサイン類似度(COSINE)、ユークリッド距離(L 2)、内積(IP)、JACCARD、およびHAMMINGを提供しています。AUTOINDEXは、スカラーフィールドにも適用され、メタデータフィルタリングを加速します。Zilliz Cloud Terraform Providerを使用してインデックスを管理する方法の詳細については、以下のリソースとデータソースを参照してください

- [インデックス（リソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [インデックス（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### ユーザーと役割{#users-and-roles}

Zilliz Cloudでは、クラスターユーザーを作成し、クラスターロールを割り当てて特権を定義し、データセキュリティを実現できます。ユーザーは、適切に構成された資格情報を持つデータベースユーザーを表し、一連のロールが割り当てられます。一方、ロールは、一連の特権をカプセル化し、ユーザーに割り当てることができるエンティティです。このセクションのリソースとデータソースを使用して、ロールベースのアクセス制御(RBAC)を実装できます。詳細については、以下のリソースとデータソースを参照してください

- [ユーザー(リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [ユーザー（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [役割(リソース)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [役割（データソース）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

### BYOCプロジェクト{#byoc-projects}

Zilliz Cloudは、Zilliz Cloudのインフラストラクチャに頼らずに、組織が独自のクラウドアカウントでアプリケーションやデータをホストできるBYOCソリューションも提供しています。BYOCソリューションは、クロスアカウント権限を介してインフラストラクチャリソースを管理するためにZilliz Cloudに許可するかどうかに応じて、BYOCまたはBYOC-Iモードで展開できます。詳細については、[BYOCの概要](/docs/byoc/byoc-intro)を参照してください。

Zilliz Cloud Terraform Providerを使用すると、BYOCまたはBYOC-Iプロジェクトを作成し、VPC内に関連するデータプレーンリソースをデプロイできます。詳細については、以下のチュートリアルを参照してください。

- [Zilliz Cloud ConsoleでBYOCプロジェクトを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project-on-console)

- [Terraformを使用してBYOCプロジェクトを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project)

- [Terraformを使用してBYOC-Iプロジェクトを作成する](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)

</include>

