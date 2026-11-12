---
title: "データバックフィル  | Cloud"
slug: /data-backfill
sidebar_label: "データバックフィル "
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データバックフィルを使用すると、Zilliz Cloud ボリューム上の Parquet ファイルに保存されているデータを使って、Zilliz Cloud コレクション内の既存エンティティの選択したフィールドを更新できます。バックフィルジョブは、主キーによって入力レコードを既存エンティティと照合し、指定されたフィールド値をコレクションに書き戻します。新しく追加したフィールドへのデータ投入、欠損値の補完、既存フィールド値の大規模な置換に使用できます。 | Cloud"
type: origin
token: CdmcwKYHZimNZ2kw5wqcQDDOned
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# データバックフィル 

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、該当するすべての AWS リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。有効にするには、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</FeatureNote>

データバックフィルを使用すると、Zilliz Cloud ボリューム上の Parquet ファイルに保存されているデータを使って、Zilliz Cloud コレクション内の既存エンティティの選択したフィールドを更新できます。バックフィルジョブは、主キーによって入力レコードを既存エンティティと照合し、指定されたフィールド値をコレクションに書き戻します。新しく追加したフィールドへのデータ投入、欠損値の補完、既存フィールド値の大規模な置換に使用できます。

書き込みの切り替え、スナップショットの作成、過去のエンティティのバックフィル、バックフィルのコミットなど、稼働中のコレクションのスキーマを進化させるための完全なワークフローについては、[スキーマ進化](./schema-evolution) を参照してください。

## 概要\{#overview}

次の図は、データバックフィルの事前チェックとデータバックフィルという、連結可能な 2 つの独立した API エンドポイントの手順を示しています。前者は、コレクションデータが変更される前に入力データとバックフィル構成を検証することを目的とし、後者は対象コレクションに対して実際のバックフィルを実行します。

