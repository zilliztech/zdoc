---
title: "Spark バッチジョブの管理 | Cloud"
slug: /manage-spark-batch-jobs
sidebar_label: "Spark バッチジョブの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark バッチジョブは非同期で実行され、送信から完了まで複数の状態を遷移します。このページでは、ジョブのライフサイクルについて説明し、ジョブの一覧表示、詳細の取得、およびキャンセル可能な状態にあるジョブのキャンセル方法をご紹介します。 | Cloud"
type: origin
token: LYncwOT8Mi9Lfqk9asdcNPvFnWe
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Spark バッチジョブの管理

Spark バッチジョブは非同期で実行され、送信から完了まで複数の状態を遷移します。このページでは、ジョブのライフサイクルについて説明し、ジョブの一覧表示、詳細の取得、およびキャンセル可能な状態にあるジョブのキャンセル方法をご紹介します。

## ジョブの状態を理解する\{#understand-job-states}

次の図は、ジョブのライフサイクルとキャンセルフローを示しています。

![SWfawcEqhhLaP2bltqkcy9bUn8g](https://zdoc-images.s3.us-west-2.amazonaws.com/SWfawcEqhhLaP2bltqkcy9bUn8g.png)

ジョブは通常、`PENDING` から `PREPARING`、そして `RUNNING` へと遷移し、最終状態に到達します。

`PENDING`、`PREPARING`、または `RUNNING` の状態にあるジョブはキャンセルリクエストを受け付けますが、`SUCCEEDED`、`FAILED`、または `TIMEOUT` に到達したジョブはキャンセルできません。すでにキャンセルフローに入っているジョブへの重複するキャンセルリクエストは、冪等に処理されます。

## リージョン内の Spark バッチジョブを一覧表示する\{#list-spark-batch-jobs-in-a-region}

特定のリージョン内の Spark バッチジョブを一覧表示することで、アクセス権限のあるプロジェクト全体から送信されたジョブを検索できます。リクエストにはリージョン ID と `type=SPARK` が必要です。オプションのフィルターを組み合わせることで、状態、ジョブ名のプレフィックス、作成時刻に基づいて結果を絞り込めます。

### リクエスト例\{#request-examples}

次の例では、`aws-us-west-2` において、アクセス可能な全プロジェクトの Spark バッチジョブを一覧表示します。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs?type=SPARK&regionId=aws-us-west-2" \
  --header "Authorization: Bearer ${API_KEY}"
```

結果を絞り込むには、1 つ以上のオプションフィルターを追加します。次の例では、**aws-us-west-2** リージョンで名前が **pk-dedup** で始まる **running** 状態の Spark バッチジョブを一覧表示し、1 ページあたり最大 **50** 件のジョブを返します。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/jobs" \
  --get \
  --data-urlencode "type=SPARK" \
  --data-urlencode "regionId=aws-us-west-2" \
  --data-urlencode "state=RUNNING" \
  --data-urlencode "jobNamePrefix=pk-dedup" \
  --data-urlencode "pageSize=50" \
  --header "Authorization: Bearer ${API_KEY}"
```

### 結果の絞り込み\{#filter-the-results}

次の表に、ジョブ一覧リクエストで使用可能なフィルターを示します。

| パラメーター | 必須 | 説明 |
| --- | --- | --- |
| `type` | はい | ジョブの種類です。このパラメーターには `SPARK` を指定します。 |
| `regionId` | はい | Spark バッチジョブを一覧表示する対象のリージョン ID です。 |
| `state` | いいえ | `PENDING`、`RUNNING`、`SUCCEEDED` などの状態でジョブを絞り込みます。 |
| `jobNamePrefix` | いいえ | 指定したプレフィックスで始まる名前のジョブを絞り込みます。 |
| `createdAfter` | いいえ | `2026-07-30T00:00:00Z` など、指定した ISO 8601 タイムスタンプ以降に作成されたジョブを返します。 |
| `createdBefore` | いいえ | 指定した ISO 8601 タイムスタンプ以前に作成されたジョブを返します。 |
| `pageSize` | いいえ | 1 ページあたりに返すジョブの数です。デフォルトは `20` で、有効範囲は `1` から `100` です。 |
| `pageToken` | いいえ | 直前のレスポンスで `nextPageToken` として返されたページネーショントークンです。 |

上記のリクエスト例のように、同じリクエスト内で複数のオプションフィルターを組み合わせることができます。

### 結果のページネーション\{#paginate-through-the-results}

レスポンスに `nextPageToken` が含まれる場合は、その値を次のリクエストで `pageToken` として渡してください。`nextPageToken` が存在しないか空になるまで繰り返します。

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

### レスポンスの内容\{#understand-the-response}

正常なレスポンスには、条件に一致するジョブの総数、現在のページのジョブ一覧、および追加の結果がある場合に次のページを取得するためのトークンが含まれます。

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

レスポンスには以下の項目が含まれます。

- `total`: リクエストフィルターに一致するジョブの総数です。

- `items`: 現在のページに含まれる Spark バッチジョブです。

- `nextPageToken`: 次のページを取得するためのトークンです。これ以上結果がない場合、このフィールドは存在しないか空になります。

レスポンスのパラメーターの詳細については、リファレンスの [Spark バッチジョブの一覧表示](/reference/restful/list-spark-batch-jobs) を参照してください。

## プロジェクト内の Spark バッチジョブの詳細を表示する\{#view-a-spark-batch-job-details-in-a-project}

ジョブ ID と、ジョブが送信されたプロジェクト ID を指定して、Spark バッチジョブの詳細を取得できます。

### リクエスト例\{#request-example}

```bash
export PROJECT_ID="proj-xxxxxxxxxxxxxxxxxxxxxxx"
export JOB_ID="job-xxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
  --url "https://api.cloud.zilliz.com/v2/projects/${PROJECT_ID}/spark/jobs/${JOB_ID}" \
  --header "Authorization: Bearer ${API_KEY}"
```

### レスポンスの内容\{#understand-the-response}

次の例は、失敗した K-Means クラスタリングジョブに対する API レスポンス（ステータスコード 200）を示しています。

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

レスポンスには以下の項目が含まれます。

- **ジョブの状態と識別情報**: `jobId`、`jobName`、`status`、`regionId`、および Spark アプリケーション識別子です。

- **診断情報**: `failureReason`、Spark History のリンク、および利用可能な場合はドライバーログ URI です。

- **出力契約**: オペレーター、出力形式、書き込みモード、入力列の保持有無、およびジョブによって生成された列です。

- **タイミング情報**: ジョブの作成、キューイング、送信、実行、完了の各タイムスタンプです。

ジョブが失敗した場合は、まず `failureReason` を確認し、その後 Spark History やドライバーログのリンクを使用して詳細なトラブルシューティングを行ってください。

### 出力コントラクトについて\{#understand-the-output-contract}

次の表に、`outputContract` エンベロープに含まれるフィールドの一覧を示します。

| フィールド | 説明 |
| --- | --- |
| `operator` | Spark バッチジョブで実行される組み込みオペレーターです。例: `kmeans`、`pk_deduplicate`、`vector_deduplicate`、`anomaly_detection` など。 |
| `outputFormat` | 生成される出力の実際の形式です。通常はジョブリクエスト内の `output.format` と一致します。 |
| `writeMode` | 設定された出力パスがすでに存在する場合の動作を指定します。 |
| `preservesInputColumns` | 出力に入力データセットの元の列が含まれるかどうかを示します。 |
| `generatedColumns` | ジョブによって追加される列です。たとえば、K-Means クラスタリングの場合は `cluster_id`、異常検知の場合は `outlier_score` が追加されます。 |

たとえば、`preservesInputColumns` が `true` に設定され、`generatedColumns` に `cluster_id` が含まれる K-Means ジョブの場合、元のデータセットにクラスター割り当て列が追加されて出力されます。

## Spark バッチジョブをキャンセルする\{#cancel-a-spark-batch-job}

状態が `PENDING`、`PREPARING`、または `RUNNING` のジョブに対しては、キャンセルリクエストを送信できます。

### リクエスト例\{#request-example}

```bash
export PROJECT_ID="proj-xxxxxxxxxxxxxxxxxxxxxxx"
export JOB_ID="job-xxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/projects/${PROJECT_ID}/spark/jobs/${JOB_ID}/cancel" \
  --header "Authorization: Bearer ${API_KEY}"
```

### キャンセルリクエストの動作について\{#understand-the-cancel-request-behaviors}

キャンセル時の動作は、ジョブの現在の状態によって異なります。非終端状態にあるジョブはキャンセルリクエストを受け付けます。次の表に、各状態でのキャンセルリクエスト受信時の動作を示します。

| 現在の状態 | キャンセルリクエストの動作 |
| --- | --- |
| `PENDING`、`PREPARING`、`RUNNING` | `202 Accepted` を返し、ジョブをキャンセルフローに移行します。 |
| `CANCELLING` | 既存のキャンセル処理を継続します。 |
| `CANCELED` | 新たなキャンセル操作を開始せず、現在のジョブ情報を返します。 |
| `SUCCEEDED`、`FAILED`、`TIMEOUT` | 状態エラーを返してリクエストを拒否します。 |

