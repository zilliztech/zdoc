---
title: "ResultSet | Go | v2"
slug: /go/go/v2-Vector-ResultSet
sidebar_label: "ResultSet"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "一致したエンティティ ID、スコア、フィールド値を含む search または query の結果を格納します。 | Go | v2"
type: docx
token: CCWrdPlSao0pOTx9oIgcA64Nnjd
sidebar_position: 15
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
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

一致したエンティティ ID、スコア、フィールド値を含む search または query の結果を格納します。

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

    グループ化された結果に使用される group-by 列。

- **IDs** (*column.Column*)

    自動生成された ID。`Insert` API の列にマッピングできます

- **Fields** (*DataSet*)

    出力フィールドデータ

- **Scores** (*[]float32*)

    対象 vector までの距離

- **Recall** (*float32*)

    クエリ vector の検索結果の再現率（Zilliz Cloud により推定）

- **Err** (*error*)

    search エラー（存在する場合）

**METHODS:**

- `GetColumn(fieldName string) column.Column`

    GetColumn は、指定されたフィールド名の列を返します。

- `Len() int`

    結果数を返します。

- `Slice(start, end int) ResultSet`

    指定された範囲内の結果のサブセットを返します。
