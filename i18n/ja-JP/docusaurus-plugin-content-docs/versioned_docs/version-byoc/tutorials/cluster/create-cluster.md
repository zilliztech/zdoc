---
title: "クラスタ作成 | BYOC"
slug: /create-cluster
sidebar_label: "クラスタ作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、ユーザーのビジネスニーズに対応するために、さまざまなクラスタープランレベルを提供しています。適切なクラスタータイプの選択に関するガイダンスについては、クイックスタート](./quick-start)と[詳細なプラン比較を参照してください。 | BYOC"
type: origin
token: AmPbw2DdSig3YPkCKDucnG3Rn7g
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - create
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスタ作成

Zilliz Cloudは、ユーザーのビジネスニーズに対応するために、さまざまなクラスタープランレベルを提供しています。適切なクラスタータイプの選択に関するガイダンスについては、[クイックスタート](./quick-start)と[詳細なプラン比較](./select-zilliz-cloud-service-plans)を参照してください。

このトピックでは、クラスターを作成する方法について説明します。

## 前提条件{#prerequisites}{#prerequisites}

確認する:

- Zilliz Cloudへの登録手順については、[Zilliz Cloudに登録する](./register-with-zilliz-cloud)を参照してください。

\</exclude>

- BYOCプロジェクト。手順については、「[AWSでBYOCをデプロイする](./deploy-byoc-aws)」を参照してください。

- クラスターを設立する組織またはプロジェクトの所有権。役割と権限の詳細については、「[アクセス制御](./access-control)」を参照してください。

## 無料クラスタを設定する{#set-up-a-free-cluster}{#set-up-a-free-cluster}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"c URL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に移動してログインします。

1. 適切な組織とプロジェクトを選択します。

1. [**無料クラスタを作成**]をクリックします。

    ![create_cluster_01](/byoc/ja-JP/create_cluster_01.png)

1. [**新しいクラスタを作成**]セクションで、[**無料**プラン]を選択し、必要なパラメータを入力します。

    <Admonition type="info" icon="Notes" title="undefined">

    <p>各ユーザーには1つの無料クラスターが許可されています。追加のクラスターについては、サーバーレスまたは専用プランを選択してください。</p>

    </Admonition>

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>クラスタ名</strong></p></td>
         <td><p>クラスターの名前。</p></td>
       </tr>
       <tr>
         <td><p><strong>クラウドプロバイダーと地域</strong></p></td>
         <td><p>クラスターの場所とホストされているクラウドプロバイダー。現在、無料のクラスターはGoogle Cloud Platform（GCP）で利用可能です。詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
       </tr>
    </table>

    ![create_cluster_02](/byoc/ja-JP/create_cluster_02.png)

1. [**作成**]をクリックします。**クラスター詳細**ページにリダイレクトされ、クラスターのパブリックエンドポイントとAPIキーが表示されます。これらの詳細を記録して、今後のアクセスに備えます。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、IDが`cluster-free`のプロジェクトに空きクラスタを作成しま`proj-xxxxxxxxxxxxxxxxxxxxx`。

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

- `{API_KEY}`: APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `cluster terName`:作成するクラスタの名前。

- `projectId`:クラスタを作成するプロジェクトのID。プロジェクトIDを一覧表示するには、[List Projects](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`:クラスタを作成するクラウドリージョンのIDです。現在、空きクラスタはGCP上でのみ作成できます。利用可能なクラウドリージョンIDを取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

</TabItem>

</Tabs>

## サーバーレスクラスタを設定する{#set-up-a-serverless-cluster}{#set-up-a-serverless-cluster}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"c URL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に移動してログインします。

1. 適切な組織とプロジェクトを選択します。

1. [**+クラスタ**]をクリックします。

    ![create_serverless_dedicated_cluster_01](/byoc/ja-JP/create_serverless_dedicated_cluster_01.png)

1. [**新しいクラスタを作成**]セクションで、[**サーバーレス**]プランを選択し、必要なパラメータを入力します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
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

    ![create_serverless_cluster_form](/byoc/ja-JP/create_serverless_cluster_form.png)

1. [**作成**]をクリックします。**クラスター詳細**ページにリダイレクトされ、クラスターのパブリックエンドポイントとAPIキーが表示されます。これらの詳細を記録して、今後のアクセスに備えます。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、ID`cluster-everless`という名前のサーバーレスクラスターをプロジェクトに作成しま`proj-xxxxxxxxxxxxxxxxxxxxx`。

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

- `{API_KEY}`: APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `cluster terName`:作成するクラスタの名前。

- `projectId`:クラスタを作成するプロジェクトのID。プロジェクトIDを一覧表示するには、[List Projects](/reference/restful/list-projects-v2)操作を呼び出します。

- `regionId`:クラスタを作成するクラウドリージョンのIDです。現在、空きクラスタはGCP上でのみ作成できます。利用可能なクラウドリージョンIDを取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2)操作を呼び出してください。

</TabItem>

</Tabs>

\</exclude>

## 専用のクラスタを作成{#create-a-dedicated-cluster}{#create-a-dedicated-cluster}

\<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"c URL","value":"Bash"}]}>

\<TabItem value="Cloud Console">

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 希望の組織とプロジェクトを入力します。

。