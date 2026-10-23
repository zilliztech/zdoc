---
title: "DeleteResult | Go | v2"
slug: /go/go/v2-Vector-DeleteResult
sidebar_label: "DeleteResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Delete 操作の結果を保持します。この結果には、削除されたエンティティの数が含まれます。 | Go | v2"
type: docx
token: Gh4ydrMIBopZekxncUFcrJctnBl
sidebar_position: 7
keywords: 
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - zilliz
  - zilliz cloud
  - cloud
  - DeleteResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DeleteResult

Delete 操作の結果を保持します。この結果には、削除されたエンティティの数が含まれます。

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**フィールド:**

- **DeleteCount** (*int64*)

    影響を受けたエンティティの数です。
