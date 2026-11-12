---
title: "ベクトル類似性による重複排除 | Cloud"
slug: /vector-similarity-dedup
sidebar_label: "ベクトル類似性による重複排除"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル類似性による重複排除は、類似度の高い埋め込みを持つレコードを特定し、意味的な重複としてグループ化します。このジョブを使用して、言い換えられたテキスト、わずかに変更された画像、類似コンテンツの複数バージョンなど、意味的な冗長性を削減できます。 | Cloud"
type: origin
token: Dr1SwNSqriPKTEkeNjDcDE2XnGb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# ベクトル類似性による重複排除

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、該当するすべての AWS リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。有効にするには、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</FeatureNote>

ベクトル類似性による重複排除は、類似度の高い埋め込みを持つレコードを特定し、意味的な重複としてグループ化します。このジョブを使用して、言い換えられたテキスト、わずかに変更された画像、類似コンテンツの複数バージョンなど、意味的な冗長性を削減できます。

[主キー重複排除](./primary-key-dedup) とベクトル類似性による重複排除は、異なる種類の重複を処理します。データクレンジングワークフローでは、まず主キーが重複するレコードを削除し、その後、残りのデータに対してベクトル類似性による重複排除を実行できます。

## 概要\{#overview}

次の図は、ベクトル類似性による重複排除が重複グループを特定し、出力データセットを生成する方法を示しています。まず、ベクトルを K-Means クラスターに分割し、設定されたメトリクスを使用して各クラスター内のレコードを比較します。設定された類似度または距離のしきい値を満たすレコードは接続され、重複グループにマージされます。

