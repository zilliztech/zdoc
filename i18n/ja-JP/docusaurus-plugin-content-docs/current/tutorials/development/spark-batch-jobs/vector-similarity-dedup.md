---
title: "ベクトル類似度重複排除 | Cloud"
slug: /vector-similarity-dedup
sidebar_label: "ベクトル類似度重複排除"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル類似度重複排除は、非常に類似した埋め込みを持つレコードを特定し、それらを意味的な重複としてグループ化します。このジョブを使用すると、言い換えられたテキスト、わずかに変更された画像、類似コンテンツの複数バージョンなど、意味的な冗長性を削減できます。 | Cloud"
type: origin
token: Dr1SwNSqriPKTEkeNjDcDE2XnGb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# ベクトル類似度重複排除

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、AWS us-west-2 リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

ベクトル類似度重複排除は、非常に類似した埋め込みを持つレコードを特定し、それらを意味的な重複としてグループ化します。このジョブを使用すると、言い換えられたテキスト、わずかに変更された画像、類似コンテンツの複数バージョンなど、意味的な冗長性を削減できます。

[プライマリキー重複排除](./primary-key-dedup) とベクトル類似度重複排除は、それぞれ異なる種類の重複に対処します。データクレンジングのワークフローでは、まずプライマリキーが重複するレコードを削除し、その後、残りのデータに対してベクトル類似度重複排除を実行できます。

## 概要\{#overview}

次の図は、ベクトル類似度重複排除が重複グループを特定し、出力データセットを生成する仕組みを示しています。まず、ベクトルを K-Means クラスターに分割し、構成されたメトリックを使用して各クラスター内のレコードを比較します。構成された類似度または距離のしきい値を満たすレコードが接続され、重複グループに統合されます。

