---
title: "Spark バッチジョブ | Cloud"
slug: /spark-batch-jobs
sidebar_label: "Spark バッチジョブ"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark バッチジョブを使用すると、Zilliz Cloud で管理されている大規模データセットに対して分散オフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター化、検査を行えます。 | Cloud"
type: origin
token: K4F3wDpFciHWwJkZd5qc302OnWg
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Spark バッチジョブ

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS us-west-2 リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

Spark バッチジョブを使用すると、Zilliz Cloud で管理されている大規模データセットに対して分散オフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター化、検査を行えます。

Spark バッチジョブは、長時間実行されるデータ処理タスク向けに設計されています。低レイテンシーのオンラインリクエストやレコード単位の変換を目的としたものではありません。

## 発生する可能性のある問題\{#problems-you-may-encounter}

ベクトルデータセットが大きくなるにつれて、単純な挿入や検索操作だけでは対応できなくなる場合があります。繰り返しの取り込みによって重複が発生したり、大規模な埋め込みコレクションの全体像を把握しにくくなったり、前処理パイプラインの失敗によって疑わしいレコードが残ったりすることがあります。

### 重複するベクトル埋め込み\{#duplicate-vector-embeddings}

再試行、繰り返しのインポート、データソースの重複、同じテキストや画像のわずかな変更版などによって、エンティティ間で重複するベクトル埋め込みが作成されることがあります。一部のエンティティは同じプライマリキーを共有していますが、ほかのエンティティはプライマリキーが異なるものの内容がほぼ同一であり、ストレージ、インデックス作成、後続処理のコストを増加させます。

Spark バッチジョブは、大規模なデータセット全体で重複を特定して削除できます。同じ ID を持つレコードを整理するには **プライマリキー重複排除ジョブ** を、ID は異なるが内容がほぼ同一のレコードを検出するには **ベクトル類似度重複排除ジョブ** を使用します。

### 不明瞭な埋め込み分布\{#unclear-embedding-distributions}

コレクションが大きくなるにつれて、埋め込み分布の全体像を把握することが難しくなります。どのパターンがデータセットを支配しているのか、ロングテールデータがどこに現れるのか、新しくインポートされたデータが既存のレコードと異なるのかどうかを把握できない場合があります。

**K-Means クラスタリングジョブ** は、類似する埋め込みを大まかなクラスターにグループ化し、各レコードにクラスター ID を割り当てます。この結果を利用して、データ分布の分析、データソースの比較、代表的なサンプルの作成、類似度に基づく処理の小規模なグループへの分割を行えます。

### 埋め込みデータに潜む異常\{#hidden-anomalies-in-embedding-data}

埋め込みパイプラインでは、一見すると有効に見えるものの、データセットの残りの部分と一致しないレコードが生成されることがあります。前処理の失敗、不適切なモデル、パースノイズ、破損したソースコンテンツ、予期しないデータバッチなどによって、手動での確認では発見しにくい異常な埋め込みが作成される可能性があります。

**異常検知ジョブ** は、埋め込み分布をスキャンし、一般的なパターンから大きく外れるレコードを特定します。この結果を利用して、再埋め込み、クリーンアップ、またはさらなるレビューが必要になる可能性があるデータを見つけることができます。異常は必ずしも無効であるとは限らないため、フラグが付けられたレコードは自動的に削除するのではなく、レビューする必要があります。

## ジョブタイプの選択\{#choose-a-job-type}

次の表に、目的に応じて推奨されるジョブタイプを示します。

| **目的** | **推奨されるジョブ** |
| --- | --- |
| 同じプライマリキーを共有するレコードの削除 | [プライマリキー重複排除](./primary-key-dedup) |
| ベクトル表現が非常に類似しているレコードの検出 | [ベクトル類似度重複排除](./vector-similarity-dedup) |
| ベクトルデータをあらかじめ定義された数のグループに分割 | [K-Means クラスタリング](./k-means-clustering) |
| 主要なデータ分布から大きく外れるレコードの検出 | [異常検知](./anomaly-detection) |

## Spark バッチジョブの仕組み\{#how-spark-batch-jobs-work}

