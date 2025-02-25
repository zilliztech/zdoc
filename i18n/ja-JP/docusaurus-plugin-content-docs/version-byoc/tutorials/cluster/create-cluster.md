---
title: "クラスタ作成 | BYOC"
slug: /create-cluster
sidebar_label: "クラスタ作成"
beta: FALSE
notebook: FALSE
description: "このトピックでは、クラスターを作成する方法について説明します。 | BYOC"
type: origin
token: AmPbw2DdSig3YPkCKDucnG3Rn7g
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - create
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスタ作成

このトピックでは、クラスターを作成する方法について説明します。

## 前提条件{#prerequisites}

確認する:

- BYOCプロジェクト。手順については、「[AWSでBYOCをデプロイする](./deploy-byoc-aws)」を参照してください。

- クラスターを設立する組織またはプロジェクトの所有権。役割と権限の詳細については、「[アクセス制御](./access-control)」を参照してください。

## クラスタを作成{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 希望の組織とプロジェクトを入力します。

1. [**クラスタを作成**]をクリックします。

    ![create-cluster-byoc](/byoc/ja-JP/create-cluster-byoc.png)

1. [**新しいクラスターを作成**]ページで、**Standard**または**Enterprise**プランを選択し、関連するパラメータを入力します。

    ![cluster-cluster-byoc](/byoc/ja-JP/cluster-cluster-byoc.png)

    - **クラスター名**:クラスターに一意の識別子を割り当てます。

    - **クラウドプロバイダー設定**:クラウドサービスプロバイダーと、クラスターをデプロイする特定のリージョンを選択します。BYOCライセンスでは、現在AWS **us-west-2**リージョンのみがサポートされています。さらにクラウドリージョンをリクエストする場合は、[お問い合わせ](https://zilliz.com/cloud-region-request?firstname=Li&lastname=Yun&company=zilliz&name=zilliz&email=leryn.li@zilliz.com&fullname=Li%20Yun&phone=--&country=China&requested_csp_provider=AWS)ください。

    - **CUの設定**:

        - **CUタイプ**:クラスタのパフォーマンス要件に合わせたCUタイプを選択します。詳細については、「[適切なCUを選択](./cu-types-explained)」を参照してください。

        - **CU Size**:クラスタの合計体格をCU単位で選択します。

        - **トポロジ**:クラスターの構造を示すグラフィカルな表現です。これには、さまざまなノードの役割とコンピューティングリソースの指定が含まれます。

            - **プロキシ**:ユーザー接続を管理し、ロードバランサーでサービスアドレスを効率化するステートレスノード。

            - **クエリノード**:ハイブリッドベクトルおよびスカラー検索、および増分データ更新を担当します。

            - **コーディネーター**:オーケストレーションセンターで、ワーカーノード間でタスクを分散します。

            - **データノード**:永続性のためにデータの変異とログからスナップショットへの変換を処理します。

            <Admonition type="info" icon="📘" title="ノート">

            <p>通常、<strong>1-8 CU</strong>を持つクラスターは、小規模なデータセットに適したシングルノードセットアップを使用します。<strong>8 CU</strong>以上のクラスターは、パフォーマンスとスケーラビリティを向上させるために分散型マルチサーバーノードアーキテクチャを採用しています。</p>

            </Admonition>

    - **クラウドバックアップ**:クラスタ内に保存されているデータを保護し、障害が発生した場合にデータの永続性と回復機能を確保するために、自動クラウドバックアップを有効にするかどうかを決定します。

1. [**クラスタを作成**]をクリックします。クラスタアクセスのパブリックエンドポイントとトークンを表示するダイアログにリダイレクトされます。これらの詳細は安全に保管してください。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、1つのPerformance-optimizedCUを持つクラスタ`cluster-02`を作成します。

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

上記のコマンドで、

- `{API_KEY}`:APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `cluster terName`:作成するクラスタの名前。

- `projectId`:クラスタを作成するプロジェクトのID。プロジェクトIDを一覧表示するには、[List Projects](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`:クラスターを作成するクラウドリージョンのID。利用可能なクラウドリージョンIDを取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2)操作を呼び出します。

- `プラン`: Zilliz Cloudサービスのプランレベル。有効な値:**Standard**と**Enterprise**。

- `cuType`:クラスタに使用されるCUのタイプ。有効な値:**Performance-optimized**と**Capacity-Optimized**。

- `cuSize`:クラスタに使用するCUのサイズです。値の範囲は1から256までです。`Create Cluster`を呼び出すことで、最大32個のCUを持つクラスタを作成できます。32個以上のCUを持つクラスタを作成する場合は、[お問い合わせください](https://zilliz.com/contact-sales)。

</TabItem>

</Tabs>

## 検証する{#verification}

クラスターを作成したら、クラスターリストページでその状態を確認できます。**実行中**の状態のクラスターは、作成に成功したことを示します。