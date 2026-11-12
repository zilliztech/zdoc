---
title: "バッチジョブ | Cloud"
slug: /batch-jobs
sidebar_label: "バッチジョブ"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "バッチジョブでは、Zilliz Cloud で管理されている大規模データセットに対して分散オフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター化、検査を行えます。 | Cloud"
type: origin
token: K4F3wDpFciHWwJkZd5qc302OnWg
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# バッチジョブ

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、該当するすべての AWS リージョンでのみ利用できます。Google Cloud および Microsoft Azure では利用できません。有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

</FeatureNote>

バッチジョブでは、Zilliz Cloud で管理されている大規模データセットに対して分散オフライン処理を実行できます。組み込みジョブを使用して、ベクトルデータの重複排除、クラスター化、検査を行えます。

バッチジョブは、長時間実行されるデータ処理タスク向けに設計されています。低レイテンシーのオンラインリクエストやレコード単位の変換を目的としたものではありません。

## 発生する可能性がある問題\{#problems-you-may-encounter}

ベクトルデータセットが成長するにつれて、単純な挿入や検索の操作だけでは足りなくなる場合があります。繰り返しの取り込みによって重複が発生したり、大規模な埋め込みコレクションの理解が難しくなったり、前処理パイプラインの失敗によって疑わしいレコードが残ったりする可能性があります。

### ベクトル埋め込みの重複\{#duplicate-vector-embeddings}

再試行、繰り返しのインポート、データソースの重複、同じテキストや画像をわずかに変更したバージョンなどにより、エンティティ間で重複したベクトル埋め込みが作成される可能性があります。一部のエンティティは同じプライマリキーを共有している一方、他のエンティティはプライマリキーが異なるもののコンテンツがほぼ同一であるため、ストレージ、インデックス作成、下流処理のコストが増加します。

バッチジョブは、大規模データセット全体で重複を特定して削除できます。**プライマリキー重複排除ジョブ**を使用して同じ ID を持つレコードをクリーンアップするか、**ベクトル類似度重複排除ジョブ**を使用して ID は異なるがコンテンツがほぼ同一のレコードを検出します。

### 埋め込み分布が不明瞭な場合\{#unclear-embedding-distributions}

コレクションが大きくなるにつれて、埋め込み分布の全体像を把握することが難しくなります。どのパターンがデータセットの大部分を占めているのか、ロングテールデータがどこに現れるのか、新しくインポートされたデータが既存のレコードと異なるのかがわからない場合があります。

**K-Means クラスタリングジョブ**は、類似した埋め込みを大まかなクラスターにグループ化し、各レコードにクラスター ID を割り当てます。結果を使用して、データ分布の分析、データソースの比較、代表サンプルの作成、類似度ベースの処理の小規模グループへの分割を行えます。

### 埋め込みデータ内の隠れた異常\{#hidden-anomalies-in-embedding-data}

埋め込みパイプラインは、有効に見えてもデータセットの他の部分と一致しないレコードを生成する場合があります。前処理の失敗、不正確なモデル、解析ノイズ、破損したソースコンテンツ、予期しないデータバッチなどにより、手動の検査では発見しにくい異常な埋め込みが作成される可能性があります。

**異常検出ジョブ**は埋め込み分布をスキャンし、一般的なパターンと大きく異なるレコードを特定します。結果を使用して、再埋め込み、クリーンアップ、または追加の確認が必要な可能性があるデータを見つけることができます。異常は必ずしも無効であるとは限らないため、フラグが付けられたレコードは自動的に削除するのではなく、確認する必要があります。

## ジョブタイプを選択する\{#choose-a-job-type}

次の表に、目的別の推奨ジョブタイプを示します。

| **目的** | **推奨ジョブ** |
| --- | --- |
| 同じプライマリキーを共有するレコードを削除する | [プライマリキー重複排除](./primary-key-dedup) |
| ベクトル表現が非常に類似したレコードを検出する | [ベクトル類似度重複排除](./vector-similarity-dedup) |
| ベクトルデータを事前定義された数のグループに分割する | [K-Means クラスタリング](./k-means-clustering) |
| 主なデータ分布と大きく異なるレコードを検出する | [異常検出](./anomaly-detection) |

## バッチジョブの仕組み\{#how-batch-jobs-work}

バッチジョブは、長時間実行される分散オフライン処理ジョブであり、ジョブ作成リクエストを受信すると直ちにジョブ ID を返します。ジョブ ID をハンドラーとして使用し、進捗を監視してライフサイクルを管理できます。

### 事前準備\{#before-you-start}

バッチジョブを送信するには、次の条件を満たしていることを確認してください。

- 十分な権限を持つ有効な Zilliz Cloud API キーがあること。

- 入力データが、サポートされている形式で Zilliz Cloud ボリュームに用意されていること。

    - サポートされているデータファイル形式は、`parquet`、`lance`、`json`、`csv` です。

