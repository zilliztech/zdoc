---
title: "FunctionScore | Go | v2"
slug: /go/go/v2-Collection-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionScore 实例表示搜索时的 FunctionScore 消息：一组评分 Function（例如 boost ranker）以及 `boostmode` 和 `functionmode` 等评分选项参数。通过 `WithFunctionScore()` 将其传递给搜索选项。 | Go | v2"
type: docx
token: XNZ5dgPuHo1PD8xMlAycMzjxnrc
sidebar_position: 30
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionScore
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

FunctionScore 实例表示搜索时的 FunctionScore 消息：一组评分 Function（例如 boost ranker）以及 `boost_mode` 和 `function_mode` 等评分选项参数。通过 `WithFunctionScore()` 将其传递给搜索选项。

```go
type FunctionScore struct {
    Functions []*Function
    Params map[string]string
}
```

**字段：**

- **Functions** (<em>[]</em>Function&ast;) -

    搜索期间应用的评分函数。

- **Params** (*map[string]string*) -

    评分选项参数，例如 boost_mode 或 function_mode。

**构建器方法：**

- `AddFunction(f *[Function](Function.md)) *FunctionScore`

    将评分函数追加到评分中。

- `WithParam(key string, value any) *FunctionScore`

    设置评分选项参数的键值对，并将值转换为其字符串表示形式。

**方法：**

- `Clone() *FunctionScore`

    返回 fs 的深拷贝：functions 和 params 会被复制，因此返回的 score 不会与源对象共享可变状态。

## 示例\{#example}

演示 FunctionScore 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

rerank := entity.NewFunction().
	WithName("boost").
	WithType(entity.FunctionTypeRerank)

functionScore := entity.NewFunctionScore().AddFunction(rerank).
	WithParam("boost_mode", "sum").
	WithParam("function_mode", "multiply")

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors).
	WithFunctionScore(functionScore))
if err != nil {
	// handle error
}
```
