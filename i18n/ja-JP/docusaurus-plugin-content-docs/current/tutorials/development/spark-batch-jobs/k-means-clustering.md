---
title: "K-Means クラスタリング | Cloud"
slug: /k-means-clustering
sidebar_label: "K-Means クラスタリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "K-Means クラスタリングは、類似した埋め込みを持つレコードを指定された数のクラスターにグループ化します。このジョブを使用すると、ベクトルデータの分布を把握したり、レコードを大まかな意味グループに整理したり、サンプリングや分析などの後続ワークフロー向けにデータセットを準備できます。 | Cloud"
type: origin
token: SpMPwIX9diuiqfkHEAZcBSmnnOc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# K-Means クラスタリング

K-Means クラスタリングは、類似した埋め込みを持つレコードを指定された数のクラスターにグループ化します。このジョブを使用すると、ベクトルデータの分布を把握したり、レコードを大まかな意味グループに整理したり、サンプリングや分析などの後続ワークフロー向けにデータセットを準備できます。

このジョブはすべての入力レコードを保持し、各レコードに割り当てられたクラスターを示す `cluster_id` フィールドを追加します。

## 概要\{#overview}

次の図は、K-Means クラスタリングジョブがベクトルデータをどのように整理するかを示しています。ジョブは指定されたベクトルフィールドを読み取り、各レコードを要求されたクラスターのいずれかに割り当て、`cluster_id` フィールドを追加した上で元のレコードを書き出します。

同じ `cluster_id` が割り当てられたレコードは、同じクラスターに属します。なお、現在のところジョブはクラスターの重心を個別の出力ファイルとして書き出しません。

![PIGQwxa6th4dLWbYG6jcCCCSnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/PIGQwxa6th4dLWbYG6jcCCCSnxb.png)

### クラスター数の選択\{#choose-the-number-of-clusters}

`numClusters` に、ジョブで生成したいグループ数を設定します。値を小さくするとより広範なクラスターが作成され、値を大きくするとよりきめ細かいクラスターが作成されます。

### 距離メトリックの選択\{#choose-a-distance-metric}

距離メトリックは、ベクトルがどのようにクラスターに割り当てられるかを決定します。

| **メトリック** | **類似性の解釈** | **使用場面** |
| --- | --- | --- |
| `l2` | ユークリッド距離が小さいベクトルほど類似性が高いとみなされます。 | 埋め込みモデルや既存のワークフローでユークリッド距離を使用している場合に適しています。 |
| `cosine` | コサイン類似度が大きいベクトルほど類似性が高いとみなされます。 | ベクトルの方向がベクトルの大きさよりも重要な場合は、このメトリックを使用します。 |

### 出力について\{#understand-the-output}

出力にはすべての入力列が保持され、各レコードに `cluster_id` フィールドが追加されます。

| **フィールド** | **説明** |
| --- | --- |
| `cluster_id` | レコードに割り当てられたクラスターです。同じ `cluster_id` を持つレコードは、同じ K-Means クラスターに属します。 |

ジョブは、有効なすべての入力ベクトルをいずれかのクラスターに割り当てます。クラスターIDは単一のジョブ出力内でのグループ識別に用いられるものであり、別々の実行間での安定した識別子としては扱えません。

## 事前準備\{#before-you-start}

K-Means クラスタリングジョブを作成する前に、以下の点を確認してください。

- すべての入力ファイルが互換性のあるスキーマを使用しており、クラスター化対象のベクトルフィールドを含んでいること。

- 該当フィールド内のすべてのベクトルが同じ型と次元を持ち、同じ埋め込みモデルおよび前処理方法で生成されていること。

認証、入力ファイル、出力の動作など、Spark バッチジョブの実行に関する一般的な要件については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## K-Means クラスタリングジョブの作成\{#create-a-k-means-clustering-job}

入出力の場所、クラスター化対象のベクトルフィールド、距離メトリック、クラスター数を指定して、K-Means クラスタリングジョブを作成します。ジョブは非同期で実行され、ステータスの監視に使用できるジョブIDを返します。ジョブが成功すると、設定された出力パスで出力ファイルを利用できます。

<Procedures>

1. 冪等性キーを準備します。

    冪等性キーとは、同じジョブリクエストを再試行する際に変更しない一意の文字列です。詳細については、[冪等送信](./spark-batch-jobs#idempotent-submission) を参照してください。

1. リクエストペイロードを準備します。

    ```bash
    export payload='{
      "description": "clustering product embeddings",
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
        "path": "output/products-clustered.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "metric": "l2",
      "numClusters": 100,
      "resourceSize": "MEDIUM",
      "timeoutSeconds": 7200
    }'
    ```

    次の表に、ジョブ固有のパラメータを示します。

    | **パラメータ** | **必須** | **説明** |
    | --- | --- | --- |
    | `primaryKeyField` | いいえ | 各レコードを識別し、割り当てられた `cluster_id` と紐付けるための入力フィールドです。省略した場合、ジョブは出力内の各レコードに対して識別子を生成します。 |
    | `vectorField` | はい | クラスター化対象のベクトルフィールド。サポートされる表現には、`array<float>`、数値配列、Spark ベクトル、カンマ区切り文字列があります。 |
    | `metric` | はい | ベクトルの比較に使用するメトリックです。指定可能な値は `cosine` および `l2` です。 |
    | `numClusters` | はい | 作成するクラスターの数です。正の整数を指定する必要があります。 |

    すべての Spark バッチジョブに共通するパラメータについては、[リクエストペイロード](./spark-batch-jobs#request-payload) を参照してください。

1. ペイロードを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/kmeans" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-003" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    リクエスト送信後、ジョブが作成されるとレスポンスが返されます。レスポンスにはジョブIDが含まれており、進行状況の監視に使用できます。以下は成功時のレスポンス例です。

    ```json
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxx",
        "projectId": "proj-xxxxxxxx",
        "type": "SPARK",
        "description": "clustering product embeddings",
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

</Procedures>

## ジョブの監視\{#monitor-the-job}

リクエスト送信後、返されたジョブIDを使用してジョブが終了状態に達するまで監視します。ジョブのステータスや詳細の確認、既存ジョブの一覧表示、あるいはキャンセル可能な状態にあるジョブのキャンセルを行えます。

ジョブが正常に完了したら、リクエストで指定したパスに期待通りの出力が存在することを確認してください。

操作手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs) を参照してください。

## 出力の検証\{#validate-the-output}

ジョブが正常に完了したら、以下の項目を確認してください。

- 設定した Volume パスに出力ファイルが存在すること。

- すべての入力レコードと列が保持されていること。

- 各レコードに有効な `cluster_id` が含まれていること。

- 一意なクラスターIDの数が `numClusters` を超えないこと。

- 同じクラスターからサンプリングしたレコードが、想定する用途に対して十分に類似していること。

## 次のステップ\{#next-steps}

生成された `cluster_id` の値を使用して、埋め込みの分布を分析したり、異なる意味グループからレコードをサンプリングしたり、後続処理のためにレコードを整理できます。これらのグループ内で意味的に冗長なレコードを特定するには、[ベクトル類似性による重複排除](./vector-similarity-dedup) を使用します。また、全体の分布に適合しない異常なレコードを検出するには、[異常検知](./anomaly-detection) を使用します。
