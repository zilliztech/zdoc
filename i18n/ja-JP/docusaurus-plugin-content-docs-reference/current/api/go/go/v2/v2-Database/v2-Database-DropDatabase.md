---
title: "DropDatabase | Go | v2"
slug: /go/go/v2-Database-DropDatabase
sidebar_label: "DropDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、データベースとそのすべてのコレクションを完全に削除します。 | Go | v2"
type: docx
token: XjDhd3KjUo8gxdxqPvAcUqOUnfe
sidebar_position: 5
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - DropDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabase

この操作は、データベースとそのすべてのコレクションを完全に削除します。

```go
func (c *Client) DropDatabase(ctx context.Context, option DropDatabaseOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropDatabase() のリクエストを作成します。

```go
option := milvusclient.NewDropDatabaseOption(dbName)

err := client.DropDatabase(ctx, option)
```

**パラメーター:**

- **dbName** (*string*) -

    **[必須]**

    データベースの名前です。

**ビルダーメソッド:**

- `NewDropDatabaseOption(dbName string)`

    DropDatabase() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropDatabase() の使用例を示します。

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
	// handle err
}
defer cli.Close(ctx)

err = cli.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("test_db"))
if err != nil {
	// handle err
}
```
