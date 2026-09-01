---
title: "Spark バッチジョブ | Cloud"
slug: /spark-batch-jobs
sidebar_label: "Spark バッチジョブ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark バッチジョブを使用すると、Zilliz Cloud で管理される大規模データセットに対して分散オフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター、検査を行えます。 | Cloud"
type: origin
token: K4F3wDpFciHWwJkZd5qc302OnWg
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Spark バッチジョブ

Spark バッチジョブを使用すると、Zilliz Cloud で管理される大規模データセットに対して分散オフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター、検査を行えます。

Spark バッチジョブは、長時間実行されるデータ処理タスク向けに設計されています。低レイテンシーのオンラインリクエストやレコード単位の変換には適していません。

## 発生しうる課題\{#problems-you-may-encounter}

ベクトルデータセットが大きくなるにつれて、単純な挿入や検索操作だけでは不十分になる場合があります。繰り返しの取り込みによる重複の発生、大規模な埋め込みコレクションの全体像の把握困難、前処理パイプラインの失敗による疑わしいレコードの残留などが生じることがあります。

### 重複するベクトル埋め込み\{#duplicate-vector-embeddings}

再試行、繰り返しのインポート、データソースの重複、同じテキストや画像の微修正版などが原因で、エンティティ間で重複するベクトル埋め込みが生成されることがあります。同じプライマリキーを持つエンティティだけでなく、プライマリキーは異なるものの内容がほぼ同一のエンティティも存在し、ストレージ、インデックス、後続処理のコストを増加させます。

Spark バッチジョブは、大規模データセット全体から重複を特定して削除できます。同じ ID を持つレコードを整理するには **プライマリキー重複排除ジョブ** を、ID は異なるが内容がほぼ同一のレコードを検出するには **ベクトル類似度重複排除ジョブ** を使用します。

### 不明瞭な埋め込み分布\{#unclear-embedding-distributions}

コレクションが大きくなるにつれて、埋め込み分布の全体像を把握するのが難しくなります。データセット内でどのパターンが支配的か、ロングテールデータがどこに分布しているか、新規インポートデータが既存レコードと異なっているかなどが不明確になる場合があります。

**K-Means クラスタリングジョブ** は、類似する埋め込みを大まかなクラスターにグループ化し、各レコードにクラスター ID を割り当てます。この結果を用いて、データ分布の分析、データソースの比較、代表的なサンプルの作成、類似度ベースの処理の細分化などを行えます。

### 埋め込みデータに潜む異常\{#hidden-anomalies-in-embedding-data}

埋め込みパイプラインは、一見正常でもデータセットの他の部分と一致しないレコードを生成することがあります。前処理の失敗、不適切なモデル、解析ノイズ、破損したソースコンテンツ、想定外のデータバッチなどが原因で、手動での確認では発見しにくい異常な埋め込みが生じる可能性があります。

**異常検出ジョブ** は、埋め込み分布をスキャンし、一般的なパターンから大きく外れたレコードを特定します。この結果を活用して、再埋め込み、クリーンアップ、詳細なレビューが必要なデータを特定できます。異常が直ちに無効なデータを意味するわけではないため、フラグ付きレコードは自動削除せず、必ずレビューを行ってください。

## ジョブタイプの選択\{#choose-a-job-type}

次の表に、目的に応じた推奨ジョブタイプを示します。

| **目的** | **推奨ジョブ** |
| --- | --- |
| 同じプライマリキーを持つレコードの削除 | [プライマリキー重複排除](./primary-key-dedup) |
| ベクトル表現が非常に類似しているレコードの検出 | [ベクトル類似度重複排除](./vector-similarity-dedup) |
| ベクトルデータを指定した数のグループに分割 | [K-Means クラスタリング](./k-means-clustering) |
| 主要なデータ分布から大きく外れたレコードの検出 | [異常検出](./anomaly-detection) |

## Spark バッチジョブの仕組み\{#how-spark-batch-jobs-work}

Spark バッチジョブは、長時間実行される分散オフライン処理ジョブであり、ジョブ作成リクエストを受け取るとすぐにジョブ ID を返します。このジョブ ID を使用して、進行状況の監視やライフサイクルの管理を行えます。

### 事前準備\{#before-you-start}

Spark バッチジョブを送信する前に、以下の条件を満たしていることを確認してください。

- 十分な権限を持つ有効な Zilliz Cloud API キーを保有していること。

- 入力データが、サポートされている形式で Zilliz Cloud Volume に配置されていること。

    - サポートされているデータファイル形式は、`parquet`、`lance`、`json`、`csv` です。

- 各 External Volume に関連付けられたストレージロールに、ジョブの実行に必要な権限が付与されていること。

    - 入力 External Volume には、入力先への読み取りアクセスが必要です。

    - 出力 External Volume には、出力先への読み書きアクセスに加え、ジョブ実行中に作成された一時オブジェクトや不完全なオブジェクトを削除する権限が必要です。

    - 入力用と出力用の External Volume で、異なるストレージロールを使用することも可能です。

