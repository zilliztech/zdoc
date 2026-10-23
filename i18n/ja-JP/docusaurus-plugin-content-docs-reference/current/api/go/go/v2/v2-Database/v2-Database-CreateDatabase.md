---
title: "CreateDatabase | Go | v2"
slug: /go/go/v2-Database-CreateDatabase
sidebar_label: "CreateDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した名前とオプションのプロパティを使用して新しいデータベースを作成します。 | Go | v2"
type: docx
token: KgMSdCS28oPhbWx38NLcrXKanCd
sidebar_position: 2
keywords: 
  - 階層型ナビゲーション可能なスモールワールド
  - 密埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase

この操作は、指定した名前とオプションのプロパティを使用して新しいデータベースを作成します。

```go
func (c *Client) CreateDatabase(ctx context.Context, option CreateDatabaseOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreateDatabase() のリクエストを作成します。

```go
option := milvusclient.NewCreateDatabaseOption(dbName).
    WithProperty(key, value)

err := client.CreateDatabase(ctx, option)
```

**パラメーター:**

- **dbName** (*string*) -

    **[REQUIRED]**

    データベースの名前です。

**ビルダーメソッド:**

- `NewCreateDatabaseOption(dbName string)`

    データベースを作成するためのオプションを作成します。`dbName` は、作成するデータベースの名前を指定します。

- `WithProperty(key string, value any)`

    値を文字列表現に変換した後、データベースプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

データベースが作成されると nil を返します。操作が失敗した場合はエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。リクエストの構築または RPC が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

CreateDatabase() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("test_db").
	WithProperty("database.replica.number", "3"))
if err != nil {
	// handle error
}
```
