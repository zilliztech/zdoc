---
title: "NewNgramIndex | Go | v2"
slug: /go/go/v2-Index-NewNgramIndex
sidebar_label: "NewNgramIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在文本字段上创建 n-gram 索引配置，将文本切分为由 minGram 和 maxGram 限定的重叠 n-gram，以支持子字符串匹配。 | Go | v2"
type: docx
token: L4Trd2cEUoe8zQxtAb8cDNr7nkc
sidebar_position: 32
keywords: 
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - zilliz
  - zilliz cloud
  - cloud
  - NewNgramIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewNgramIndex

此操作会在文本字段上创建 n-gram 索引配置，将文本切分为由 minGram 和 maxGram 限定的重叠 n-gram，以支持子字符串匹配。

```go
func NewNgramIndex(minGram, maxGram int) Index
```

## 请求语法\{#request-syntax}

使用给定的最小和最大 gram 长度创建 n-gram 索引配置。

```go
NewNgramIndex(minGram int, maxGram int) Index
```

**参数：**

- **minGram** （*int*） -

    **[必需]**

- **maxGram** （*int*） -

    **[必需]**

**返回类型：**

[Index](./v2-Management-Index)

**返回：**

返回 n-gram 索引配置实例。

**参数：**

- **index** （[Index](./v2-Management-Index)） -

    n-gram 索引配置实例。通过索引选项将其传递给 CreateIndex()。

**错误处理：**

- **error**

    校验、请求构建或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 NewNgramIndex 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewNgramIndex(3, 8)))
if err != nil {
	// handle error
}
```