### External Volume の権限設定\{#configure-external-volume-permissions}

Spark バッチジョブは、External Volume から入力データを読み取り、結果を External Volume に書き込みます。ジョブの送信前に、各 Volume に関連付けられたオブジェクトストレージロールに、用途に応じた適切な権限が付与されていることを確認してください。

入力用と出力用の Volume で、異なるストレージロールを使用できます。各ロールには、対応するバケットおよびプレフィックスに対して必要な権限のみを付与してください。

#### 入力 Volume\{#input-volume}

入力 Volume には、入力データへの読み取りアクセスが必要です。Volume が使用する Integration に必要な読み取り権限が既に含まれている場合は、追加の設定は不要です。

Amazon S3 の場合、ロールには以下の権限が必要です。

- 入力プレフィックス配下のオブジェクトに対する `s3:GetObject`

- 入力プレフィックス配下のオブジェクトを一覧表示するための `s3:ListBucket`

- バケットに対する `s3:GetBucketLocation`

<details>

<summary>例を表示するにはここをクリックしてください。</summary>

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

#### 出力 Volume\{#output-volume}

出力 Volume には、ジョブ結果を書き込むための権限が必要です。また、Spark が書き込みの失敗やキャンセルによって残された一時オブジェクトなどを削除する場合もあります。

Amazon S3 の場合、ロールには以下の権限が必要です。

- 出力先にアクセスするための `s3:GetObject`、`s3:ListBucket`、`s3:GetBucketLocation`

- 結果を書き込むための `s3:PutObject`

- 一時オブジェクトや不完全な出力オブジェクトをクリーンアップするための `s3:DeleteObject`

`s3:PutObject` および `s3:DeleteObject` のスコープは、バケット全体ではなく出力プレフィックスに限定してください。

<details>

<summary>例を表示するにはここをクリックしてください。</summary>

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

### Spark バッチジョブの送信と実行\{#submit-and-run-a-spark-batch-job}

API キーを取得し、必要なファイルを Zilliz Cloud ボリュームにアップロードしたら、Spark バッチジョブを送信・実行する準備は完了です。

<Procedures>

1. べき等性キーを生成します。

    べき等性キーとは、同じジョブリクエストを再試行する際に変わらない一意の文字列です。詳細については、[べき等性のある送信](./primary-key-dedup) を参照してください。

1. リクエストヘッダーを準備します。

    Spark バッチジョブを作成する際は、前の手順で生成したべき等性キーをリクエストヘッダーに含めます。

    ```http
    Authorization: Bearer <api-key>
    Idempotency-Key: spark-job-20260730-001
    Content-Type: application/json
    ```

1. リクエストペイロードを準備します。

    すべての Spark バッチジョブは共通のペイロード構造を持ちますが、ジョブ固有のパラメーターは目的に応じて異なります。

    共通のペイロード構造については [リクエストペイロード](./primary-key-dedup) を参照してください。ジョブ固有のパラメーターについては、以下のページを参照してください。

    - [主キー重複排除](./primary-key-dedup)

    - [ベクトル類似度重複排除](./vector-similarity-dedup)

    - [K-Means クラスタリング](./k-means-clustering)

    - [外れ値検出](./anomaly-detection)

</Procedures>

#### べき等性のある送信\{#idempotent-submission}

べき等性キーを使用することで、ジョブ送信を安全に再試行できます。Zilliz Cloud はキーとリクエストボディの両方を確認し、既存のジョブを返すか、競合としてリクエストを拒否するかを判断します。照合動作の概要を次の表に示します。

| ケース | 動作 |
| --- | --- |
| 同じべき等性キーかつ同じリクエストボディ | 重複を作成せず、以前に作成された Spark バッチジョブを返します。 |
| 同じべき等性キーだが異なるリクエストボディ | 競合エラーを返します。 |

べき等性キーのスコープは、特定の組織、ユーザー、リージョン、プロジェクトに限定されます。Zilliz Cloud は、ジョブの最大タイムアウト時間に基づき、キーを約 **25 時間** 保持します。保持期間が過ぎた後は、同じキーを新しい送信に再利用できます。

#### リクエストペイロード\{#request-payload}

すべての Spark バッチジョブは、以下のような共通のペイロード構造を持ちます。

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

各パラメーターの説明を次の表に示します。

| パラメーター | 必須 | 説明 |
| --- | --- | --- |
| `description` | 任意 | ジョブに関する任意の説明です。<br/>値は 1,024 文字以内の文字列です。 |
| `regionId` | 必須 | ジョブを実行する Zilliz Cloud リージョンの ID です。サポートされているリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 |
| `input` | 任意 | ジョブの入力です。組み込みジョブの場合のみ必須となります。詳細については、下の表を参照してください。 |
| `output` | 任意 | ジョブの出力です。組み込みジョブの場合は必須です。詳細については、下の表を参照してください。 |
| `resourceSize` | 任意 | ジョブに必要な Spark クラスターのサイズです。指定可能な値は `SMALL`、`MEDIUM`、`LARGE`、`XLARGE`、`2XLARGE`、`3XLARGE` です。 |
| `timeoutSeconds` | 任意 | ジョブのタイムアウト時間（秒）です。値は `300` から `86400` の範囲の正の整数です。 |