![Eup8wertXhAZVFbM5CncoJP7ndb](https://zdoc-images.s3.us-west-2.amazonaws.com/Eup8wertXhAZVFbM5CncoJP7ndb.png)

### ソースレコードを既存のエンティティと照合する\{#match-source-records-to-existing-entities}

入力データファイルには、Zilliz Cloud がソースレコードを対象コレクション内の既存エンティティと照合するために使用する `pk` 列が含まれている必要があります。バックフィル対象のフィールドには、対象コレクションのフィールドと同じ名前を使用することも、`columnMapping` を介して明示的にマッピングすることもできます。バックフィルは、リクエストで指定されたフィールドのみを更新し、新しいエンティティは挿入しません。

### バックフィル前に検証する\{#validate-before-backfill}

バックフィルを実行する前に、同じ入力とフィールド構成を使用して事前チェックを実行できます。事前チェックは、コレクションデータを変更せずに、入力スキーマ、必須のソース列、列マッピング、および入力行のサンプルを検証します。事前チェックジョブが正常に完了しても、入力が検証に合格したことを意味するわけではありません。バックフィルを続行する前に、`precheckReport.passed` が `true` であることを確認してください。

### バックフィルモードを選択する\{#choose-a-backfill-mode}

バックフィルジョブを作成するときは、`mode` を使用して入力が対象フィールドにどのように適用されるかを制御します：

| **モード** | **動作** |
| --- | --- |
| `coalesce` | 一致したエンティティのうち、NULL の対象フィールドのみをバックフィルします。既存の非 NULL 値は変更されません。<br/>これがデフォルトモードです。 |
| `overwrite` | 一致したすべてのエンティティの対象フィールドをバックフィルします。一致しないエンティティは変更されません。 |
| `replace` | 一致したすべてのエンティティの対象フィールドをバックフィルします。一致しないエンティティの対象フィールドは NULL に設定されます。 |

既に書き込まれている値を変更せずに欠損値を補完する場合は、`coalesce` を使用します。入力が一致したエンティティより優先される必要がある場合は、`overwrite` を使用します。一致しないエンティティの対象フィールドがクリアされるため、入力が選択したフィールドについて最終的に望む全データを表している場合に限り、`replace` を使用してください。

## 事前準備\{#before-you-start}

データバックフィルの事前チェックを実行し、データをバックフィルする前に、次の条件を満たしていることを確認してください。

- 対象のコレクションと、バックフィルするフィールドがすでに存在していること。

- ソースデータが、Zilliz Cloud ボリューム内のデータファイルに保存されていること。

- 各入力レコードに、既存のエンティティとの照合に使用する `pk` 列が含まれていること。

- ソース列名が対象フィールド名と異なる場合は、`columnMapping` を準備していること。

- 対象のクラスターと入力ボリュームが同じプロジェクトおよびリージョンにあること。

認証、サポートされるファイル形式、入力ファイル、出力動作など、バッチジョブを実行するための一般的な要件については、[バッチジョブ](./batch-jobs) を参照してください。

## 事前チェック付きのデータバックフィルジョブを作成する\{#create-a-data-backfill-job-with-prechecks}

対象コレクションの主キーに対応する列を含むように入力データファイルを準備します。ソース列名が対象コレクションの対応するフィールド名と異なる場合は、`columnMapping` を使用して、主キーとバックフィルジョブに含まれるすべてのフィールドの完全なマッピングを指定します。

<Procedures>

1. 冪等キーを準備します。

    冪等キーは、同じジョブリクエストを再試行するときに変わらない一意の文字列です。詳細については、[冪等な送信](./batch-jobs#idempotent-submission) を参照してください。

    事前チェックジョブとバックフィルジョブでは、競合の可能性を避けるために異なる冪等キーを使用してください。

1. 必要に応じて事前チェックを実行します。

    バックフィルを開始する前に、対象コレクションを変更せずに入力データと構成を検証するための事前チェックを実行できます。任意の操作ですが、事前チェックの実行をお勧めします。

    事前チェックのリクエストペイロードは、次のとおりです。

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
    | `clusterId` | はい | Zilliz Cloud クラスターの ID です。<br/>値は 256 文字以下の文字列です。 |
    | `dbName` | いいえ | 指定したクラスター内のデータベースの名前です。<br/>値は 256 文字以下の文字列です。 |
    | `collectionName` | はい | 指定したクラスターおよびデータベース内のコレクションの名前です。<br/>値は 256 文字以下の文字列です。 |
    | `fields` | はい | バックフィルする対象コレクション内のフィールドです。<br/>Zilliz Cloud は、この名前を使用してバックフィルタスクの対象フィールドを特定します。値は文字列の配列です。 |
    | `input` | はい | バックフィルの入力データです。Zilliz Cloud ボリュームに保存されているデータファイルを指定します。詳細については、一般的な [リクエストペイロード](./batch-jobs#request-payload) を参照してください。 |
    | `columnMapping` | いいえ | 名前が異なる場合に、入力データ内のソース列を対象コレクションのフィールドにマッピングします。<br/>ソースデータの列名が対象コレクションのフィールド名と異なる場合に `columnMapping` を使用します。指定する場合、`columnMapping` には主キーとバックフィルタスクに含まれるすべてのフィールドのマッピングを含める必要があります。 |

    `columnMapping` を省略する場合、主キー列を含むソース列は、対象コレクションの対応するフィールドと同じ名前である必要があります。

    その後、次のように事前チェックを送信できます。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill/precheck" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: batch-job-20260730-005" \
        --header "Content-Type: application/json" \
        --data "${precheck_payload}"
    ```

    リクエストはジョブ ID を返します。返されたジョブ ID を使用して、その進行状況と事前チェックレポートを取得します。

    <details>

    <summary>ここをクリックすると、事前チェックの応答例が表示されます。</summary>

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

    **事前チェックの結果を確認します。** 事前チェックジョブが正常に完了したからといって、入力が検証に合格したとは限りません。`passed` を確認し、`false` の場合は、`errors` を確認して、バックフィルを実行する前に入力または構成を修正してください。

    次の表に、発生する可能性のある検証エラーを示します。

    | エラーコード | 説明 |
    | --- | --- |
    | `SOURCE_COLUMN_MISSING` | 指定された列がソースデータファイルに存在しないことを示します。 |
    | `SOURCE_COLUMN_TYPE_MISMATCH` | 指定された列のデータ型が、対象コレクションの対応する列のデータ型と異なることを示します。 |

1. バックフィルを送信します。

    バックフィルリクエストでは、事前チェックリクエストと同じ入力およびフィールド構成を使用します。さらに、`mode` を設定して、入力値が対象コレクションにどのように適用されるかを制御します。`coalesce` がデフォルトモードです。詳細については、[バックフィルモードを選択する](./data-backfill#choose-a-backfill-mode) を参照してください。

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

    バックフィルモードを選択したら、次のようにバックフィルリクエストを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: batch-job-20260730-006" \
        --header "Content-Type: application/json" \
        --data "${backfill_payload}"
    ```

    <details>

    <summary>ここをクリックすると、バックフィルジョブの応答例が表示されます。</summary>

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
          "message": "The batch job failed.",
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

    リクエストはジョブ ID を返します。これを使用してバックフィルジョブを監視します。ジョブの詳細には、対象コレクション、入力データ、列マッピング、割り当てられたリソースに関する情報が含まれます。

</Procedures>

## ジョブを監視する\{#monitor-the-job}

リクエストを送信したら、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細を表示したり、既存のジョブを一覧表示したり、キャンセル可能な状態にある間にジョブをキャンセルしたりできます。

ジョブが成功したら、リクエストで指定したパスに期待どおりの出力があることを確認します。

手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-batch-jobs) を参照してください。

## 結果を検証する\{#validate-the-results}

バックフィルジョブが成功したら、対象フィールドが期待どおりに更新されたことを確認します。代表的なサンプルのエンティティをクエリし、バックフィルされた値をソースデータ内の対応するレコードと比較します。

また、選択したバックフィルモードが正しく適用されたことを確認します。`coalesce` の場合は、既存の非 NULL 値が変更されていない必要があります。`overwrite` の場合は、一致しないエンティティが変更されていない必要があります。`replace` の場合は、一致しないエンティティの対象フィールドが NULL である必要があります。

大規模なバックフィルの場合は、本番環境でバックフィル済みデータを使用する前に、更新されたフィールドのカバレッジを確認して、欠損値や予期しない値を特定することを検討してください。

## 次のステップ\{#next-step}

バックフィルされたデータを検証したら、アプリケーションで更新されたフィールドの使用を開始するか、バックフィルが必要だったワークフローを続行できます。

たとえば、スキーマ変更の一環としてデータをバックフィルしている場合は、完全な移行ワークフローについて[スキーマ進化](./schema-evolution) を参照してください。
