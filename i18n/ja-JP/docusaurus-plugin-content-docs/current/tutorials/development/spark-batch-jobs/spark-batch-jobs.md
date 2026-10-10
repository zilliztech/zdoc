---
title: "Spark バッチジョブ | Cloud"
slug: /spark-batch-jobs
sidebar_label: "Spark バッチジョブ"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark バッチジョブを使用すると、Zilliz Cloud で管理されている大規模なデータセットに対して分散されたオフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター化、検査を行えます。 | Cloud"
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

Spark バッチジョブを使用すると、Zilliz Cloud で管理されている大規模なデータセットに対して、分散されたオフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター化、検査を行えます。

Spark バッチジョブは、長時間実行されるデータ処理タスク向けに設計されています。低レイテンシのオンラインリクエストやレコード単位の変換を目的としたものではありません。

## 発生する可能性のある問題\{#problems-you-may-encounter}

ベクトルデータセットが大きくなるにつれて、単純な挿入や検索の操作だけでは対応できなくなる場合があります。繰り返しの取り込みによって重複が生じたり、大規模な埋め込みコレクションの全体像を把握しにくくなったり、前処理パイプラインの失敗によって問題のあるレコードが残ったりすることがあります。

### 重複したベクトル埋め込み\{#duplicate-vector-embeddings}

再試行、繰り返しのインポート、重複するデータソース、同じテキストや画像のわずかに変更されたバージョンなどは、いずれもエンティティ間で重複したベクトル埋め込みを生成する可能性があります。一部のエンティティは同じ主キーを共有していますが、別のエンティティは主キーが異なるものの内容がほぼ同一であり、ストレージ、インデックス作成、ダウンストリーム処理のコストが増加します。

Spark バッチジョブは、大規模なデータセット全体の重複を特定して削除できます。**主キー重複排除ジョブ** を使用して同じ ID を持つレコードをクリーンアップするか、**ベクトル類似度重複排除ジョブ** を使用して、ID は異なるものの内容がほぼ同一であるレコードを検出します。

### 不明確な埋め込み分布\{#unclear-embedding-distributions}

コレクションが大きくなるにつれて、埋め込み分布の全体像を把握することが難しくなります。どのパターンがデータセットの大部分を占めているのか、ロングテールデータがどこに現れるのか、新しくインポートされたデータが既存のレコードと異なるのかどうかを把握できない場合があります。

**K-Means クラスタリングジョブ** は、類似した埋め込みを粗いクラスターにグループ化し、各レコードにクラスター ID を割り当てます。結果を使用して、データ分布の分析、データソースの比較、代表的なサンプルの作成、類似度ベースの処理の小規模なグループへの分割を行えます。

### 埋め込みデータに隠れた異常\{#hidden-anomalies-in-embedding-data}

埋め込みパイプラインでは、有効に見えてもデータセットの他の部分と一致しないレコードが生成されることがあります。前処理の失敗、不正確なモデル、パースノイズ、破損したソースコンテンツ、予期しないデータバッチなどは、いずれも手作業による検査では発見しにくい異常な埋め込みを生成する可能性があります。

**異常検出ジョブ** は、埋め込み分布をスキャンし、一般的なパターンと大きく異なるレコードを特定します。結果を使用して、再埋め込み、クリーンアップ、または追加のレビューが必要になる可能性があるデータを見つけることができます。異常は必ずしも無効であるとは限らないため、フラグが付けられたレコードは自動的に削除するのではなく、レビューする必要があります。

## ジョブタイプを選択する\{#choose-a-job-type}

次の表に、目的別に推奨されるジョブタイプを示します。

| **目的** | **推奨ジョブ** |
| --- | --- |
| 同じ主キーを共有するレコードを削除する | [主キー重複排除](./primary-key-dedup) |
| ベクトル表現が非常に類似しているレコードを検出する | [ベクトル類似度重複排除](./vector-similarity-dedup) |
| ベクトルデータを事前に定義された数のグループに分割する | [K-Means クラスタリング](./k-means-clustering) |
| 主要なデータ分布と大きく異なるレコードを検出する | [異常検出](./anomaly-detection) |

## Spark バッチジョブの仕組み\{#how-spark-batch-jobs-work}

Spark バッチジョブは、長時間実行される分散型のオフライン処理ジョブであり、ジョブ作成リクエストを受信すると直ちにジョブ ID を返します。ジョブ ID をハンドラーとして使用して、進行状況を監視し、ライフサイクルを管理できます。

### 事前準備\{#before-you-start}

Spark バッチジョブを送信するには、次の点を確認してください。

- 十分な権限を持つ有効な Zilliz Cloud API キーを保有していること。

- 入力データが、サポートされている形式で Zilliz Cloud ボリュームに用意されていること。

    - サポートされているデータファイル形式が `parquet`、`lance`、`json`、`csv` であること。

