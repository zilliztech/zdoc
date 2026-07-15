---
title: "クラスター | Cloud"
slug: /on-demand-cluster
sidebar_key: on-demand-cluster
sidebar_label: "クラスター"
beta: PUBLIC
notebook: FALSE
description: "クラスターは、ベクトルデータベースのワークロードを実行するコンピュートリソースの集合です。Zilliz Cloud には、常時稼働して低レイテンシーアクセスが必要な本番ワークロードを処理する Serving クラスターと、リクエストの到着時に起動し、アイドル時にゼロまでスケールするオンデマンドクラスターの2種類があります。 | Cloud"
type: origin
token: XFoiwC15Jiu5LAkUeuVcvbconDR
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - オンデマンドコンピュート
  - クラスター

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# オンデマンドクラスター

オンデマンドクラスターは、オンデマンドの検索およびクエリワークロードにコンピュートリソースを提供します。リクエストが到着すると起動し、アイドル状態になるとゼロまでスケールダウンするため、バッチ検索、検証、探索、常時稼働のサービスを必要としないワークロードに適しています。

## 前提条件

オンデマンドクラスターを作成する前に、次の条件を満たしていることを確認してください。

- 対象プロジェクトの **Project Admin** であること。ロールと権限の詳細については、[プロジェクトユーザーの管理](./project-users)を参照してください。
- オンデマンドクラスターを作成するプロジェクトの ID を取得していること。
- プロジェクト内のリソースを管理する権限を持つ API キーを取得していること。
- プロジェクトとオンデマンドクラスターが同じリージョンにあること。現在サポートされているリージョンは `aws-us-west-2` と `az-eastus` です。

## 制限事項

| 制限 | 説明 |
| ----- | ----------- |
| プロジェクトタイプ | オンデマンドクラスターは Enterprise プロジェクトでのみ利用できます。 |
| リージョン | 現在、オンデマンドクラスターを作成できるのは `aws-us-west-2` と `az-eastus` のみです。 |
| 権限 | オンデマンドクラスターを管理するには、Project Admin である必要があります。 |
| クラスター数 | 各プロジェクトには最大20個のオンデマンドクラスターを作成できます。 |
| データ量 | オンデマンドクラスターは、8 CU ごとに最大 3 TB の生データをクエリできます。この制限を超えるクエリはエラーを返します。 |

## オンデマンドクラスターの作成

Zilliz Cloud コンソールまたは RESTful API を使用してオンデマンドクラスターを作成できます。

### RESTful API を使用する場合\{#via-restful-api}

次の例では、オンデマンドクラスターを作成します。詳細については、[Create On-Demand Cluster (V2)](/reference/restful/create-on-demand-cluster-v2)を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60,
    "description": "A cluster for vector search workloads."
}'
```

次の表は各パラメータについて説明しています。

| パラメータ | 説明 |
| --------- | ----------- |
| `projectId` | オンデマンドクラスターを作成するプロジェクトの ID。 |
| `regionId` | オンデマンドクラスターをデプロイするリージョン。リージョンはプロジェクトのリージョンと一致している必要があります。現在は `aws-us-west-2` または `az-eastus` を使用します。 |
| `clusterName` | 作成するオンデマンドクラスターの名前。 |
| `cuSize` | 割り当てるクエリ CU の数。クラスターはワークロードに応じてゼロからこの値まで自動的にスケールします。最小値は 8 CU、最大値は 256 CU で、8 単位で指定します。この値は作成後に変更できません。 |
| `autoSuspend` | クラスターが自動一時停止するまでのアイドルタイムアウト（秒）。この期間中にリクエストを受信しなかった場合、コンピュートコストの発生を停止するためクラスターが一時停止します。最小値とデフォルト値はいずれも60秒です。 |
| `description`（任意） | 作成するオンデマンドクラスターの説明。最大255文字。 |

出力例は次のとおりです。

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted. The on-demand cluster is being created. Use the Describe On-Demand Cluster API to check its creation progress and status. Once the cluster status is RUNNING, use your API key to access the on-demand cluster."
    }
}
```

### Web コンソールを使用する場合\{#via-web-console}

<Supademo id="cmo9gv84436szl2dy975hyhsh" title=""  />

<Procedures>

1. **On-Demand Compute > Clusters** をクリックします。

1. **+ Cluster** をクリックします。

