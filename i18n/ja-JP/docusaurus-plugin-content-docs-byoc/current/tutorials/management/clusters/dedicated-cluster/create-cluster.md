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

<Admonition type="info" title="Notes">

このトピックでは、Dedicated クラスターを作成する方法について説明します。Free または Serverless クラスターを作成するには、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。

</Admonition>

## 事前準備\{#prerequisites}

以下を確認してください。

- BYOC プロジェクトがあること。詳細については、次のページを参照してください。

    - [AWS に BYOC をデプロイ](./deploy-byoc-aws)

    - [AWS に BYOC-I をデプロイ](./deploy-byoc-i-aws)

    - [GCP に BYOC をデプロイ](./deploy-byoc-gcp)

    - [Microsoft Azure に BYOC-I をデプロイ](./deploy-byoc-i-azure)

- クラスターを作成する組織またはプロジェクトの所有権を持っていること。ロールと権限の詳細については、[アクセス制御の概要](./access-control-overview) を参照してください。

## クラスターを作成する\{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 目的の組織とプロジェクトを選択します。

1. **Create クラスター** をクリックします。

    ![create-クラスター-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-cluster-byoc.png "create-クラスター-byoc")

1. **Create New クラスター** ページで、関連するパラメータを入力します。

    ![クラスター-クラスター-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/cluster-cluster-byoc.png "クラスター-クラスター-byoc")

    - **クラスター Name**: クラスターの一意の識別子を設定します。

    - （任意）**クラスター Description**: クラスターの説明を入力します。

    - **クラスター Settings**:

        - **クラスター Type**: クラスターのパフォーマンス要件に合ったクラスタータイプを選択します。詳細については、[適切なクラスタータイプを選択する](./cu-types-explained) を参照してください。

        - **Query CU**: クラスターの Query CU 数を選択します。

        - **Topology**: クラスターの構造を示す図です。これには、各ノードの役割とコンピュートリソースの割り当てが含まれます。

            - **Proxy**: ユーザー接続を管理し、ロードバランサーでサービスアドレスを効率化するステートレスノードです。

            - **Query Node**: ハイブリッドベクトル検索とスカラー検索、および増分データ更新を担当します。

            - **Coordinator**: オーケストレーションの中心であり、ワーカーノード全体にタスクを分散します。

            - **Data Node**: データの変更と、永続化のためのログからスナップショットへの変換を処理します。

    - （任意）**Backup Policy**: 作成するクラスターの自動バックアップポリシーを決定します。バックアップポリシーの詳細については、[自動バックアップのスケジュール](./schedule-automatic-backups) を参照してください。

1. **Create クラスター** をクリックします。

    プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認が完了するとダイアログボックスは閉じます。そうでない場合は、次のいずれかを実行できます。

    - **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する、または

    - **Back to Last Step** をクリックして、クラスター設定を変更する。

    ![ZHZqbofKioaBqNxkeSYcXgtnnwc](https://zdoc-images.s3.us-west-2.amazonaws.com/zhzqbofkioabqnxkesycxgtnnwc.png "ZHZqbofKioaBqNxkeSYcXgtnnwc")

    <Admonition type="info" title="Notes">

    ローリングには追加のリソースが必要になります。これらのリソースは使用後に解放されます。

    </Admonition>

    その後、クラスターアクセス用のパブリックエンドポイントとトークンを表示するダイアログにリダイレクトされます。これらの情報は安全に保管してください。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。ここで、`{API_KEY}` は認証に使用する API キーです。詳細については、[Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2) を参照してください。

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

- `{API_KEY}`: API リクエストの認証に使用する資格情報です。値をご自身の値に置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成するプロジェクトの ID です。プロジェクト ID を一覧表示するには、[List Projects](/reference/restful/list-projects-v2) オペレーションを呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンの ID です。利用可能なクラウドリージョン ID を取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2) オペレーションを呼び出します。

- `cuType`: クラスターのタイプです。有効な値: Performance-optimized、Capacity-optimized。

- `cuSize`: クラスターで使用する Query CU 数です。値の範囲: 1 ～ 2,048。

- `description`（任意）: クラスターの説明です。

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

いいえ。Zilliz Cloud は、サポート対象の最新 Milvus バージョンでクラスターを自動的にプロビジョニングし、管理されたローリングアップグレードを通じて最新の状態に保ちます。特定のバージョンが必要な場合は、[サポートに連絡](https://support.zilliz.com/hc/en-us/requests/new) して、ユースケースを説明してください。
