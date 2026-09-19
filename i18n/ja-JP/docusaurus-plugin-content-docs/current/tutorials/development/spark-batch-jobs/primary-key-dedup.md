---
title: "プライマリキー重複排除 | Cloud"
slug: /primary-key-dedup
sidebar_label: "プライマリキー重複排除"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プライマリキー重複排除は、同じプライマリキーを共有するレコードを特定し、大規模なデータセットから冗長なコピーを削除します。このジョブを使用すると、繰り返しのインポート、パイプラインの再試行、移行、または重複するデータソースによって発生した重複をクリーンアップできます。 | Cloud"
type: origin
token: Wh2Kw8tn7ivDZOkDy2jcqFU7nje
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プライマリキー重複排除

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、AWS us-west-2 リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

プライマリキー重複排除は、同じプライマリキーを共有するレコードを特定し、大規模なデータセットから冗長なコピーを削除します。このジョブを使用すると、繰り返しのインポート、パイプラインの再試行、移行、または重複するデータソースによって発生した重複をクリーンアップできます。

## 概要\{#overview}

プライマリキー重複排除ジョブは、同じプライマリキー値を持つレコードをグループ化し、各グループから 1 件のレコードを保持します。デフォルトでは、ジョブは内部識別子に基づいて保持するレコードを選択するため、ユーザーに表示されるフィールド値から結果を予測することはできません。重複レコードに異なるフィールド値が含まれている場合は、`keepBy` を使用して保持するレコードを定義します。

### 重複の特定方法\{#how-duplicates-are-identified}

ジョブを作成する際には、クリーンアップされたデータを対象コレクションにインポートした後にプライマリキーとして機能するスカラーフィールドを指定します。ジョブは、このフィールドに同じ値を持つレコードを重複と見なし、同じ重複グループに配置します。

プライマリキー重複排除では、完全に一致するプライマリキーの重複のみを特定します。プライマリキー値が異なるレコードは、そのスカラーフィールドやベクトル埋め込みが同一または非常に類似していても、重複とは見なされません。

### 保持されるレコード\{#which-record-is-retained}

デフォルトでは、ジョブは内部識別子に基づいて各重複グループから 1 件のレコードを選択します。デフォルトの動作は、すべての重複レコードに同じフィールド値が含まれている場合にのみ使用してください。

