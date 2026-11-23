---
title: "オンデマンドコンピューティングの使用量を理解する | Cloud"
slug: /understand-on-demand-compute-usage
sidebar_label: "使用量を理解する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "オンデマンドコンピューティングの使用量の詳細を使用すると、請求書に含まれるクエリとインデックス作成のコンピューティング使用量を把握できます。既存の請求書の使用量の詳細を CSV ファイルとしてダウンロードし、請求書と併せて確認できます。 | Cloud"
type: origin
token: EOApwoWKPipHLHk7VKdci4QlnPc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# オンデマンドコンピューティングの使用量を理解する

オンデマンドコンピューティングの使用量の詳細を使用すると、請求書に含まれるクエリとインデックス作成のコンピューティング使用量を把握できます。既存の請求書の使用量の詳細を CSV ファイルとしてダウンロードし、請求書と併せて確認できます。

## オンデマンドコンピューティングの使用量\{#on-demand-compute-usage}

オンデマンドコンピューティングには、次の 2 種類のコンピューティング使用量が含まれます。

- **Query CU 使用量**は、オンデマンドクラスターがアクティブな間に消費するコンピューティングリソースを測定します。

- **Indexing CU 使用量**は、マネージドコレクションと外部コレクションのインデックス構築ワークロードが消費するコンピューティングリソースを測定します。

使用量の詳細は CU-分で表されます。料金は、使用量と適用される単価によって異なります。コストの計算方法と請求規則については、[オンデマンドコンピューティングのコスト](/docs/on-demand-compute-cost) を参照してください。

## 使用量の詳細をダウンロードする\{#download-usage-details}

![K0AXwjpuNhNvUQbnym4cDCFMnZb](https://zdoc-images.s3.us-west-2.amazonaws.com/K0AXwjpuNhNvUQbnym4cDCFMnZb.png)

<Procedures>

1. Zilliz Cloud コンソールで、使用量を確認する請求書を開きます。

1. オンデマンドコンピューティングの使用量の詳細をダウンロードするオプションを選択します。

1. **Query CU** または **Indexing CU** を選択し、CSV ファイルをダウンロードします。

</Procedures>

このファイルには、選択した種類と請求書の使用量が含まれます。その種類の使用量がない場合、CSV には列ヘッダーのみが含まれます。

## Query CU 使用量を理解する\{#understand-query-cu-usage}

Query CU の CSV には、請求間隔ごとに 1 行が含まれます。

| フィールド | 説明 |
| --- | --- |
| Invoice ID and invoice line item ID | 請求書と関連する明細項目を識別します。 |
| Period Start and Period End | UTC での請求期間の開始と終了です。開始は含まれ、終了は含まれません。 |
| Region ID, Project ID, and Instance ID | 使用量に関連するリージョン、プロジェクト、オンデマンドクラスターを識別します。 |
| Session ID | 請求間隔を識別します。 |
| Start Time and End Time | UTC での請求間隔の開始日時と終了日時です。秒単位の精度で記録されます。 |
| CU | 請求間隔に使用された Query CU の容量です。 |
| Billable Minutes | その間隔で請求される分数です。 |
| CU-minutes | CU と請求対象分数から算出された、その間隔の Query CU 使用量です。 |
| Calculation | 使用量の算出方法の説明です。 |

各請求間隔は、1 分単位に切り上げられます。エクスポートされた開始時刻と終了時刻は秒単位の精度であるため、それらのタイムスタンプから計算した期間は、元の請求対象分数と一致しない場合があります。請求対象の使用量を確認する際は、エクスポート内の **Billable Minutes** と **CU-minutes** の値を使用してください。

請求セッション ID は請求間隔を識別します。これはクラスター監視ビューで使用される実行 ID とは異なるため、1 対 1 の対応関係があると想定しないでください。実行はコンピューティングのアクティブ化に関連するリクエストをまとめたものですが、CSV では請求対象の使用量が報告されます。実行の詳細については、[オンデマンドクラスターの監視](./monitor-on-demand-cluster) を参照してください。

## Indexing CU 使用量を理解する\{#understand-indexing-cu-usage}

Indexing CU の CSV には、請求書の明細項目内のコレクションごとに 1 行が含まれます。

| フィールド | 説明 |
| --- | --- |
| Invoice ID and invoice line item ID | 請求書と関連する明細項目を識別します。 |
| Period Start and Period End | UTC での請求期間の開始と終了です。開始は含まれ、終了は含まれません。 |
| Region ID, Project ID, and Instance ID | 使用量に関連するリージョン、プロジェクト、コンピューティングインスタンスを識別します。 |
| データベース ID and データベース Name | コレクションに関連するデータベースを識別します。 |
| コレクション ID and Collection Name | その行で請求対象の使用量が集計されているコレクションを識別します。 |
| CU-minutes | コレクションの請求対象インデックス作成使用量の集計値です。 |
| Calculation | 使用量の算出方法の説明です。 |

これらの行は、請求対象のコレクション使用量を要約したものであり、個々のインデックス作成ジョブを表すものではありません。請求金額の正式な情報源は請求書です。

## ダウンロードのトラブルシューティング\{#troubleshoot-downloads}

| 問題 | 対処方法 |
| --- | --- |
| 使用量の詳細が不完全であるか、請求書と一致しません。 | 請求書が更新されてから再試行するか、サポートにお問い合わせください。部分的なファイルは提供されません。 |
| 使用量の詳細がダウンロードの上限を超えています。 | 完全なエクスポートについてサポートにお問い合わせください。 |
| 進行中のエクスポートリクエストが多すぎます。 | 後で再試行してください。 |
| ネットワーク、権限、またはセッションの問題によりダウンロードが失敗します。 | 接続とアクセス権を確認してから、再試行してください。 |
