---
title: "データバックフィル  | Cloud"
slug: /data-backfill
sidebar_label: "データバックフィル "
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データバックフィルを使用すると、Zilliz Cloud ボリューム上の Parquet ファイルに保存されたデータを使用して、Zilliz Cloud コレクション内の既存エンティティの選択したフィールドを更新できます。バックフィルジョブは、プライマリキーによって入力レコードを既存のエンティティと照合し、指定されたフィールドの値をコレクションに書き戻します。新しく追加されたフィールドへのデータ投入、欠損値の補完、既存フィールド値の大規模な置き換えに使用できます。 | Cloud"
type: origin
token: CdmcwKYHZimNZ2kw5wqcQDDOned
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# データバックフィル

データバックフィルを使用すると、Zilliz Cloud ボリューム上の Parquet ファイルに保存されたデータを使用して、Zilliz Cloud コレクション内の既存エンティティの選択したフィールドを更新できます。バックフィルジョブは、プライマリキーによって入力レコードを既存のエンティティと照合し、指定されたフィールドの値をコレクションに書き戻します。新しく追加されたフィールドへのデータ投入、欠損値の補完、既存フィールド値の大規模な置き換えに使用できます。

書き込みの切り替え、スナップショットの作成、履歴エンティティのバックフィル、バックフィルのコミットなど、稼働中のコレクションのスキーマを進化させる完全なワークフローについては、[スキーマ進化](./schema-evolution) を参照してください。

## 概要\{#overview}

次の図は、データバックフィルの事前チェックとデータバックフィルという、連鎖させることができる 2 つの個別の API エンドポイントの手順を示しています。前者はコレクションのデータが変更される前に入力データとバックフィル構成を検証することを目的とし、後者はターゲットコレクションに対して実際のバックフィルを実行します。

