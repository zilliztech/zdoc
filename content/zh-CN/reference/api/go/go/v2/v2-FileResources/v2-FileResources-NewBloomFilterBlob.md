---
title: "NewBloomFilterBlob | Go | v2"
slug: /go/go/v2-FileResources-NewBloomFilterBlob
sidebar_label: "NewBloomFilterBlob"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会基于成员集合，以目标假阳性率构建一个序列化后的稳定布隆过滤器 blob，并调整其大小，使大型成员集合能够通过 proxy gRPC 接收限制。 | Go | v2"
type: docx
token: VTwWd4echo5yvmx4QhscJOvendh
sidebar_position: 4
keywords: 
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - zilliz
  - zilliz cloud
  - 云
  - NewBloomFilterBlob
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewBloomFilterBlob

此操作会基于成员集合，以目标假阳性率构建一个序列化后的稳定布隆过滤器 blob，并调整其大小，使大型成员集合能够通过 proxy gRPC 接收限制。

该 blob 会提供给 `membership_match(field, {blob}, type=bloom)` 过滤表达式使用；对于整数字段或 JSON 路径，`members` 可接受 `[]int64`，而字符串成员集合则使用 NewRoaringBitmapBlob()。

```go
func NewBloomFilterBlob(members any, fpr float64) (BloomFilterBlob, error)
```

## 请求语法\{#request-syntax}

使用给定成员和给定假阳性率构建布隆过滤器 blob。

```go
NewBloomFilterBlob(members any, fpr float64) (BloomFilterBlob, error)
```

**返回类型：**

*(BloomFilterBlob, error)*

**返回：**

返回序列化后的布隆过滤器 blob。当 members 不是受支持的成员集合时，返回错误。

**参数：**

- **blob** (*BloomFilterBlob*) -

    过滤表达式所引用的序列化布隆过滤器 blob 字节。

**错误处理：**

- **error**

    验证、请求构建或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewBloomFilterBlob 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

blob, err := milvusclient.NewBloomFilterBlob([]int64{1, 2, 3}, 0.01)
if err != nil {
	// handle error
}

fmt.Println(len(blob))
```