- 各外部ボリュームに関連付けられたストレージロールに、ジョブに必要な権限があること：

    - 入力外部ボリュームに入力場所への読み取りアクセスが必要であること。

    - 出力外部ボリュームに出力場所への読み取りおよび書き込みアクセスが必要であること（ジョブの実行中に作成された一時オブジェクトまたは不完全なオブジェクトを削除する権限を含む）。

    - 入力外部ボリュームと出力外部ボリュームで異なるストレージロールを使用できること。

### 外部ボリュームの権限を構成する\{#configure-external-volume-permissions}

Spark バッチジョブは、外部ボリュームから入力データを読み取り、結果を外部ボリュームに書き込みます。ジョブを送信する前に、各ボリュームに関連付けられたオブジェクトストレージロールが、その用途に必要な権限を持っていることを確認してください。

入力ボリュームと出力ボリュームでは、異なるストレージロールを使用できます。各ロールには、対応するバケットとプレフィックスに必要な権限のみを付与してください。

#### 入力ボリューム\{#input-volume}

入力ボリュームには、入力データへの読み取りアクセスが必要です。ボリュームで使用される Integration が必要な読み取り権限をすでに提供している場合、追加の権限は不要です。

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

出力ボリュームには、ジョブの結果を書き込むための権限が必要です。また、Spark は、一時オブジェクト、または失敗した書き込みやキャンセルされた書き込みによって残されたオブジェクトを削除する場合があります。

Amazon S3 の場合、ロールには次の権限が必要です。

- 出力場所にアクセスするための `s3:GetObject`、`s3:ListBucket`、`s3:GetBucketLocation`。

- 結果を書き込むための `s3:PutObject`。

- 一時オブジェクトまたは不完全な出力オブジェクトをクリーンアップするための `s3:DeleteObject`。

`s3:PutObject` と `s3:DeleteObject` のスコープは、バケット全体ではなく出力プレフィックスに限定してください。

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

1. 冪等キーを生成します。

    冪等キーは、同じジョブリクエストを再試行するときに変化しない一意の文字列です。詳細については、[冪等な送信](./primary-key-dedup) を参照してください。

1. リクエストヘッダーを準備します。

    Spark バッチジョブを作成するときは、前の手順で生成した冪等キーをリクエストヘッダーに含めます。

    ```http
    Authorization: Bearer <api-key>
    Idempotency-Key: spark-job-20260730-001
    Content-Type: application/json
    ```

1. リクエストペイロードを準備します。

    すべての Spark バッチジョブは共通のペイロード構造を共有しており、ジョブの目的によって異なるジョブ固有のパラメーターがあります。

    共通のペイロード構造については、[リクエストペイロード](./primary-key-dedup) を参照してください。ジョブ固有のパラメーターについては、次のページを参照してください。

    - [主キー重複排除](./primary-key-dedup)

    - [ベクトル類似度重複排除](./vector-similarity-dedup)

    - [K-Means クラスタリング](./k-means-clustering)

    - [外れ値検出](./anomaly-detection)

</Procedures>

#### 冪等な送信\{#idempotent-submission}

冪等キーを使用すると、ジョブの送信を安全に再試行できます。Zilliz Cloud は、キーとリクエスト本文の両方を確認して、既存のジョブを返すか、リクエストを競合として拒否するかを判断します。次の表に、一致時の動作をまとめます。

| ケース | 動作 |
| --- | --- |
| 同じ冪等キーと同じリクエスト本文 | 重複を作成せずに、以前に作成された Spark バッチジョブを返します。 |
| 同じ冪等キーと異なるリクエスト本文 | 競合エラーを返します。 |

冪等キーは、特定の組織、ユーザー、リージョン、およびプロジェクトにスコープされます。Zilliz Cloud は、最大ジョブタイムアウト時間に基づき、キーを約 **25 時間**保持します。保持期間が過ぎると、同じキーを新しい送信に再利用できます。

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
| `description` | いいえ | ジョブのオプションの説明です。<br/>値は 1,024 文字以内の文字列です。 |
| `regionId` | はい | ジョブを実行する Zilliz Cloud リージョンの ID です。サポートされているリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。 |
| `input` | いいえ | ジョブの入力です。これは組み込みジョブの場合にのみ必須です。詳細については、次の表を参照してください。 |
| `output` | いいえ | ジョブの出力です。これは組み込みジョブの場合は必須です。詳細については、次の表を参照してください。 |
| `resourceSize` | いいえ | ジョブに必要な Spark クラスターのサイズです。指定できる値は `SMALL`、`MEDIUM`、`LARGE`、`XLARGE`、`2XLARGE`、`3XLARGE` です。 |
| `timeoutSeconds` | いいえ | 現在のジョブのタイムアウト時間（秒）です。値は `300` から `86400` までの正の整数です。 |

