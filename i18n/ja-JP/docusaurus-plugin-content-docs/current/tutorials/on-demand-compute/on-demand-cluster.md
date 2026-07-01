---
title: "クラスター | Cloud"
slug: /on-demand-cluster
sidebar_key: on-demand-cluster
sidebar_label: "クラスター"
beta: PUBLIC
notebook: FALSE
description: "クラスターは、ベクトルデータベースのワークロードを実行するコンピューティングリソースのセットです。Zilliz Cloud には、常時稼働で低レイテンシーアクセスが必要な本番ワークロード向けに継続的に実行されるサーバークラスターと、リクエストが到着したときにのみ起動し、アイドル時にゼロにスケールするオンデマンドクラスターの2種類があります。 | Cloud"
type: origin
token: XFoiwC15Jiu5LAkUeuVcvbconDR
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - オンデマンドコンピューティング
  - クラスター

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クラスタ

クラスタは、ベクトルデータベースのワークロードを実行するコンピューティングリソースのセットです。Zilliz Cloud では2つのタイプを提供しています。**serving cluster** は、常時稼働かつ低レイテンシーアクセスが必要な本番ワークロード向けに継続的に実行され、**on-demand cluster** はリクエストが到着したときにのみ起動し、アイドル時にはゼロにスケールします。

このトピックでは、**on-demand** クラスタの作成方法について説明します。

<Admonition type="info" icon="📘" title="Note">

<p>この機能は <strong>Enterprise</strong> プロジェクトでのみ利用可能です。</p>
<p>現在、on-demand クラスタは AWS us-west-2 でのみ作成できます。その他のリージョンについては、<a href="http://zilliz.com/contact-sales">お問い合わせ</a>ください。</p>

</Admonition>

## 制限\{#limitations}

- on-demand クラスタを管理するには、**プロジェクト管理者**である必要があります。

- 各プロジェクトで作成できる on-demand クラスタは最大20個までです。

- on-demand クラスタは、8 CU あたり最大3 TB の生データをクエリできます。この制限を超えるクエリはエラーを返します。

## on-demand クラスタの作成\{#create-an-on-demand-cluster}

