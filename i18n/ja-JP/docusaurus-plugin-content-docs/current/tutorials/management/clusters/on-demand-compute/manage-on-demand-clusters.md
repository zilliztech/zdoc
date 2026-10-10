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

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は現在、AWS us-west-2 および Azure East US リージョンでのみ利用できます。その他のリージョンでオンデマンドクラスターを使用するには、[お問い合わせください](http://zilliz.com/contact-sales)。

</FeatureNote>

このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。

オンデマンドクラスターは、オンデマンド検索ワークロード向けのコンピューティングを提供します。リクエストが到着すると起動し、アイドル状態になるとゼロにスケールバックします。この動作は、クラスターの作成時に構成した自動サスペンドのタイムアウトに基づきます。

オンデマンドクラスターを管理するには、対象プロジェクトの Project Admin である必要があります。ロールと権限の詳細については、[Manage Platform Users](./manage-platform-users#project-users) を参照してください。

## すべてのオンデマンドクラスターを表示する\{#view-all-on-demand-clusters}

この操作では、プロジェクトおよびリージョン内のオンデマンドクラスターを一覧表示します。

### RESTful API 経由\{#via-restful-api}

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/onDemandClusters?projectId=proj-xxxxxxxxxxxxxxx&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

応答例:

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

### Web コンソール経由\{#via-web-console}

![W3nYwPc0AhxRDWbjEsWceJGVnbh](https://zdoc-images.s3.us-west-2.amazonaws.com/W3nYwPc0AhxRDWbjEsWceJGVnbh.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. クラスター名、クラスター ID、ステータス、CU サイズ、エンドポイント、作成者、作成日時など、オンデマンドクラスターの一覧を確認します。

</Procedures>

## オンデマンドクラスターの詳細を確認する\{#check-the-details-of-an-on-demand-cluster}

この操作では、クラスター ID を指定して 1 つのオンデマンドクラスターの詳細を確認します。

### RESTful API 経由\{#via-restful-api}

```bash
curl --request GET \
     --url "https://${BASE_URL}/v2/on-demand-compute?projectId=proj-09ee1f4b1151d5dd1edbc5&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json"
```

応答例:

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

### Web コンソール経由\{#via-web-console}

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
| `RUNNING` | クラスターにアクティブなコンピューティングリソースがあり、検索またはクエリのリクエストを処理できます。 |
| `SUSPENDED` | クラスターは、構成されたアイドルタイムアウト後にゼロにスケールダウンしました。サスペンド中はコンピューティングコストが発生しません。 |
| `DELETING` | クラスターは削除中であり、使用できません。 |

サスペンドされたオンデマンドクラスターにリクエストが到着すると、Zilliz Cloud はそのワークロード用のコンピューティングリソースを起動します。構成された `autoSuspend` 期間内にリクエストを受信しなかった場合、クラスターはゼロにスケールバックします。

## オンデマンドクラスターの名前を変更する\{#rename-an-on-demand-cluster}

- **RESTful API 経由**

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

    1. 説明にカーソルを合わせ、**Edit description** アイコンをクリックします。

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. クラスターの新しい説明を入力し、**Save** をクリックします。

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## オンデマンドクラスターを変更する\{#modify-an-on-demand-cluster}

オンデマンドクラスターの名前、説明、自動サスペンド設定などの設定を変更できます。

- **RESTful API 経由**

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

    Web コンソールでは、既存のオンデマンドクラスターのクラスター名、説明、自動サスペンド時間、クエリ CU 数を変更できます。

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

<NextChannel action="include">

## キープウォームスケジュールを構成する\{#configure-a-keep-warm-schedule}

キープウォームスケジュールは、毎週繰り返される期間中、オンデマンドクラスターを稼働状態に保ちます。キープウォーム期間が開始すると、オンデマンドクラスターがサスペンドされている場合、Zilliz Cloud はそのクラスターを再開します。期間中は `Auto Suspend` が抑制されます。期間が終了すると、オンデマンドクラスターは再び既存の自動サスペンドポリシーに従います。

キープウォームスケジュールは、`Auto Suspend` を恒久的に無効にするものではなく、キープウォーム期間の終了時にオンデマンドクラスターを能動的にサスペンドするものでもありません。

<Admonition type="info" title="Note">

キープウォーム期間中にオンデマンドクラスターをサスペンドするには、先にキープウォームスケジュールを無効化または削除してください。

</Admonition>

各オンデマンドクラスターは、1 つのキープウォームスケジュールを持つことができます。スケジュールには 1～5 個の週次ルールを含めることができます。各ルールは組織のシステムタイムゾーンを使用し、曜日、開始時刻、終了時刻を含みます。

### RESTful API 経由\{#via-restful-api}

オンデマンドクラスターのキープウォームスケジュールの作成、更新、表示、有効化、無効化、削除を行うことができます。

#### キープウォームスケジュールを作成または更新する\{#create-or-update-a-keep-warm-schedule}

キープウォームスケジュールを作成または更新するときは、ルールの完全なリストを送信します。Zilliz Cloud は、1 回の操作で既存のルールを送信されたルールに置き換えます。

次の例では、平日の `09:00` から `18:00` までのキープウォームスケジュールを作成します。

```bash

```

応答例:

```bash

```

#### キープウォームスケジュールを表示する\{#view-a-keep-warm-schedule}

次の例では、オンデマンドクラスターのキープウォームスケジュールを確認します。

```bash

```

応答例:

```json

```

スケジュールが構成されていない場合、リクエストは成功し、`configured` として `false` を返します。

#### キープウォームスケジュールを有効化または無効化する\{#enable-or-disable-a-keep-warm-schedule}

キープウォームスケジュールを有効化または無効化するには、完全なルールセットと目的の `enabled` 値を指定して PUT リクエストを送信します。

<Admonition type="info" title="Note">

スケジュールを無効化しても、構成済みのすべてのルールは保持されます。オンデマンドクラスターがキープウォーム期間中の場合、Zilliz Cloud は直ちにキープウォームモードを終了します。スケジュールはオンデマンドクラスターをサスペンドしません。

</Admonition>

次の例では、既存のキープウォームスケジュールを無効化します。

```bash

```

応答例:

```bash

```

#### キープウォームスケジュールを削除する\{#delete-a-keep-warm-schedule}

キープウォームスケジュールを削除すると、スケジュールとすべてのルールが削除されます。オンデマンドクラスター、データ、イベント、監査記録は削除されません。

```bash

```

応答例:

```json

```

### Web コンソール経由\{#via-web-console}

![EnHUwxZCUhT8hlbvMJRchiAQnfY](https://zdoc-images.s3.us-west-2.amazonaws.com/EnHUwxZCUhT8hlbvMJRchiAQnfY.png)

<Procedures>

1. 対象のオンデマンドクラスターに移動します。

1. **Actions** メニューを開き、**Manage Keep-warm Schedule** をクリックします。

1. **Enable Keep-warm Schedule** をオンにします。

1. **Schedule Rules** で、1つ以上の週次ルールを追加します。

1. 各ルールについて、繰り返し曜日、開始時刻、終了時刻を構成します。

1. 次の切り替え時刻を確認します。

1. **Save** をクリックします。

</Procedures>

クラスター詳細ページには、キープウォームスケジュールのステータスが **On**、**Off**、**Not configured**、**Schedule unavailable** のいずれかで表示されます。スケジュールが構成されている場合は、ルール数、システムタイムゾーン、次の切り替え時刻も表示されます。

オンデマンドクラスターが現在キープウォーム期間中の場合、ページにはプライマリのクラスターステータスの横にセカンダリの **Keep-warm** タグが表示されます。

![IF04w32RNhEbr7b8OBUcM8n3nnc](https://zdoc-images.s3.us-west-2.amazonaws.com/IF04w32RNhEbr7b8OBUcM8n3nnc.png)

スケジュールを無効化しても、構成済みのすべてのルールは保持されます。オンデマンドクラスターがキープウォーム期間中の場合、Zilliz Cloud は直ちにキープウォームモードを終了します。スケジュールはオンデマンドクラスターをサスペンドしません。キープウォームスケジュールを無効化するには、以下に示すように **Enable Keep-warm Schedule** をオフにして **Save** をクリックします。

![OzydwQkLjhVsoBbckHzciUAbnmc](https://zdoc-images.s3.us-west-2.amazonaws.com/OzydwQkLjhVsoBbckHzciUAbnmc.png)

スケジュールを削除すると、すべてのルールが完全に削除されます。キープウォームスケジュールを削除するには、以下に示すように **Delete Schedule** をクリックし、操作を確定します。

![SBkEwV2bihQXhDbdTlIcnnYknSd](https://zdoc-images.s3.us-west-2.amazonaws.com/SBkEwV2bihQXhDbdTlIcnnYknSd.png)

</NextChannel>

## オンデマンドクラスターを削除する\{#drop-an-on-demand-cluster}

<Admonition type="danger" title="Danger">

オンデマンドクラスターを削除すると、直ちに削除され、復元できません。この操作は取り消せません。

</Admonition>

### RESTful API 経由\{#via-restful-api}

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

応答例:

```bash
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

1. **On-Demand Compute > クラスター** に移動します。

1. 対象のオンデマンドクラスターを選択します。

1. クラスターを削除し、操作を確定します。

</Procedures>

## 関連トピック\{#related-topics}

- オンデマンドクラスターを作成するには、[Create On-Demand Cluster](./on-demand-cluster) を参照してください。

- プロジェクトエンドポイント経由で接続するには、[Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。
