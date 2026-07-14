---
title: "ListCollections() | Go | v2"
slug: /go/go/v2-Collection-ListCollections
sidebar_label: "ListCollections()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のデータベース内のすべての collection を一覧表示します。 | Go | v2"
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

この操作は、現在のデータベース内のすべての collection を一覧表示します。

```go
func (c *Client) ListCollections(ctx context.Context, option ListCollectionOption, callOptions ...grpc.CallOption) (collectionNames []string, err error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewListCollectionOption()

result, err := client.ListCollections(ctx, option)
```

**戻り値の型:**

*collectionNames []string, err error*

**戻り値:**

名前のリスト。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

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
