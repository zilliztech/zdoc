---
title: "DropCollectionProperties() | Go | v2"
slug: /go/go/v2-Collection-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection から指定されたプロパティを削除します。 | Go | v2"
type: docx
token: Zyf1dXoBIo83V2xWHiKcXUEAnMc
sidebar_position: 14
keywords: 
  - Pinecone vector database
  - Audio search
  - semantic search とは
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

この操作は、collection から指定されたプロパティを削除します。

```go
func (c *Client) DropCollectionProperties(ctx context.Context, option DropCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropCollectionPropertiesOption(collection, propertyKeys)

err := client.DropCollectionProperties(ctx, option)
```

**パラメーター:**

- **[collection](./v2-Collection)** (*string*)

    collection。

- **propertyKeys** (*...string*)

    プロパティキー。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/milvus-io/milvus/pkg/v2/common"
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

err = cli.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
	// handle error
}
```
