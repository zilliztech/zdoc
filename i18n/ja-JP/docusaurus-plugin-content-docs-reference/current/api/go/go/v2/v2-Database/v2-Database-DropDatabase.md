---
title: "DropDatabase() | Go | v2"
slug: /go/go/v2-Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データベースとそのすべてのコレクションを完全に削除します。 | Go | v2"
type: docx
token: FfZ6dqEk2o9Cn3xFAgTckLhsnS6
sidebar_position: 5
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabase()

この操作は、データベースとそのすべてのコレクションを完全に削除します。

```go
func (c *Client) DropDatabase(ctx context.Context, option DropDatabaseOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropDatabaseOption(dbName)

err := client.DropDatabase(ctx, option)
```

**パラメータ:**

- **dbName** (*string*)

    データベースの名前。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

err = cli.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("test_db"))
if err != nil {
	// handle err
}
```
