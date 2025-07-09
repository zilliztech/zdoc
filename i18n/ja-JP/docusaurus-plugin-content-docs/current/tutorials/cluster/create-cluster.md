---
title: "クラスタ作成 | Cloud"
slug: /create-cluster
sidebar_label: "クラスタ作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、ユーザーの異なるビジネスニーズに対応するために、さまざまなクラスタープラン層を提供しています。適切なクラスタータイプの選択に関するガイダンスについては、無料トライアル](./free-trials)および[クラスタを理解する ](./select-zilliz-cloud-service-plans) [プランを参照してください。 | Cloud"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - create
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# クラスタ作成

Zilliz Cloudは、ユーザーの異なるビジネスニーズに対応するために、さまざまなクラスタープラン層を提供しています。適切なクラスタータイプの選択に関するガイダンスについては、[無料トライアル](./free-trials)および[クラスタを理解する ](./select-zilliz-cloud-service-plans) [プラン](./select-zilliz-cloud-service-plans)を参照してください。

このトピックでは、クラスターを作成する方法について説明します。

## 前提条件{#prerequisites}

確認する:

- Zilliz Cloudへの登録手順については、[Zilliz Cloudに登録してください。](./register-with-zilliz-cloud)を参照してください。

</exclude>

- BYOCプロジェクトです。手順については、[AWSでBYOCをデプロイする](./deploy-byoc-aws)を参照してください。

</include>

- クラスターを設立する組織またはプロジェクトの所有権。ロールと権限の詳細については、[アクセス制御](./access-control)を参照してください。

## 無料クラスタを設定する{#set-up-a-free-cluster}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に移動してログインしてください。

1. 適切な組織とプロジェクトを選択します。

1. **Create Free Cluster**をクリックします。

    ![create_cluster_01](/img/create_cluster_01.png)

1. 「新しいクラスターを作成」セクションで、「無料」プランを選択し、必要なパラメータを入力してください。 

    <Admonition type="info" icon="📘" title="ノート">

    <p>各ユーザーには1つの無料クラスターが許可されています。追加のクラスターについては、サーバーレスまたは専用プランを選択してください。</p>

    </Admonition>

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>クラスタ名</strong></p></td>
         <td><p>クラスターの名前。</p></td>
       </tr>
       <tr>
         <td><p><strong>クラウドプロバイダーと地域</strong></p></td>
         <td><p>クラスタの場所とそれがホストされているクラウドプロバイダ。現在、Google Cloud Platform（GCP）で無料クラスタを利用できます。詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
       </tr>
    </table>

    ![create_cluster_02](/img/create_cluster_02.png)

1. **作成**をクリックします。**クラスターの詳細**ページにリダイレクトされ、クラスターのパブリックエンドポイントとAPIキーが表示されます。これらの詳細は、将来のアクセスのために記録してください。

</TabItem>

<tabitem value="Bash"></tabitem>

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、ID `proj-xxxxxxxxxxxxxxxxxxxxx`のプロジェクトに`cluster-free`という名前の空きクラスターを作成します。

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
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

上記のコマンドで、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `clusterName`:作成するクラスターの名前。

