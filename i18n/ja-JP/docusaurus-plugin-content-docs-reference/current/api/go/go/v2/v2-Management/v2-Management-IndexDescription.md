---
title: "IndexDescription | Go | v2"
slug: /go/go/v2-Management-IndexDescription
sidebar_label: "IndexDescription"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "インデックスの種類、パラメーター、ビルド状態、行数を含むインデックス情報を記述します。 | Go | v2"
type: docx
token: Wyvhd3725onAmAxegk1caOHonQg
sidebar_position: 14
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - cloud
  - IndexDescription
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# IndexDescription

インデックスの種類、パラメーター、ビルド状態、行数を含むインデックス情報を記述します。

```go
type IndexDescription struct {
    index.Index
    State index.IndexState
    PendingIndexRows int64
    TotalRows int64
    IndexedRows int64
}
```

**フィールド:**

- **インデックス.Index** *(embedded)*

    Inherits methods from index.Index.

- **State** (*index.IndexState*)

    現在の状態です。

- **PendingIndexRows** (*int64*)

    インデックス作成待ちの行数です。

- **TotalRows** (*int64*)

    行の総数です。

- **IndexedRows** (*int64*)

    インデックス済みの行数です。
