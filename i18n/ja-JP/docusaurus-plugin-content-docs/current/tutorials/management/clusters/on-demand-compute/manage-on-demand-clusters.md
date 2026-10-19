---
title: "オンデマンドクラスターの管理 | Cloud"
slug: /manage-on-demand-clusters
sidebar_label: "クラスターの管理"
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

この機能は、Enterprise プラン以上でのみ利用できます。

</FeatureNote>

このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。

オンデマンドクラスターは、オンデマンド検索ワークロード向けのコンピューティングを提供します。リクエストが到着すると起動し、アイドル状態になると、クラスター作成時に設定した自動サスペンドのタイムアウトに基づいてゼロにスケールバックします。

オンデマンドクラスターを管理するには、対象プロジェクトの Project Admin である必要があります。ロールと権限の詳細については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

## すべてのオンデマンドクラスターを表示する\{#view-all-on-demand-clusters}

この操作を使用して、プロジェクトおよびリージョン内のオンデマンドクラスターを一覧表示します。

### RESTful API を使用する\{#via-restful-api}

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/onDemandClusters?projectId=proj-xxxxxxxxxxxxxxx&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

応答例：

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

### Web コンソールを使用する\{#via-web-console}

![W3nYwPc0AhxRDWbjEsWceJGVnbh](https://zdoc-images.s3.us-west-2.amazonaws.com/W3nYwPc0AhxRDWbjEsWceJGVnbh.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. クラスター名、クラスター ID、ステータス、CU サイズ、エンドポイント、作成者、作成時刻を含むオンデマンドクラスターの一覧を確認します。

</Procedures>

## オンデマンドクラスターの詳細を確認する\{#check-the-details-of-an-on-demand-cluster}

この操作を使用して、クラスター ID を指定して 1 つのオンデマンドクラスターを確認します。

### RESTful API を使用する\{#via-restful-api}

```bash
curl --request GET \
     --url "https://${BASE_URL}/v2/on-demand-compute?projectId=proj-09ee1f4b1151d5dd1edbc5&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json"
```

応答例：

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

### Web コンソールを使用する\{#via-web-console}

![XiWTwTJ3mhgjHBbS5dycYi4bn4c](https://zdoc-images.s3.us-west-2.amazonaws.com/XiWTwTJ3mhgjHBbS5dycYi4bn4c.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. 対象クラスターをクリックして詳細を表示します。

</Procedures>

## クラスターのステータスを理解する\{#understand-cluster-status}

オンデマンドクラスターは、リクエストのアクティビティに基づいてステータスを自動的に変更します。

| ステータス | 説明 |
| --- | --- |
| `RUNNING` | クラスターにはアクティブなコンピューティングリソースがあり、検索またはクエリのリクエストを処理できます。 |
| `SUSPENDED` | クラスターは、設定されたアイドルタイムアウト後にゼロにスケールバックされています。サスペンド中はコンピューティングコストが発生しません。 |
| `DELETING` | クラスターは削除中であり、使用できません。 |

サスペンドされたオンデマンドクラスターにリクエストが到着すると、Zilliz Cloud はワークロード用のコンピューティングリソースを起動します。設定された `autoSuspend` 期間内にリクエストを受信しなかった場合、クラスターはゼロにスケールバックします。

## オンデマンドクラスターの名前を変更する\{#rename-an-on-demand-cluster}

- **RESTful API を使用する**

    次の例では、クラスター名を変更します。詳細については、[Update On-Demand クラスター](/reference/restful/update-on-demand-cluster-v2) を参照してください。

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

    出力例は以下の通りです。

    ```json
    {
        "code": 0,
        "data": {
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
        }
    }
    ```

- **Web コンソールを使用する**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. **Actions** をクリックし、**Rename** を選択します。

        ![IvU4bhPSfo7u76xC67DcESHpnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/ivu4bhpsfo7u76xc67dceshpnfg.png "IvU4bhPSfo7u76xC67DcESHpnfg")

    1. クラスターの新しい名前を入力し、**Save** をクリックします。

        ![GPBzb78W3ojP0HxalhHc6M4Zn6c](https://zdoc-images.s3.us-west-2.amazonaws.com/gpbzb78w3ojp0hxalhhc6m4zn6c.png "GPBzb78W3ojP0HxalhHc6M4Zn6c")

    </Procedures>

## オンデマンドクラスターの説明を編集する\{#edit-the-description-of-an-on-demand-cluster}

- **RESTful API を使用する**

    次の例では、クラスターの説明を変更します。詳細については、[Update On-Demand クラスター](/reference/restful/update-on-demand-cluster-v2) を参照してください。

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

    出力例は以下の通りです。

    ```json
    {
        "code": 0,
        "data": {
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
        }
    }
    ```

- **Web コンソールを使用する**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. 説明にカーソルを合わせ、**Edit description** アイコンをクリックします。

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. クラスターの新しい説明を入力し、**Save** をクリックします。

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## オンデマンドクラスターを変更する\{#modify-an-on-demand-cluster}

オンデマンドクラスターの名前、説明、自動サスペンド設定などの設定を変更できます。

- **RESTful API を使用する**

    既存のオンデマンドクラスターの名前、説明、自動サスペンド時間、クエリ CU 数を変更できます。詳細については、[Update On-Demand クラスター](/reference/restful/update-on-demand-cluster-v2) を参照してください。

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

    出力例は以下の通りです。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted."
      }
    }
    ```

- **Web コンソールを使用する**

    Web コンソールを使用して、既存のオンデマンドクラスターのクラスター名、説明、自動サスペンド時間、クエリ CU 数を変更できます。

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## キープウォームスケジュールを構成する\{#configure-a-keep-warm-schedule}

キープウォームスケジュールは、毎週繰り返される時間枠の間、オンデマンドクラスターを実行状態に保ちます。キープウォームの時間枠が開始されると、オンデマンドクラスターがサスペンドされている場合、Zilliz Cloud はそのクラスターを再開します。時間枠の間は、`Auto Suspend` が抑制されます。時間枠が終了すると、オンデマンドクラスターは既存の自動サスペンドポリシーに再び従います。

キープウォームスケジュールは、`Auto Suspend` を恒久的に無効にするものではなく、キープウォームの時間枠が終了したときにオンデマンドクラスターをアクティブにサスペンドするものでもありません。

<Admonition type="info" title="Note">

キープウォームの時間枠中にオンデマンドクラスターをサスペンドするには、先にキープウォームスケジュールを無効化または削除してください。

</Admonition>

各オンデマンドクラスターには、1 つのキープウォームスケジュールを設定できます。スケジュールには、1〜10 個の毎週のルールを含めることができます。各ルールは組織のシステムタイムゾーンを使用し、曜日、開始時刻、終了時刻を含みます。

### RESTful API を使用する\{#via-restful-api}

既存のオンデマンドクラスター API を使用して、キープウォームスケジュールを構成します。キープウォームの構成は、作成、記述、更新の各 API で `keepWarm` オブジェクトによって指定します。

#### キープウォームスケジュールを作成する\{#create-a-keep-warm-schedule}

オンデマンドクラスターの作成時にキープウォームスケジュールを構成するには、作成リクエストに `keepWarm` を含めます。

次の例では、平日の `09:00` から `18:00` までのキープウォームスケジュールを持つオンデマンドクラスターを作成します。

```bash
curl --request POST \
  --url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "cuSize": 8,
    "clusterName": "my-on-demand-cluster",
    "autoSuspend": "5m",
    "keepWarm": {
      "enabled": true,
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ]
    }
  }'