- `projectId`:クラスタを作成するプロジェクトのID。プロジェクトIDをリストするには、[リストプロジェクト](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`:クラスタを作成したいクラウドリージョンのIDです。現在、空きクラスタはGCP上でのみ作成できます。利用可能なクラウドリージョンIDを取得するには、[クラウドリージョンのリスト](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

</TabItem>

</Tabs>

## サーバーレスクラスタを設定する{#set-up-a-serverless-cluster}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に移動してログインしてください。

1. 適切な組織とプロジェクトを選択します。

1. **+クラスタ**をクリックします。

    ![create_serverless_dedicated_cluster_01](/img/create_serverless_dedicated_cluster_01.png)

1. 「新しいクラスターの作成」セクションで、「サーバーレス」プランを選択し、必要なパラメータを入力してください。 

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>クラスタ名</strong></p></td>
         <td><p>クラスターの名前。</p></td>
       </tr>
       <tr>
         <td><p><strong>クラウドプロバイダーと地域</strong></p></td>
         <td><p>クラスタの場所とそれがホストされているクラウドプロバイダ。現在、サーバーレスクラスタはGoogle Cloud Platform（GCP）で利用可能です。詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
       </tr>
    </table>

    ![create_serverless_cluster_form](/img/create_serverless_cluster_form.png)

1. **作成**をクリックします。**クラスターの詳細**ページにリダイレクトされ、クラスターのパブリックエンドポイントとAPIキーが表示されます。これらの詳細は、将来のアクセスのために記録してください。

</TabItem>

<tabitem value="Bash"></tabitem>

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、ID `proj-xxxxxxxxxxxxxxxxxxxxx`のプロジェクトに`cluster-severless`という名前のサーバーレスクラスターを作成します。

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
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

上記のコマンドで、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `clusterName`:作成するクラスターの名前。

- `projectId`:クラスタを作成するプロジェクトのID。プロジェクトIDをリストするには、[リストプロジェクト](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`:クラスタを作成したいクラウドリージョンのIDです。現在、空きクラスタはGCP上でのみ作成できます。利用可能なクラウドリージョンIDを取得するには、[クラウドリージョンのリスト](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

</TabItem>

</Tabs>

</exclude>

## 作成する献身的なクラスタ{#create-alessinclude-targetsaasgreater-dedicatedlessincludegreater-cluster}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. 希望の組織とプロジェクトを入力します。

1. **+クラスタ**をクリックします。

    ![create_serverless_dedicated_cluster_01](/img/create_serverless_dedicated_cluster_01.png)

</include>

1. **クラスタ作成**をクリックします。

    ![create-cluster-byoc](/img/create-cluster-byoc.png)

</include>

1. [新しいクラスタの作成]ページで、スタンダードプランまたはエンタープライズプランを選択してください。関連するパラメータを入力します。

    ![create-dedicated_cluster](/img/create-dedicated_cluster.png)

    </exclude>

    ![cluster-cluster-byoc](/img/cluster-cluster-byoc.png)

    </include>

    - **クラスター名**:クラスターに一意の識別子を割り当てます。

    - **クラウドプロバイダーの設定**:クラウドサービスプロバイダーとクラスターが展開される特定のリージョンを選択してください。詳細については、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。

    - **CUの設定**:

        - **CUタイプ**:クラスタのパフォーマンス要件に合わせたCUタイプを選択してください。詳細については、[適切なCUを選択してください](./cu-types-explained)を参照してください。

        - **CUサイズ**:クラスタの合計体格をCU単位で選択してください。

        - トポロジー:クラスターの構造を示すグラフィカルな表現。これには、さまざまなノードの役割と計算リソースの指定が含まれます

            - プロキシ:ユーザー接続を管理し、ロードバランサーでサービスアドレスを効率化するステートレスノード。

            - クエリノード:ハイブリッドベクトルおよびスカラー検索、およびインクリメンタルデータ更新を担当します。

            - **コーディネーター**:オーケストレーションセンターで、タスクをワーカーノードに分散させます。

            - データノード:永続性のためにデータの変異とログからスナップショットへの変換を処理します。

            <Admonition type="info" icon="📘" title="ノート">

            <p>1-8 CUを持つクラスターは通常、小規模なデータセットに適したシングルノードセットアップを使用します。8 CU以上のクラスターは、パフォーマンスとスケーラビリティを向上させるために分散型マルチサーバーノードアーキテクチャを採用しています。</p>

            </Admonition>

        </include>

    - クラウドバックアップ:クラスタ内に保存されたデータを保護するために自動クラウドバックアップを有効にするかどうかを決定し、障害が発生した場合にデータの永続性と回復機能を確保します。

1. [Create Cluster(クラスタの作成)]をクリックします。クラスタアクセス用のパブリックエンドポイントとトークンが表示されるダイアログにリダイレクトされます。これらの詳細は安全に保管してください。

</TabItem>

<tabitem value="Bash"></tabitem>

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`リクエストはリクエストボディを受け取り、献身的な1つのPerformance-optimized[CU](./cu-types-explained)を持つ`cluster-02`という名前のクラスター。

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

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `clusterName`:作成するクラスターの名前。

- `projectId`:クラスタを作成するプロジェクトのID。プロジェクトIDをリストするには、[リストプロジェクト](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`:クラスタを作成するクラウドリージョンのID。利用可能なクラウドリージョンIDを取得するには、[クラウドリージョンのリスト](/reference/restful/list-cloud-regions-v2)操作を呼び出します。

- `plan`:あなたが購読しているZilliz Cloudサービスのプランレベル。有効な値:**Standard**と**Enterprise**。

- `cuType`:クラスタに使用されるCUのタイプ。有効な値:**Performance-optimizedと**Capacity-optimized**。

- `cuSize`:クラスタに使用されるCUの体格です。値の範囲は1から256までです。`Create Cluster`を呼び出すことで、最大32個のCUを持つクラスタを作成できます。32個以上のCUを持つクラスタを作成するには、[お問い合わせ](https://zilliz.com/contact-sales)を使用してください。

</TabItem>

</Tabs>

## 検証する{#verification}

クラスタを作成したら、クラスタリストページでその状態を確認できます。**実行中**の状態のクラスタは、作成が成功したことを示します。