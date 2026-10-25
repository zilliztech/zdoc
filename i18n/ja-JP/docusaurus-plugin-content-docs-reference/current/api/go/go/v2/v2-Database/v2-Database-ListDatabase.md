---
title: "ListDatabase | Go | v2"
slug: /go/go/v2-Database-ListDatabase
sidebar_label: "ListDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus インスタンス内のすべてのデータベースを一覧表示します。 | Go | v2"
type: docx
token: A0bMdNQyvon0rhxJIQpcHbPPn3f
sidebar_position: 7
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - ListDatabase
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListDatabase

この操作は、Milvus インスタンス内のすべてのデータベースを一覧表示します。

```go
func (c *Client) ListDatabase(ctx context.Context, option ListDatabaseOption, callOptions ...grpc.CallOption) (databaseNames []string, err error)
```

## Request Syntax\{#request-syntax}

ListDatabase() のリクエストを作成します。

```go
option := milvusclient.NewListDatabaseOption()

dbs, err := client.ListDatabase(ctx, option)
```

**ビルダーメソッド:**

- `NewListDatabaseOption()`

    ListDatabase() のリクエストを作成します。

**戻り値の型:**

*databaseNames []string, err error*

**戻り値:**

名前のリストです。操作が失敗した場合はエラーを返します。

**パラメーター:**

- **result** (*databaseNames []string*) -

    ListDatabase() によって返される databaseNames []string の値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## Example\{#example}

ListDatabase() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

dbs, err := cli.ListDatabase(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
	// handle err
}
fmt.Println(dbs)
```
