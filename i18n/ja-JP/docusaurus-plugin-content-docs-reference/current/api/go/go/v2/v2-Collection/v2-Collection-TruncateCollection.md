---
title: "TruncateCollection() | Go | v2"
slug: /go/go/v2-Collection-TruncateCollection
sidebar_label: "TruncateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection のすべてのデータを削除しますが、collection のスキーマと構造は保持します | Go | v2"
type: docx
token: V7bwdcBPGosCFWxjYQfctDDInmb
sidebar_position: 24
keywords: 
  - vector database の例
  - rag vector database
  - vector db とは
  - vector databases とは
  - zilliz
  - zilliz cloud
  - cloud
  - TruncateCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# TruncateCollection()

この操作は、collection のすべてのデータを削除しますが、collection のスキーマと構造は保持します

```go
func (c *Client) TruncateCollection(ctx context.Context, option TruncateCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
err := client.TruncateCollection(
    ctx, 
    milvusclient.NewTruncateCollectionOption("collection_name")
)
```

**パラメーター:**

- **collectionName** (*string*)

    対象の collection の名前。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
package main

import (
    "context"
    "log"
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

func main() {
    ctx := context.Background()
    
    client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // Truncate collection
    err = client.TruncateCollection(ctx, milvusclient.NewTruncateCollectionOption("my_collection"))
    if err != nil {
        log.Printf("Failed to truncate collection: %v", err)
        return
    }
    
    log.Println("Collection truncated successfully")
}
```