```

応答例：

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "prompt": "successfully submitted. Cluster is being created."
  }
}
```

#### キープウォームスケジュールを表示する\{#view-a-keep-warm-schedule}

次の例では、オンデマンドクラスターのキープウォームスケジュールを確認します。

```bash
curl --request GET \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Accept: application/json"
```

応答例：

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "clusterName": "my-on-demand-cluster",
    "status": "RUNNING",
    "autoSuspend": 300,
    "keepWarmActive": true,
    "keepWarm": {
      "enabled": true,
      "systemTimezone": "Asia/Shanghai",
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ],
      "nextTransitionAt": "2026-09-15T10:00:00Z",
      "nextTransitionType": "END"
    }
  }
}
```

スケジュールが構成されていない場合、`keepWarm` は `null`、`keepWarmActive` は `false` です。

#### キープウォームスケジュールを更新する\{#update-a-keep-warm-schedule}

キープウォームスケジュールを更新するには、完全な `keepWarm` オブジェクトを含む `PATCH` リクエストを送信します。Zilliz Cloud は、既存のスケジュールを送信されたスケジュールに置き換えます。

次の例では、既存のオンデマンドクラスターのキープウォームスケジュールを更新します。

```bash
curl --request PATCH \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "keepWarm": {
      "enabled": true,
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ]
    }
  }'
