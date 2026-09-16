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
sidebar_position: 15
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - cloud
  - IndexDescription
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
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

**FIELDS:**

- **インデックス.Index** *(埋め込み)*

    index.Index からメソッドを継承します。

- **State** (*index.IndexState*)

    現在の状態。

- **PendingIndexRows** (*int64*)

    インデックス作成待ちの行数。

- **TotalRows** (*int64*)

    行の総数。

- **IndexedRows** (*int64*)

    インデックス済みの行数。
