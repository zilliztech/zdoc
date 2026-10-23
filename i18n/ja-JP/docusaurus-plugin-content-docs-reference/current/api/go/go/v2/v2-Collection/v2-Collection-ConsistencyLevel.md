---
title: "ConsistencyLevel | Go | v2"
slug: /go/go/v2-Collection-ConsistencyLevel
sidebar_label: "ConsistencyLevel"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ConsistencyLevel インスタンスは、コレクションに対する読み取り操作の整合性保証レベルを指定します。 | Go | v2"
type: docx
token: U2DXdRPC4o7hUDx6JECc0LQWnub
sidebar_position: 7
keywords: 
  - ANNS
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - zilliz
  - zilliz cloud
  - クラウド
  - ConsistencyLevel
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ConsistencyLevel

ConsistencyLevel インスタンスは、コレクションに対する読み取り操作の整合性保証レベルを指定します。

```go
type ConsistencyLevel commonpb
```

**値:**

- **ClStrong** = ConsistencyLevel(commonpb.ConsistencyLevel_Strong)

    強い整合性です。すべての操作が即座に可視になります。

- **ClBounded** = ConsistencyLevel(commonpb.ConsistencyLevel_Bounded)

    デフォルトで 5 秒の許容ウィンドウを伴う Bounded Staleness です。

- **ClSession** = ConsistencyLevel(commonpb.ConsistencyLevel_Session)

    セッション整合性です。読み取りでは、同じセッションからの書き込みを参照できます。

- **ClEventually** = ConsistencyLevel(commonpb.ConsistencyLevel_Eventually)

    結果整合性です。クエリパフォーマンスが最適です。

- **ClCustomized** = ConsistencyLevel(commonpb.ConsistencyLevel_Customized)

    ユーザーが指定した保証タイムスタンプを使用するカスタム整合性です。

## 例\{#example}

ConsistencyLevel の使用例を示します。

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle error
}

defer cli.Close(ctx)

// Use ConsistencyLevel in search to control read freshness
queryVector := []float32{0.1, 0.2, 0.3, 0.4, 0.5}
results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", 10, []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong))
if err != nil {
    // handle error
}
fmt.Println(results)
```