![Eup8wertXhAZVFbM5CncoJP7ndb](https://zdoc-images.s3.us-west-2.amazonaws.com/Eup8wertXhAZVFbM5CncoJP7ndb.png)

### ソースレコードを既存のエンティティと照合する\{#match-source-records-to-existing-entities}

入力データファイルには、Zilliz Cloud がソースレコードをターゲットコレクション内の既存のエンティティと照合するために使用する `pk` 列が含まれている必要があります。バックフィルするフィールドには、ターゲットコレクションのフィールドと同じ名前を使用することも、`columnMapping` を介して明示的にマッピングすることもできます。バックフィルは、リクエストで指定されたフィールドのみを更新し、新しいエンティティは挿入しません。

### バックフィル前に検証する\{#validate-before-backfill}

バックフィルを実行する前に、同じ入力とフィールド構成を使用して事前チェックを実行できます。事前チェックは、コレクションデータを変更せずに、入力スキーマ、必須のソース列、列マッピング、および入力行のサンプルを検証します。事前チェックジョブが成功したからといって、それだけで入力が検証に合格したわけではありません。バックフィルを続行する前に、`precheckReport.passed` が `true` であることを確認してください。

### バックフィルモードを選択する\{#choose-a-backfill-mode}

バックフィルジョブを作成する際は、`mode` を使用して入力がターゲットフィールドにどのように適用されるかを制御します。

| **モード** | **動作** |
| --- | --- |
| `coalesce` | 一致するエンティティの NULL のターゲットフィールドのみをバックフィルします。既存の NULL 以外の値は変更されません。<br/>これがデフォルトのモードです。 |
| `overwrite` | 一致するすべてのエンティティのターゲットフィールドをバックフィルします。一致しないエンティティは変更されません。 |
| `replace` | 一致するすべてのエンティティのターゲットフィールドをバックフィルします。一致しないエンティティの場合、ターゲットフィールドは NULL に設定されます。 |

すでに書き込まれた値を変更せずに欠損値を補完したい場合は、`coalesce` を使用します。入力が一致するエンティティより優先される必要がある場合は、`overwrite` を使用します。一致しないエンティティのターゲットフィールドがクリアされるため、`replace` は、入力が選択したフィールドについて意図する完全なデータセットを表す場合にのみ使用してください。

## 事前準備\{#before-you-start}

データバックフィルの事前チェックおよびバックフィルを実行する前に、以下の条件を満たしていることを確認してください。

- 対象コレクションと、バックフィル対象のフィールドがすでに存在していること。

- ソースデータが Zilliz Cloud ボリューム内のデータファイルに保存されていること。

- 各入力レコードに、既存エンティティとの照合に使用する `pk` 列が含まれていること。

- ソース列名がターゲットフィールド名と異なる場合は、`columnMapping` を準備すること。

- ターゲットクラスターと入力ボリュームが同じプロジェクトおよびリージョンにあること。

認証、サポートされているファイル形式、入力ファイル、出力動作など、Spark バッチジョブを実行するための一般的な要件については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## 事前チェック付きのデータバックフィルジョブを作成する\{#create-a-data-backfill-job-with-prechecks}

ターゲットコレクションのプライマリキーに対応する列を含めるように入力データファイルを準備します。ソース列名がターゲットコレクションの対応するフィールド名と異なる場合は、`columnMapping` を使用して、プライマリキーおよびバックフィルジョブに含まれるすべてのフィールドの完全なマッピングを指定します。

<Procedures>

1. 冪等性キーを準備します。

    冪等性キーは、同じジョブリクエストを再試行するときに変更されない一意の文字列です。詳細については、[冪等な送信](./spark-batch-jobs#idempotent-submission) を参照してください。

    事前チェックジョブとバックフィルジョブでは、競合の可能性を避けるために異なる冪等性キーを使用してください。

1. オプションで事前チェックを実行します。

    バックフィルを開始する前に、ターゲットコレクションを変更せずに入力データと構成を検証するための事前チェックを実行できます。オプションではありますが、事前チェックの実行をお勧めします。

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

    次の表に、ジョブ固有のパラメーターを示します。

    | パラメーター | 必須 | 説明 |
    | --- | --- | --- |
    | `clusterId` | はい | Zilliz Cloud クラスターの ID です。<br/>値は 256 文字以内の文字列です。 |
    | `dbName` | いいえ | 指定されたクラスター内のデータベースの名前です。<br/>値は 256 文字以内の文字列です。 |
    | `collectionName` | はい | 指定されたクラスターおよびデータベース内のコレクションの名前です。<br/>値は 256 文字以内の文字列です。 |
    | `fields` | はい | バックフィルするターゲットコレクション内のフィールドです。<br/>Zilliz Cloud はこの名前を使用して、バックフィルタスクのターゲットフィールドを特定します。値は文字列の配列リストです。 |
    | `input` | はい | バックフィルの入力データです。Zilliz Cloud ボリュームに保存されたデータファイルを指します。詳細については、一般的な [リクエストペイロード](./spark-batch-jobs#request-payload) を参照してください。 |
    | `columnMapping` | いいえ | 名前が異なる場合に、入力データのソース列をターゲットコレクションのフィールドにマッピングします。<br/>ソースデータの列名がターゲットコレクションのフィールド名と異なる場合は、`columnMapping` を使用します。指定する場合、`columnMapping` にはプライマリキーおよびバックフィルタスクに関係するすべてのフィールドのマッピングを含める必要があります。 |

    `columnMapping` を省略する場合、プライマリキー列を含むソース列の名前は、ターゲットコレクションの対応するフィールドと同じである必要があります。

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

    リクエストはジョブ ID を返します。返されたジョブ ID を使用して、その進行状況と事前チェックレポートを取得します。

    <details>

    <summary>考えられる事前チェックレスポンスを表示するには、ここをクリックしてください。</summary>

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

    **事前チェックの結果を確認します。** 事前チェックジョブが正常に完了したからといって、必ずしも入力が検証に合格したことを意味するわけではありません。`passed` を確認し、`false` の場合は、`errors` を確認して、バックフィルを実行する前に入力または構成を修正してください。

    次の表に、考えられる検証エラーを示します。

    | エラーコード | 説明 |
    | --- | --- |
    | `SOURCE_COLUMN_MISSING` | 指定された列がソースデータファイルに存在しないことを示します。 |
    | `SOURCE_COLUMN_TYPE_MISMATCH` | 指定された列のデータ型が、ターゲットコレクション内の対応する列のデータ型と異なることを示します。 |

1. バックフィルを送信します。

    バックフィルリクエストは、事前チェックリクエストと同じ入力およびフィールド構成を使用します。さらに、`mode` を設定して、入力値がターゲットコレクションにどのように適用されるかを制御します。`coalesce` がデフォルトのモードです。詳細については、[バックフィルモードの選択](./data-backfill#choose-a-backfill-mode) を参照してください。

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

    <summary>考えられるバックフィルジョブのレスポンスを表示するには、ここをクリックしてください。</summary>

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

    リクエストはジョブ ID を返します。これを使用してバックフィルジョブを監視します。ジョブの詳細には、ターゲットコレクション、入力データ、列マッピング、および割り当てられたリソースに関する情報が含まれます。

</Procedures>

## ジョブの監視\{#monitor-the-job}

リクエストを送信した後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細を表示したり、既存のジョブを一覧表示したり、ジョブがまだキャンセル可能な状態にある間にキャンセルしたりできます。

ジョブが成功したら、リクエストで指定されたパスに期待される出力が存在することを確認します。

手順、ジョブの状態、および状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs) を参照してください。

## 結果を検証する\{#validate-the-results}

バックフィルジョブが成功したら、ターゲットフィールドが期待どおりに更新されたことを確認します。代表的なエンティティのサンプルをクエリし、バックフィルされた値をソースデータ内の対応するレコードと比較します。

また、選択したバックフィルモードが正しく適用されたことを確認します。`coalesce` の場合、既存の NULL 以外の値は変更されないはずです。`overwrite` の場合、一致しないエンティティは変更されないはずです。`replace` の場合、一致しないエンティティのターゲットフィールドは NULL になるはずです。

大規模なバックフィルの場合は、バックフィルされたデータを本番環境で使用する前に、更新されたフィールドのカバレッジを確認して、欠損値や予期しない値を特定することを検討してください。

## 次のステップ\{#next-step}

バックフィルされたデータを検証した後、アプリケーションで更新されたフィールドの使用を開始するか、バックフィルが必要だったワークフローを続行できます。

たとえば、スキーマ変更の一環としてデータをバックフィルする場合は、完全な移行ワークフローについて [スキーマ進化](./schema-evolution) を参照してください。
