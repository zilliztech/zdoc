---
title: "On-Demand Cluster を管理する | Cloud"
slug: /manage-on-demand-clusters
sidebar_label: "Cluster を管理"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で on-demand cluster を表示、確認、削除する方法について説明します。 | Cloud"
type: origin
token: L11Mw0GRTiKALikJaEycwj1wnKg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# On-Demand Cluster を管理する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は現在、AWS us-west-2 および Azure East US リージョンでのみ利用できます。他のリージョンで on-demand cluster を使用するには、[お問い合わせください](http://zilliz.com/contact-sales)。

</FeatureNote>

このガイドでは、Zilliz Cloud で on-demand clusters を表示、確認、削除する方法について説明します。

On-demand clusters は、オンデマンド検索ワークロード向けのコンピュートを提供します。リクエストが到着すると起動し、cluster 作成時に設定した auto-suspend タイムアウトに基づいて、アイドル時にはゼロまでスケールダウンします。

On-demand cluster を管理するには、対象プロジェクトの Project Admin である必要があります。ロールと権限の詳細については、[プロジェクトユーザーの管理](./project-users#project-role-and-access-comparison) を参照してください。

## すべての on-demand clusters を表示する\{#view-all-on-demand-clusters}

この操作を使用して、プロジェクトおよびリージョン内の on-demand clusters を一覧表示します。

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

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. cluster 名、cluster ID、ステータス、CU サイズ、endpoint、作成者、作成時刻を含む on-demand cluster の一覧を確認します。

</Procedures>

## on-demand cluster の詳細を確認する\{#check-the-details-of-an-on-demand-cluster}

この操作を使用して、cluster ID によって 1 つの on-demand cluster を確認します。

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

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. 対象の cluster をクリックして詳細を表示します。

</Procedures>

## cluster ステータスを理解する\{#understand-cluster-status}

On-demand cluster は、リクエストのアクティビティに応じて自動的にステータスが変化します。

| Status | Description |
| --- | --- |
| `RUNNING` | cluster はアクティブなコンピュートリソースを持ち、検索またはクエリリクエストを処理できます。 |
| `SUSPENDED` | cluster は設定されたアイドルタイムアウト後にゼロまでスケールダウンしています。停止中はコンピュートコストが発生しません。 |
| `DELETING` | cluster は削除中であり、使用できません。 |

停止中の on-demand cluster にリクエストが到着すると、Zilliz Cloud はそのワークロードのためにコンピュートリソースを起動します。設定された `autoSuspend` 期間内にリクエストが受信されない場合、cluster は再びゼロまでスケールダウンします。

## on-demand cluster の名前を変更する\{#rename-an-on-demand-cluster}

- **RESTful API を使用する場合**

    以下の例では cluster 名を変更します。詳細については、[Update On-Demand Cluster Info](/reference/restful/update-on-demand-cluster-info-v2) を参照してください。

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

    1. 対象の on-demand cluster に移動します。

    1. **Actions** をクリックし、**Rename** を選択します。

        ![IvU4bhPSfo7u76xC67DcESHpnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/ivu4bhpsfo7u76xc67dceshpnfg.png "IvU4bhPSfo7u76xC67DcESHpnfg")

    1. cluster の新しい名前を入力し、**Save** をクリックします。

        ![GPBzb78W3ojP0HxalhHc6M4Zn6c](https://zdoc-images.s3.us-west-2.amazonaws.com/gpbzb78w3ojp0hxalhhc6m4zn6c.png "GPBzb78W3ojP0HxalhHc6M4Zn6c")

    </Procedures>

## on-demand cluster の説明を編集する\{#edit-the-description-of-an-on-demand-cluster}

- **RESTful API を使用する場合**

    以下の例では cluster の説明を変更します。詳細については、[Update On-Demand Cluster Info](/reference/restful/update-on-demand-cluster-info-v2) を参照してください。

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

    1. 対象の on-demand cluster に移動します。

    1. 説明にカーソルを合わせて **Edit description** アイコンをクリックします。

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. cluster の新しい説明を入力し、**Save** をクリックします。

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## on-demand cluster を変更する\{#modify-an-on-demand-cluster}

名前、説明、auto-suspend 設定など、on-demand cluster の設定を変更できます。

- **RESTful API を使用する場合**

    既存の on-demand cluster の auto-suspend 時間を変更できます。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
    
    curl --request PATCH \
    --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
    --header "Content-Type: application/json" \
    -d '{
        "clusterName": "New Cluster Name",
        "description": "This is the new description of the cluster.",
        "autoSuspend": "5m"
    }'
    ```

    以下は出力例です。

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

    Web コンソールでは、既存の on-demand cluster の cluster 名、説明、auto-suspend 時間を変更できます。

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## on-demand cluster を削除する\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="危険">

on-demand cluster を削除すると、即座に削除され、復元できません。この操作は元に戻せません。

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

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. 対象の on-demand cluster を選択します。

1. cluster を削除し、操作を確認します。

</Procedures>

## 関連トピック\{#related-topics}

- On-demand cluster を作成するには、[Create On-Demand Cluster](./on-demand-cluster) を参照してください。

- プロジェクト endpoint 経由で接続するには、[Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。

