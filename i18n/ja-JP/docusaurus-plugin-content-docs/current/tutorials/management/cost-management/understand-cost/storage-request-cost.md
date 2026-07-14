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

リクエストは 2 つのクラスに分類されます。    

- **Class 1**: `PUT`, `COPY`, `POST`, `LIST`

- **Class 2**: `GET`, `SELECT`

Zilliz Cloud では、次の操作でストレージリクエストコストが発生します。

- オンデマンドシナリオで使用されるデータベース内の管理対象 collection に対してインデックスを構築する。この場合、Class 1 と Class 2 の両方のリクエストコストが発生します。

- インデックスのみがロードされている場合に、オンデマンドシナリオで使用されるデータベース内の管理対象 collection に対して search を実行する。この場合、Class 2 のリクエストコストが発生します。

- コールドデータが object storage から読み取られる場合に、tiered-storage serving cluster で search を実行する。この場合、Class 2 のリクエストコストが発生します。

- 読み取りおよび書き込みを含むボリュームファイル操作。この場合、Class 1 と Class 2 の両方のリクエストコストが発生します。

次の操作ではストレージリクエストコストは発生しません。

- external collection に対するすべての操作。

- object storage からオンデマンドシナリオで使用されるデータベースへのデータのインポート。

- performance-optimized または capacity-optimized serving cluster でのインデックス構築/search。

### コスト計算\{#cost-calculation}

```plaintext
Storage Requests Cost = (Class 1 Request Count x Class 1 Unit Price)
                      + (Class 2 Request Count x Class 2 Unit Price)
```

- **Class 1 Request Count**: Class 1 リクエスト数。

- **Class 2 Request Count**: Class 2 リクエスト数。

- **Unit Price**: クラウドリージョンおよびリクエストクラスによって決まります。詳細については、[Zilliz Cloud Pricing](https://zilliz.com/pricing/pricing-guide) を参照してください。

## 例\{#example}

1 回の請求期間における使用量が次のとおりであるとします。

- **Region**: AWS us-east-1

- **Class 1 Request Count**: 200,000

- **Class 2 Request Count**: 1,200,000

単価は次のとおりです。

- **Class 1 Unit Price** = 100 万リクエストあたり &#36;5.00

- **Class 2 Unit Price** = 100 万リクエストあたり &#36;0.4

この場合、ストレージリクエストコストの合計は `(0.2 x 5.00) + (1.2 x 0.40) = $1.48` です。
