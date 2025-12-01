---
title: "クラスターの作成 | BYOC"
slug: /create-cluster
sidebar_label: "クラスターの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターの作成方法について説明します。 | BYOC"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 作成
  - Zilliz
  - milvusベクトルデータベース
  - milvus db
  - milvusベクトルdb

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターの作成

このトピックでは、クラスターの作成方法について説明します。

## 事前準備\{#prerequisites}

以下を確認してください：

- BYOCプロジェクト。手順については[Deploy BYOC on AWS](./deploy-byoc-aws)を参照してください。

- クラスターを設置する組織またはプロジェクトの所有権。ロールと権限の詳細については、[Access Control](./access-control)を参照してください。

## クラスターの作成\{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 必要な組織とプロジェクトに入ります。

1. **Create Cluster**をクリックします。

    ![create-cluster-byoc](/img/create-cluster-byoc.png)

1. **Create New Cluster**ページで、関連するパラメータを入力します。

    ![cluster-cluster-byoc](/img/cluster-cluster-byoc.png)

    - **Cluster Name**: クラスターの識別子を割り当てます。

    - **Cluster Settings**:

        - **Cluster Type**: クラスターのパフォーマンス要件に合わせてクラスタータイプを選択します。詳細は[Select the Right CU](./cu-types-explained)を参照してください。

        - **Query CU**: クラスターのクエリCU数を選択します。

        - **Topology**: クラスター構造を示すグラフィカルな表現です。これには、さまざまなノードのロールとコンピュートリソースの指定が含まれます：

            - **Proxy**: ユーザー接続を管理し、ロードバランサーとサービスアドレスを簡素化するステートレスノード。

            - **Query Node**: ハイブリッドベクトル検索およびスカラー検索と増分データ更新を担当します。

            - **Coordinator**: タスクをワーカーノード間で配布するオーケストレーションセンター。

            - **Data Node**: データ変更処理および永続化のためのログからスナップショットへの変換を処理します。

    - (オプション) **Backup Policy**: 作成するクラスターのバックアップ頻度を決定します。Zilliz Cloudはクラスター作成後にすぐにバックアップを作成します。その後のバックアップは指定されたスケジュールに従います。

1. **Create Cluster**をクリックします。

    プロジェクトのリソースクォータを確認するように求められます。リソースが十分であれば、チェックが完了するとダイアログボックスは消えます。そうでない場合は、以下が可能です

    - **Go To Project Resource Settings**をクリックしてプロジェクトのリソース設定を編集するか、または

    - **Back to Last Step**をクリックしてクラスタ設定を変更します。

    ![ZHZqbofKioaBqNxkeSYcXgtnnwc](/img/ZHZqbofKioaBqNxkeSYcXgtnnwc.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>ローリングには追加リソースが必要になる場合があります。これらのリソースは使用後に解放されます。</p>

    </Admonition>

    その後、クラスターへのアクセス用パブリックエンドポイントとトークンを表示するダイアログにリダイレクトされます。これらの詳細は安全に保管してください。

</TabItem>

<TabItem value="Bash">

以下の例のように、`{API_KEY}` は認証に使用されるAPIキーです。

以下の `POST` リクエストはリクエストボディを受け取り、`cluster-02` という名前の Performance-optimized クラスターを [CU](./cu-types-explained) 1つで作成します。

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
#         "prompt": "正常に送信されました。クラスターが作成中です。DescribeCluster APIを使用して、クラスターの作成進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、SDKを使用して初期パスワードと指定した管理者アカウントでベクトルデータベースにアクセスできます。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前。

- `projectId`: クラスターを作成するプロジェクトのID。プロジェクトIDのリストを取得するには、[List Projects](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンのID。利用可能なクラウドリージョンIDを取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2)操作を呼び出します。

- `cuType`: クラスターのタイプ。有効な値: Performance-optimized, Capacity-optimized。

- `cuSize`: クラスターに使用されるクエリCUの数。値の範囲: 1から256。

詳細については、[Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2)を参照してください。

</TabItem>

</Tabs>