上記の表の `input` および `output` パラメーターは、以下のような同様の構造を持ちます。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>はい</p></td>
     <td><p>Spark バッチジョブのタイプです。<code>input</code> と <code>output</code> の両方に適用されます。指定可能な値は次のとおりです。</p><ul><li><code>volume</code></li></ul></td>
   </tr>
   <tr>
     <td><p><code>volumeName</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>Zilliz Cloud ボリュームの名前です。<code>type</code> を <code>volume</code> に設定する場合に必須となります。<code>input</code> と <code>output</code> の両方に適用されます。</p></td>
   </tr>
   <tr>
     <td><p><code>path</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定した Zilliz Cloud ボリュームのルートからの相対パスで指定する入力/outputファイルパスです。<code>type</code> を <code>volume</code> に設定する場合に必須となります。<code>input</code> と <code>output</code> の両方に適用されます。</p><p>例えば、ファイルが <code>volume://path/to/data.parquet</code> にある場合、<code>path</code> を <code>path/to/data.parquet</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>format</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>入力または出力ファイルの形式です。<code>input</code> と <code>output</code> の両方に適用されます。デフォルト値は <code>parquet</code> です。指定可能な値は <code>parquet</code>、<code>lance</code>、<code>json</code>、<code>csv</code> です。</p></td>
   </tr>
   <tr>
     <td><p><code>writeMode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>出力ファイルの書き込みモードです。<code>output</code> にのみ適用されます。指定可能な値は次のとおりです。</p><ul><li><p><code>ERROR_IF_EXIST</code></p><p>指定した出力ファイルが既に存在する場合にエラーを返します。これがデフォルトのオプションです。</p></li><li><p><code>OVERWRITE</code></p><p>指定したファイルを上書きします。</p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

`input` では、`format` によって使用される Spark データソースリーダーが決まります。このパラメーターを省略した場合、ジョブはデフォルトで Parquet リーダーを使用し、指定したパス配下の Parquet ファイルのみを処理します。JSON や CSV など他の形式のファイルは無視されます。

処理対象のファイルが Parquet 以外の場合は、`input.format` に対応する形式を明示的に設定してください。ジョブは異なる形式のファイルを自動的に検出・結合しません。

</Admonition>

#### 送信レスポンス\{#submission-response}

ジョブリクエストが成功した場合でも、返される HTTP コードは異なることがあります。レスポンスに含まれる HTTP コードを次の表に示します。

| ケース | HTTP コード | 説明 |
| --- | --- | --- |
| ジョブ作成時 | `201 CREATED` | ジョブが作成中であることを示します。<br/>ジョブ作成は非同期で行われるため、レスポンスに含まれるジョブ ID を使用して進行状況の確認やライフサイクル管理を行えます。 |
| ジョブキャンセル時 | `202 ACCEPTED` | キャンセル要求が受け付けられ、処理中であることを示します。<br/>ジョブのキャンセルは非同期で行われるため、レスポンスに含まれるジョブ ID を使用して進行状況を確認できます。 |
| ジョブ情報取得時 | `200 OK` | リクエストに対するレスポンスが正常に返されたことを示します。<br/>これは同期処理であり、レスポンスにはリクエスト処理時点のジョブステータスが常に含まれます。 |

HTTP コードは異なりますが、ペイロード構造は以下のように共通です。

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

レスポンスにはジョブの監視に使用できるジョブ ID が含まれます。ジョブの状態確認、詳細情報の取得、実行中のジョブのキャンセルについては、[ジョブステータスの理解](./manage-spark-batch-jobs#understand-job-states) を参照してください。

エラーが発生した場合、レスポンスは以下のようになります。

```json
{
  "code": 10001,
  "message": "projectId is required",
  "details": {
    "errorCode": "INVALID_PARAMETER"
  }
}
```

エラーの内容は、`details.errorCode` とエラーレスポンスに含まれる HTTP コードから特定できます。該当する HTTP コードとその意味を次の表に示します。

| HTTP コード | 説明 |
| --- | --- |
| `400 BAD REQUEST` | リクエストに含まれるパラメーターが不正であることを示します。 |
| `403 FORBIDDEN` | API キーに十分な権限がないか、指定したプロジェクトでリソースを利用できないことを示します。 |
| `404 NOT FOUND` | ジョブ ID や Zilliz Cloud ボリュームなど、指定されたリソースが存在しないことを示します。 |
| `409 CONFLICT` | べき等性キーがリクエストペイロードと一致しないことを示します。 |
| `500 INTERNAL SERVER ERROR` | サーバー側でリクエストの処理に失敗したことを示します。 |

## 次のステップ\{#next-steps}

以下のガイドを参照して、目的に合った Spark バッチジョブの作成や、既存ジョブの監視・管理を行ってください。

import DocCardList from '@theme/DocCardList';

<DocCardList />
