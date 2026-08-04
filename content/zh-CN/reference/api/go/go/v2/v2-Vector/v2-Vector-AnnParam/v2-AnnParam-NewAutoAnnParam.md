---
title: "NewAutoAnnParam() | Go | v2"
slug: /go/go/v2-AnnParam-NewAutoAnnParam
sidebar_label: "NewAutoAnnParam()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数为 AUTOINDEX 创建一组 ANN 搜索参数，并可配置搜索精度级别。 | Go | v2"
type: docx
token: VFR6dvKoyo0Pl5x6a44cbIJ8n3f
sidebar_position: 2
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
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

此函数为 AUTOINDEX 创建一组 ANN 搜索参数，并可配置搜索精度级别。

```go
func NewAutoAnnParam(level int) autoAnnParam
```

**参数：**

- **level** (*int*)

    搜索精度级别（1-5）。值越高，召回率越高，但延迟也会增加。

**返回：**

*[AnnParam](./v2-Vector-AnnParam)*

一个 ANN 搜索参数实例。通过 `WithAnnParam()` 将其传递给搜索选项。

## 示例\{#example}

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
