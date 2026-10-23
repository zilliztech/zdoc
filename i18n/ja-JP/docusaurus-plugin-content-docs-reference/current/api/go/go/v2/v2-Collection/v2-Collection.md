---
title: "コレクション | Go | v2"
slug: /go/go/v2-Collection
sidebar_label: "コレクション"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コレクションインスタンスは、コレクションのスキーマと整合性設定を含む、Milvus のコレクションメタデータを表します。`DescribeCollection()` によって返されます。 | Go | v2"
type: docx
token: PNwFdxMMdo6rtIxERDHcVFgdnxc
sidebar_position: 6
keywords: 
  - 低コストのベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - コレクション
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# コレクション

コレクションインスタンスは、コレクションのスキーマと整合性設定を含む、Milvus のコレクションメタデータを表します。`DescribeCollection()` によって返されます。

```go
type Collection struct {
    ID int64
    Name string
    Schema *Schema
    PhysicalChannels []string
    VirtualChannels []string
    Loaded bool
    ConsistencyLevel ConsistencyLevel
    ShardNum int32
    Properties map[string]string
    UpdateTimestamp uint64
}
```

**フィールド:**

- **ID** (*int64*) -

    コレクションの一意識別子です。

- **Name** (*string*) -

    コレクションの名前です。

- **スキーマ** ([スキーマ](./v2-Collection-Schema)) -

    フィールド定義と主キーを含むコレクションスキーマです。

- **PhysicalChannels** (*[]string*) -

    コレクションが使用する物理メッセージチャネルです。

- **VirtualChannels** (*[]string*) -

    コレクションが使用する仮想メッセージチャネルです。

- **Loaded** (*bool*) -

    コレクションが現在ロードされているかどうか。

- **ConsistencyLevel** ([ConsistencyLevel](./v2-Collection-ConsistencyLevel)) -

    コレクションの整合性レベルです。

- **ShardNum** (*int32*) -

    コレクションのシャード数です。

- **Properties** (*map[string]string*) -

    コレクションのプロパティ（TTL 設定など）です。

- **UpdateTimestamp** (*uint64*) -

    コレクションの更新タイムスタンプです。通常、内部的な変更検出に使用されます。

## 例\{#example}

コレクションの使用例を示します。

```go
import (
	"context"

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

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("books"))
if err != nil {
	// handle error
}
fmt.Println(collection.Name, collection.ConsistencyLevel)
```
