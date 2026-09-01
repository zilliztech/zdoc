---
title: "オンデマンドクラスターの管理 | BYOC"
slug: /manage-on-demand-clusters
sidebar_label: "クラスターの管理"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。 | BYOC"
type: origin
token: L11Mw0GRTiKALikJaEycwj1wnKg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# オンデマンドクラスターの管理

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

現在、この機能は AWS us-west-2 および Azure East US リージョンでのみ利用可能です。他のリージョンでオンデマンドクラスターをご利用の場合は、[お問い合わせ](http://zilliz.com/contact-sales)ください。

</FeatureNote>

このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。

オンデマンドクラスターは、オンデマンド検索ワークロード向けにコンピューティングリソースを提供します。リクエストの受信時に起動し、アイドル状態になると、クラスター作成時に設定された自動サスペンドタイムアウトに基づいてゼロまでスケールダウンします。

オンデマンドクラスターを管理するには、対象プロジェクトの Project Admin である必要があります。ロールと権限の詳細については、「[プラットフォームユーザーの管理](./manage-platform-users#project-users)」を参照してください。

## すべてのオンデマンドクラスターを表示する\{#view-all-on-demand-clusters}

この操作により、指定したプロジェクトおよびリージョン内のオンデマンドクラスターを一覧表示できます。

### RESTful API を使用する場合\{#via-restful-api}

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/onDemandClusters?projectId=proj-xxxxxxxxxxxxxxx&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

レスポンス例:

```bash
{
    "code": 0,
    "data": {
        "count": 2,
        "onDemandClusters": [
            {
                "projectId": "proj-xxxxxxxxxxxxxxx",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "clusterName": "Cluster-01",
                "regionId": "aws-us-west-2",
                "cuSize": 8,
                "status": "RUNNING",
                "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.api.zillizcloud.com",
                "privateLink": "",
                "createdBy": "john.doe@zilliz.com",
                "createTime": "2024-04-21T10:15:15Z",
                "autoSuspend": 60,
                "description": "An on-demand cluster for vector search workloads."
            },
            {
                "projectId": "proj-xxxxxxxxxxxxxxx",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "clusterName": "Cluster-02",
                "regionId": "aws-us-west-2",
                "status": "RUNNING",
                "cuSize": 8,
                "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.api.zillizcloud.com",
                "privateLink": "",
                "createdBy": "john.doe@zilliz.com",
                "createTime": "2024-04-21T10:15:16Z",
                "autoSuspend": 60,
                "description": "An on-demand cluster for vector search workloads."
            }
        ]
    }
}
```

### Web コンソールを使用する場合\{#via-web-console}

![W3nYwPc0AhxRDWbjEsWceJGVnbh](https://zdoc-images.s3.us-west-2.amazonaws.com/W3nYwPc0AhxRDWbjEsWceJGVnbh.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. オンデマンドクラスターの一覧を確認します。ここにはクラスター名、クラスター ID、ステータス、CU サイズ、エンドポイント、作成者、作成日時が含まれます。

</Procedures>

## オンデマンドクラスターの詳細を確認する\{#check-the-details-of-an-on-demand-cluster}

この操作により、クラスター ID を指定して特定のオンデマンドクラスターの詳細を確認できます。

### RESTful API を使用する場合\{#via-restful-api}

```bash
curl --request GET \
     --url "https://${BASE_URL}/v2/on-demand-compute?projectId=proj-09ee1f4b1151d5dd1edbc5&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json"
```

レスポンス例:

```bash
{
  "code": 0,
  "data": {
    "projectId": "proj-09ee1f4b1151d5dd1edbc5",
    "regionId": "aws-us-west-2",
    "status": "enabled"
  }
}
```

### Web コンソールを使用する場合\{#via-web-console}

![XiWTwTJ3mhgjHBbS5dycYi4bn4c](https://zdoc-images.s3.us-west-2.amazonaws.com/XiWTwTJ3mhgjHBbS5dycYi4bn4c.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. 対象のクラスターをクリックすると、詳細が表示されます。

</Procedures>

## クラスターステータスの理解\{#understand-cluster-status}

オンデマンドクラスターのステータスは、リクエストの状況に応じて自動的に変化します。

| ステータス | 説明 |
| --- | --- |
| `RUNNING` | クラスターにアクティブなコンピューティングリソースが割り当てられており、検索やクエリのリクエストを処理できる状態です。 |
| `SUSPENDED` | 設定されたアイドルタイムアウト期間を経過し、クラスターがゼロまでスケールダウンした状態です。サスペンド中はコンピューティングコストは発生しません。 |
| `DELETING` | クラスターの削除処理が進行中であり、使用できない状態です。 |

サスペンド中のオンデマンドクラスターにリクエストが届くと、Zilliz Cloud がワークロード用のコンピューティングリソースを起動します。設定された `autoSuspend` 期間内にリクエストがない場合、クラスターは再びゼロまでスケールダウンします。

## オンデマンドクラスターの名前を変更する\{#rename-an-on-demand-cluster}

- **RESTful API を使用する場合**

    以下の例ではクラスター名を変更しています。詳細については、「[Update On-Demand クラスター Info](/reference/restful/update-on-demand-cluster-info-v2)」を参照してください。

    ```bash
    curl --request PATCH \
    --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
    --header "Content-Type: application/json" \
    -d '{
        "clusterName": "New Cluster Name"
    }'
    ```

    以下は出力例です。

    ```json
    {
        "code": 0,
        "data": {
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
        }
    }
    ```

- **Web コンソールを使用する場合**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. **Actions** をクリックし、**Rename** を選択します。

        ![IvU4bhPSfo7u76xC67DcESHpnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/ivu4bhpsfo7u76xc67dceshpnfg.png "IvU4bhPSfo7u76xC67DcESHpnfg")

    1. クラスターの新しい名前を入力し、**Save** をクリックします。

        ![GPBzb78W3ojP0HxalhHc6M4Zn6c](https://zdoc-images.s3.us-west-2.amazonaws.com/gpbzb78w3ojp0hxalhhc6m4zn6c.png "GPBzb78W3ojP0HxalhHc6M4Zn6c")

    </Procedures>

## オンデマンドクラスターの説明を編集する\{#edit-the-description-of-an-on-demand-cluster}

- **RESTful API を使用する場合**

    以下の例ではクラスターの説明を変更しています。詳細については、「[Update On-Demand クラスター](/reference/restful/update-on-demand-cluster-v2)」を参照してください。

    ```bash
    curl --request PATCH \
    --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
    --header "Content-Type: application/json" \
    -d '{
        "description": ""
    }'
    ```

    以下は出力例です。

    ```json
    {
        "code": 0,
        "data": {
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
        }
    }
    ```

- **Web コンソールを使用する場合**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. 説明欄にカーソルを合わせ、**Edit description** アイコンをクリックします。

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. クラスターの新しい説明を入力し、**Save** をクリックします。

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## オンデマンドクラスターの変更\{#modify-an-on-demand-cluster}

オンデマンドクラスターの名前、説明、自動サスペンド設定などの各種設定を変更できます。

- **RESTful API を使用する場合**

    既存のオンデマンドクラスターについて、名前、説明、自動サスペンド時間、クエリ CU 数を変更できます。詳細は「[Update On-Demand クラスター](/reference/restful/update-on-demand-cluster-v2)」を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

    curl --request PATCH \
         --url "https://${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "autoSuspend": "5m",
            "clusterName": "my-on-demand-updated",
            "description": "Updated on-demand cluster description",
            "cuSize": 32
          }'
    ```

    以下に出力例を示します。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted."
      }
    }
    ```

- **Web コンソールを使用する場合**

    Web コンソールから、既存のオンデマンドクラスターのクラスター名、説明、自動サスペンド時間、クエリ CU 数を変更できます。

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## オンデマンドクラスターの削除\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Danger">

オンデマンドクラスターを削除すると即座に除去され、復元することはできません。この操作は取り消せません。

</Admonition>

### RESTful API を使用する場合\{#via-restful-api}

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

レスポンス例:

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "status": "DELETING"
  }
}
```

### Web コンソールを使用する場合\{#via-web-console}

![H9p9wioiohNX3Ub6evBcWGTBnse](https://zdoc-images.s3.us-west-2.amazonaws.com/H9p9wioiohNX3Ub6evBcWGTBnse.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. 対象のオンデマンドクラスターを選択します。

1. クラスターを削除し、操作を確定します。

</Procedures>

## 関連トピック\{#related-topics}

- オンデマンドクラスターを作成するには、「[Create On-Demand クラスター](./on-demand-cluster)」を参照してください。

- プロジェクトエンドポイント経由で接続するには、「[Connect for On-Demand Search](./connect-for-on-demand-search)」を参照してください。
