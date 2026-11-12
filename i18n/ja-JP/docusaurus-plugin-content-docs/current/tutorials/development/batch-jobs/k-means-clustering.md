---
title: "K-Means クラスタリング | Cloud"
slug: /k-means-clustering
sidebar_label: "K-Means クラスタリング"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "K-Means クラスタリングは、類似した埋め込みを持つレコードを指定した数のクラスターにグループ化します。このジョブは、ベクトルデータの分布を調べたり、レコードを大まかな意味グループに整理したり、サンプリングや分析、その他のダウンストリームワークフロー用にデータセットを準備したりするために使用します。 | Cloud"
type: origin
token: SpMPwIX9diuiqfkHEAZcBSmnnOc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# K-Means クラスタリング

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、対象となるすべての AWS リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。有効にするには、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</FeatureNote>

K-Means クラスタリングは、類似した埋め込みを持つレコードを、指定した数のクラスターにグループ化します。このジョブは、ベクトルデータの分布の調査、レコードの大まかな意味グループへの整理、またはサンプリングや分析、その他のダウンストリームワークフロー用のデータセット準備に使用します。

このジョブは、すべての入力レコードを保持し、各レコードに割り当てられたクラスターを示す `cluster_id` フィールドを追加します。

## 概要\{#overview}

次の図は、K-Means クラスタリングジョブがベクトルデータをどのように整理するかを示しています。このジョブは、指定されたベクトルフィールドを読み取り、各レコードを要求されたクラスターのいずれかに割り当て、元のレコードに `cluster_id` フィールドを追加して書き込みます。  

同じ `cluster_id` が割り当てられたレコードは、同じクラスターに属します。現在、このジョブはクラスター重心を個別の出力ファイルとして書き込みません。

![PIGQwxa6th4dLWbYG6jcCCCSnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/PIGQwxa6th4dLWbYG6jcCCCSnxb.png)

### クラスター数の選択\{#choose-the-number-of-clusters}

`numClusters` に、ジョブで生成するグループ数を設定します。値を小さくするとより大まかなクラスターが作成され、値を大きくするとより細分化されたクラスターが作成されます。

### 距離メトリックの選択\{#choose-a-distance-metric}

距離メトリックは、ベクトルがクラスターに割り当てられる方法を決定します。

| **メトリック** | **類似性の解釈** | **使用する場合** |
| --- | --- | --- |
| `l2` | ユークリッド距離が小さいベクトルほど、より類似しています。 | 埋め込みモデルまたは既存のワークフローでユークリッド距離を使用する場合に、このメトリックを使用します。 |
| `cosine` | コサイン類似度が大きいベクトルほど、より類似しています。 | ベクトルの大きさよりもベクトルの方向が重要な場合に、このメトリックを使用します。 |

### 出力の理解\{#understand-the-output}

出力はすべての入力列を保持し、各レコードに `cluster_id` フィールドを追加します。

| **フィールド** | **説明** |
| --- | --- |
| `cluster_id` | レコードに割り当てられたクラスターです。同じ `cluster_id` を持つレコードは、同じ K-Means クラスターに属します。 |

このジョブは、有効なすべての入力ベクトルをいずれか 1つのクラスターに割り当てます。クラスター ID は 1つのジョブの出力内でグループを識別するものであり、別々の実行間で安定した識別子として扱うべきではありません。

## 事前準備\{#before-you-start}

K-Means クラスタリングジョブを作成する前に、次の点を確認してください。

- すべての入力ファイルが互換性のあるスキーマを使用し、クラスタリング対象のベクトルフィールドを含んでいること。

- そのフィールド内のすべてのベクトルが同じ型と次元を使用し、同じ埋め込みモデルと前処理方法を使用して生成されていること。

バッチジョブの実行に関する一般的な要件（認証、入力ファイル、出力動作など）については、[バッチジョブ](./batch-jobs) を参照してください。

## K-Means クラスタリングジョブを作成する\{#create-a-k-means-clustering-job}

入力と出力の場所、クラスタリングするベクトルフィールド、距離メトリック、クラスター数を指定して、K-Means クラスタリングジョブを作成します。ジョブは非同期で実行され、ステータスの監視に使用できるジョブ ID を返します。ジョブが成功すると、出力ファイルは設定した出力パスで利用できます。

<Procedures>

1. 冪等キーを準備します。

    冪等キーは、同じジョブリクエストを再試行しても変更されない一意の文字列です。詳細については、[冪等な送信](./batch-jobs#idempotent-submission) を参照してください。

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

    次の表に、ジョブ固有のパラメーターを示します。

    | **パラメーター** | **必須** | **説明** |
    | --- | --- | --- |
    | `primaryKeyField` | いいえ | 各レコードを識別し、割り当てられた `cluster_id` に関連付けるために使用する入力フィールドです。省略すると、ジョブは出力内の各レコードの識別子を生成します。 |
    | `vectorField` | はい | クラスタリングするベクトルフィールドです。サポートされる表現には、`array<float>`、数値配列、ベクトル、カンマ区切り文字列が含まれます。 |
    | `metric` | はい | ベクトルの比較に使用するメトリックです。指定できる値は `cosine` と `l2` です。 |
    | `numClusters` | はい | 作成するクラスター数です。値は正の整数である必要があります。 |

    すべてのバッチジョブで共有されるパラメーターについては、[リクエストペイロード](./batch-jobs#request-payload) を参照してください。

1. ペイロードを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/kmeans" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: batch-job-20260730-003" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    リクエストは、ジョブが作成された後に返されます。レスポンスには、ジョブの進行状況を監視するために使用できるジョブ ID が含まれます。次の例は、成功したレスポンスを示しています。

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

リクエストを送信した後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細を表示したり、既存のジョブを一覧表示したり、キャンセル可能な状態にある間にジョブをキャンセルしたりできます。

ジョブが成功したら、期待どおりの出力がリクエストで指定したパスで利用できることを確認してください。

手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-batch-jobs) を参照してください。

## 出力の検証\{#validate-the-output}

ジョブが成功したら、次の点を確認してください。

- 出力ファイルが、設定されたボリュームパスに存在すること。

- すべての入力レコードと列が保持されていること。

- 各レコードに有効な `cluster_id` が含まれていること。

- 異なるクラスター ID の数が `numClusters` を超えていないこと。

- 同じクラスターからサンプリングしたレコードが、想定する用途に対して妥当な程度に類似していること。

## 次のステップ\{#next-steps}

生成された `cluster_id` 値を使用して、埋め込みの分布を分析したり、異なる意味グループからレコードをサンプリングしたり、ダウンストリーム処理用にレコードを整理したりします。これらのグループ内で意味的に冗長なレコードを特定するには、[ベクトル類似性重複排除](./vector-similarity-dedup) を使用します。より広い分布に適合しない異常なレコードを見つけるには、[異常検知](./anomaly-detection) を使用します。