![AC9XwS0lVhbb80bYSmscw2LhnZb](https://zdoc-images.s3.us-west-2.amazonaws.com/AC9XwS0lVhbb80bYSmscw2LhnZb.png)

各重複グループから、代表として 1 件のレコードが選択されます。デフォルトでは、K-Means クラスターの重心に最も近いレコードが選択されます。代わりに `keepBy` を使用すると、別のフィールドに基づいて代表を選択できます。

出力モードに応じて、ジョブは重複グループのメタデータを付けてすべてのレコードを保持するか、代表レコードと変更されていないシングルトンレコードを含む重複排除済みデータセットを生成します。

### 重複と見なされる条件の決定\{#decide-what-counts-as-a-duplicate}

前述のしきい値（`similarityThreshold`）の意味と有効範囲は、選択したメトリックによって異なります。しきい値を直接設定するか、目標の重複排除率を指定します。両方のパラメーターを未指定のままにすることはできません。

<table>
   <tr>
     <th><p>方法</p></th>
     <th><p>使用場面</p></th>
     <th><p>動作</p></th>
   </tr>
   <tr>
     <td><p><code>targetDedupRate</code></p></td>
     <td><p>適切なしきい値がまだわからない場合。</p></td>
     <td><p>入力データから <code>similarityThreshold</code> を導出し、要求された重複排除率に近づけます。</p></td>
   </tr>
   <tr>
     <td><p><code>similarityThreshold</code></p></td>
     <td><p>類似したデータに対してしきい値をすでに検証済みの場合。</p></td>
     <td><p>指定したカットオフをそのまま使用します。</p><ul><li><p><code>cosine</code> の場合、<code>(0, 1]</code> の範囲の類似度の値です。</p></li><li><p><code>l2</code> の場合、<code>0</code> より大きい距離の値です。</p></li></ul></td>
   </tr>
</table>

`targetDedupRate` を指定すると、ジョブは要求された重複排除率とほぼ同等の結果を生成すると見込まれる `similarityThreshold` を自動的に推定します。K-Means クラスタリングの後、ジョブは入力データの約 10% のサンプルに対して複数の候補しきい値を評価し、各しきい値の重複排除率を測定して、線形補間を使用して要求された率に対応するしきい値を推定します。

これにより、適切な `similarityThreshold` を手動で決定する必要がなくなりますが、重複排除が開始される前にパラメーター推定の追加ステージが発生します。このステージにより、固定の `similarityThreshold` を使用する場合と比べて処理時間が約 10% 増加する見込みです。

`similarityThreshold` の意味は、選択したメトリックによって異なります。

- `cosine` の場合、`(0, 1]` の範囲の類似度の値です。

- `l2` の場合、`0` より大きい距離の値です。

### 保持するレコードの選択\{#choose-which-record-to-keep}

デフォルトでは、ジョブは自身の K-Means クラスターの重心にベクトルが最も近いレコードを、各重複グループの代表として選択します。

クラスターの重心に最も近いレコードが、保持したいレコードでもある場合は、デフォルトの動作を使用します。重複レコードに異なるビジネス上の値が含まれている場合は、`keepBy` を使用して保持するレコードを定義します。`keepBy` は `<field-name>:<strategy>` の形式で設定します。たとえば、`timestamp:max` は `timestamp` フィールドの値が最も大きいレコードを保持します。これは通常、最も新しいレコードを表します。

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- Removed with timestamp:max -->
| doc-2       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- Retained with timestamp:max -->
| doc-3       | 1715000000 | Similar version | [0.16, 0.39] | <!-- Removed with timestamp:max -->
```

この例では、3 件のレコードは埋め込みが十分に類似しているため、同じ重複グループに配置されます。`keepBy` を指定しない場合、ジョブは K-Means クラスターの重心に最も近いレコードを保持します。`keepBy` を `timestamp:max` に設定すると、ジョブは `timestamp` 値が最も大きい `doc-2` を保持します。

ジョブは、選択されたレコード全体を保持します。重複グループ内の異なるレコードのフィールド値を結合することはありません。

### 距離メトリックの選択\{#choose-a-distance-metric}

距離メトリックは、ベクトルがどのようにクラスターに割り当てられるかを決定します。

| **メトリック** | **類似性の解釈** | **使用場面** |
| --- | --- | --- |
| `l2` | ユークリッド距離が小さいベクトルほど類似性が高いとみなされます。 | 埋め込みモデルや既存のワークフローでユークリッド距離を使用している場合に適しています。 |
| `cosine` | コサイン類似度が大きいベクトルほど類似性が高いとみなされます。 | ベクトルの方向がベクトルの大きさよりも重要な場合は、このメトリックを使用します。 |

### 出力モードの選択\{#choose-an-output-mode}

重複排除の結果を確認するのか、クリーンアップ済みデータセットを直接生成するのかに基づいて、出力モードを選択します。

| モード | 返される内容 | 使用場面 |
| --- | --- | --- |
| `map` | すべての入力レコードを保持し、各レコードの重複グループの割り当てと代表ステータスを示す `parent_id` と `is_representative` を追加します。 | 重複グループの確認、結果の監査、または新しい `targetDedupRate` や `similarityThreshold` の評価にこのモードを使用します。 |
| `deduped_rows` | 各重複グループから代表レコードを返し、シングルトンレコードは変更せずに保持します。 | 重複排除の設定を検証した後に、このモードを使用して下流で使用するクリーンアップ済みデータセットを生成します。 |

`outputMode` を省略した場合、そのデフォルト値は `primaryKeyField` が指定されているかどうかによって異なります。

- `primaryKeyField` を指定した場合、`outputMode` のデフォルトは `map` です。

- `primaryKeyField` を省略した場合、`outputMode` のデフォルトは `deduped_rows` です。

出力モードを明示的に `map` に設定するには、`primaryKeyField` も指定する必要があります。指定しない場合、リクエストはパラメーターエラーを返します。

`map` モードでは、出力に以下の追加フィールドが含まれます。

| フィールド | 説明 |
| --- | --- |
| `parent_id` | 選択された代表レコードのプライマリキーです。同じ重複グループ内のレコードは同じ `parent_id` を共有します。シングルトンレコードの場合、`parent_id` には自身のプライマリキーが設定されます。 |
| `is_representative` | レコードが代表として保持されるかどうかを示します。このフィールドは、各重複グループで選択された代表とシングルトンレコードの場合に `true` になります。 |

初回の実行では、`map` 出力とともに `targetDedupRate` を使用し、レコードを削除する前に重複グループを確認します。結果を検証した後は、引き続き `targetDedupRate` を使用するか、繰り返し実行できるように固定の `similarityThreshold` を設定します。

## 事前準備\{#before-you-start}

ベクトル類似度重複排除ジョブを作成する前に、以下の点を確認してください。

- すべての入力ファイルが互換性のあるスキーマを使用しており、比較対象のベクトルフィールドを含んでいること。

- 該当フィールド内のすべてのベクトルが同じ型と次元を持ち、同じ埋め込みモデルおよび前処理方法で生成されていること。

- `map` モードを使用するには、入力に有効なプライマリキーフィールドが含まれている必要があり、`primaryKeyField` を使用して指定する必要があること。

- `keepBy` を使用する場合、指定したフィールドがすべての入力ファイルに存在し、選択した戦略で比較できる値を含んでいること。

認証、入力ファイル、出力の動作など、Spark バッチジョブの実行に関する一般的な要件については、[Spark バッチジョブ](./spark-batch-jobs) を参照してください。

## ベクトル類似度重複排除ジョブの作成\{#create-a-vector-similarity-deduplication-job}

入出力の場所、比較対象のベクトルフィールド、重複の検出方法、代表レコードの選択方法、および出力モードを指定して、ベクトル類似度重複排除ジョブを作成します。ジョブは非同期で実行され、ステータスの監視に使用できるジョブ ID を返します。ジョブが成功すると、設定された出力パスで結果を利用できます。

<Procedures>

1. 冪等性キーを準備します。

    冪等性キーとは、同じジョブリクエストを再試行する際に変更しない一意の文字列です。詳細については、[冪等送信](./spark-batch-jobs#idempotent-submission) を参照してください。

1. リクエストペイロードを準備します。

    ```bash
    export payload = '{
      "description": "deduplicate by product semantics",
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
        "path": "output/products-vector-dedup.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "metric": "cosine",
      "similarityThreshold": 0.95,
      "outputMode": "map",
      "keepBy": "updated_at:max",
      "resourceSize": "MEDIUM",
      "timeoutSeconds": 7200
    }
    '
    ```

    次の表に、ジョブ固有のパラメーターを示します。

    <table>
       <tr>
         <th><p>パラメーター</p></th>
         <th><p>必須</p></th>
         <th><p>説明</p></th>
       </tr>
       <tr>
         <td><p><code>primaryKeyField</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>レコード識別子として使用されるフィールドです。<code>map</code> 出力で <code>parent_id</code> 値の生成にも使用されます。</p></td>
       </tr>
       <tr>
         <td><p><code>vectorField</code></p></td>
         <td><p>はい</p></td>
         <td><p>類似性の比較に使用するベクトルフィールドです。サポートされる値には、<code>array&lt;float&gt;</code>、数値配列、Spark ベクトル、カンマ区切り文字列があります。</p></td>
       </tr>
       <tr>
         <td><p><code>metric</code></p></td>
         <td><p>はい</p></td>
         <td><p>ベクトルの比較に使用するメトリックです。指定可能な値は <code>cosine</code> および <code>l2</code> です。</p></td>
       </tr>
       <tr>
         <td><p><code>similarityThreshold</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>ニアデュプリケートレコードを特定するために使用するカットオフです。</p><ul><li><p><code>cosine</code> の場合、<code>(0, 1]</code> の範囲の類似度の値を指定します。この値以上の類似度を持つレコードはニアデュプリケートとして扱われます。</p></li><li><p><code>l2</code> の場合、<code>0</code> より大きい距離を指定します。この値以下の距離を持つレコードはニアデュプリケートとして扱われます。</p></li></ul><p>このパラメーターは <code>targetDedupRate</code> と同時に指定しないでください。どちらも指定しない場合、ジョブは組み込みの重複検出のデフォルト値を使用します。</p></td>
       </tr>
       <tr>
         <td><p><code>outputMode</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>出力モードです。指定可能な値は <code>map</code> および <code>deduped_rows</code> です。省略した場合、このパラメーターは <code>primaryKeyField</code> が指定されていれば <code>map</code> に、それ以外の場合は <code>deduped_rows</code> にデフォルト設定されます。<code>map</code> に設定するには <code>primaryKeyField</code> が必要です。</p></td>
       </tr>
       <tr>
         <td><p><code>targetDedupRate</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>重複として特定するレコードの目標割合です。有効範囲は <code>(0, 1)</code> です。ジョブはこの割合に近づけるために、入力データからしきい値を導出します。</p><p>このパラメーターは <code>similarityThreshold</code> と同時に指定しないでください。どちらも指定しない場合、ジョブは選択したメトリックの組み込みの重複検出のデフォルト値を使用します。</p></td>
       </tr>
       <tr>
         <td><p><code>keepBy</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>各重複グループから代表を選択するために使用するルールです。<code>&lt;field-name&gt;:&lt;strategy&gt;</code> の形式で使用します。<code>strategy</code> は <code>max</code> または <code>min</code> です。たとえば、<code>timestamp:max</code> は <code>timestamp</code> 値が最も大きいレコードを保持します。省略した場合、K-Means クラスターの重心に最も近いレコードが選択されます。</p></td>
       </tr>
    </table>

    <Admonition type="info" title="Notes">

    `similarityThreshold` と `targetDedupRate` は相互に排他的です。両方を指定した場合、またはどちらも指定しない場合はエラーになります。

    </Admonition>

    すべての Spark バッチジョブに共通するパラメーターについては、[リクエストペイロード](./spark-batch-jobs#request-payload) を参照してください。

1. ジョブを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/dedup/vector" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-002" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    リクエストは、ジョブが作成された後に返されます。レスポンスには、進行状況の監視に使用できるジョブ ID が含まれます。次の例は、成功時のレスポンスを示しています。

    ```json
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxx",
        "projectId": "proj-xxxxxxxx",
        "type": "SPARK",
        "description": "deduplicate by product semantics",
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

