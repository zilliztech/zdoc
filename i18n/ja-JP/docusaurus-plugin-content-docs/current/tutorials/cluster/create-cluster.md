---
title: "クラスターを作成 | Cloud"
slug: /create-cluster
sidebar_label: "クラスターを作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、さまざまなビジネスニーズに対応するための複数のクラスターデプロイメントオプションを提供します。 | Cloud"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - 作成
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# クラスターを作成

Zilliz Cloudは、さまざまなビジネスニーズに対応するための複数のクラスターデプロイイメントオプションを提供します。

- **無料**: ストレージ、vCU消費量、コレクション数に制限がある学習や個人プロジェクトの開始点を提供します。

- **サーバーレス**: ワークロードに合わせて自動的にスケーリルする共有環境を提供します - リソースをプロビジョニングする必要はありません。このオプションは、予測不可能またはスパイキーなトラフィックに優れたコスト効率と弾力性を提供します。

- **専用**: 一貫した予測可能なパフォーマンスを必要とするプロダクションワークロードのための分離された予約環境を提供します。このオプションは、持続的な高スループットおよびレイテンシに敏感なアプリケーションに最適です。

各デプロイメントオプションの詳細な説明については、[Zilliz Cloudの価格](https://zilliz.com/pricing)を参照してください。

このトピックでは、クラスターを作成する方法について説明します。

## 前提条件\{#prerequisites}

以下を確認してください：

- Zilliz Cloudへの登録。手順については、[Zilliz Cloudに登録](./register-with-zilliz-cloud)を参照してください。

- クラスターを設立する組織またはプロジェクトの所有権。ロールとパーミッションの詳細については、[アクセス制御](./access-control)を参照してください。

## 無料クラスターを作成\{#create-a-free-cluster}

<Admonition type="info" icon="📘" title="注意">

<p>各組織は無料クラスターを1つしか持つことができません。追加のクラスターが必要な場合は、サーバーレスまたは専用クラスターを選択してください。</p>

</Admonition>

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**無料**クラスターを作成する方法を示します。

<Supademo id="cmhixdror61dofati1xmaai6j?utm_source=link" title=""  />

クラスターが作成されている間、クラスターログイン情報（ユーザーとパスワード）を保存する必要があります。これは一度だけ表示されます。

クラスターのステータスが「実行中」に変わると、クラスターの作成が正常に完了します。その後、クラスターのエンドポイントとトークンをコピーし、[接続](./connect-to-cluster)のために使用できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

以下の`POST`リクエストはリクエストボディを受け取り、IDが`proj-xxxxxxxxxxxxxxxxxxxxx`のプロジェクトに`cluster-free`という名前の無料クラスターを作成します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createFree" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-free",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_xxxxxxxx",
#         "password": "*************",
#         "prompt": "正常に送信されました。クラスターは作成中です。DescribeCluster APIを使用して、クラスター作成の進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、指定した管理者アカウントと初期パスワードを使用してSDKでベクターデータベースにアクセスできます。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストを認証するために使用されるクレデンシャル。値を独自のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前。

- `projectId`: クラスターを作成するプロジェクトのID。プロジェクトIDを一覧表示するには、[プロジェクトを一覧表示](/reference/restful/list-projects-v2)操作を呼び出してください。

- `regionId`: クラスターを作成するクラウドリージョンのID。現在、無料クラスターはGCPでのみ作成できます。利用可能なクラウドリージョンIDを取得するには、[クラウドリージョンを一覧表示](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

詳細については、[無料クラスターを作成](/reference/restful/create-free-cluster-v2)を参照してください。

</TabItem>

</Tabs>

## サーバーレスクラスターを作成\{#create-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**サーバーレス**クラスターを作成する方法を示します。

<Supademo id="cmhixpd150ajjvc0i1t95ihdr?utm_source=link" title=""  />

クラスターが作成されている間、クラスターログイン情報（ユーザーとパスワード）を保存する必要があります。これは一度だけ表示されます。

クラスターのステータスが「実行中」に変わると、クラスターの作成が正常に完了します。その後、クラスターのエンドポイントとトークンをコピーし、[接続](./connect-to-cluster)のために使用できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

以下の`POST`リクエストはリクエストボディを受け取り、IDが`proj-xxxxxxxxxxxxxxxxxxxxx`のプロジェクトに`cluster-severless`という名前のサーバーレスクラスターを作成します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createServerless" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-serverless",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_xxxxxxxx",
#         "password": "***********",
#         "prompt": "正常に送信されました。クラスターは作成中です。DescribeCluster APIを使用して、クラスター作成の進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、指定した管理者アカウントと初期パスワードを使用してSDKでベクターデータベースにアクセスできます。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストを認証するために使用されるクレデンシャル。値を独自のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前。

- `projectId`: クラスターを作成するプロジェクトのID。プロジェクトIDを一覧表示するには、[プロジェクトを一覧表示](/reference/restful/list-projects-v2)操作を呼び出してください。

- `regionId`: クラスターを作成するクラウドリージョンのID。現在、無料クラスターはGCPでのみ作成できます。利用可能なクラウドリージョンIDを取得するには、[クラウドリージョンを一覧表示](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

詳細については、[サーバーレスクラスターを作成](/reference/restful/create-serverless-cluster-v2)を参照してください。

</TabItem>

</Tabs>

## 専用クラスターを作成\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**専用**クラスターを作成する方法を示します。

<Supademo id="cmhixsdvu030hxj0imafwl2av?utm_source=link" title=""  />

専用クラスターの以下の情報を構成する必要があります。

- **クラスター名**: クラスターのための一意の識別子を割り当てます。

- **クラスターセッティング**:

    - **クラスタータイプ**: クラスターのパフォーマンス要件に合わせたクラスタータイプを選択します。詳細については、[適切なクラスタータイプを選択](./cu-types-explained)を参照してください。階層ストレージクラスターを選択するには、クラスターに少なくとも8つのクエリCUが必要です。

    - **クエリCU**: クラスターのクエリCU数を選択します。

- （任意）**バックアップポリシー**: 作成するクラスターのバックアップ頻度を決定します。有効にすると、Zilliz Cloudはクラスター作成直後にバックアップを作成します。その後のバックアップは指定されたスケジュールに従います。

クラスターが作成されている間、クラスターログイン情報（ユーザーとパスワード）を保存する必要があります。これは一度だけ表示されます。

クラスターのステータスが「実行中」に変わると、クラスターの作成が正常に完了します。その後、クラスターのエンドポイントとトークンをコピーし、[接続](./connect-to-cluster)のために使用できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

以下の`POST`リクエストはリクエストボディを受け取り、[CU](./cu-types-explained)が1つのパフォーマンス最適化専用クラスターを`cluster-02`という名前で作成します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createDedicated" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "Cluster-02",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "plan": "Standard",
        "cuType": "Performance-optimized",
        "cuSize": 1
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_admin",
#         "password": "****************",
#         "prompt": "正常に送信されました。クラスターは作成中です。DescribeCluster APIを使用して、クラスター作成の進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、指定した管理者アカウントと初期パスワードを使用してSDKでベクターデータベースにアクセスできます。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストを認証するために使用されるクレデンシャル。値を独自のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前。

- `projectId`: クラスターを作成するプロジェクトのID。プロジェクトIDを一覧表示するには、[プロジェクトを一覧表示](/reference/restful/list-projects-v2)操作を呼び出してください。

- `regionId`: クラスターを作成するクラウドリージョンのID。利用可能なクラウドリージョンIDを取得するには、[クラウドリージョンを一覧表示](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

- `cuType`: クラスターのタイプ。有効な値：Performance-optimized、Capacity-optimized、Tiered-storage。

- `cuSize`: クラスターに使用されるクエリCUの数。値の範囲：1～256。

詳細については、[専用クラスターを作成](/reference/restful/create-dedicated-cluster-v2)を参照してください。

</TabItem>

</Tabs>