---
title: "CreateDatabase() | Go | v2"
slug: /go/go/v2-Database-CreateDatabase
sidebar_label: "CreateDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しいデータベースを作成します。 | Go | v2"
type: docx
token: BMlVd8UFLor42pxDtr3cnobPnxe
sidebar_position: 2
keywords: 
  - ANN Search
  - ベクトル埋め込みとは
  - vector database tutorial
  - ベクトルデータベースはどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - CreateDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase()

この操作は新しいデータベースを作成します。

```go
func (c *Client) CreateDatabase(ctx context.Context, option CreateDatabaseOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewCreateDatabaseOption(dbName).
    WithProperty(key, val)

err := client.CreateDatabase(ctx, option)
```

**パラメータ:**

- **dbName** (*string*)

    データベースの名前。

**オプションメソッド:**

- `WithProperty(key string, val any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

成功時には nil を返し、失敗時には問題の内容を示す error を返します。

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

dbName := `test_db`
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption(dbName))
if err != nil {
	// handle err
}
```