1. クラスター設定を構成します。

    次の表は各パラメータについて説明しています。

    <table>
        <tr>
          <th><p><strong>パラメータ</strong></p></th>
          <th><p><strong>説明</strong></p></th>
        </tr>
        <tr>
          <td><p>Cluster Name</p></td>
          <td><p>作成するクラスターの名前。</p></td>
        </tr>
        <tr>
          <td><p>Cluster Description</p></td>
          <td><p>作成するオンデマンドクラスターの説明。最大255文字。</p></td>
        </tr>
        <tr>
          <td><p>Query CU</p></td>
          <td><p>割り当てるクエリ CU の数。クラスターはワークロードに応じてゼロからこの値まで自動的にスケールします。リクエストが到着すると指定した CU サイズまで起動し、アイドル時にはゼロまでスケールダウンします。</p><p>最小値は 8 CU、最大値は 256 CU で、8 単位（8、16、24 など）で指定します。8 CU を超えるクラスターには支払い方法の登録が必要です。</p><p>8 に設定すると、最大 3 TB のデータを検索できます。データ量を増やすには CU サイズを増やしてください。</p><p>この値は作成後に変更できません。</p></td>
        </tr>
        <tr>
          <td><p>Auto suspend</p></td>
          <td><p>クラスターが自動一時停止するまでのアイドル時間（秒）。デフォルトは1分です。この期間中にリクエストを受信しなかった場合、コンピュートコストの発生を停止するためクラスターが一時停止します。</p></td>
        </tr>
    </table>

1. **Create** をクリックします。

</Procedures>

## オンデマンドクラスターの更新\{#update-on-demand-cluster}

オンデマンドクラスターの名前、説明、および `autoSuspend` 設定を更新できます。

### RESTful API を使用する場合\{#via-restful-api}

次の例では、オンデマンドクラスターを更新します。詳細については、[Update On-Demand Cluster (V2)](/reference/restful/update-on-demand-cluster-v2)を参照してください。

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

出力例は次のとおりです。

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
    }
}
```

### Web コンソールを使用する場合\{#via-web-console}

Web コンソールでは、既存のオンデマンドクラスターの名前、説明、自動一時停止時間を変更できます。

![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## すべてのオンデマンドクラスターの表示\{#view-all-on-demand-clusters}

### RESTful API を使用する場合\{#via-restful-api}

すべてのオンデマンドクラスターを一覧表示するには、次のリクエストを使用します。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
      --url "{BASE_URL}/v2/clusters/onDemandClusters?projectId={PROJECT_ID}&regionId=aws-us-west-2" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json"
```

出力例は次のとおりです。

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
        "createdBy": "admin@zilliz.com",
        "createTime": 1745396115000
      }
    ]
  }
}
```

### Web コンソールを使用する場合\{via-web-console}

![WPOBwHulYhQPRIbgpjJcrAfXnVc](https://zdoc-images.s3.us-west-2.amazonaws.com/WPOBwHulYhQPRIbgpjJcrAfXnVc.png)

## オンデマンドクラスターの詳細確認\{#check-the-details-of-an-on-demand-cluster}

### RESTful API を使用する場合\{#via-restful-api}

オンデマンドクラスターの詳細を取得するには、次のリクエストを使用します。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
      --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json"
```

出力例は次のとおりです。

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "clusterName": "xxx",
    "regionId": "aws-us-west-2",
    "cuSize": 8,
    "status": "RUNNING",
    "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com",
    "privateLink": "",
    "createdBy": "admin@zilliz.com",
    "createTime": 1745396115000
  }
}
```

### Web コンソールを使用する場合\{via-web-console}

![NDpWwXSknh7FMibTGjNcwg8Vnjf](https://zdoc-images.s3.us-west-2.amazonaws.com/NDpWwXSknh7FMibTGjNcwg8Vnjf.png)

## オンデマンドクラスターの削除\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Warning">

クラスターを削除すると、直ちに完全に削除され、復元できません。この操作は元に戻せません。

</Admonition>

### RESTful API を使用する場合\{#via-restful-api}

オンデマンドクラスターを削除するには、次のリクエストを使用します。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request DELETE \
      --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json"
```

出力例は次のとおりです。

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "status": "DELETING"
  }
}
```

### Web コンソールを使用する場合\{via-web-console}

![Vu38wTpLDhmRqYbmYFVcbjK5nVx](https://zdoc-images.s3.us-west-2.amazonaws.com/Vu38wTpLDhmRqYbmYFVcbjK5nVx.png)
