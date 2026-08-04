---
title: "DescribeDatabase() | Go | v2"
slug: /go/go/v2-Database-DescribeDatabase
sidebar_label: "DescribeDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回数据库的详细信息，包括其属性。 | Go | v2"
type: docx
token: AR0Bdq0okohr1Cxa1rOcDtvTnoc
sidebar_position: 4
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeDatabase()

此操作返回数据库的详细信息，包括其属性。

```go
func (c *Client) DescribeDatabase(ctx context.Context, option DescribeDatabaseOption, callOptions ...grpc.CallOption) (*entity.Database, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDescribeDatabaseOption(dbName)

result, err := client.DescribeDatabase(ctx, option)
```

**参数：**

- **dbName** (*string*)

    数据库的名称。

**返回类型：**

**entity.Database, error*

**返回：**

返回包含属性在内的数据库描述。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

dbName := `test_db`
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

db, err := cli.DescribeDatabase(ctx, milvusclient.NewDescribeDatabaseOption(dbName))
if err != nil {
	// handle err
}
log.Println(db)
```