Spark バッチジョブは、長時間実行される分散オフライン処理ジョブであり、ジョブ作成リクエストを受け取るとすぐにジョブ ID を返します。このジョブ ID をハンドラーとして使用して、進行状況の監視とライフサイクルの管理を行えます。

### 事前準備\{#before-you-start}

Spark バッチジョブを送信するには、次の条件を満たしていることを確認してください。

- 十分な権限を持つ有効な Zilliz Cloud API キーがあること。

- 入力データが、サポートされている形式で Zilliz Cloud ボリュームに用意されていること。

    - サポートされているデータファイル形式は `parquet`、`lance`、`json`、`csv` です。

- 各外部ボリュームに関連付けられたストレージロールが、ジョブに必要な権限を持っていること。

    - 入力用の外部ボリュームには、入力場所への読み取りアクセス権が必要です。

    - 出力用の外部ボリュームには、出力場所への読み取りと書き込みのアクセス権が必要です。これには、ジョブの実行中に作成された一時オブジェクトや不完全なオブジェクトを削除する権限も含まれます。

    - 入力と出力の外部ボリュームでは、異なるストレージロールを使用できます。

### 外部ボリュームの権限を構成する\{#configure-external-volume-permissions}

Spark バッチジョブは、外部ボリュームから入力データを読み取り、結果を外部ボリュームに書き込みます。ジョブを送信する前に、各ボリュームに関連付けられたオブジェクトストレージのロールが、その用途に必要な権限を持っていることを確認してください。

入力ボリュームと出力ボリュームでは、異なるストレージロールを使用できます。各ロールには、対応するバケットとプレフィックスに必要な権限のみを付与してください。

#### 入力ボリューム\{#input-volume}

入力ボリュームには、入力データへの読み取りアクセス権が必要です。ボリュームで使用する統合がすでに必要な読み取り権限を提供している場合、追加の権限は必要ありません。

Amazon S3 の場合、ロールには次の権限が必要です。

- 入力プレフィックス配下のオブジェクトに対する `s3:GetObject`。

- 入力プレフィックス配下のオブジェクトを一覧表示するための `s3:ListBucket`。

- バケットに対する `s3:GetBucketLocation`。

<details>

