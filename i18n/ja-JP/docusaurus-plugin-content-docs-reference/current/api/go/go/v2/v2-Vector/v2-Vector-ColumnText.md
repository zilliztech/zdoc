---
title: "ColumnText | Go | v2"
slug: /go/go/v2-Vector-ColumnText
sidebar_label: "ColumnText"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "ColumnText インスタンスは、挿入、upsert、クエリ出力に使用する文字列値を保持する TEXT フィールドの列を表します。NewColumnText() で作成します。 | Go | v2"
type: docx
token: RPoPdeGegozh2sxjgXBcKppfneb
sidebar_position: 22
keywords: 
  - NLP 検索
  - LLM ハルシネーション
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - ColumnText
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnText

ColumnText インスタンスは、挿入、upsert、クエリ出力に使用する文字列値を保持する TEXT フィールドの列を表します。NewColumnText() で作成します。

```go
type ColumnText struct {
}
```

**BUILDER METHODS:**

- `Slice(start, end int) Column`

    指定された行範囲にわたるサブ列を返します。

## 例\{#example}

ColumnText の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnText("summary", []string{"first", "second"})
fmt.Println(values.Len())
```
