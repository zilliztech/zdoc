---
title: "UpsertResult | Go | v2"
slug: /go/go/v2-Vector-UpsertResult
sidebar_label: "UpsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "影響を受けたエンティティの数と IDs を含む Upsert 操作の結果を保持します。 | Go | v2"
type: docx
token: KlfGdGLbxo7zfNxin91cgFxWnQO
sidebar_position: 15
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - UpsertResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpsertResult

影響を受けたエンティティの数と IDs を含む Upsert 操作の結果を保持します。

```go
type UpsertResult struct {
    UpsertCount int64
    IDs column.Column
}
```

**FIELDS:**

- **UpsertCount** (*int64*)

    影響を受けたエンティティの数。

- **IDs** (*column.Column*)

    影響を受けたエンティティの IDs。
