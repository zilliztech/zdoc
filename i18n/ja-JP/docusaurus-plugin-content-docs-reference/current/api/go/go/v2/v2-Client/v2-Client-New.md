---
title: "New() | Go | v2"
slug: /go/go/v2-Client-New
sidebar_label: "New()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された設定で指定された Zilliz Cloud クラスターへの接続を作成します。 | Go | v2"
type: docx
token: NvlZd3VOpoMrsoxmavQckdAOnQg
sidebar_position: 4
keywords: 
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - New()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# New()

この操作は、指定された設定で指定された Zilliz Cloud クラスターへの接続を作成します。

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

**戻り値の型:**

**Client, error*

**戻り値:**

使用可能な、接続済みの Client インスタンスです。接続に失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// Connect to a local Milvus server
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

collections, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	log.Fatal("failed to list collections:", err)
}
fmt.Println(collections)
```
