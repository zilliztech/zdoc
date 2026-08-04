---
title: "ListCollections() | Go | v2"
slug: /go/go/v2-Collection-ListCollections
sidebar_label: "ListCollections()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出当前数据库中的所有 collection。 | Go | v2"
type: docx
token: AVEcd3SCwoRyiTxcNodcQAepnGf
sidebar_position: 21
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollections()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListCollections()

此操作列出当前数据库中的所有 collection。

```go
func (c *Client) ListCollections(ctx context.Context, option ListCollectionOption, callOptions ...grpc.CallOption) (collectionNames []string, err error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewListCollectionOption()

result, err := client.ListCollections(ctx, option)
```

**返回类型：**

*collectionNames []string, err error*

**返回：**

名称列表。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	// handle error
}

fmt.Println(collectionNames)
```