上記の表の `input` パラメーターと `output` パラメーターは、次のような類似した構造を共有します。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>はい</p></td>
     <td><p>Spark バッチジョブのタイプです。これは <code>input</code> と <code>output</code> の両方に適用されます。指定できる値は次のとおりです。</p><ul><li><code>volume</code></li></ul></td>
   </tr>
   <tr>
     <td><p><code>volumeName</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>Zilliz Cloud ボリュームの名前です。<code>type</code> を <code>volume</code> に設定する場合は必須です。これは <code>input</code> と <code>output</code> の両方に適用されます。</p></td>
   </tr>
   <tr>
     <td><p><code>path</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定した Zilliz Cloud ボリュームのルートを基準とした input/output ファイルパスです。<code>type</code> を <code>volume</code> に設定する場合は必須です。これは <code>input</code> と <code>output</code> の両方に適用されます。</p><p><code>volume://path/to/data.parquet</code> にあるファイルの場合は、<code>path</code> を <code>path/to/data.parquet</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>format</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>入力ファイルまたは出力ファイルの形式です。これは <code>input</code> と <code>output</code> の両方に適用されます。このパラメーターのデフォルトは <code>parquet</code> です。指定できる値は <code>parquet</code>、<code>lance</code>、<code>json</code>、<code>csv</code> です。</p></td>
   </tr>
   <tr>
     <td><p><code>writeMode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>出力ファイルの書き込みモードです。これは <code>output</code> にのみ適用されます。指定できる値は次のとおりです。</p><ul><li><p><code>ERROR_IF_EXIST</code></p><p>このオプションは、指定した出力ファイルがすでに存在する場合にエラーを返します。これがデフォルトのオプションです。</p></li><li><p><code>OVERWRITE</code></p><p>このオプションは、指定したファイルを上書きします。</p></li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Notes">

`input` の場合、使用される Spark データソースリーダーは `format` によって決まります。このパラメーターを省略すると、ジョブはデフォルトで Parquet リーダーを使用し、指定したパス配下の Parquet ファイルのみを処理します。JSON や CSV などの他の形式のファイルは無視されます。

処理するファイルが Parquet でない場合は、`input.format` を対応する形式に明示的に設定してください。ジョブは、異なる形式のファイルを自動的に検出して結合することはありません。

</Admonition>

#### 送信時のレスポンス\{#submission-response}

成功したジョブリクエストへのレスポンスでは、異なる HTTP コードが返される場合があります。次の表に、レスポンスに含まれる該当する HTTP コードを示します。

| ケース | HTTP コード | 説明 |
| --- | --- | --- |
| ジョブの作成 | `201 CREATED` | ジョブが作成中であることを示します。<br/>ジョブの作成は非同期であり、レスポンスに含まれるジョブ ID を使用して、進行状況の確認とライフサイクルの管理を行えます。 |
| ジョブのキャンセル | `202 ACCEPTED` | キャンセルが受け付けられ、進行中であることを示します。<br/>ジョブのキャンセルは非同期であり、レスポンスに含まれるジョブ ID を使用して進行状況を確認できます。 |
| ジョブの詳細取得 | `200 OK` | 要求されたレスポンスが返されることを示します。<br/>これは同期処理であり、レスポンスには常に、リクエストが処理された時点のジョブステータスが含まれます。 |

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

レスポンスには、ジョブの監視に使用できるジョブ ID が含まれます。ジョブの状態の表示、ジョブの詳細の取得、または実行中のジョブのキャンセルについては、[ジョブの状態について](./manage-spark-batch-jobs#understand-job-states) を参照してください。

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

エラーは、`details.errorCode` と、エラーレスポンスに含まれる HTTP CODE から判断できます。次の表に、該当する HTTP CODE とその意味を示します。

| HTTP コード | 説明 |
| --- | --- |
| `400 BAD REQUEST` | リクエストに含まれるパラメーターが正しくないことを示します。 |
| `403 FORBIDDEN` | API キーに十分な権限がないか、指定したプロジェクトでリソースが利用できないことを示します。 |
| `404 NOT FOUND` | ジョブ ID や Zilliz Cloud ボリュームなど、指定したリソースが存在しないことを示します。 |
| `409 CONFLICT` | 冪等キーがリクエストペイロードと一致しないことを示します。 |
| `500 INTERNAL SERVER ERROR` | サーバーがリクエストの処理に失敗したことを示します。 |

## 次のステップ\{#next-steps}

次のガイドを使用して、目的に合った Spark バッチジョブを作成するか、既存のジョブを監視および管理します。

import DocCardList from '@theme/DocCardList';

<DocCardList />
