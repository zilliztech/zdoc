---
title: "オンデマンドクラスターの管理 | Cloud"
slug: /manage-on-demand-clusters
sidebar_label: "クラスターを管理"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。 | Cloud"
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

この機能は現在、AWS us-west-2 および Azure East US リージョンでのみ利用できます。他のリージョンでオンデマンドクラスターを使用するには、[お問い合わせください](http://zilliz.com/contact-sales)。

</FeatureNote>

このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。

オンデマンドクラスターは、オンデマンド検索ワークロード向けのコンピュートを提供します。リクエストが到着すると起動し、クラスター作成時に設定した自動サスペンドのタイムアウトに基づいて、アイドル時にはゼロまでスケールダウンします。

オンデマンドクラスターを管理するには、対象プロジェクトの Project Admin である必要があります。ロールと権限の詳細については、[プロジェクトユーザーの管理](./project-users#project-role-and-access-comparison)を参照してください。

## すべてのオンデマンドクラスターを表示する\{#view-all-on-demand-clusters}

この操作を使用して、プロジェクトおよびリージョン内のオンデマンドクラスターを一覧表示します。

### RESTful API 経由\{#via-restful-api}

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/onDemandClusters?projectId=proj-xxxxxxxxxxxxxxx&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

レスポンス例:

```plaintext
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

### Web コンソール経由\{#via-web-console}

![W3nYwPc0AhxRDWbjEsWceJGVnbh](https://zdoc-images.s3.us-west-2.amazonaws.com/W3nYwPc0AhxRDWbjEsWceJGVnbh.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. クラスター名、クラスター ID、ステータス、CU サイズ、エンドポイント、作成者、作成時刻など、オンデマンドクラスターの一覧を確認します。

</Procedures>

## オンデマンドクラスターの詳細を確認する\{#check-the-details-of-an-on-demand-cluster}

この操作を使用して、クラスター ID によって 1 つのオンデマンドクラスターを確認します。

### RESTful API 経由\{#via-restful-api}

```bash
curl --request GET \
     --url "https://${BASE_URL}/v2/on-demand-compute?projectId=proj-09ee1f4b1151d5dd1edbc5&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json"
```

レスポンス例:

```plaintext
{
  "code": 0,
  "data": {
    "projectId": "proj-09ee1f4b1151d5dd1edbc5",
    "regionId": "aws-us-west-2",
    "status": "enabled"
  }
}
```

### Web コンソール経由\{#via-web-console}

![XiWTwTJ3mhgjHBbS5dycYi4bn4c](https://zdoc-images.s3.us-west-2.amazonaws.com/XiWTwTJ3mhgjHBbS5dycYi4bn4c.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. 対象のクラスターをクリックして詳細を表示します。

</Procedures>

## クラスターステータスを理解する\{#understand-cluster-status}

オンデマンドクラスターは、リクエストのアクティビティに応じて自動的にステータスが変化します。

| ステータス | 説明 |
| --- | --- |
| `RUNNING` | クラスターにはアクティブなコンピュートリソースがあり、検索またはクエリリクエストを処理できます。 |
| `SUSPENDED` | クラスターは設定されたアイドルタイムアウト後にゼロまでスケールダウンしました。一時停止中はコンピュートコストは発生しません。 |
| `DELETING` | クラスターは削除中であり、使用できません。 |

サスペンドされたオンデマンドクラスターにリクエストが到着すると、Zilliz Cloud はそのワークロードのためにコンピュートリソースを起動します。設定された `autoSuspend` 期間内にリクエストがない場合、クラスターは再びゼロまでスケールダウンします。

## オンデマンドクラスターの名前を変更する\{#rename-an-on-demand-cluster}

- **RESTful API 経由**

    次の例ではクラスター名を変更します。詳細については、[Update On-Demand Cluster Info](/reference/restful/update-on-demand-cluster-info-v2) を参照してください。

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

- **Web コンソール経由**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. **Actions** をクリックし、**Rename** を選択します。

        ![IvU4bhPSfo7u76xC67DcESHpnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/ivu4bhpsfo7u76xc67dceshpnfg.png "IvU4bhPSfo7u76xC67DcESHpnfg")

    1. クラスターの新しい名前を入力し、**Save** をクリックします。

        ![GPBzb78W3ojP0HxalhHc6M4Zn6c](https://zdoc-images.s3.us-west-2.amazonaws.com/gpbzb78w3ojp0hxalhhc6m4zn6c.png "GPBzb78W3ojP0HxalhHc6M4Zn6c")

    </Procedures>

## オンデマンドクラスターの説明を編集する\{#edit-the-description-of-an-on-demand-cluster}

- **RESTful API 経由**

    次の例ではクラスターの説明を変更します。詳細については、[Update On-Demand Cluster Info](/reference/restful/update-on-demand-cluster-info-v2) を参照してください。

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

- **Web コンソール経由**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. 説明の上にカーソルを合わせ、**Edit description** アイコンをクリックします。

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. クラスターの新しい説明を入力し、**Save** をクリックします。

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## オンデマンドクラスターを変更する\{#modify-an-on-demand-cluster}

オンデマンドクラスターの名前、説明、自動サスペンド設定などを変更できます。

- **RESTful API 経由**

    既存のオンデマンドクラスターの自動サスペンド時間を変更できます。

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

- **Web コンソール経由**

    Web コンソール経由で、既存のオンデマンドクラスターのクラスター名、説明、自動サスペンド時間を変更できます。

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## オンデマンドクラスターを削除する\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Danger">

オンデマンドクラスターを削除すると、ただちに削除され、復元できません。この操作は元に戻せません。

</Admonition>

### RESTful API 経由\{#via-restful-api}

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

レスポンス例:

```plaintext
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "status": "DELETING"
  }
}
```

### Web コンソール経由\{#via-web-console}

![H9p9wioiohNX3Ub6evBcWGTBnse](https://zdoc-images.s3.us-west-2.amazonaws.com/H9p9wioiohNX3Ub6evBcWGTBnse.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. 対象のオンデマンドクラスターを選択します。

1. クラスターを削除し、操作を確認します。

</Procedures>

## 関連トピック\{#related-topics}

- オンデマンドクラスターを作成するには、[オンデマンドクラスターの作成](./on-demand-cluster)を参照してください。

- プロジェクトエンドポイントを介して接続するには、[オンデマンド検索向け接続](./connect-for-on-demand-search)を参照してください。