![AC9XwS0lVhbb80bYSmscw2LhnZb](https://zdoc-images.s3.us-west-2.amazonaws.com/AC9XwS0lVhbb80bYSmscw2LhnZb.png)

重複グループごとに、1つのレコードが代表として選択されます。デフォルトでは、K-Means クラスターのセントロイドに最も近いレコードが選択されます。代わりに `keepBy` を使用して、別のフィールドに基づいて代表を選択できます。

出力モードに応じて、ジョブは重複グループのメタデータを持つすべてのレコードを保持するか、代表レコードと変更されていない単一レコードを含む重複排除済みデータセットを生成します。

### 重複と見なす条件を決定する\{#decide-what-counts-as-a-duplicate}

前述のしきい値（`similarityThreshold`）の意味と有効範囲は、選択したメトリクスによって異なります。しきい値を直接設定するか、目標の重複排除率を指定できます。両方のパラメーターを未指定のままにすることはできません。

<table>
   <tr>
     <th><p>手法</p></th>
     <th><p>使用する場合</p></th>
     <th><p>動作</p></th>
   </tr>
   <tr>
     <td><p><code>targetDedupRate</code></p></td>
     <td><p>適切なしきい値がまだわからない場合。</p></td>
     <td><p>要求された重複排除率に近づけるよう、入力データから <code>similarityThreshold</code> を導出します。</p></td>
   </tr>
   <tr>
     <td><p><code>similarityThreshold</code></p></td>
     <td><p>類似データに対してしきい値をすでに検証済みの場合。</p></td>
     <td><p>指定されたカットオフを直接使用します。</p><ul><li><p><code>cosine</code> の場合、<code>(0, 1]</code> の範囲の類似度値です。</p></li><li><p><code>l2</code> の場合、<code>0</code> より大きい距離値です。</p></li></ul></td>
   </tr>
</table>

`targetDedupRate` を指定すると、ジョブは要求された重複排除率にほぼ一致する結果を生成すると予想される `similarityThreshold` を自動的に推定します。K-Means クラスタリング後、ジョブは入力データの約 10% のサンプルに対して複数の候補しきい値を評価し、各しきい値の重複排除率を測定し、線形補間を使用して要求された率に対応するしきい値を推定します。

これにより、適切な `similarityThreshold` を手動で決定する必要がなくなりますが、重複排除を開始する前に追加のパラメーター推定ステージが追加されます。このステージにより、固定の `similarityThreshold` を使用する場合と比較して、処理時間が約 10% 増加する見込みです。

`similarityThreshold` の意味は、選択したメトリクスによって異なります：

- `cosine` の場合、`(0, 1]` の範囲の類似度値です。

- `l2` の場合、`0` より大きい距離値です。

### 保持するレコードを選択する\{#choose-which-record-to-keep}

デフォルトでは、ジョブは各重複グループの代表として、ベクトルがその K-Means クラスターのセントロイドに最も近いレコードを選択します。

クラスターのセントロイドに最も近いレコードが保持したいレコードでもある場合は、デフォルトの動作を使用します。重複レコードに異なるビジネス値が含まれている場合は、`keepBy` を使用して保持するレコードを定義します。`keepBy` は `<field-name>:<strategy>` の形式で設定します。たとえば、`timestamp:max` は `timestamp` フィールドの値が最も大きいレコードを保持し、これは通常、最新のレコードを表します。

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- Removed with timestamp:max -->
| doc-2       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- Retained with timestamp:max -->
| doc-3       | 1715000000 | Similar version | [0.16, 0.39] | <!-- Removed with timestamp:max -->
```

この例では、3つのレコードは埋め込みが十分に類似しているため、同じ重複グループに配置されます。`keepBy` を指定しない場合、ジョブは K-Means クラスターのセントロイドに最も近いレコードを保持します。`keepBy` を `timestamp:max` に設定すると、ジョブは `timestamp` 値が最も大きい `doc-2` を保持します。

ジョブは選択されたレコード全体を保持します。重複グループ内の異なるレコードのフィールド値を結合することはありません。

### 距離メトリクスを選択する\{#choose-a-distance-metric}

距離メトリクスは、ベクトルがクラスターに割り当てられる方法を決定します。

| **メトリクス** | **類似度の解釈方法** | **使用する場合** |
| --- | --- | --- |
| `l2` | ユークリッド距離が小さいベクトルほど類似しています。 | 埋め込みモデルまたは既存のワークフローでユークリッド距離を使用している場合は、このメトリクスを使用します。 |
| `cosine` | コサイン類似度が大きいベクトルほど類似しています。 | ベクトルの大きさよりも方向が重要な場合は、このメトリクスを使用します。 |

### 出力モードを選択する\{#choose-an-output-mode}

重複排除の結果を確認するか、クレンジング済みデータセットを直接生成するかに基づいて、出力モードを選択します。

| モード | 返される内容 | 使用する場合 |
| --- | --- | --- |
| `map` | すべての入力レコードを保持し、`parent_id` と `is_representative` を追加して、各レコードの重複グループへの割り当てと代表ステータスを示します。 | 重複グループを確認する場合、結果を監査する場合、または新しい `targetDedupRate` または `similarityThreshold` を評価する場合は、このモードを使用します。 |
| `deduped_rows` | 各重複グループの代表レコードを返し、単一レコードは変更せずに保持します。 | 重複排除設定を検証した後、ダウンストリームで使用するクレンジング済みデータセットを生成する場合は、このモードを使用します。 |

`outputMode` を省略した場合、そのデフォルト値は `primaryKeyField` が指定されているかどうかによって異なります：

- `primaryKeyField` が指定されている場合、`outputMode` のデフォルトは `map` です。

- `primaryKeyField` が省略されている場合、`outputMode` のデフォルトは `deduped_rows` です。

出力モードを明示的に `map` に設定するには、`primaryKeyField` も指定する必要があります。指定しない場合、リクエストはパラメーターエラーを返します。

`map` モードでは、出力に次の追加フィールドが含まれます：

| フィールド | 説明 |
| --- | --- |
| `parent_id` | 選択された代表レコードの主キーです。同じ重複グループ内のレコードは同じ `parent_id` を共有します。単一レコードの場合、`parent_id` はそのレコード自身の主キーに設定されます。 |
| `is_representative` | レコードが代表として保持されるかどうかを示します。このフィールドは、各重複グループで選択された代表レコードと単一レコードでは `true` です。 |

初回実行では、`map` 出力で `targetDedupRate` を使用し、レコードを削除する前に重複グループを確認します。結果を検証した後、`targetDedupRate` の使用を継続するか、再現性のある実行のために固定の `similarityThreshold` を設定します。

## 事前準備\{#before-you-start}

ベクトル類似性による重複排除ジョブを作成する前に、次の条件を満たしていることを確認してください：

- すべての入力ファイルが互換性のあるスキーマを使用し、比較するベクトルフィールドを含んでいること。

- そのフィールド内のすべてのベクトルが同じ型と次元を使用し、同じ埋め込みモデルと前処理方法を使用して生成されていること。

- `map` モードを使用するには、入力に有効な主キーフィールドが含まれ、`primaryKeyField` を使用して指定する必要があること。

- `keepBy` を使用する場合、指定したフィールドがすべての入力ファイルに存在し、選択したストラテジーを使用して比較できる値を含んでいること。

認証、入力ファイル、出力動作など、バッチジョブの実行に関する一般的な要件については、[バッチジョブ](./batch-jobs) を参照してください。

## ベクトル類似性による重複排除ジョブを作成する\{#create-a-vector-similarity-deduplication-job}

入力と出力の場所、比較するベクトルフィールド、重複検出方法、代表レコードの選択方法、および出力モードを指定して、ベクトル類似性による重複排除ジョブを作成します。ジョブは非同期で実行され、ステータスの監視に使用できるジョブ ID を返します。ジョブが成功すると、結果は設定された出力パスで利用できます。

<Procedures>

1. べき等キーを準備します。

    べき等キーは、同じジョブリクエストを再試行しても変更されない一意の文字列です。詳細については、[べき等送信](./batch-jobs#idempotent-submission) を参照してください。

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

    次の表は、ジョブ固有のパラメーターを示しています：

    <table>
       <tr>
         <th><p>パラメーター</p></th>
         <th><p>必須</p></th>
         <th><p>説明</p></th>
       </tr>
       <tr>
         <td><p><code>primaryKeyField</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>レコード識別子として使用されるフィールドです。また、<code>map</code> 出力で <code>parent_id</code> 値を生成するためにも使用されます。</p></td>
       </tr>
       <tr>
         <td><p><code>vectorField</code></p></td>
         <td><p>はい</p></td>
         <td><p>類似度比較に使用されるベクトルフィールドです。サポートされる値には、<code>array&lt;float&gt;</code>、数値配列、ベクトル、およびカンマ区切りの文字列が含まれます。</p></td>
       </tr>
       <tr>
         <td><p><code>metric</code></p></td>
         <td><p>はい</p></td>
         <td><p>ベクトル比較に使用されるメトリクスです。指定可能な値は <code>cosine</code> と <code>l2</code> です。</p></td>
       </tr>
       <tr>
         <td><p><code>similarityThreshold</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>近似重複レコードを特定するために使用されるカットオフです。</p><ul><li><p><code>cosine</code> の場合、<code>(0, 1]</code> の範囲の類似度値を指定します。この値以上の類似度を持つレコードは近似重複として扱われます。</p></li><li><p><code>l2</code> の場合、<code>0</code> より大きい距離を指定します。この値以下の距離を持つレコードは近似重複として扱われます。</p></li></ul><p>このパラメーターは <code>targetDedupRate</code> と一緒に指定しないでください。どちらのパラメーターも指定しない場合、ジョブは組み込みの重複検出デフォルト値を使用します。</p></td>
       </tr>
       <tr>
         <td><p><code>outputMode</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>出力モードです。指定可能な値は <code>map</code> と <code>deduped_rows</code> です。省略した場合、このパラメーターは、<code>primaryKeyField</code> が指定されていれば <code>map</code> に、それ以外の場合は <code>deduped_rows</code> にデフォルト設定されます。<code>map</code> に設定するには <code>primaryKeyField</code> が必要です。</p></td>
       </tr>
       <tr>
         <td><p><code>targetDedupRate</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>重複として特定するレコードの目標割合です。有効範囲は <code>(0, 1)</code> です。ジョブはこの率に近づけるよう、入力データからしきい値を導出します。</p><p>このパラメーターは <code>similarityThreshold</code> と一緒に指定しないでください。どちらのパラメーターも指定しない場合、ジョブは選択したメトリクスの組み込みの重複検出デフォルト値を使用します。</p></td>
       </tr>
       <tr>
         <td><p><code>keepBy</code></p></td>
         <td><p>いいえ</p></td>
         <td><p>各重複グループから代表を選択するために使用されるルールです。<code>&lt;field-name&gt;:&lt;strategy&gt;</code> の形式を使用します。ここで、<code>strategy</code> は <code>max</code> または <code>min</code> です。たとえば、<code>timestamp:max</code> は <code>timestamp</code> 値が最も大きいレコードを保持します。省略した場合、K-Means クラスターのセントロイドに最も近いレコードが選択されます。</p></td>
       </tr>
    </table>

    <Admonition type="info" title="Notes">

    `similarityThreshold` と `targetDedupRate` は相互に排他的です。両方を指定した場合、またはどちらも指定しない場合、エラーになります。

    </Admonition>

    すべてのバッチジョブで共有されるパラメーターについては、[リクエストペイロード](./batch-jobs#request-payload) を参照してください。

1. ジョブを送信します。

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/dedup/vector" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: batch-job-20260730-002" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    ジョブが作成されると、リクエストが返されます。レスポンスには、進捗状況の監視に使用できるジョブ ID が含まれます。次の例は、成功したレスポンスを示しています：

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

    送信時の動作の詳細については、[送信レスポンス](./batch-jobs#submission-response) を参照してください。

</Procedures>

## ジョブを監視する\{#monitor-the-job}

リクエストを送信した後、返されたジョブ ID を使用して、ジョブが終了状態に達するまで監視します。ジョブのステータスと詳細を表示したり、既存のジョブを一覧表示したり、ジョブがまだキャンセル可能な状態にある間にジョブをキャンセルしたりできます。

ジョブが成功したら、リクエストで指定したパスに期待される出力が存在することを確認します。

手順、ジョブの状態、状態遷移については、[Spark バッチジョブの管理](./manage-batch-jobs) を参照してください。

## 出力を検証する\{#validate-the-output}

ジョブが成功したら、次の点を確認してください：

- 出力ファイルが設定されたボリュームパスに存在すること。

- `map` 出力の場合：

    - すべての入力レコードが保持されていること。

    - 同じ重複グループ内のレコードが同じ `parent_id` を共有していること。

    - 各重複グループに、`is_representative` が `true` に設定されたレコードがちょうど 1つ存在すること。

    - 単一レコードが自身の主キーを `parent_id` として使用し、`is_representative` が `true` に設定されていること。

- `deduped_rows` 出力の場合：

    - 各重複グループの代表レコードのみが保持されていること。

    - 単一レコードが変更されずに残っていること。

- `keepBy` を指定した場合、サンプリングされた各重複グループの代表が、設定されたフィールドとストラテジーに一致すること。

- 生成された重複グループのサンプルに、実際に近似重複であるレコードが含まれていること。

## 次のステップ\{#next-step}

まだ行っていない場合は、[主キー重複排除](./primary-key-dedup) を使用して、同じ主キー値を持つレコードを特定します。モデルトレーニングや大規模なデータ分析では、[K-Means クラスタリング](./k-means-clustering) を使用して埋め込みの分布を調べ、[異常検出](./anomaly-detection) を使用して、さらに確認が必要な可能性のある異常なレコードを見つけます。 
