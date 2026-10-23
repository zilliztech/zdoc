---
title: "Segment | Go | v2"
slug: /go/go/v2-Management-Segment
sidebar_label: "Segment"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Segment インスタンスは、Milvus 内の永続データセグメントを表します。`GetPersistentSegmentInfo()` によって返されます。 | Go | v2"
type: docx
token: CTUCd5vxBoEyEYxrzgrc58EsnJc
sidebar_position: 25
keywords: 
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone と Milvus の比較
  - Chroma と Milvus の比較
  - zilliz
  - zilliz cloud
  - クラウド
  - Segment
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Segment

Segment インスタンスは、Milvus 内の永続データセグメントを表します。`GetPersistentSegmentInfo()` によって返されます。

```go
type Segment struct {
    ID int64
    CollectionID int64
    ParititionID int64
    NumRows int64
    State commonpb.SegmentState
}
```

**フィールド:**

- **ID** (*int64*) -

    セグメントの一意の識別子です。

- **CollectionID** (*int64*) -

    セグメントが属するコレクションの識別子です。

- **ParititionID** (*int64*) -

    セグメントが属するパーティションの識別子です。

- **NumRows** (*int64*) -

    セグメント内の行数です。

- **State** (*commonpb.SegmentState*) -

    セグメントの現在の状態です。

**ビルダーメソッド:**

- `Flushed() bool`

    セグメントがフラッシュ済み状態のときに true を返します。

## 例\{#example}

Segment の使用例を示します。

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

segments, err := cli.GetPersistentSegmentInfo(ctx, milvusclient.NewGetPersistentSegmentInfoOption("books"))
if err != nil {
	// handle error
}
for _, segment := range segments {
	fmt.Println(segment.ID, segment.NumRows)
}
```