- 各外部ボリュームに関連付けられたストレージロールに、ジョブに必要な権限があること。

    - 入力外部ボリュームに、入力場所への読み取りアクセス権があること。

    - 出力外部ボリュームに、出力場所への読み取りおよび書き込みアクセス権があること。これには、ジョブ実行中に作成された一時オブジェクトまたは不完全なオブジェクトを削除する権限が含まれます。

    - 入力外部ボリュームと出力外部ボリュームでは、異なるストレージロールを使用できること。

### 外部ボリュームの権限を構成する\{#configure-external-volume-permissions}

バッチジョブは、外部ボリュームから入力データを読み取り、外部ボリュームに結果を書き込みます。ジョブを送信する前に、各ボリュームに関連付けられたオブジェクトストレージロールに、想定される用途に必要な権限があることを確認してください。

入力ボリュームと出力ボリュームでは、異なるストレージロールを使用できます。各ロールには、対応するバケットとプレフィックスに必要な権限のみを付与してください。

#### 入力ボリューム\{#input-volume}

入力ボリュームには、入力データへの読み取りアクセス権が必要です。ボリュームで使用される Integration がすでに必要な読み取り権限を提供している場合は、追加の権限は不要です。

Amazon S3 の場合、ロールには次の権限が必要です。

- 入力プレフィックス配下のオブジェクトには、`s3:GetObject` が必要です。

- 入力プレフィックス配下のオブジェクトを一覧表示するには、`s3:ListBucket` が必要です。

- バケットのロケーションを取得するには、`s3:GetBucketLocation` が必要です。

<details>

<summary>ここをクリックして例を表示します。</summary>

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

出力ボリュームには、ジョブ結果を書き込むための権限が必要です。Zilliz Cloud は、一時オブジェクトや、失敗した書き込みまたはキャンセルされた書き込みによって残されたオブジェクトを削除する場合もあります。

Amazon S3 の場合、ロールには次の権限が必要です。

- 出力場所にアクセスするには、`s3:GetObject`、`s3:ListBucket`、`s3:GetBucketLocation` が必要です。

- 結果を書き込むには、`s3:PutObject` が必要です。

- 一時的または不完全な出力オブジェクトをクリーンアップするには、`s3:DeleteObject` が必要です。

`s3:PutObject` と `s3:DeleteObject` は、バケット全体ではなく出力プレフィックスにスコープしてください。

<details>

<summary>ここをクリックして例を表示します。</summary>

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

### バッチジョブを送信して実行する\{#submit-and-run-a-batch-job}

API キーを取得し、必要なファイルを Zilliz Cloud ボリュームにアップロードしたら、バッチジョブを送信して実行する準備が整います。

<Procedures>

1. 冪等キーを生成します。

    冪等キーは一意な文字列で、同じジョブリクエストを再試行するときに変更されません。詳細は、[冪等な送信](./primary-key-dedup) を参照してください。

1. リクエストヘッダーを準備します。

    バッチジョブを作成する際には、前の手順で生成した冪等キーをリクエストヘッダーに含めます。

    ```http
    Authorization: Bearer <api-key>
    Idempotency-Key: batch-job-20260730-001
    Content-Type: application/json
    ```

1. リクエストペイロードを準備します。

    すべてのバッチジョブは共通のペイロード構造を持ち、ジョブの目的に応じてジョブ固有のパラメーターが変わります。

    共通のペイロード構造については、[リクエストペイロード](./primary-key-dedup) を参照してください。ジョブ固有のパラメーターについては、次のページを参照してください。

    - [プライマリキー重複排除](./primary-key-dedup)

    - [ベクトル類似度重複排除](./vector-similarity-dedup)

    - [K-Means クラスタリング](./k-means-clustering)

    - [外れ値検出](./anomaly-detection)

</Procedures>

#### 冪等な送信\{#idempotent-submission}

冪等キーを使用すると、ジョブの送信を安全に再試行できます。Zilliz Cloud はキーとリクエスト本文の両方を確認し、既存のジョブを返すか、競合としてリクエストを拒否するかを決定します。次の表に、一致時の動作をまとめます。

| ケース | 動作 |
| --- | --- |
| 同じ冪等キーと同じリクエスト本文 | 以前に作成されたバッチジョブを返し、重複するジョブは作成しません。 |
| 同じ冪等キーと異なるリクエスト本文 | 競合エラーを返します。 |

冪等キーは、特定の組織、ユーザー、リージョン、プロジェクトにスコープされます。Zilliz Cloud は、ジョブの最大タイムアウト期間に基づいて、キーを約 **25 時間**保持します。保持期間の経過後は、同じキーを新しい送信に再利用できます。

#### リクエストペイロード\{#request-payload}

すべてのバッチジョブは、次の共通のペイロード構造を使用します。

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
| `regionId` | はい | ジョブを実行する Zilliz Cloud リージョンの ID です。サポートされているリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。 |
| `input` | いいえ | ジョブの入力です。これは組み込みジョブでのみ必須です。詳細は次の表を参照してください。 |
| `output` | いいえ | ジョブの出力です。これは組み込みジョブで必須です。詳細は次の表を参照してください。 |
| `resourceSize` | いいえ | ジョブに必要な Spark クラスターのサイズです。指定可能な値は `SMALL`、`MEDIUM`、`LARGE`、`XLARGE`、`2XLARGE`、`3XLARGE` です。 |
| `timeoutSeconds` | いいえ | 現在のジョブのタイムアウト期間（秒）です。値は `300` から `86400` までの正の整数です。 |