```

応答例：

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx"
  }
}
```

#### キープウォームスケジュールを無効化する\{#disable-a-keep-warm-schedule}

キープウォームスケジュールを無効化するには、完全な `keepWarm` オブジェクトを含む `PATCH` リクエストを送信し、`enabled` を `false` に設定します。

<Admonition type="info" title="Note">

スケジュールを無効化しても、構成済みのすべてのルールは保持されます。オンデマンドクラスターがキープウォームの時間枠内にある場合、Zilliz Cloud は直ちにキープウォームモードを終了します。スケジュールによってオンデマンドクラスターはサスペンドされません。

</Admonition>

次の例では、既存のキープウォームスケジュールを無効化します。

```bash
curl --request PATCH \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "keepWarm": {
      "enabled": false,
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ]
    }
  }'
```

応答例：

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx"
  }
}
```

#### キープウォームスケジュールを削除する\{#delete-a-keep-warm-schedule}

キープウォームスケジュールを削除すると、スケジュールとすべてのルールが削除されます。オンデマンドクラスター、データ、イベント、監査レコードは削除されません。

キープウォームスケジュールを削除するには、空の `schedules` リストを含む `PATCH` リクエストを送信します。

```bash
curl --request PATCH \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "keepWarm": {
      "enabled": false,
      "schedules": []
    }
  }'
```

応答例：

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx"
  }
}
```

### Web コンソールを使用する\{#via-web-console}

![EnHUwxZCUhT8hlbvMJRchiAQnfY](https://zdoc-images.s3.us-west-2.amazonaws.com/EnHUwxZCUhT8hlbvMJRchiAQnfY.png)

<Procedures>

1. 対象のオンデマンドクラスターに移動します。

1. **Actions** メニューを開き、**Manage Keep-warm** をクリックします。

1. **Enable Keep-warm Schedule** を有効にします。

1. **Schedule Rules** で、1 つ以上の毎週のルールを追加します。

1. 各ルールについて、繰り返し曜日、開始時刻、終了時刻を構成します。

1. 次の移行時刻を確認します。

1. **Save** をクリックします。

</Procedures>

クラスターの詳細ページには、キープウォームスケジュールのステータスが表示されます。スケジュールが構成されている場合は、次の移行時刻も表示されます。

オンデマンドクラスターが現在キープウォームの時間枠内にある場合、ページにはプライマリクラスターステータスの横にセカンダリの **Keep-warm** タグが表示されます。

![IF04w32RNhEbr7b8OBUcM8n3nnc](https://zdoc-images.s3.us-west-2.amazonaws.com/IF04w32RNhEbr7b8OBUcM8n3nnc.png)

スケジュールを無効化しても、構成済みのすべてのルールは保持されます。オンデマンドクラスターがキープウォームの時間枠内にある場合、Zilliz Cloud は直ちにキープウォームモードを終了します。スケジュールによってオンデマンドクラスターはサスペンドされません。キープウォームスケジュールを無効化するには、以下に示すように **Enable Keep-warm Schedule** をオフにして **Save** をクリックします。

![OzydwQkLjhVsoBbckHzciUAbnmc](https://zdoc-images.s3.us-west-2.amazonaws.com/OzydwQkLjhVsoBbckHzciUAbnmc.png)

## オンデマンドクラスターを削除する\{#drop-an-on-demand-cluster}

<Admonition type="danger" title="Danger">

オンデマンドクラスターを削除すると、直ちに削除され、復元できません。この操作は元に戻せません。

</Admonition>

### RESTful API を使用する\{#via-restful-api}

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

応答例：

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "status": "DELETING"
  }
}
```

### Web コンソールを使用する\{#via-web-console}

![H9p9wioiohNX3Ub6evBcWGTBnse](https://zdoc-images.s3.us-west-2.amazonaws.com/H9p9wioiohNX3Ub6evBcWGTBnse.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. 対象のオンデマンドクラスターを選択します。

1. クラスターを削除し、操作を確認します。

</Procedures>

## 関連トピック\{#related-topics}

- オンデマンドクラスターの作成については、[オンデマンドクラスターの作成](./on-demand-cluster) を参照してください。

- プロジェクトエンドポイント経由で接続するには、[オンデマンド検索用の接続](./connect-for-on-demand-search) を参照してください。