- **RESTful API経由**

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    curl --request POST \
         --url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "projectId": "proj-09ee1f4b1151d5dd1edbc5",
            "regionId": "aws-us-west-2",
            "clusterName": "my-on-demand",
            "cuSize": 8,
            "autoSuspend": 120,
            "description": "A cluster for vector search workloads."
          }'
         
    # {
    #   "code": 0,
    #   "data": {
    #     "clusterId": "in07-7d6ac8697204a6a",
    #     "regionId": "aws-us-west-2",
    #     "projectId": "proj-09ee1f4b1151d5dd1edbc5"
    #   }
    # }
    ```

    The following table describes the parameters.

    <table>
       <tr>
         <th><p><strong>パラメーター</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td><p><code>projectId</code></p></td>
         <td><p>オンデマンドクラスターが作成されるプロジェクトのID。</p></td>
       </tr>
       <tr>
         <td><p><code>regionId</code></p></td>
         <td><p>クラスターがデプロイされるリージョン。プロジェクトのリージョンと一致する必要があります。</p></td>
       </tr>
       <tr>
         <td><p><code>cuSize</code></p></td>
         <td><p>割り当てるクエリーCUの数。クラスターはワークロードに基づいてゼロからこの値の間で自動的にスケールします — リクエストが到着すると指定されたCUサイズまでスピンアップし、アイドル時にはゼロまでスケールダウンします。</p><p>最小は8 CU、最大は256 CUで、サイズは8ずつ増加します（例：8、16、24）。8 CUを超えるクラスターには支払い方法が必要です。</p><p>これを8に設定すると、最大3 TBのデータを検索できます。データボリュームを増やすには、CUサイズを増やしてください。</p><p>この値は作成後に固定され、変更できません。</p></td>
       </tr>
       <tr>
         <td><p><code>clusterName</code></p></td>
         <td><p>作成するクラスターの名前。</p></td>
       </tr>
       <tr>
         <td><p><code>auto一時停止</code></p></td>
         <td><p>クラスターが自動的に一時停止するまでのアイドルタイムアウト。この期間内にリクエストを受信しない場合、クラスターはコンピュートコストの発生を停止するために一時停止します。</p><ul><li><p>値の型: 整数</p></li><li><p>単位: 秒</p></li><li><p>最小値: 60</p></li><li><p>デフォルト: 60</p></li></ul></td>
       </tr>
       <tr>
         <td><p><code>description</code></p></td>
         <td><p>作成するオンデマンドクラスターの説明です。最大 255 文字です。</p></td>
       </tr>
    </table>

- **ウェブコンソール経由**

    次のデモでは、ウェブコンソールでオンデマンドクラスターを作成する方法を示しています。

    <Supademo id="cmo9gv84436szl2dy975hyhsh" title=""  />

    <Procedures>

    1. **On-Demand Compute > Clusters** をクリックします。

    1. **+ Cluster** をクリックします。

    1. クラスター設定を構成します。

        次の表でパラメーターを説明します。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>クラスター名</p></td>
             <td><p>作成するクラスターの名前。</p></td>
           </tr>
           <tr>
             <td><p>クラスターの説明</p></td>
             <td><p>作成するオンデマンドクラスターの説明です。最大 255 文字です。</p></td>
           </tr>
           <tr>
             <td><p>Query CU</p></td>
             <td><p>割り当てるクエリーCUの数。クラスターはワークロードに基づいてゼロからこの値の間で自動的にスケールします — リクエストが到着すると指定されたCUサイズまでスピンアップし、アイドル時にはゼロまでスケールダウンします。</p><p>最小は8 CU、最大は256 CUで、サイズは8ずつ増加します（例：8、16、24）。8 CUを超えるクラスターには支払い方法が必要です。</p><p>この値は作成後に固定され、変更できません。</p></td>
           </tr>
           <tr>
             <td><p>Auto suspend</p></td>
             <td><p>クラスターが自動的に一時停止するまでのアイドル時間（秒単位）。デフォルトは1分です。この期間内にリクエストを受信しない場合、クラスターはコンピュートコストの発生を停止するために一時停止します。</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## View all on-demand clusters\{#view-all-on-demand-clusters}

- **RESTful API経由**

    次のように、すべてのオンデマンドクラスターを一覧表示できます:

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    curl --request GET \
         --url "{BASE_URL}/v2/clusters/onDemandClusters?projectId={PROJECT_ID}&regionId=aws-us-west-2" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "count": 2,
        "onDemandClusters": [
          {
            "clusterId": "in07-7d6ac8697204a6a",
            "clusterName": "xxx",
            "regionId": "aws-us-west-2",
            "cuSize": 8,
            "status": "SUSPENDED",
            "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
            "privateLink": "",
            "createdBy": "jack.tsai@zilliz.com",
            "createTime": 1745396115000
          }
        ]
      }
    }
    ```

- **ウェブコンソール経由**

    ![WPOBwHulYhQPRIbgpjJcrAfXnVc](https://zdoc-images.s3.us-west-2.amazonaws.com/WPOBwHulYhQPRIbgpjJcrAfXnVc.png)

## Check the details of an on-demand cluster\{#check-the-details-of-an-on-demand-cluster}

- **RESTful API経由**

    オンデマンドクラスターは以下のように記述できます:

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
         --url "${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in07-7d6ac8697204a6a",
        "clusterName": "xxx",
        "regionId": "aws-us-west-2",
        "cuSize": 8,
        "status": "RUNNING",
        "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
        "privateLink": "",
        "createdBy": "jack.tsai@zilliz.com",
        "createTime": 1745396115000
      }
    }
    ```

- **ウェブコンソール経由**

    ![NDpWwXSknh7FMibTGjNcwg8Vnjf](https://zdoc-images.s3.us-west-2.amazonaws.com/NDpWwXSknh7FMibTGjNcwg8Vnjf.png)

## オンデマンドクラスタの削除\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Warning">

<p>クラスタを削除すると、即座に削除され、復元することはできません。この操作は元に戻せません。</p>

</Admonition>

- **RESTful API経由**

    オンデマンドクラスタは以下のように削除できます。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request DELETE \
         --url "${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in07-7d6ac8697204a6a",
        "status": "DELETING"
      }
    }
    ```

- **ウェブコンソール経由**

    ![Vu38wTpLDhmRqYbmYFVcbjK5nVx](https://zdoc-images.s3.us-west-2.amazonaws.com/Vu38wTpLDhmRqYbmYFVcbjK5nVx.png)
