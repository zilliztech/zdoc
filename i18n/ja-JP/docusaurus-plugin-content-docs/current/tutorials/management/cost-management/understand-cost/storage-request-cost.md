---
title: "ストレージリクエストコスト | Cloud"
slug: /storage-request-cost
sidebar_label: "ストレージリクエスト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ストレージリクエストコストは、オンデマンド検索、インデックス構築タスク、ボリュームファイルの読み取りまたは書き込みによって生成される操作を対象とするストレージコストの一種です。 | Cloud"
type: origin
token: YMYFwJhUuibUTxkJ1lTcNVSxnhg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ストレージリクエストコスト

ストレージリクエストコストは、オンデマンド検索、インデックス構築タスク、ボリュームファイルの読み取りまたは書き込みによって生成される操作を対象とするストレージコストの一種です。

## ストレージリクエストコストの発生源\{#sources-of-storage-request-cost}

リクエストは、次の 2 つのクラスに分類されます：

- **クラス 1**：`PUT`、`COPY`、`POST`、`LIST`

- **クラス 2**：`GET`、`SELECT`

Zilliz Cloud では、次の操作でストレージリクエストコストが発生します：

- オンデマンドシナリオ向けのデータベース内のマネージドコレクションでインデックスを構築します。これにより、クラス 1 とクラス 2 の両方のリクエストコストが発生します。

- オンデマンドシナリオ向けのデータベース内のマネージドコレクションで、インデックスのみがロードされている状態で検索を実行します。これにより、クラス 2 のリクエストコストが発生します。

- 読み取りと書き込みを含むボリュームファイル操作です。これにより、クラス 1 とクラス 2 の両方のリクエストコストが発生します。

次の操作では、ストレージリクエストコストは発生しません：

- 外部コレクションに対するすべての操作です。

- オブジェクトストレージからオンデマンドシナリオ向けのデータベースにデータをインポートします。

- パフォーマンス最適化または容量最適化されたサービングクラスターでインデックスの構築/search を実行します。

### コストの計算\{#cost-calculation}

```plaintext
Storage Requests Cost = (Class 1 Request Count x Class 1 Unit Price)
                      + (Class 2 Request Count x Class 2 Unit Price)
```

- **クラス 1 リクエスト数**：クラス 1 のリクエスト数です。

- **クラス 2 リクエスト数**：クラス 2 のリクエスト数です。

- **単価**：クラウドリージョンとリクエストクラスによって決まります。詳細は、[Zilliz Cloud Pricing](https://zilliz.com/pricing/pricing-guide) を参照してください。

## 例\{#example}

1 回の請求期間内の使用量が次の通りであるとします：

- **リージョン**：AWS us-east-1

- **クラス 1 リクエスト数**：200,000

- **クラス 2 リクエスト数**：1,200,000

単価は次の通りです：

- **クラス 1 単価** = &#36;5.00／1M リクエスト

- **クラス 2 単価** = &#36;0.4／1M リクエスト

この場合、ストレージリクエストコストの合計は `(0.2 x 5.00) + (1.2 x 0.40) = $1.48` になります。
