---
title: "主キー重複排除 | Cloud"
slug: /primary-key-dedup
sidebar_label: "主キー重複排除"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "主キー重複排除は、同じ主キーを共有するレコードを識別し、大規模なデータセットから冗長なコピーを削除します。このジョブは、繰り返しのインポート、パイプラインの再試行、移行、または重複するデータソースによって発生した重複をクリーンアップするために使用します。 | Cloud"
type: origin
token: Wh2Kw8tn7ivDZOkDy2jcqFU7nje
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 主キー重複排除

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS us-west-2 リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

主キー重複排除は、同じ主キーを共有するレコードを識別し、大規模なデータセットから冗長なコピーを削除します。このジョブは、繰り返しのインポート、パイプラインの再試行、移行、または重複するデータソースによって発生した重複をクリーンアップするために使用します。

## 概要\{#overview}

主キー重複排除ジョブは、同じ主キー値を持つレコードをグループ化し、各グループから 1 つのレコードを保持します。デフォルトでは、ジョブは内部識別子に基づいて保持するレコードを選択するため、結果はユーザーに表示されるフィールド値からは予測できません。重複レコードに異なるフィールド値が含まれている場合は、`keepBy` を使用して保持するレコードを定義します。

### 重複の識別方法\{#how-duplicates-are-identified}

ジョブを作成する際には、クリーンアップされたデータをターゲットコレクションにインポートした後に主キーとして機能するスカラーフィールドを指定します。ジョブは、このフィールドに同じ値を持つレコードを重複と見なし、同じ重複グループに配置します。

主キー重複排除は、完全に一致する主キーの重複のみを識別します。主キー値が異なるレコードは、スカラーフィールドやベクトル埋め込みが同一または非常に類似していても、重複とは見なされません。

### 保持されるレコード\{#which-record-is-retained}

デフォルトでは、ジョブは内部識別子に基づいて各重複グループから 1 つのレコードを選択します。デフォルトの動作は、すべての重複レコードに同じフィールド値が含まれている場合にのみ使用してください。

重複レコードに異なる値が含まれている場合は、`keepBy` を使用して保持するレコードを定義します。`keepBy` は `<field-name>:<strategy>` の形式で設定します。たとえば、`timestamp:max` は `timestamp` フィールドの値が最も大きいレコードを保持します。これは通常、最新のレコードを表します。

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- Removed with timestamp:max -->
| doc-1       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- Retained with timestamp:max -->
| doc-2       | 1715000000 | Another record  | [0.27, 0.53] | <!-- Retained -->
```

この例では、最初の 2 つのレコードは同じ主キー値を持つため、重複と見なされます。これらのレコードには、`timestamp`、`content`、`vector` フィールドに異なる値が含まれています。`keepBy` を指定しない場合、ジョブは内部識別子に基づいて 1 つのレコードを保持し、結果はこれらのフィールド値からは予測できません。`keepBy` を `timestamp:max` に設定すると、ジョブは `timestamp` 値が最も大きいため 2 番目のレコードを保持します。

ジョブは選択されたレコード全体を保持します。異なる重複レコードのフィールド値を結合することはありません。

### ジョブの出力内容\{#what-the-job-produces}

ジョブは、重複排除されたデータセットを生成します。このデータセットには、重複排除された各主キー値ごとに 1 つの完全なレコードが含まれます。その後、出力は、選択したフィールドを主キーとしてコレクションにインポートできます。

## 事前準備\{#before-you-start}

主キー重複排除ジョブを作成する前に、以下を確認してください。

- すべての入力ファイルが、ターゲットコレクションに一致する互換性のあるスキーマを使用していること。

- 選択した主キーフィールドがすべての入力ファイルに存在し、サポートされている文字列または整数の値が含まれていること。

- 重複レコードに異なる値が含まれている場合は、適切な `keepBy` フィールドと戦略を選択していること。

認証、入力ファイル、出力の動作など、Spark バッチジョブを実行するための一般的な要件については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## 主キー重複排除ジョブを作成する\{#create-a-primary-key-deduplication-job}

Zilliz Cloud Volumes の入力パスと出力パス、主キーとして機能するフィールド、およびオプションの `keepBy` ルールを指定して、主キー重複排除ジョブを作成します。ジョブは非同期で実行され、進行状況の監視に使用できるジョブ ID を返します。

<Procedures>

1. 冪等性キーを準備します。

    冪等性キーは、同じジョブリクエストを再試行するときに変更されない一意の文字列です。詳細については、[冪等性のある送信](./spark-batch-jobs#idempotent-submission) を参照してください。

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

    次の表は、ジョブ固有のパラメーターを一覧表示します。

    | パラメーター | 必須 | 説明 |
    | --- | --- | --- |
    | `primaryKeyField` | はい | データクリーンアップ後、ターゲットコレクションで主キーとして機能するスカラーフィールドの名前です。<br/>値のデータ型は、Zilliz Cloud コレクションの要件に従って、文字列または整数のいずれかである必要があります。 |
    | `keepBy` | いいえ | どの重複を保持するかを決定する保持戦略です。値は `<field-name>:<strategy>` の形式（例: `timestamp:max`）で設定します。 |

    次の戦略がサポートされています。  

    - `max`: 指定したフィールドの値が最も大きいレコードを保持します。

    - `min`: 指定したフィールドの値が最も小さいレコードを保持します。

    `keepBy` を省略すると、ジョブは内部識別子に基づいて各重複グループから 1 つのレコードを選択します。重複レコードに異なるフィールド値が含まれる可能性があり、予測可能な保持ルールが必要な場合は、`keepBy` を使用します。

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

## ジョブを監視する\{#monitor-the-job}

リクエストを送信した後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細を表示したり、既存のジョブを一覧表示したり、キャンセル可能な状態にある間にジョブをキャンセルしたりできます。

ジョブが成功したら、リクエストで指定したパスに想定どおりの出力が存在することを確認します。

手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs) を参照してください。

## 出力を検証する\{#validate-the-output}

ジョブが成功したら、以下を確認してください。

- 出力ファイルが設定された Volume パスに存在すること。

- 各主キー値が 1 回だけ出現すること。

- 構成された `keepBy` ルールに基づいて、想定どおりのレコードが保持されていること。

入力と出力のレコード数を比較して、削除された重複の数が妥当であることを確認することもできます。

## 次のステップ\{#next-step}

主キー重複排除は、同じ主キー値を共有するレコードを削除しますが、データセットによってはさらにクリーンアップが役立つ場合があります。[ベクトル類似度重複排除](./vector-similarity-dedup) を使用して、主キーは異なるが内容が非常に類似しているレコードを識別します。モデルトレーニングや大規模なデータ分析には、[K-Means クラスタリング](./k-means-clustering) を使用して埋め込み分布を調べ、[外れ値検出](./anomaly-detection) を使用して、さらに確認が必要な可能性のある異常なレコードを見つけます。 
