---
title: "クラスターの作成 | BYOC"
slug: /create-cluster
sidebar_key: create-cluster
sidebar_label: "クラスターの作成"
beta: FALSE
notebook: FALSE
description: "このトピックでは、クラスターを作成する方法について説明します。| BYOC"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 作成

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターの作成

このトピックでは、クラスターを作成する方法について説明します。

## 前提条件\{#prerequisites}

次のことを確認してください。

- BYOC プロジェクトがあること。手順については、[AWS への BYOC のデプロイ](./deploy-byoc-aws) を参照してください。

- クラスターを構築する組織またはプロジェクトの所有権があること。ロールと権限の詳細については、[アクセス制御](./access-control) を参照してください。

## クラスターの作成\{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 目的の組織とプロジェクトを入力します。

1. **Create Cluster** をクリックします。

    ![create-cluster-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-cluster-byoc.png "create-cluster-byoc")

1. **Create New Cluster** ページで、関連するパラメーターを入力します。

    ![cluster-cluster-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/cluster-cluster-byoc.png "cluster-cluster-byoc")

    - **クラスター名**: クラスターの一意の識別子を割り当てます。

    - **クラスター設定**:

        - **クラスタータイプ**: クラスターのパフォーマンス要件に合致するクラスタータイプを選択します。詳細については、[適切な CU の選択](./cu-types-explained) を参照してください。

        - **Query CU**: クラスターのクエリ CU 数を選択します。

        - **トポロジー**: クラスターの構造を示すグラフィカル表現です。これには、さまざまなノードに対するロールと計算リソースの指定が含まれます。

            - **プロキシ**: ユーザー接続を管理し、ロードバランサーを介してサービスアドレスを効率化するステートレスノードです。

            - **Query Node**: ハイブリッドベクトル検索およびスカラー検索、ならびに増分データ更新を担当します。

            - **コーディネーター**: オーケストレーションセンターであり、タスクをワーカーノード全体に分散します。

            - **データ Node**: 永続化のためのデータ変更とログからスナップショットへの変換を処理します。

    - (オプション) **Backup Policy**: 作成するクラスターのバックアップ頻度を決定します。Zilliz Cloud は、クラスター作成直後にバックアップを作成します。その後のバックアップは、指定されたスケジュールに従って実行されます。

1. **Create Cluster** をクリックします。

    プロジェクトのリソース割当量を確認するよう促されます。リソースが十分であれば、チェック完了後にダイアログボックスが消えます。そうでない場合は、次のいずれかを行います。

    - **Go To Project リソース設定** をクリックして、プロジェクトのリソース設定を編集する、または

    - **前のステップに戻る** をクリックして、クラスター設定を変更する。

    ![ZHZqbofKioaBqNxkeSYcXgtnnwc](https://zdoc-images.s3.us-west-2.amazonaws.com/zhzqbofkioabqnxkesycxgtnnwc.png "ZHZqbofKioaBqNxkeSYcXgtnnwc")

    <Admonition type="info" icon="📘" title="Notes">

    <p>ローリングには追加のリソースが必要になります。これらのリソースは使用後に解放されます。</p>

    </Admonition>

    その後、クラスターアクセス用のパブリックエンドポイントとトークンを表示するダイアログにリダイレクトされます。これらの詳細を安全に保管してください。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。ここで、`{API_KEY}` は認証に使用される API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、1 つのクエリ [CU](./cu-types-explained) を持つ `cluster-02` という名前の パフォーマンス最適化済み クラスターを作成します。

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
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

上記のコマンドにおいて、

- `{API_KEY}`: API リクエストの認証に使用される資格情報。この値を独自の値に置き換えてください。

- `clusterName`: 作成するクラスターの名前。

- `projectId`: クラスターを作成するプロジェクトの ID。プロジェクト ID を一覧表示するには、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) オペレーションを呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンの ID。利用可能なクラウドリージョン ID を取得するには、[クラウドリージョンの一覧表示](/reference/restful/list-cloud-regions-v2) オペレーションを呼び出します。

- `cuType`: クラスターのタイプ。有効な値: パフォーマンス最適化済み, 容量最適化済み。

- `cuSize`: クラスターに使用されるクエリ CU の数。値の範囲: 1 から 256。

詳細については、[専用クラスターの作成](/reference/restful/create-dedicated-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## FAQ\{#faq}

**クラスター作成時に Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は、サポートされている最新の Milvus バージョンでクラスターを自動的にプロビジョニングし、管理されたローリングアップグレードを通じて最新の状態に保ちます。特定のバージョンが必要な場合は、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us/requests/new) いただき、ユースケースをご説明ください。