---
title: "Search() | Go | v2"
slug: /go/go/v2-Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在指定集合上执行近似最近邻（ANN）搜索。您可以使用 `NewSearchOption` 执行基于向量的搜索，或使用 `NewSearchByIDsOption` 按主键 ID 搜索。 | Go | v2"
type: docx
token: YKm9dpXcVoy277xHVT2cIymfnRj
sidebar_position: 17
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - Search()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Search()

此操作会在指定集合上执行近似最近邻（ANN）搜索。您可以使用 `NewSearchOption` 执行基于向量的搜索，或使用 `NewSearchByIDsOption` 按主键 ID 搜索。

```go
func (c *Client) Search(ctx context.Context, option SearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## 请求语法\{#request-syntax}

**向量搜索：**

```go
option := milvusclient.NewSearchOption(collectionName, limit, vectors).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithANNSField(annsField).
    WithGroupByField(groupByField).
    WithGroupSize(groupSize).
    WithStrictGroupSize(strictGroupSize).
    WithIgnoreGrowing(ignoreGrowing).
    WithAnnParam(ap).
    WithSearchParam(key, value).
    WithFunctionReranker(fr)

resultSets, err := cli.Search(ctx, option)
```

**按主键 ID 搜索：**

```go
option := milvusclient.NewSearchByIDsOption(collectionName, limit, ids).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithOutputFields(fieldNames)

resultSets, err := cli.Search(ctx, option)
```

**参数：**

- **option** (*SearchOption*) -

    搜索选项。向量搜索使用 `NewSearchOption`，基于主键的搜索使用 `NewSearchByIDsOption`。

**构建器方法：**

- `NewSearchOption(collectionName string, limit int, vectors []entity.Vector)`<br/>
  此方法会创建一个用于基于向量的 ANN 搜索的搜索选项。

- `NewSearchByIDsOption(collectionName string, limit int, ids column.Column)`<br/>
  此方法会创建一个通过主键 ID 查找实体的搜索选项。

- `WithPartitions(partitionNames ...string)`<br/>
  此方法将搜索范围限制在指定的分区名称内。

- `WithFilter(expr string)`<br/>
  此方法为搜索结果应用布尔表达式过滤。

- `WithTemplateParam(key string, val any)`<br/>
  此方法设置用于表达式求值的模板参数。

- `WithOffset(offset int)`<br/>
  此方法设置在返回匹配结果前要跳过的结果数量。

- `WithOutputFields(fieldNames ...string)`<br/>
  此方法指定在结果集中返回哪些字段。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`<br/>
  此方法设置搜索的一致性级别。

- `WithANNSField(annsField string)`<br/>
  当集合包含多个向量字段时，此方法指定要搜索的向量字段。

- `WithGroupByField(groupByField string)`<br/>
  此方法按指定字段对搜索结果进行分组。

- `WithGroupSize(groupSize int)`<br/>
  启用分组时，此方法设置每组返回的结果数量。

- `WithStrictGroupSize(strictGroupSize bool)`<br/>
  此方法强制执行严格的分组大小限制。

- `WithIgnoreGrowing(ignoreGrowing bool)`<br/>
  此方法在搜索期间忽略 growing segments。

- `WithAnnParam(ap index.AnnParam)`<br/>
  此方法设置近似最近邻搜索参数（例如 nprobe、ef）。

- `WithSearchParam(key, value string)`<br/>
  此方法设置自定义搜索参数键值对。

- `WithFunctionReranker(fr *entity.Function)`<br/>
  此方法对搜索结果应用基于函数的重排序器。

**返回类型：**

*[]ResultSet, error*

**返回：**

包含匹配实体、分数和字段的搜索或查询结果。如果操作失败，则返回错误。

**异常：**

- **error**

    通过检查 err != nil 获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
	APIKey:  token,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
	"quick_setup", // collectionName
	3,             // limit
	[]entity.Vector{entity.FloatVector(queryVector)},
))
if err != nil {
	log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
