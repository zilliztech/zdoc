---
title: "DescribeDatabase | Go | v2"
slug: /go/go/v2-Database-DescribeDatabase
sidebar_label: "DescribeDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Database 的详细信息，包括其属性。 | Go | v2"
type: docx
token: TA9gd2U0moA7oPx2x9Ocsq8dnud
sidebar_position: 4
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeDatabase
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeDatabase

此操作返回 Database 的详细信息，包括其属性。

```go
func (c *Client) DescribeDatabase(ctx context.Context, option DescribeDatabaseOption, callOptions ...grpc.CallOption) (*entity.Database, error)
```

## 请求语法\{#request-syntax}

创建 DescribeDatabase() 的请求。

```go
option := milvusclient.NewDescribeDatabaseOption(dbName)

result, err := client.DescribeDatabase(ctx, option)
```

**参数：**

- **dbName** （*string*） -

    **[必需]**

    Database 的名称。

**构建器方法：**

- `NewDescribeDatabaseOption(dbName string)`

    创建 DescribeDatabase() 的请求。

**返回类型：**

&ast;*Entity.Database, error*

**返回：**

返回包含属性的 Database 说明。如果操作失败，则返回错误。

```go
type Database struct {
    Name       string
    Properties map[string]string
}
```

**参数：**

- **Name** （*string*） -

    Database 的名称。

- **Properties** （*map[string]string*） -

    Database 的属性。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DescribeDatabase() 的使用方式。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
