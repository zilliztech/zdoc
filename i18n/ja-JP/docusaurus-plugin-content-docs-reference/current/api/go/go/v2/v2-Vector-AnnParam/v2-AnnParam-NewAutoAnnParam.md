---
title: "NewAutoAnnParam() | Go | v2"
slug: /go/go/v2-AnnParam-NewAutoAnnParam
sidebar_label: "NewAutoAnnParam()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、検索精度レベルを設定できる AUTOINDEX 用の ANN 検索パラメーターセットを作成します。 | Go | v2"
type: docx
token: VFR6dvKoyo0Pl5x6a44cbIJ8n3f
sidebar_position: 2
keywords: 
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - 字句検索
  - zilliz
  - zilliz cloud
  - cloud
  - NewAutoAnnParam()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAutoAnnParam()

この関数は、検索精度レベルを設定できる AUTOINDEX 用の ANN 検索パラメーターセットを作成します。

```go
func NewAutoAnnParam(level int) autoAnnParam
```

**パラメーター:**

- **level** (*int*)

    検索精度レベル（1〜5）です。値を大きくすると再現率が向上しますが、その代わりにレイテンシーが増加します。

**戻り値:**

*[AnnParam](./v2-Vector-AnnParam)*

ANN 検索パラメーターのインスタンスです。これを `WithAnnParam()` を介して検索オプションに渡します。

## 例\{#example}

```go
import (
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Create ANN search parameters
param := index.NewAutoAnnParam(10)

// Use with a search option
option := milvusclient.NewSearchOption("collection_name", limit, vectors).
    WithAnnParam(param)
```
