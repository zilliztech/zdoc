---
title: "データベース | Go | v2"
slug: /go/go/v2-Database
sidebar_label: "データベース"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "データベース インスタンスは、DescribeDatabase によって返されるデータベースとそのプロパティを表します。 | Go | v2"
type: docx
token: YXVpdEBCWo4vpexKgwCcRbClnFc
sidebar_position: 3
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - データベース
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# データベース

データベース インスタンスは、DescribeDatabase によって返されるデータベースとそのプロパティを表します。

```go
type Database struct {
    Name string
    Properties map[string]string
}
```

**FIELDS:**

- **Name** (*string*) -

    データベースの名前。

- **Properties** (*map[string]string*) -

    データベースのプロパティ。

## 例\{#example}

データベース の使用方法を示します。

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