ジョブが成功したら、以下を確認してください。

- 出力ファイルが、設定された Volume パスに存在すること。

- `map` 出力の場合、以下のとおりです。

    - すべての入力レコードが保持されていること。

    - 同じ重複グループ内のレコードが同じ `parent_id` を共有していること。

    - 各重複グループに、`is_representative` が `true` に設定されたレコードがちょうど 1 件あること。

    - シングルトンレコードは自身のプライマリキーを `parent_id` として使用し、`is_representative` が `true` に設定されていること。

- `deduped_rows` 出力の場合、以下のとおりです。

    - 各重複グループの代表レコードのみが保持されていること。

    - シングルトンレコードが変更されずに残っていること。

- `keepBy` を指定した場合、サンプリングした各重複グループの代表が、設定したフィールドと戦略に一致していること。

- 生成された重複グループのサンプルに、実際にニアデュプリケートであるレコードが含まれていること。

## 次のステップ\{#next-step}

まだ実施していない場合は、[プライマリキー重複排除](./primary-key-dedup) を使用して、同じプライマリキー値を持つレコードを特定します。モデルトレーニングや大規模なデータ分析には、[K-Means クラスタリング](./k-means-clustering) を使用して埋め込みの分布を調べ、[異常検知](./anomaly-detection) を使用して、さらに確認が必要な可能性がある異常なレコードを見つけます。 

