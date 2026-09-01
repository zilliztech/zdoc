---
title: "異常検知 | Cloud"
slug: /anomaly-detection
sidebar_label: "異常検知"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "異常検知は、ベクトル埋め込みが全体的なデータ分布から大きく逸脱しているレコードを特定します。このジョブを使用すると、データ品質の問題、まれなケース、処理エラー、または追加の確認が必要なサンプルを示唆する異常なレコードを検出できます。 | Cloud"
type: origin
token: IQDjwxyWIi2V3VkuxKCcJV6fndb
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 異常検知

異常検知は、ベクトル埋め込みが全体的なデータ分布から大きく逸脱しているレコードを特定します。このジョブを使用すると、データ品質の問題、まれなケース、処理エラー、または追加の確認が必要なサンプルを示唆する異常なレコードを検出できます。

## 概要\{#overview}

次の図は、異常検知ジョブが Isolation Forest を使用してベクトルレコードにスコアを付け、最もスコアの高いレコードまたはスコア付きデータセット全体を返す仕組みを示しています。

![AmEAw0tXEheK1tbrSsIcbTGwndf](https://zdoc-images.s3.us-west-2.amazonaws.com/AmEAw0tXEheK1tbrSsIcbTGwndf.png)

### 異常の特定方法\{#how-anomalies-are-identified}

上の図に示すように、このジョブは Isolation Forest を使用して、全体的なベクトル分布から逸脱したレコードを特定します。各分離木の構築では、ランダムなベクトル次元と分割値の選択を繰り返し、レコードを徐々に小さなグループへ分割していきます。密集領域から離れたレコードは通常、リーフに到達するまでの分割回数が少なくて済む一方、密集領域にあるレコードはより長いパスをたどる傾向があります。この性質により、わずかな分割で孤立するレコードと、木の深いレベルまで多くの近傍レコードとグループ化されたままのレコードを区別できます。

### 異常スコアの理解\{#understand-the-anomaly-score}

ジョブは各レコードについて、すべての分離木における平均パス長を計算し、それを `outlier_score` に変換します。平均パスが短いほどスコアは高くなり、長いほどスコアは低くなります。スコアが高いほど、データセット内の他のレコードと比較してそのレコードがより異常であることを意味しますが、必ずしもそのレコードが誤っていることや削除すべきであることを意味するわけではありません。

スコアが最も高いレコードを確認し、それらがデータ品質の問題、まれだが有効なケース、想定されるばらつきのいずれに該当するかを判断します。

### 返すレコード数の選択\{#choose-how-many-records-to-return}

`topK` を使用して、`outlier_score` 値が最も高いレコードのみを返せます。たとえば、`topK` を `100` に設定すると、スコアが最も高い 100 件のレコードが返されます。`topK` を省略した場合、出力にはすべてのレコードとその異常スコアが含まれます。

### ベクトルフィールドを保持するかどうかの選択\{#choose-whether-to-retain-the-vector-field}

`outputWithFeatures` を使用して、分析対象のベクトルフィールドを出力に含めるかどうかを制御します。デフォルト値は `true` です。`false` に設定するとベクトルフィールドは除外されますが、各出力レコードをソースデータまで追跡できるよう、`primaryKeyField` を指定することを推奨します。

## 開始前に\{#before-you-start}

異常検知ジョブを作成する前に、以下の点を確認してください。

- すべての入力ファイルが互換性のあるスキーマを使用しており、分析対象のベクトルフィールドを含んでいること。

- 当該フィールド内のすべてのベクトルが同じ型と次元を持ち、同じ埋め込みモデルと前処理方法で生成されていること。

`outputWithFeatures` を `false` に設定する場合は、各出力レコードをソースデータまで追跡できるように `primaryKeyField` を指定することを検討してください。

認証、サポート対象のファイル形式、入力ファイル、出力動作など、Spark バッチジョブの実行に関する一般的な要件については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## 異常検知ジョブの作成\{#create-an-anomaly-detection-job}

異常検知ジョブを作成するには、入出力の場所、分析対象のベクトルフィールド、返すレコード数、および出力にベクトルフィールドを保持するかどうかを指定します。ジョブは非同期で実行され、ステータスの監視に使用できるジョブ ID が返されます。

<Procedures>

1. べき等性キーを準備します。

    べき等性キーは、同じジョブリクエストを再試行する際に変更されない一意の文字列です。詳細については、[べき等性のある送信](./spark-batch-jobs#idempotent-submission) を参照してください。

1. リクエストペイロードを準備します。

    ```bash
    export payload='{
      "description": "inspecting anomalous product",
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
        "path": "output/product-anomalies.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "topK": 100,
      "outputWithFeatures": true,
      "resourceSize": "MEDIUM",
      "timeoutSeconds": 7200
    }'
    ```

    次の表に、ジョブ固有のパラメータを示します。

    | パラメータ | 必須 | 説明 |
    | --- | --- | --- |
    | `vectorField` | はい | 異常検知に使用するベクトルフィールドです。サポートされる表現形式には、`array<float>`、数値配列、Spark ベクトル、カンマ区切り文字列があります。 |
    | `primaryKeyField` | いいえ | 出力内でレコードを識別するために使用する入力フィールドです。`outputWithFeatures` を `false` に設定する場合に推奨されます。 |
    | `topK` | いいえ | 返すレコードの最大数です。`outlier_score` の高い順に並べ替えられます。値は正の整数である必要があります。省略した場合、ジョブはスコア付きのすべてのレコードを返します。 |
    | `outputWithFeatures` | いいえ | 出力にベクトルフィールドを保持するかどうかを指定します。デフォルト: `true`。`false` に設定すると、ベクトルフィールドは除外されます。 |

1. ペイロードを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/anomaly-detection" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-004" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    リクエストはジョブ作成後に完了し、レスポンスには進行状況の監視に使用できるジョブ ID が含まれます。以下は成功時のレスポンス例です。

    ```json
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxx",
        "projectId": "proj-xxxxxxxx",
        "type": "SPARK",
        "description": "inspecting anomalous product",
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

リクエスト送信後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスや詳細の確認、既存ジョブの一覧表示、キャンセル可能な状態にあるジョブのキャンセルを行えます。

ジョブが成功したら、リクエストで指定したパスに期待どおりの出力があることを確認します。

操作手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-spark-batch-jobs) を参照してください。

## 出力の理解と検証\{#understand-and-validate-the-output}

異常検知ジョブの出力には、`topK` の指定有無に応じて、スコアが最も高いレコードまたはスコア付きのすべてのレコードが含まれます。各出力レコードには `outlier_score` が付与されます。

| **フィールド** | **説明** |
| --- | --- |
| `outlier_score` | レコードに割り当てられた異常スコアです。値が高いほど、データセット内の他のレコードと比較してそのレコードがより異常であることを示します。 |

出力内容は以下の設定にも依存します。

- `topK` を指定した場合、出力には `outlier_score` 値が最も高いレコードが最大 topK 件含まれます。

- `topK` を省略した場合、出力にはスコア付きのすべてのレコードが含まれます。

- `outputWithFeatures` が `true` の場合、ベクトルフィールドは保持されます。

- `outputWithFeatures` が `false` の場合、ベクトルフィールドは除外されます。

ジョブ成功後、以下の項目を確認してください。

- 出力ファイルが設定された Volume パスに存在すること。

- 各出力レコードに `outlier_score` が含まれていること。

- `topK` を指定した場合、出力に含まれるレコード数が要求した件数以下であること。

- `topK` を省略した場合、すべての有効な入力レコードが出力に含まれていること。

- ベクトルフィールドの有無が `outputWithFeatures` の設定と一致していること。

- `primaryKeyField` を指定した場合、各出力レコードを対応する入力レコードまで追跡できること。

- スコアが最も高いレコードのサンプルを確認し、データ品質の問題、まれだが有効なケース、想定されるばらつきのいずれに該当するかを判断すること。

## 次のステップ\{#next-steps}

スコアが最も高いレコードを確認し、データ品質の問題、まれだが有効なケース、またはさらなる処理が必要なレコードのいずれに該当するかを判断します。結果に基づいて、無効なデータの修正や削除、意味のあるエッジケースの保持、選択したレコードの手動レビューへの振り分けなどを行えます。

ベクトルデータの全体的な構造を調べるには、[K-Means クラスタリング](./k-means-clustering) を使用します。また、意味的に冗長なレコードを特定するには、[ベクトル類似度による重複排除](./vector-similarity-dedup) を使用します。
