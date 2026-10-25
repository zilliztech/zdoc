---
title: "NewRoaringBitmapBlob | Go | v2"
slug: /go/go/v2-FileResources-NewRoaringBitmapBlob
sidebar_label: "NewRoaringBitmapBlob"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据成员集合构建序列化后的 roaring bitmap blob。该 blob 供 `membershipmatch(field, {blob}, type=roaring)` 过滤表达式使用。 | Go | v2"
type: docx
token: O8dIdQuMyofLmVxGXYScUSK0nOe
sidebar_position: 5
keywords: 
  - Serverless 向量 Database
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewRoaringBitmapBlob
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewRoaringBitmapBlob

此操作根据成员集合构建序列化后的 roaring bitmap blob。该 blob 供 `membership_match(field, {blob}, type=roaring)` 过滤表达式使用。

```go
func NewRoaringBitmapBlob(members any) (RoaringBitmapBlob, error)
```

## 请求语法\{#request-syntax}

使用给定的成员构建 roaring bitmap blob。

```go
NewRoaringBitmapBlob(members any) (RoaringBitmapBlob, error)
```

**返回类型：**

*(RoaringBitmapBlob, error)*

**返回：**

返回序列化后的 roaring bitmap blob。当 members 不是受支持的成员集合时，返回错误。

**参数：**

- **blob** (*RoaringBitmapBlob*) -

    过滤表达式所引用的序列化 roaring bitmap blob 字节。

**错误处理：**

- **error**

    验证、请求构建或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewRoaringBitmapBlob 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

blob, err := milvusclient.NewRoaringBitmapBlob([]string{"user-a", "user-b"})
if err != nil {
	// handle error
}

fmt.Println(len(blob))
```