重複レコードに異なる値が含まれている場合は、`keepBy` を使用して保持するレコードを定義します。`keepBy` は `<field-name>:<strategy>` の形式で設定します。たとえば、`timestamp:max` は `timestamp` フィールドの値が最も大きいレコードを保持します。これは通常、最も新しいレコードを表します。

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- Removed with timestamp:max -->
| doc-1       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- Retained with timestamp:max -->
| doc-2       | 1715000000 | Another record  | [0.27, 0.53] | <!-- Retained -->
```

この例では、最初の 2 件のレコードは同じプライマリキー値を持っているため、重複と見なされます。これらのレコードには、`timestamp`、`content`、および `vector` フィールドに異なる値が含まれています。`keepBy` を指定しない場合、ジョブは内部識別子に基づいて 1 件のレコードを保持し、その結果をこれらのフィールド値から予測することはできません。`keepBy` を `timestamp:max` に設定すると、ジョブは `timestamp` 値が最も大きい 2 番目のレコードを保持します。

ジョブは、選択されたレコード全体を保持します。異なる重複レコードのフィールド値を結合することはありません。

### ジョブの出力内容\{#what-the-job-produces}

ジョブは、重複排除されたデータセットを生成します。このデータセットには、重複排除後のプライマリキー値ごとに 1 件の完全なレコードが含まれます。その後、選択したフィールドをプライマリキーとして、出力をコレクションにインポートできます。

## 事前準備\{#before-you-start}

プライマリキー重複排除ジョブを作成する前に、以下を満たしていることを確認してください。

- すべての入力ファイルが、対象コレクションに一致する互換性のあるスキーマを使用していること。

- 選択したプライマリキーフィールドがすべての入力ファイルに存在し、サポートされている文字列または整数の値が含まれていること。

- 重複レコードに異なる値が含まれている場合は、適切な `keepBy` フィールドと戦略を選択すること。

認証、入力ファイル、出力動作など、Spark バッチジョブの実行に関する一般的な要件については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## プライマリキー重複排除ジョブを作成する\{#create-a-primary-key-deduplication-job}

Zilliz Cloud ボリューム内の入力パスと出力パス、プライマリキーとして機能するフィールド、およびオプションの `keepBy` ルールを指定して、プライマリキー重複排除ジョブを作成します。ジョブは非同期的に実行され、進行状況の監視に使用できるジョブ ID を返します。

<Procedures>

1. べき等性キーを準備します。

    べき等性キーとは、同じジョブリクエストを再試行するときに変わらない一意の文字列です。詳細については、[べき等性のある送信](./spark-batch-jobs#idempotent-submission) を参照してください。

1. リクエストペイロードを準備します。

    ```bash
    export payload='{
      "description": "deduplicate by product id",
      "regionId": "aws-us-west-2",
      "input": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "input/products.parquet",
        "format": "parquet"
      },
      "output": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "output/products-dedup.parquet",
        "format": "parquet",
        "writeMode": "ERROR_IF_EXISTS"
      },
      "primaryKeyField": "id",
      "keepBy": "updated_at:max",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
    ```

    次の表に、ジョブ固有のパラメーターを示します。

    | パラメーター | 必須 | 説明 |
    | --- | --- | --- |
    | `primaryKeyField` | はい | データのクリーンアップ後に、対象コレクションでプライマリキーとして機能するスカラーフィールドの名前です。<br/>その値のデータ型は、Zilliz Cloud コレクションの要件に従い、文字列または整数のいずれかである必要があります。 |
    | `keepBy` | いいえ | 保持する重複レコードを決定する保持戦略です。値は `<field-name>:<strategy>` の形式で設定します（例: `timestamp:max`）。 |

    次の戦略がサポートされています。

    - `max`: 指定したフィールドの値が最も大きいレコードを保持します。

    - `min`: 指定したフィールドの値が最も小さいレコードを保持します。

    `keepBy` を省略した場合、ジョブは内部識別子に基づいて各重複グループから 1 件のレコードを選択します。重複レコードに異なるフィールド値が含まれる可能性があり、予測可能な保持ルールが必要な場合は、`keepBy` を使用します。

    すべての Spark バッチジョブで共有されるパラメーターについては、[リクエストペイロード](./spark-batch-jobs#request-payload) を参照してください。

1. ジョブを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/dedup/pk" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-001" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    リクエストは、ジョブが作成された後に返されます。レスポンスには、進行状況の監視に使用できるジョブ ID が含まれます。次の例は、成功したレスポンスを示しています。

    ```json
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxx",
        "projectId": "proj-xxxxxxxx",
        "type": "SPARK",
        "description": "deduplicate by product id",
        "status": "PENDING",
        "regionId": "aws-us-west-2",
        "clusterId": "in-xxxxxxxx",
        "createdAt": null,
        "startedAt": null,
        "finishedAt": null,
        "durationSeconds": null
      }
    }
    ```

    送信時の動作の詳細については、[送信レスポンス](./spark-batch-jobs#submission-response) を参照してください。

</Procedures>

## ジョブの監視\{#monitor-the-job}

リクエストを送信した後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細の表示、既存のジョブの一覧表示、キャンセル可能な状態にあるジョブのキャンセルを行うことができます。

ジョブが成功したら、リクエストで指定したパスに期待される出力が存在することを確認します。

手順、ジョブの状態、および状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs) を参照してください。

## 出力の検証\{#validate-the-output}

ジョブが成功したら、以下を確認します。

- 出力ファイルが、構成されたボリュームパスに存在すること。

- 各プライマリキー値が 1 回だけ出現すること。

- 構成された `keepBy` ルールに基づいて、期待されるレコードが保持されていること。

また、入力と出力のレコード数を比較して、削除された重複の数が妥当であることを確認できます。

## 次のステップ\{#next-step}

プライマリキー重複排除では、同じプライマリキー値を共有するレコードが削除されますが、データセットによっては追加のクリーンアップが有効な場合があります。プライマリキーは異なるものの内容が非常に類似しているレコードを特定するには、[ベクトル類似度による重複排除](./vector-similarity-dedup) を使用します。モデルトレーニングや大規模なデータ分析には、[K-Means クラスタリング](./k-means-clustering) を使用して埋め込みの分布を調べ、[異常検知](./anomaly-detection) を使用して、さらに確認が必要な可能性がある異常なレコードを見つけます。

