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

この機能は現在、AWS us-west-2 および Azure East US リージョンでのみ利用できます。他のリージョンでオンデマンドクラスターを使用するには、[お問い合わせ](http://zilliz.com/contact-sales)ください。

</FeatureNote>

このガイドでは、Zilliz Cloud でオンデマンドクラスターを表示、確認、削除する方法について説明します。

オンデマンドクラスターは、オンデマンド検索ワークロード向けにコンピューティングリソースを提供します。リクエストの受信時に起動し、アイドル状態になると、クラスター作成時に設定された自動サスペンドタイムアウトに基づいてゼロまでスケールダウンします。

オンデマンドクラスターを管理するには、対象プロジェクトの Project Admin である必要があります。ロールと権限の詳細については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

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

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

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

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

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

- **Web コンソールを使用する場合**

    <Procedures>

    1. 対象のオンデマンドクラスターに移動します。

    1. 説明にカーソルを合わせ、**Edit description** アイコンをクリックします。

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. クラスターの新しい説明を入力し、**Save** をクリックします。

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## オンデマンドクラスターの変更\{#modify-an-on-demand-cluster}

オンデマンドクラスターの名前、説明、自動サスペンド設定など、各種設定を変更できます。

- **RESTful API を使用する場合**

    既存のオンデマンドクラスターについて、名前、説明、自動サスペンド時間、クエリ CU 数を変更できます。詳細については、[Update On-Demand クラスター](/reference/restful/update-on-demand-cluster-v2) を参照してください。

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

- **Web コンソールを使用する場合**

    Web コンソールから、既存のオンデマンドクラスターのクラスター名、説明、自動サスペンド時間、クエリ CU 数を変更できます。

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## keep-warm スケジュールの構成\{#configure-a-keep-warm-schedule}

keep-warm スケジュールは、毎週繰り返される一定の時間帯にオンデマンドクラスターを稼働させ続けます。keep-warm ウィンドウが開始されると、Zilliz Cloud はオンデマンドクラスターがサスペンド状態であれば再開します。ウィンドウ中は `Auto Suspend` が抑制されます。ウィンドウが終了すると、オンデマンドクラスターは既存の自動サスペンドポリシーに再び従います。

keep-warm スケジュールは `Auto Suspend` を永続的に無効化するものではなく、keep-warm ウィンドウが終了したときにオンデマンドクラスターを能動的にサスペンドするものでもありません。

<Admonition type="info" title="Note">

keep-warm ウィンドウ中にオンデマンドクラスターをサスペンドするには、先に keep-warm スケジュールを無効化または削除してください。

</Admonition>

各オンデマンドクラスターが持てる keep-warm スケジュールは 1 つです。スケジュールには週次ルールを 1 ～ 5 件含めることができます。各ルールは組織のシステムタイムゾーンを使用し、曜日、開始時刻、終了時刻を含みます。

### RESTful API を使用する場合\{#via-restful-api}

オンデマンドクラスターの keep-warm スケジュールは、作成、更新、表示、有効化、無効化、削除できます。

#### keep-warm スケジュールの作成または更新\{#create-or-update-a-keep-warm-schedule}

keep-warm スケジュールを作成または更新する場合は、ルールの完全なリストを送信します。Zilliz Cloud は、送信されたルールで既存のルールを 1 回の操作で置き換えます。

次の例では、平日の `09:00` から `18:00` までの keep-warm スケジュールを作成します。

```bash

```

レスポンス例:

```bash

```

#### keep-warm スケジュールの表示\{#view-a-keep-warm-schedule}

次の例では、オンデマンドクラスターの keep-warm スケジュールを確認します。

```bash

```

レスポンス例:

```json

```

スケジュールが構成されていない場合、リクエストは成功し、`configured` として `false` を返します。

#### keep-warm スケジュールの有効化または無効化\{#enable-or-disable-a-keep-warm-schedule}

keep-warm スケジュールを有効化または無効化するには、ルールセット全体と目的の `enabled` 値を指定して PUT リクエストを送信します。

<Admonition type="info" title="Note">

スケジュールを無効化しても、構成済みのルールはすべて保持されます。オンデマンドクラスターが keep-warm ウィンドウ内にある場合、Zilliz Cloud は直ちに keep-warm モードを終了します。スケジュールによってオンデマンドクラスターがサスペンドされることはありません。

</Admonition>

次の例では、既存の keep-warm スケジュールを無効化します。

```bash

```

レスポンス例:

```bash

```

#### keep-warm スケジュールの削除\{#delete-a-keep-warm-schedule}

keep-warm スケジュールを削除すると、スケジュールとすべてのルールが削除されます。オンデマンドクラスター、データ、イベント、監査レコードは削除されません。

```bash

```

レスポンス例:

```json

```

### Web コンソールを使用する場合\{#via-web-console}

![EnHUwxZCUhT8hlbvMJRchiAQnfY](https://zdoc-images.s3.us-west-2.amazonaws.com/EnHUwxZCUhT8hlbvMJRchiAQnfY.png)

<Procedures>

1. 対象のオンデマンドクラスターに移動します。

1. **Actions** メニューを開き、**Manage Keep-warm Schedule** をクリックします。

1. **Enable Keep-warm Schedule** をオンにします。

1. **Schedule Rules** で週次ルールを 1 つ以上追加します。

1. 各ルールについて、繰り返す曜日、開始時刻、終了時刻を構成します。

1. 次回の切り替え時刻を確認します。

1. **Save** をクリックします。

</Procedures>

クラスターの詳細ページには、keep-warm スケジュールのステータスが **On**、**Off**、**Not configured**、**Schedule unavailable** のいずれかで表示されます。スケジュールが構成されている場合は、ルール数、システムタイムゾーン、次回の切り替え時刻も表示されます。

オンデマンドクラスターが現在 keep-warm ウィンドウ内にある場合、ページにはプライマリのクラスターステータスの隣に、セカンダリの **Keep-warm** タグが表示されます。

![IF04w32RNhEbr7b8OBUcM8n3nnc](https://zdoc-images.s3.us-west-2.amazonaws.com/IF04w32RNhEbr7b8OBUcM8n3nnc.png)

スケジュールを無効化しても、構成済みのルールはすべて保持されます。オンデマンドクラスターが keep-warm ウィンドウ内にある場合、Zilliz Cloud は直ちに keep-warm モードを終了します。スケジュールによってオンデマンドクラスターがサスペンドされることはありません。keep-warm スケジュールを無効化するには、以下に示すように **Enable Keep-warm Schedule** をオフにして **Save** をクリックします。

![OzydwQkLjhVsoBbckHzciUAbnmc](https://zdoc-images.s3.us-west-2.amazonaws.com/OzydwQkLjhVsoBbckHzciUAbnmc.png)

スケジュールを削除すると、すべてのルールが完全に削除されます。keep-warm スケジュールを削除するには、以下に示すように **Delete Schedule** をクリックし、操作を確定します。

![SBkEwV2bihQXhDbdTlIcnnYknSd](https://zdoc-images.s3.us-west-2.amazonaws.com/SBkEwV2bihQXhDbdTlIcnnYknSd.png)

## オンデマンドクラスターの削除\{#drop-an-on-demand-cluster}

<Admonition type="danger" title="Danger">

オンデマンドクラスターを削除すると、即座に除去され、復元することはできません。この操作は取り消せません。

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

1. **On-Demand Compute > クラスター** に移動します。

1. 対象のオンデマンドクラスターを選択します。

1. クラスターを削除し、操作を確定します。

</Procedures>

## 関連トピック\{#related-topics}

- オンデマンドクラスターを作成するには、[オンデマンドクラスターの作成](./on-demand-cluster) を参照してください。

- プロジェクトエンドポイント経由で接続するには、[オンデマンド検索への接続](./connect-for-on-demand-search) を参照してください。

