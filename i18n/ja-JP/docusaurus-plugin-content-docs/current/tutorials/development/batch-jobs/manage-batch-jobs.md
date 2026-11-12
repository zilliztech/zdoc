---
title: "バッチジョブの管理 | Cloud"
slug: /manage-batch-jobs
sidebar_label: "バッチジョブの管理"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "バッチジョブは非同期で実行され、送信から完了までの間に複数の状態を遷移します。このページでは、ジョブのライフサイクルについて説明したうえで、ジョブの一覧表示、ジョブの詳細の取得、およびキャンセル可能な状態にあるジョブのキャンセル方法を説明します。 | Cloud"
type: origin
token: LYncwOT8Mi9Lfqk9asdcNPvFnWe
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# バッチジョブの管理

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、対象となるすべての AWS リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

</FeatureNote>

バッチジョブは非同期で実行され、送信から完了までの間に複数の状態を遷移します。このページでは、ジョブのライフサイクルについて説明したうえで、ジョブの一覧表示、ジョブの詳細の取得、およびキャンセル可能な状態にあるジョブのキャンセル方法を説明します。

## ジョブの状態を理解する\{#understand-job-states}

次の図は、ジョブのライフサイクルとキャンセルフローを示しています。

![SWfawcEqhhLaP2bltqkcy9bUn8g](https://zdoc-images.s3.us-west-2.amazonaws.com/SWfawcEqhhLaP2bltqkcy9bUn8g.png)

ジョブは通常、`PENDING` から `PREPARING`、次に `RUNNING` へと進み、その後終了状態に達します。 

`PENDING`、`PREPARING`、または `RUNNING` のジョブはキャンセルリクエストを受け付けますが、`SUCCEEDED`、`FAILED`、または `TIMEOUT` に達したジョブはキャンセルできません。すでにキャンセルフローにあるジョブに対する繰り返しのキャンセルリクエストは、冪等に処理されます。

## リージョン内のバッチジョブを一覧表示する\{#list-batch-jobs-in-a-region}

特定のリージョン内のバッチジョブを一覧表示すると、アクセス可能なプロジェクト全体で送信されたジョブを確認できます。リクエストには、リージョン ID と `type=SPARK` が必要です。オプションのフィルターを組み合わせて、状態、ジョブ名のプレフィックス、または作成時刻で結果を絞り込むことができます。

### リクエストの例\{#request-examples}

次の例では、`aws-us-west-2` 内でアクセス可能なすべてのプロジェクトのバッチジョブを一覧表示します。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs?type=SPARK&regionId=aws-us-west-2" \
  --header "Authorization: Bearer ${API_KEY}"
```

結果を絞り込むには、1 つ以上のオプションのフィルターを追加します。次の例では、名前が **`pk-dedup`** で始まる **`aws-us-west-2`** 内の **実行中** のバッチジョブを一覧表示します。1 ページあたり最大 **50** 件のジョブを返します。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs" \
  --get \
  --data-urlencode "type=SPARK" \
  --data-urlencode "regionId=aws-us-west-2" \
  --data-urlencode "status=RUNNING" \
  --data-urlencode "pageSize=50" \
  --header "Authorization: Bearer ${API_KEY}"
```

### 結果をフィルターする\{#filter-the-results}

次の表に、ジョブ一覧リクエストに適用できるフィルターを示します。

| パラメーター | 必須 | 説明 |
| --- | --- | --- |
| `type` | はい | ジョブの種類です。このパラメーターには `SPARK` を指定します。 |
| `regionId` | はい | バッチジョブを一覧表示するリージョンの ID です。 |
| `status` | いいえ | `PENDING`、`RUNNING`、`SUCCEEDED` などの状態でジョブを絞り込みます。 |
| `createdAfter` | いいえ | 指定した ISO 8601 タイムスタンプより後に作成されたジョブを返します。たとえば、`2026-07-30T00:00:00Z` です。 |
| `createdBefore` | いいえ | 指定した ISO 8601 タイムスタンプより前に作成されたジョブを返します。 |
| `pageSize` | いいえ | 1 ページあたりに返すジョブの数です。デフォルトは `20` で、有効範囲は `1`～`100` です。 |
| `pageToken` | いいえ | 前回のレスポンスで `nextPageToken` として返されたページネーショントークンです。 |

オプションのフィルターは、上記のリクエスト例に示すように、同じリクエスト内で組み合わせることができます。

### 結果をページネーションする\{#paginate-through-the-results}

レスポンスに `nextPageToken` が含まれている場合は、その値を次のリクエストの `pageToken` として渡します。`nextPageToken` が存在しないか空になるまで繰り返します。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NEXT_PAGE_TOKEN="token-returned-by-the-previous-request"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs" \
  --get \
  --data-urlencode "type=SPARK" \
  --data-urlencode "regionId=aws-us-west-2" \
  --data-urlencode "pageSize=20" \
  --data-urlencode "pageToken=${NEXT_PAGE_TOKEN}" \
  --header "Authorization: Bearer ${API_KEY}"
```

### レスポンスを理解する\{#understand-the-response}

成功したレスポンスでは、一致するジョブの総数、現在のページのジョブ、およびさらに結果がある場合に次のページを取得するためのトークンが返されます。

```json
{
  "code": 0,
  "data": {
    "total": 2,
    "items": [
      {
        "jobId": "job-xxxxxxxx",
        "projectId": "proj-xxxxxxxx",
        "type": "SPARK",
        "description": "backfill product attributes",
        "status": "RUNNING",
        "regionId": "aws-us-west-2",
        "clusterId": "in-xxxxxxxx",
        "createdAt": "2026-08-21T02:00:00Z",
        "startedAt": "2026-08-21T02:01:00Z",
        "finishedAt": null,
        "durationSeconds": null
      }
    ],
    "nextPageToken": "opaque-token"
  }
}
```

レスポンスの内容は次のとおりです。

- `total`: リクエストのフィルターに一致するジョブの総数。

- `items`: 現在のページで返されたバッチジョブ。

- `nextPageToken`: 次のページを取得するために使用するトークン。これ以上結果がない場合、このフィールドは存在しないか空です。

レスポンス内のパラメーターの詳細については、リファレンスページ [List batch jobs](/reference/restful/list-spark-jobs-v2) を参照してください。

## プロジェクト内のバッチジョブの詳細を表示する\{#view-a-batch-job-details-in-a-project}

ジョブ ID と、そのジョブが送信されたプロジェクトのプロジェクト ID を指定すると、バッチジョブの詳細を取得できます。

### リクエストの例\{#request-example}

```bash
export PROJECT_ID="proj-xxxxxxxxxxxxxxxxxxxxxxx"
export JOB_ID="job-xxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/projects/${PROJECT_ID}/jobs/${JOB_ID}" \
  --header "Authorization: Bearer ${API_KEY}"
```

### レスポンスを理解する\{#understand-the-response}

次の例は、失敗した K-Means クラスタリングジョブに対する成功した API レスポンスを示しています。

```json
{
  "code": 0,
  "data": {
    "jobId": "job-xxxxxxxx",
    "projectId": "proj-xxxxxxxx",
    "type": "SPARK",
    "description": "backfill product attributes",
    "status": "FAILED",
    "regionId": "aws-us-west-2",
    "clusterId": "in-xxxxxxxx",
    "artifact": null,
    "details": {
      "dbName": "default",
      "collectionName": "products",
      "input": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "backfill/products.parquet",
        "format": "parquet"
      },
      "fields": ["title", "price", "embedding"],
      "columnMapping": {
        "source_id": "id",
        "source_title": "title",
        "source_price": "price",
        "source_embedding": "embedding"
      },
      "mode": "coalesce",
      "resourceSize": "SMALL"
    },
    "precheckReport": null,
    "failureReason": {
      "code": "SPARK_EXECUTION_FAILED",
      "message": "The Spark job failed.",
      "retryable": false
    },
    "createdAt": "2026-08-21T02:00:00Z",
    "submittedAt": "2026-08-21T02:00:30Z",
    "startedAt": "2026-08-21T02:01:00Z",
    "finishedAt": "2026-08-21T02:10:00Z",
    "durationSeconds": 540
  }
}
```

レスポンスの内容は次のとおりです。

- **ジョブの状態と識別情報**: `jobId`、`jobName`、`status`、`regionId`、およびアプリケーションの識別子。

- **診断情報**: `failureReason`、履歴リンク、および利用可能な場合のドライバーログ URI。

- **出力契約**: オペレーター、出力形式、書き込みモード、入力列が保持されるかどうか、およびジョブによって生成された列。

- **タイミング情報**: ジョブの作成、キューイング、送信、実行、完了のタイムスタンプ。

失敗したジョブでは、まず `failureReason` を確認し、その後、より詳細なトラブルシューティングを行うために履歴またはドライバーログのリンクを使用してください。

### 出力契約を理解する\{#understand-the-output-contract}

次の表に、`outputContract` エンベロープ内のフィールドを示します。

| フィールド | 説明 |
| --- | --- |
| `operator` | バッチジョブによって実行される組み込みオペレーターです（`kmeans`、`pk_deduplicate`、`vector_deduplicate`、`anomaly_detection` など）。 |
| `outputFormat` | 生成される出力の実際の形式です。通常、ジョブリクエストの `output.format` と一致します。 |
| `writeMode` | 設定された出力パスがすでに存在する場合に使用される動作です。 |
| `preservesInputColumns` | 出力に入力データセットの元の列が保持されるかどうかを示します。 |
| `generatedColumns` | ジョブによって追加される列です。たとえば、K-Means クラスタリングの場合は `cluster_id`、異常検知の場合は `outlier_score` です。 |

たとえば、`preservesInputColumns` が `true` に設定され、`generatedColumns` に `cluster_id` が含まれる K-Means ジョブでは、元のデータセットにクラスター割り当て列が追加された出力が生成されます。

## バッチジョブをキャンセルする\{#cancel-a-batch-job}

`PENDING`、`PREPARING`、または `RUNNING` のジョブに対してキャンセルリクエストを送信できます。

### リクエストの例\{#request-example}

```bash
export PROJECT_ID="proj-xxxxxxxxxxxxxxxxxxxxxxx"
export JOB_ID="job-xxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/projects/${PROJECT_ID}/jobs/${JOB_ID}/cancel" \
  --header "Authorization: Bearer ${API_KEY}"
```

### キャンセルリクエストの動作を理解する\{#understand-the-cancel-request-behaviors}

キャンセルの動作は、ジョブの現在の状態によって異なります。終了状態にないジョブはキャンセルリクエストを受け付けます。次の表に、ジョブの状態と、それらの状態でキャンセルリクエストを受信したときの対応する動作を示します。

| 現在の状態 | キャンセルリクエストの動作 |
| --- | --- |
| `PENDING`, `PREPARING`, `RUNNING` | `202 Accepted` を返し、ジョブをキャンセルフローに移行します。 |
| `CANCELLING` | 既存のキャンセル処理を継続します。 |
| `CANCELED` | 別のキャンセル操作を開始せずに、現在のジョブを返します。 |
| `SUCCEEDED`, `FAILED`, `TIMEOUT` | 状態エラーでリクエストを拒否します。 |
