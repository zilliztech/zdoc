---
title: "Database | Go | v2"
slug: /go/go/v2-Database
sidebar_label: "Database"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Database 实例表示一个 Database 及其属性，该实例由 DescribeDatabase 返回。 | Go | v2"
type: docx
token: YXVpdEBCWo4vpexKgwCcRbClnFc
sidebar_position: 3
keywords: 
  - 大语言模型
  - 向量化
  - k 近邻算法
  - ANNS
  - zilliz
  - zilliz cloud
  - 云
  - Database
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Database

Database 实例表示一个 Database 及其属性，该实例由 DescribeDatabase 返回。

```go
type Database struct {
    Name string
    Properties map[string]string
}
```

**字段：**

- **Name** （*string*） -

    Database 的名称。

- **Properties** （*map[string]string*） -

    Database 的属性。

## 示例\{#example}

演示 Database 的用法。

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

databases, err := cli.ListDatabases(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
	// handle error
}
for _, db := range databases {
	fmt.Println(db.Name)
}
```
