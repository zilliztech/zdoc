---
title: "ResultSet | Go | v2"
slug: /go/go/v2-Vector-ResultSet
sidebar_label: "ResultSet"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "一致した entity ID、スコア、フィールド値を含む検索またはクエリ結果を格納します。 | Go | v2"
type: docx
token: CCWrdPlSao0pOTx9oIgcA64Nnjd
sidebar_position: 10
keywords: 
  - ハイブリッド vector 検索
  - 動画重複排除
  - 動画類似性検索
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - ResultSet
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ResultSet

一致した entity ID、スコア、フィールド値を含む検索またはクエリ結果を格納します。

```go
type ResultSet struct {
    ResultCount int
    GroupByValue column.Column
    IDs column.Column
    Fields DataSet
    Scores []float32
    Recall float32
    Err error
}
```

**FIELDS:**

- **ResultCount** (*int*)

    返されるエントリ数

- **GroupByValue** (*column.Column*)

    グループ化された結果に使用される group-by 列です。

- **IDs** (*column.Column*)

    自動生成された id。`Insert` API の列にマッピングできます

- **Fields** (*DataSet*)

    出力フィールドデータ

- **Scores** (*[]float32*)

    対象 vector までの距離

- **Recall** (*float32*)

    クエリ vector の検索結果の再現率（zilliz cloud による推定）

- **Err** (*error*)

    存在する場合の検索エラー

**METHODS:**

- `GetColumn(fieldName string) column.Column`

    GetColumn は、指定されたフィールド名の列を返します。

- `Len() int`

    結果数を返します。

- `Slice(start, end int) ResultSet`

    指定された範囲内の結果のサブセットを返します。
