---
title: "UpsertResult | Go | v2"
slug: /go/go/v2-Vector-UpsertResult
sidebar_label: "UpsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Upsert 操作の結果には、影響を受けたエンティティの件数と ID が含まれます。 | Go | v2"
type: docx
token: KlfGdGLbxo7zfNxin91cgFxWnQO
sidebar_position: 20
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - UpsertResult
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# UpsertResult

Upsert 操作の結果には、影響を受けたエンティティの件数と ID が含まれます。

```go
type UpsertResult struct {
    UpsertCount int64
    IDs column.Column
}
```

**フィールド:**

- **UpsertCount** (*int64*)

    影響を受けたエンティティの数です。

- **IDs** (*column.Column*)

    影響を受けたエンティティの ID です。