上記の表の `input` パラメーターと `output` パラメーターは、次の同様の構造を持ちます。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>はい</p></td>
     <td><p>バッチジョブのタイプです。これは <code>input</code> と <code>output</code> の両方に適用されます。指定可能な値は次のとおりです。</p><ul><li><code>volume</code></li></ul></td>
   </tr>
   <tr>
     <td><p><code>volumeName</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>Zilliz Cloud ボリュームの名前です。<code>type</code> を <code>volume</code> に設定した場合は必須です。これは <code>input</code> と <code>output</code> の両方に適用されます。</p></td>
   </tr>
   <tr>
     <td><p><code>path</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定された Zilliz Cloud ボリュームのルートを基準とした input/output ファイルパスです。<code>type</code> を <code>volume</code> に設定した場合は必須です。これは <code>input</code> と <code>output</code> の両方に適用されます。</p><p><code>volume://path/to/data.parquet</code> にあるファイルの場合は、<code>path</code> を <code>path/to/data.parquet</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>format</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>入力ファイルまたは出力ファイルの形式です。これは <code>input</code> と <code>output</code> の両方に適用されます。このパラメーターのデフォルトは <code>parquet</code> です。指定可能な値は <code>parquet</code>、<code>lance</code>、<code>json</code>、<code>csv</code> です。</p></td>
   </tr>
   <tr>
     <td><p><code>writeMode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>出力ファイルの書き込みモードです。これは <code>output</code> のみに適用されます。指定可能な値は次のとおりです。</p><ul><li><p><code>ERROR_IF_EXIST</code></p><p>このオプションは、指定した出力ファイルがすでに存在する場合にエラーを返します。これがデフォルトのオプションです。</p></li><li><p><code>OVERWRITE</code></p><p>このオプションは、指定したファイルを上書きします。</p></li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Notes">

`input` の場合、`format` は使用するデータソースリーダーを決定します。このパラメーターを省略すると、ジョブはデフォルトで Parquet リーダーを使用し、指定されたパス配下の Parquet ファイルのみを処理します。JSON や CSV など他の形式のファイルは無視されます。

処理するファイルが Parquet でない場合は、`input.format` に対応する形式を明示的に設定します。ジョブは異なる形式のファイルを自動的に検出して結合することはありません。

</Admonition>

#### 送信レスポンス\{#submission-response}

成功したジョブリクエストへの応答では、異なる HTTP コードが返される場合があります。次の表に、応答に含まれる該当する HTTP コードを一覧表示します。

| ケース | HTTP コード | 説明 |
| --- | --- | --- |
| ジョブの作成 | `201 CREATED` | ジョブが作成中であることを示します。<br/>ジョブの作成は非同期で、応答に含まれるジョブ ID を使用して進捗を確認し、ライフサイクルを管理できます。 |
| ジョブのキャンセル | `202 ACCEPTED` | キャンセルが受け付けられ、進行中であることを示します。<br/>ジョブのキャンセルは非同期で、応答に含まれるジョブ ID を使用して進捗を確認できます。 |
| ジョブの詳細取得 | `200 OK` | 要求されたレスポンスが返されたことを示します。<br/>これは同期処理であり、レスポンスにはリクエスト処理時点のジョブステータスが常に含まれます。 |

HTTP コードは異なりますが、次の共通のペイロード構造を持ちます。

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

レスポンスには、ジョブの監視に使用できるジョブ ID が含まれています。ジョブの状態の表示、ジョブの詳細取得、実行中のジョブのキャンセルについては、[ジョブの状態を理解する](./manage-batch-jobs#understand-job-states) を参照してください。

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

`details.errorCode` と、エラーレスポンスに含まれる HTTP CODE からエラーを判別できます。次の表に、該当する HTTP CODE とその意味を一覧表示します。

| HTTP コード | 説明 |
| --- | --- |
| `400 BAD REQUEST` | リクエストに含まれるパラメーターが正しくないことを示します。 |
| `403 FORBIDDEN` | API キーに十分な権限がないか、指定したプロジェクトでリソースを利用できないことを示します。 |
| `404 NOT FOUND` | ジョブ ID や Zilliz Cloud ボリュームなど、指定したリソースが存在しないことを示します。 |
| `409 CONFLICT` | 冪等キーがリクエストペイロードと一致しないことを示します。 |
| `500 INTERNAL SERVER ERROR` | サーバーがリクエストの処理に失敗したことを示します。 |

## 次のステップ\{#next-steps}

目的に合ったバッチジョブを作成する場合、または既存のジョブを監視・管理する場合は、次のガイドを使用してください。

import DocCardList from '@theme/DocCardList';

<DocCardList />
