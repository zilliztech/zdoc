---
title: "データバックフィル | Cloud"
slug: /data-backfill
sidebar_label: "データバックフィル"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データバックフィルを使用すると、Zilliz Cloud コレクション内の既存エンティティの選択したフィールドを、Zilliz Cloud ボリューム上の Parquet ファイルに保存されたデータを使って更新できます。バックフィルジョブは、入力レコードを主キーによって既存エンティティと照合し、指定したフィールド値をコレクションに書き戻します。新しく追加したフィールドへの値の設定、欠損値の補完、既存フィールド値の一括置換などに使用できます。 | Cloud"
type: origin
token: CdmcwKYHZimNZ2kw5wqcQDDOned
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# データバックフィル

データバックフィルを使用すると、Zilliz Cloud コレクション内の既存エンティティの選択したフィールドを、Zilliz Cloud ボリューム上の Parquet ファイルに保存されたデータを使って更新できます。バックフィルジョブは、入力レコードを主キーによって既存エンティティと照合し、指定したフィールド値をコレクションに書き戻します。新しく追加したフィールドへの値の設定、欠損値の補完、既存フィールド値の一括置換などに使用できます。

稼働中のコレクションのスキーマを進化させるための完全なワークフロー（書き込みの切り替え、スナップショットの作成、過去のエンティティのバックフィル、バックフィルのコミットなど）については、[スキーマ Evolution](./schema-evolution) を参照してください。

## 概要\{#overview}

次の図は、データバックフィル事前チェックとデータバックフィルという、連結して使用できる 2 つの独立した API エンドポイントの手順を示しています。前者はコレクションのデータを変更する前に入力データとバックフィル構成を検証することを目的とし、後者は対象コレクションに対して実際のバックフィルを実行します。

