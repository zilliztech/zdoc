---
title: "データバックフィル | Cloud"
slug: /data-backfill
sidebar_label: "データバックフィル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データバックフィルを使用すると、Zilliz Cloud コレクション内の既存エンティティの特定のフィールドを、Zilliz Cloud ボリューム上の Parquet ファイルに保存されたデータを使って更新できます。バックフィルジョブは、主キーに基づいて入力レコードと既存エンティティを照合し、指定されたフィールド値をコレクションに書き戻します。新規追加フィールドへの値の設定、欠損値の補完、既存フィールド値の一括置換などに利用できます。 | Cloud"
type: origin
token: CdmcwKYHZimNZ2kw5wqcQDDOned
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# データバックフィル

データバックフィルを使用すると、Zilliz Cloud コレクション内の既存エンティティの特定のフィールドを、Zilliz Cloud ボリューム上の Parquet ファイルに保存されたデータを使って更新できます。バックフィルジョブは、主キーに基づいて入力レコードと既存エンティティを照合し、指定されたフィールド値をコレクションに書き戻します。新規追加フィールドへの値の設定、欠損値の補完、既存フィールド値の一括置換などに利用できます。

書き込みの切り替え、スナップショットの作成、過去エンティティのバックフィル、バックフィルのコミットなど、稼働中のコレクションのスキーマを進化させるための一連のワークフローについては、「スキーマ Evolution」を参照してください。

## 概要\{#overview}

次の図は、データバックフィル事前チェックとデータバックフィルという、連結可能な 2 つの独立した API エンドポイントの処理フローを示しています。前者はコレクションのデータを変更する前に入力データとバックフィル設定を検証するためのものであり、後者は対象コレクションに対して実際にバックフィルを実行します。

