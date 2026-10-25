---
title: "Flush | Go | v2"
slug: /go/go/v2-Management-Flush
sidebar_label: "Flush"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将所有插入的数据刷新到持久化存储，确保数据持久性。 | Go | v2"
type: docx
token: JhQ6djjqiocqgYxLmQOcdgQqnJb
sidebar_position: 9
keywords: 
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - 向量搜索算法
  - zilliz
  - zilliz cloud
  - 云
  - Flush
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Flush

此操作会将所有插入的数据刷新到持久化存储，确保数据持久性。

```go
func (c *Client) Flush(ctx context.Context, option FlushOption, callOptions ...grpc.CallOption) (*FlushTask, error)
```

## 请求语法\{#request-syntax}

创建 Flush() 的请求。

```go
option := milvusclient.NewFlushOption(collName)

result, err := client.Flush(ctx, option)
```

**参数：**

- **collName** （*string*） -

    **[必需]**

    Collection 名称。

**构建器方法：**

- `NewFlushOption(collName string)`

    创建 Flush() 的请求。

**返回类型：**

&ast;*FlushTask, error*

**返回：**

返回一个 FlushTask，可用于等待 flush 完成。如果操作失败，则返回错误。

**方法：**

- **Await** （*error*） -

    阻塞，直到确认 flush 完成；按任务的检查间隔轮询服务器，直到 Collection 报告已 flush 或上下文被取消。

- **GetFlushStats** (<em>(segIDs []int64, flushSegIDs []int64, flushTs uint64, channelCheckpoints map[string]</em>msgpb.MsgPosition)&ast;) -

    返回请求 flush 的 Segment ID、已 flush 的 Segment ID、flush 时间戳，以及服务器报告的通道检查点。

**错误处理：**

- **error**

    操作失败。请查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 Flush() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

collectionName := `customized_setup_1`

task, err := cli.Flush(ctx, milvusclient.NewFlushOption(collectionName))
if err != nil {
	// handle err
}

err = task.Await(ctx)
if err != nil {
	// handle err
}
```