![Eup8wertXhAZVFbM5CncoJP7ndb](https://zdoc-images.s3.us-west-2.amazonaws.com/Eup8wertXhAZVFbM5CncoJP7ndb.png)

### ソースレコードと既存エンティティの照合\{#match-source-records-to-existing-entities}

入力データファイルには、Zilliz Cloud がソースレコードを対象コレクション内の既存エンティティと照合するために使用する `pk` 列が含まれている必要があります。バックフィルするフィールドは、対象コレクションのフィールドと同じ名前を使用するか、`columnMapping` で明示的にマッピングできます。バックフィルでは、リクエストで指定したフィールドのみが更新され、新しいエンティティは挿入されません。

### バックフィル前の検証\{#validate-before-backfill}

バックフィルを実行する前に、同じ入力とフィールド構成を使用して事前チェックを実行できます。事前チェックでは、コレクションのデータを変更することなく、入力スキーマ、必須のソース列、列マッピング、および入力行のサンプルを検証します。事前チェックジョブが成功したからといって、入力が検証に合格したことを意味するわけではありません。バックフィルに進む前に、`precheckReport.passed` が `true` であることを確認してください。

### バックフィルモードの選択\{#choose-a-backfill-mode}

バックフィルジョブを作成する際は、`mode` を使用して入力データを対象フィールドに適用する方法を制御します。

| **モード** | **動作** |
| --- | --- |
| `coalesce` | 照合されたエンティティの NULL の対象フィールドのみをバックフィルします。既存の非 NULL 値は変更されません。<br/>これがデフォルトのモードです。 |
| `overwrite` | 照合されたすべてのエンティティの対象フィールドをバックフィルします。照合されなかったエンティティは変更されません。 |
| `replace` | 照合されたすべてのエンティティの対象フィールドをバックフィルします。照合されなかったエンティティについては、対象フィールドが NULL に設定されます。 |

すでに書き込まれている値を変更せずに欠損値を補完する場合は `coalesce` を使用します。入力データを照合済みのエンティティより優先する場合は `overwrite` を使用します。`replace` は、照合されなかったエンティティの対象フィールドがクリアされるため、入力データが選択したフィールドの完全なデータを表している場合にのみ使用してください。

## 事前準備\{#before-you-start}

データバックフィルの事前チェックおよびデータバックフィルを実行する前に、以下の条件を満たしていることを確認してください。

- 対象コレクションと、バックフィルするフィールドがすでに存在していること。

- ソースデータが Zilliz Cloud ボリューム内のデータファイルに保存されていること。

- 各入力レコードに、既存エンティティとの照合に使用する `pk` 列が含まれていること。

- ソース列名が対象フィールド名と異なる場合は、`columnMapping` を用意しておくこと。

- 対象クラスターと入力ボリュームが同じプロジェクトおよびリージョンに存在すること。

Spark バッチジョブを実行するための一般的な要件（認証、サポートされるファイル形式、入力ファイル、出力動作など）については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## 事前チェック付きのデータバックフィルジョブを作成する\{#create-a-data-backfill-job-with-prechecks}

対象コレクションの主キーに対応する列を含めるように入力データファイルを準備します。ソース列名が対象コレクションの対応するフィールド名と異なる場合は、`columnMapping` を使用して、主キーとバックフィルジョブに含まれるすべてのフィールドの完全なマッピングを指定します。

<Procedures>

1. べき等性キーを準備します。

    べき等性キーとは、同じジョブリクエストを再試行しても変わらない一意の文字列です。詳細については、[べき等性のある送信](./spark-batch-jobs#idempotent-submission) を参照してください。

    事前チェックジョブとバックフィルジョブでは、競合を避けるために異なるべき等性キーを使用してください。

1. 必要に応じて事前チェックを実行します。

    バックフィルを開始する前に、対象コレクションを変更することなく入力データと構成を検証するために、事前チェックを実行できます。任意ですが、事前チェックの実行を推奨します。

    事前チェックのリクエストペイロードは以下の通りです。

    ```bash
    export precheck_payload='{
      "description": "validate backfill data",
      "clusterId": "in-xxxxxxxx",
      "dbName": "default",
      "collectionName": "products",
      "fields": ["title", "price", "embedding"],
      "input": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "backfill/products.parquet",
        "format": "parquet"
      },
      "columnMapping": {
        "source_id": "id",
        "source_title": "title",
        "source_price": "price",
        "source_embedding": "embedding"
      },
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
    ```

    ジョブ固有のパラメーターを次の表に示します。

    | パラメーター | 必須 | 説明 |
    | --- | --- | --- |
    | `clusterId` | Y | Zilliz Cloud クラスターの ID です。<br/>値は 256 文字以下の文字列です。 |
    | `dbName` | N | 指定したクラスター内のデータベースの名前です。<br/>値は 256 文字以下の文字列です。 |
    | `collectionName` | Y | 指定したクラスターおよびデータベース内のコレクションの名前です。<br/>値は 256 文字以下の文字列です。 |
    | `fields` | Y | バックフィルする対象コレクション内のフィールドです。<br/>Zilliz Cloud はこの名前を使用して、バックフィルタスクの対象フィールドを特定します。値は文字列の配列です。 |
    | `input` | Y | バックフィルの入力データです。Zilliz Cloud ボリュームに保存されたデータファイルを指します。詳細については、一般的な [リクエストペイロード](./spark-batch-jobs#request-payload) を参照してください。 |
    | `columnMapping` | N | 名前が異なる場合に、入力データのソース列を対象コレクションのフィールドにマッピングします。<br/>ソースデータの列名が対象コレクションのフィールド名と異なる場合は、`columnMapping` を使用します。指定する場合、`columnMapping` には、主キーとバックフィルタスクに関係するすべてのフィールドのマッピングを含める必要があります。 |

    `columnMapping` を省略した場合、主キー列を含むソース列は、対象コレクションの対応するフィールドと同じ名前である必要があります。

    その後、次のようにして事前チェックを送信できます。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill/precheck" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-005" \
        --header "Content-Type: application/json" \
        --data "${precheck_payload}"
    ```

    リクエストはジョブ ID を返します。返されたジョブ ID を使用して、その進捗状況と事前チェックレポートを取得できます。

    <details>

    <summary>事前チェックのレスポンス例を確認するには、ここをクリックしてください。</summary>

    ```json
    {
      "passed": false,
      "dbName": "default",
      "collectionName": "products",
      "input": "volume://product-data/backfill/products.parquet",
      "fields": ["title", "price", "embedding"],
      "columnMapping": {
        "source_id": "id",
        "source_title": "title",
        "source_price": "price",
        "source_embedding": "embedding"
      },
      "requiredSourceColumns": [
        "source_id",
        "source_title",
        "source_price",
        "source_embedding"
      ],
      "errors": [
        {
          "code": "SOURCE_COLUMN_MISSING",
          "sourceColumn": "source_embedding",
          "targetField": "embedding",
          "expectedType": "FloatVector",
          "message": "source column is missing: source_embedding"
        }
      ],
      "checkedRows": 0
    }
     
    ```

    </details>

    **事前チェックの結果を確認します。** 事前チェックジョブが正常に完了したからといって、入力が検証に合格したとは限りません。`passed` を確認し、`false` の場合は `errors` を確認して、バックフィルを実行する前に入力データまたは構成を修正してください。

    発生しうる検証エラーを次の表に示します。

    | エラーコード | 説明 |
    | --- | --- |
    | `SOURCE_COLUMN_MISSING` | 指定した列がソースデータファイルに存在しないことを示します。 |
    | `SOURCE_COLUMN_TYPE_MISMATCH` | 指定した列のデータ型が、対象コレクションの対応するフィールドのデータ型と異なることを示します。 |

1. バックフィルを送信します。

    バックフィルリクエストは、事前チェックリクエストと同じ入力とフィールド構成を使用します。さらに、`mode` を設定して、入力値を対象コレクションに適用する方法を制御します。`coalesce` がデフォルトのモードです。詳細については、[バックフィルモードの選択](./data-backfill#choose-a-backfill-mode) を参照してください。

    ```bash
    export backfill_payload='{
      "description": "backfill product data",
      "clusterId": "in-xxxxxxxx",
      "dbName": "default",
      "collectionName": "products",
      "fields": ["title", "price", "embedding"],
      "input": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "backfill/products.parquet",
        "format": "parquet"
      },
      "columnMapping": {
        "source_id": "id",
        "source_title": "title",
        "source_price": "price",
        "source_embedding": "embedding"
      },
      "mode": "coalesce",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
    ```

    バックフィルモードを選択したら、次のようにしてバックフィルリクエストを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-006" \
        --header "Content-Type: application/json" \
        --data "${backfill_payload}"
    ```

    <details>

    <summary>バックフィルジョブのレスポンス例を確認するには、ここをクリックしてください。</summary>

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

    </details>

    リクエストはジョブ ID を返します。これを使用してバックフィルジョブを監視します。ジョブの詳細には、対象コレクション、入力データ、列マッピング、および割り当てられたリソースに関する情報が含まれます。

</Procedures>

## ジョブの監視\{#monitor-the-job}

リクエストを送信した後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細の表示、既存のジョブの一覧表示、キャンセル可能な状態にあるジョブのキャンセルを行うことができます。

ジョブが成功したら、リクエストで指定したパスに期待される出力が存在することを確認します。

手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs) を参照してください。

## 結果の検証\{#validate-the-results}

バックフィルジョブが成功したら、対象フィールドが期待どおりに更新されたことを確認します。代表的なサンプルのエンティティをクエリし、バックフィルされた値をソースデータ内の対応するレコードと比較します。

また、選択したバックフィルモードが正しく適用されたことを確認します。`coalesce` の場合、既存の非 NULL 値は変更されていない必要があります。`overwrite` の場合、照合されなかったエンティティは変更されていない必要があります。`replace` の場合、照合されなかったエンティティの対象フィールドは NULL である必要があります。

大規模なバックフィルの場合は、バックフィルしたデータを本番環境で使用する前に、更新されたフィールドのカバレッジを確認して、欠損している値や予期しない値を特定することを検討してください。

## 次のステップ\{#next-step}

バックフィルしたデータを検証したら、更新されたフィールドをアプリケーションで使用したり、バックフィルが必要となったワークフローを続行したりできます。

たとえば、スキーマ変更の一環としてデータをバックフィルする場合は、完全な移行ワークフローについて [スキーマ Evolution](./schema-evolution) を参照してください。

