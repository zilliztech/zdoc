---
title: "ConsistencyLevel | Go | v2"
slug: /go/go/v2-Collection-ConsistencyLevel
sidebar_label: "ConsistencyLevel"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "指定集合上读取操作的一致性保证级别。 | Go | v2"
type: docx
token: CBg7dbZZ7oxxvJx1eV4cJXWGnbe
sidebar_position: 7
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - ConsistencyLevel
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ConsistencyLevel

指定集合上读取操作的一致性保证级别。

```go
type ConsistencyLevel commonpb
```

**取值：**

- **ClStrong** = ConsistencyLevel(commonpb.ConsistencyLevel_Strong)

    强一致性。所有操作都会立即可见。

- **ClBounded** = ConsistencyLevel(commonpb.ConsistencyLevel_Bounded)

    有界过期一致性，默认容忍窗口为 5 秒。

- **ClSession** = ConsistencyLevel(commonpb.ConsistencyLevel_Session)

    会话一致性。读取可以看到同一会话中的写入。

- **ClEventually** = ConsistencyLevel(commonpb.ConsistencyLevel_Eventually)

    最终一致性。可获得最佳查询性能。

- **ClCustomized** = ConsistencyLevel(commonpb.ConsistencyLevel_Customized)

    自定义一致性，使用用户指定的保证时间戳。

## 示例\{#example}

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
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