![Eup8wertXhAZVFbM5CncoJP7ndb](https://zdoc-images.s3.us-west-2.amazonaws.com/Eup8wertXhAZVFbM5CncoJP7ndb.png)

### ソースレコードと既存エンティティの照合\{#match-source-records-to-existing-entities}

入力データファイルには、Zilliz Cloud がソースレコードと対象コレクション内の既存エンティティを照合するために使用する `pk` 列を含める必要があります。バックフィル対象のフィールド名は、対象コレクションのフィールドと同じ名前にするか、`columnMapping` を使って明示的にマッピングできます。バックフィルではリクエストで指定されたフィールドのみが更新され、新しいエンティティは挿入されません。

### バックフィル前の検証\{#validate-before-backfill}

バックフィルの実行前に、同じ入力とフィールド構成を使用して事前チェックを実行できます。事前チェックでは、コレクションのデータを変更することなく、入力スキーマ、必須のソース列、列マッピング、および入力行のサンプルを検証します。事前チェックジョブが成功しても、入力が検証に合格したとは限りません。バックフィルに進む前に、`precheckReport.passed` が `true` であることを確認してください。

### バックフィルモードの選択\{#choose-a-backfill-mode}

バックフィルジョブの作成時に、`mode` を使用して入力データを対象フィールドに適用する方法を制御できます。

| **モード** | **動作** |
| --- | --- |
| `coalesce` | 照合されたエンティティのうち、NULL の対象フィールドのみをバックフィルします。既存の非 NULL 値は変更されません。<br/>これがデフォルトのモードです。 |
| `overwrite` | 照合されたすべてのエンティティの対象フィールドをバックフィルします。照合されなかったエンティティは変更されません。 |
| `replace` | 照合されたすべてのエンティティの対象フィールドをバックフィルします。照合されなかったエンティティについては、対象フィールドが NULL に設定されます。 |

既存の値を変更せずに欠損値のみを補完したい場合は、`coalesce` を使用します。入力データを優先して既存エンティティを更新したい場合は、`overwrite` を使用します。`replace` は、入力データが選択したフィールドの完全なデータセットを表す場合にのみ使用してください。このモードでは、照合されなかったエンティティの対象フィールドがクリアされるためです。

## 事前準備\{#before-you-start}

データバックフィルの事前チェックおよびバックフィルを実行する前に、以下の条件を満たしていることを確認してください。

- 対象コレクションと、バックフィル対象のフィールドがすでに存在していること。

- ソースデータが Zilliz Cloud ボリューム内のデータファイルに保存されていること。

- 各入力レコードに、既存エンティティとの照合に使用する `pk` 列が含まれていること。

- ソース列名と対象フィールド名が異なる場合は、`columnMapping` を用意しておくこと。

- 対象クラスターと入力ボリュームが同じプロジェクトおよびリージョンに存在すること。

認証、サポートされるファイル形式、入力ファイル、出力動作など、Spark バッチジョブ実行の一般的な要件については、「[Spark バッチジョブ](./spark-batch-jobs)」を参照してください。

## 事前チェック付きのデータバックフィルジョブを作成する\{#create-a-data-backfill-job-with-prechecks}

入力データファイルには、対象コレクションのプライマリキーに対応する列を含める必要があります。ソースデータの列名が対象コレクションのフィールド名と異なる場合は、`columnMapping` を使用して、プライマリキーおよびバックフィル対象の全フィールドのマッピングを指定してください。

<Procedures>

1. 冪等性キーを準備します。

    冪等性キーとは、同じジョブリクエストを再試行する際に再利用される一意の文字列です。詳細については、「[冪等性のある送信](./spark-batch-jobs#idempotent-submission)」を参照してください。

    事前チェックとバックフィルの各ジョブでは、競合を防ぐためにそれぞれ異なる冪等性キーを使用してください。

1. 必要に応じて事前チェックを実行します。

    バックフィルの実行前に事前チェックを行うことで、対象コレクションを変更することなく入力データや設定を検証できます。必須ではありませんが、実行することを推奨します。

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

    ジョブ固有のパラメータを次の表に示します。

    | パラメータ | 必須 | 説明 |
    | --- | --- | --- |
    | `clusterId` | Y | Zilliz Cloud クラスターの ID です。<br/>値は 256 文字以下の文字列です。 |
    | `dbName` | N | 指定したクラスター内のデータベース名です。<br/>値は 256 文字以下の文字列です。 |
    | `collectionName` | Y | 指定したクラスターおよびデータベース内のコレクション名です。<br/>値は 256 文字以下の文字列です。 |
    | `fields` | Y | バックフィル対象となるコレクション内のフィールドです。<br/>Zilliz Cloud はこれらの名前を使用してバックフィル先のフィールドを特定します。値は文字列の配列です。 |
    | `input` | Y | バックフィル用の入力データです。Zilliz Cloud ボリュームに保存されたデータファイルを指定します。詳細については、一般的な「[リクエストペイロード](./spark-batch-jobs#request-payload)」を参照してください。 |
    | `columnMapping` | N | 入力データのソース列を、名前が異なる場合に対象コレクションのフィールドに対応付けます。<br/>ソースデータの列名が対象コレクションのフィールド名と異なる場合は、`columnMapping` を使用します。指定する場合、`columnMapping` には、プライマリキーとバックフィルタスクに関係するすべてのフィールドのマッピングを含める必要があります。 |

    `columnMapping` を省略した場合、プライマリキー列を含むすべてのソース列は、対象コレクションの対応するフィールドと同名である必要があります。

    以下の方法で事前チェックを送信できます。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill/precheck" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-005" \
        --header "Content-Type: application/json" \
        --data "${precheck_payload}"
    ```

    リクエストに対してジョブ ID が返されます。このジョブ ID を使用して、進捗状況や事前チェックレポートを取得できます。

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

    **事前チェックの結果を確認する**
事前チェックジョブが正常に完了しても、入力データの検証が成功したとは限りません。`passed` の値を確認し、`false` となっている場合は `errors` を確認して、バックフィル実行前に入力データまたは設定を修正してください。

    発生しうる検証エラーを次の表に示します。

    | エラーコード | 説明 |
    | --- | --- |
    | `SOURCE_COLUMN_MISSING` | 指定された列がソースデータファイル内に存在しないことを示します。 |
    | `SOURCE_COLUMN_TYPE_MISMATCH` | 指定された列のデータ型が、対象コレクションの対応するフィールドのデータ型と一致しないことを示します。 |

1. バックフィルジョブを送信します。

    バックフィルリクエストでは、事前チェックと同じ入力データおよびフィールド設定を使用します。さらに、`mode` を設定して、入力値を対象コレクションに適用する方法を制御します。デフォルトモードは `coalesce` です。詳細については、「[バックフィルモードの選択](./data-backfill#choose-a-backfill-mode)」を参照してください。

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

    バックフィルモードを選択後、以下の手順でリクエストを送信します。

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

    リクエストに対してジョブ ID が返されます。この ID を使用してバックフィルジョブの状況を監視できます。ジョブの詳細には、対象コレクション、入力データ、列マッピング、割り当てられたリソースに関する情報が含まれます。

</Procedures>

## ジョブの監視\{#monitor-the-job}

リクエスト送信後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスや詳細の確認、既存ジョブの一覧表示、キャンセル可能な状態でのジョブのキャンセルなどが行えます。

ジョブが成功したら、リクエストで指定したパスに期待される出力が存在することを確認します。

操作手順、ジョブの状態、および状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs)を参照してください。

## 結果の検証\{#validate-the-results}

バックフィルジョブの成功後、対象フィールドが期待どおりに更新されたことを確認します。代表的なエンティティのサンプルをクエリし、バックフィル後の値とソースデータの対応レコードを比較します。

また、選択したバックフィルモードが正しく適用されたかも確認します。`coalesce` の場合、既存の非 NULL 値は変更されません。`overwrite` の場合、一致しないエンティティは変更されません。`replace` の場合、一致しないエンティティの対象フィールドは NULL になります。

大規模なバックフィルの場合、本番環境で使用する前に、更新されたフィールドのカバレッジを確認し、欠落や予期しない値がないかをチェックすることを推奨します。

## 次のステップ\{#next-step}

バックフィルデータの検証が完了したら、アプリケーションで更新済みフィールドの使用を開始するか、バックフィルを必要としていたワークフローを続行できます。

たとえば、スキーマ変更の一環としてデータをバックフィルしている場合は、完全な移行ワークフローについて「スキーマ Evolution」を参照してください。
