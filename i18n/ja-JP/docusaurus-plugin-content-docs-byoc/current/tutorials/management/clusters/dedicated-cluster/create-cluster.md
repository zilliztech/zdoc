---
title: "クラスターの作成 | BYOC"
slug: /create-cluster
sidebar_label: "クラスターの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Dedicated クラスターは、一貫性があり予測可能なパフォーマンスを必要とする本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、継続的な高スループットと低レイテンシが重要なアプリケーションに最適です。 | BYOC"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターの作成

Dedicated クラスターは、一貫性があり予測可能なパフォーマンスを必要とする本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、継続的な高スループットと低レイテンシが重要なアプリケーションに最適です。

<Admonition type="info" icon="📘" title="注意">

このトピックでは、Dedicated クラスターを作成する方法について説明します。Free または Serverless クラスターを作成するには、[Free & Serverless Clusters](./free-and-serverless-clusters) を参照してください。

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- BYOC プロジェクトがあること。詳細については、次のページを参照してください。

    - [AWS に BYOC をデプロイ](./deploy-byoc-aws)

    - [AWS に BYOC-I をデプロイ](./deploy-byoc-i-aws)

    - [GCP に BYOC をデプロイ](./deploy-byoc-gcp)

    - [Microsoft Azure に BYOC-I をデプロイ](./deploy-byoc-i-azure)

- クラスターを作成する organization または project の所有権を持っていること。ロールと権限の詳細については、[Access Control Explained](./access-control-overview) を参照してください。

## クラスターを作成する\{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします。

1. 目的の organization と project に入ります。

1. **Create Cluster** をクリックします。

    ![create-cluster-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-cluster-byoc.png "create-cluster-byoc")

1. **Create New Cluster** ページで、関連するパラメータを入力します。

    ![cluster-cluster-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/cluster-cluster-byoc.png "cluster-cluster-byoc")

    - **Cluster Name**: クラスターの一意の識別子を設定します。

    - （任意）**Cluster Description**: クラスターの説明を入力します。

    - **Cluster Settings**:

        - **Cluster Type**: クラスターのパフォーマンス要件に合ったクラスタータイプを選択します。詳細については、[Select the Right CU](./cu-types-explained) を参照してください。

        - **Query CU**: クラスターの query CU 数を選択します。

        - **Topology**: クラスターの構造を示す図です。これには、各ノードの役割とコンピュートリソースの割り当てが含まれます。

            - **Proxy**: ユーザー接続を管理し、ロードバランサーでサービスアドレスを最適化するステートレスノードです。

            - **Query Node**: ハイブリッド vector および scalar 検索と、増分データ更新を担当します。

            - **Coordinator**: オーケストレーションの中心であり、worker ノード全体にタスクを分散します。

            - **Data Node**: データの変更処理と、永続化のためのログからスナップショットへの変換を担当します。

    - （任意）**Backup Policy**: 作成するクラスターの自動バックアップポリシーを決定します。バックアップポリシーの詳細については、[Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

1. **Create Cluster** をクリックします。 

    project のリソースクォータを確認するよう求められます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。そうでない場合は、次のいずれかを実行できます。 

    - **Go To Project Resource Settings** をクリックして、project のリソース設定を編集する、または

    - **Back to Last Step** をクリックして、クラスター設定を変更する。

    ![ZHZqbofKioaBqNxkeSYcXgtnnwc](https://zdoc-images.s3.us-west-2.amazonaws.com/zhzqbofkioabqnxkesycxgtnnwc.png "ZHZqbofKioaBqNxkeSYcXgtnnwc")

    <Admonition type="info" icon="📘" title="注意">

    ローリングのために追加リソースが必要になる場合があります。これらのリソースは使用後に解放されます。

    </Admonition>

    その後、クラスターアクセス用のパブリックエンドポイントとトークンを表示するダイアログにリダイレクトされます。これらの情報は安全に保管してください。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。ここで、`{API_KEY}` は認証に使用する API key です。詳細については、[Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createDedicated" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "clusterName": "Cluster-05",
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "plan": "Standard",
    "cuType": "Performance-optimized",
    "cuSize": 1,
    "description": "A cluster for vector search workloads."
}'
```

上記のコマンドでは、次のとおりです。

- `{API_KEY}`: API リクエストの認証に使用する資格情報です。値を自分のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成する project の ID です。project ID を一覧表示するには、[List Projects](/reference/restful/list-projects-v2) オペレーションを呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンの ID です。利用可能なクラウドリージョン ID を取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2) オペレーションを呼び出します。

- `cuType`: クラスターのタイプです。有効な値: Performance-optimized、Capacity-optimized。

- `cuSize`: クラスターで使用される query CU の数です。値の範囲: 1 ～ 2,048。

- `description` （任意）: クラスターの説明です。

以下は出力例です。

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "****************",
        "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
    }
}
```

</TabItem>

</Tabs>

## FAQ\{#faq}

**クラスター作成時に Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は最新のサポート対象 Milvus バージョンでクラスターを自動的にプロビジョニングし、管理されたローリングアップグレードを通じて最新の状態に保ちます。特定のバージョンが必要な場合は、[サポートに連絡](https://support.zilliz.com/hc/en-us/requests/new) して、ユースケースを説明してください。