<summary>例を表示するには、ここをクリックしてください。</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListInput",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::<bucket>",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "<input-prefix>",
            "<input-prefix>/*"
          ]
        }
      }
    },
    {
      "Sid": "ReadInput",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket>/<input-prefix>/*"
    }
  ]
}
```

</details>

#### 出力ボリューム\{#output-volume}

出力ボリュームには、ジョブの結果を書き込む権限が必要です。また、Spark は一時オブジェクトや、失敗またはキャンセルされた書き込みによって残されたオブジェクトを削除する場合があります。

Amazon S3 の場合、ロールには次の権限が必要です。

- 出力場所にアクセスするための `s3:GetObject`、`s3:ListBucket`、`s3:GetBucketLocation`。

- 結果を書き込むための `s3:PutObject`。

- 一時的な出力オブジェクトや不完全な出力オブジェクトをクリーンアップするための `s3:DeleteObject`。

`s3:PutObject` と `s3:DeleteObject` は、バケット全体ではなく出力プレフィックスに限定してください。

<details>

<summary>例を表示するには、ここをクリックしてください。</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListOutput",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::<bucket>",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "<output-prefix>",
            "<output-prefix>/*"
          ]
        }
      }
    },
    {
      "Sid": "ReadWriteOutput",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::<bucket>/<output-prefix>/*"
    }
  ]
}
```

</details>

### Spark バッチジョブを送信して実行する\{#submit-and-run-a-spark-batch-job}

API キーを取得し、必要なファイルを Zilliz Cloud ボリュームにアップロードしたら、Spark バッチジョブを送信して実行する準備は完了です。

<Procedures>

1. べき等性キーを生成します。

    べき等性キーは、同じジョブリクエストを再試行するときに変わらない一意の文字列です。詳細については、[べき等性のある送信](./primary-key-dedup) を参照してください。

1. リクエストヘッダーを準備します。

    Spark バッチジョブを作成するときは、前のステップで生成したべき等性キーをリクエストヘッダーに含めます。

    ```http
    Authorization: Bearer <api-key>
    Idempotency-Key: spark-job-20260730-001
    Content-Type: application/json
    ```

1. リクエストペイロードを準備します。

    すべての Spark バッチジョブは共通のペイロード構造を共有しており、ジョブの目的に応じてジョブ固有のパラメーターが異なります。

    共通のペイロード構造については、[リクエストペイロード](./primary-key-dedup) を参照してください。ジョブ固有のパラメーターについては、次のページを参照してください。

    - [プライマリキー重複排除](./primary-key-dedup)

    - [ベクトル類似度重複排除](./vector-similarity-dedup)

    - [K-Means クラスタリング](./k-means-clustering)

    - [外れ値検出](./anomaly-detection)

</Procedures>

#### べき等性のある送信\{#idempotent-submission}

べき等性キーを使用すると、ジョブの送信を安全に再試行できます。Zilliz Cloud はキーとリクエストボディの両方を確認して、既存のジョブを返すか、リクエストを競合として拒否するかを判断します。一致時の動作を次の表に示します。

| ケース | 動作 |
| --- | --- |
| べき等性キーが同じでリクエストボディも同じ | 以前に作成された Spark バッチジョブを返します。重複するジョブは作成されません。 |
| べき等性キーが同じでリクエストボディが異なる | 競合エラーを返します。 |

べき等性キーのスコープは、特定の組織、ユーザー、リージョン、およびプロジェクトです。Zilliz Cloud は、ジョブの最大タイムアウト期間に基づいて、キーを約 **25 時間**保持します。保持期間が過ぎると、同じキーを新しい送信に再利用できます。

#### リクエストペイロード\{#request-payload}

すべての Spark バッチジョブは、次のような共通のペイロード構造を共有します。

```json
{
  "description": "optional description",
  "regionId": "aws-us-west-2",
  "input": {...},
  "output": {...},
  "resourceSize": "SMALL",
  "timeoutSeconds": 3600
}
```

次の表に、これらのパラメーターの説明を示します。

| パラメーター | 必須 | 説明 |
| --- | --- | --- |
| `description` | いいえ | ジョブの説明（任意）です。<br/>値は 1,024 文字以内の文字列です。 |
| `regionId` | はい | ジョブを実行する Zilliz Cloud リージョンの ID です。サポートされているリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 |
| `input` | いいえ | ジョブの入力です。これは組み込みジョブでのみ必須です。詳細については、以下の表を参照してください。 |
| `output` | いいえ | ジョブの出力です。これは組み込みジョブで必須です。詳細については、以下の表を参照してください。 |
| `resourceSize` | いいえ | ジョブに必要な Spark クラスターのサイズです。指定可能な値は `SMALL`、`MEDIUM`、`LARGE`、`XLARGE`、`2XLARGE`、`3XLARGE` です。 |
| `timeoutSeconds` | いいえ | 現在のジョブのタイムアウト期間（秒）です。値は `300` から `86400` までの正の整数です。 |

上記の表の `input` パラメーターと `output` パラメーターは、次のような同様の構造を共有します。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>はい</p></td>
     <td><p>Spark バッチジョブのタイプです。これは <code>input</code> と <code>output</code> の両方に適用されます。指定可能な値は次のとおりです。</p><ul><li><code>volume</code></li></ul></td>
   </tr>
   <tr>
     <td><p><code>volumeName</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>Zilliz Cloud ボリュームの名前です。<code>type</code> を <code>volume</code> に設定する場合に必須です。これは <code>input</code> と <code>output</code> の両方に適用されます。</p></td>
   </tr>
   <tr>
     <td><p><code>path</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>input/output ファイルのパスは、指定した Zilliz Cloud ボリュームのルートからの相対パスです。<code>type</code> を <code>volume</code> に設定する場合に必須です。これは <code>input</code> と <code>output</code> の両方に適用されます。</p><p>ファイルが <code>volume://path/to/data.parquet</code> にある場合は、<code>path</code> を <code>path/to/data.parquet</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>format</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>入力ファイルまたは出力ファイルの形式です。これは <code>input</code> と <code>output</code> の両方に適用されます。このパラメーターのデフォルト値は <code>parquet</code> です。指定可能な値は <code>parquet</code>、<code>lance</code>、<code>json</code>、<code>csv</code> です。</p></td>
   </tr>
   <tr>
     <td><p><code>writeMode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>出力ファイルの書き込みモードです。これは <code>output</code> にのみ適用されます。指定可能な値は次のとおりです。</p><ul><li><p><code>ERROR_IF_EXIST</code></p><p>指定した出力ファイルがすでに存在する場合にエラーを返します。これがデフォルトのオプションです。</p></li><li><p><code>OVERWRITE</code></p><p>指定したファイルを上書きします。</p></li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Notes">

`input` の場合、`format` によって使用される Spark データソースリーダーが決まります。このパラメーターを省略すると、ジョブはデフォルトで Parquet リーダーを使用し、指定したパス配下の Parquet ファイルのみを処理します。JSON や CSV などほかの形式のファイルは無視されます。

処理するファイルが Parquet 以外の場合は、`input.format` に対応する形式を明示的に設定してください。このジョブは、異なる形式のファイルを自動的に検出して結合することはありません。

</Admonition>

#### 送信レスポンス\{#submission-response}

成功したジョブリクエストのレスポンスでは、異なる HTTP コードが返される場合があります。次の表に、レスポンスに含まれる該当する HTTP コードを示します。

| ケース | HTTP コード | 説明 |
| --- | --- | --- |
| ジョブの作成 | `201 CREATED` | ジョブが作成中であることを示します。<br/>ジョブの作成は非同期であるため、レスポンスに含まれるジョブ ID を使用して、進行状況を確認したりライフサイクルを管理したりできます。 |
| ジョブのキャンセル | `202 ACCEPTED` | キャンセルが受け付けられ、処理中であることを示します。<br/>ジョブのキャンセルは非同期であるため、レスポンスに含まれるジョブ ID を使用して進行状況を確認できます。 |
| ジョブの詳細取得 | `200 OK` | リクエストされたレスポンスが返されたことを示します。<br/>これは同期処理であり、レスポンスにはリクエストが処理された時点のジョブステータスが常に含まれます。 |

HTTP コードは異なりますが、次のように同じペイロード構造を共有します。

```json
{
  "code": 0,
  "data": {
    "jobId": "job-xxxxxxxx",
    "projectId": "proj-xxxxxxxx",
    "type": "SPARK",
    "description": "backfill product attributes",
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

レスポンスには、ジョブの監視に使用できるジョブ ID が含まれます。ジョブの状態を確認したり、ジョブの詳細を取得したり、実行中のジョブをキャンセルしたりするには、[ジョブの状態を理解する](./manage-spark-batch-jobs#understand-job-states) を参照してください。

エラーが発生した場合、レスポンスは次のようになります。

```json
{
  "code": 10001,
  "message": "projectId is required",
  "details": {
    "errorCode": "INVALID_PARAMETER"
  }
}
```

エラーの内容は、`details.errorCode` と、エラーレスポンスに含まれる HTTP コードから判断できます。次の表に、該当する HTTP コードとその意味を示します。

| HTTP コード | 説明 |
| --- | --- |
| `400 BAD REQUEST` | リクエストに含まれるパラメーターが正しくないことを示します。 |
| `403 FORBIDDEN` | API キーに十分な権限がないか、指定したプロジェクトでリソースを利用できないことを示します。 |
| `404 NOT FOUND` | ジョブ ID や Zilliz Cloud ボリュームなど、指定したリソースが存在しないことを示します。 |
| `409 CONFLICT` | べき等性キーがリクエストペイロードと一致しないことを示します。 |
| `500 INTERNAL SERVER ERROR` | サーバーがリクエストの処理に失敗したことを示します。 |

## 次のステップ\{#next-steps}

次のガイドを参照して、目的に合った Spark バッチジョブを作成するか、既存のジョブの監視と管理を行ってください。

import DocCardList from '@theme/DocCardList';

<DocCardList />
