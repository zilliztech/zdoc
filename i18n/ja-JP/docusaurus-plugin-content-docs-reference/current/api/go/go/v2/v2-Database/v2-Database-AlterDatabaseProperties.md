---
title: "AlterDatabaseProperties | Go | v2"
slug: /go/go/v2-Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のデータベースのプロパティを変更します。 | Go | v2"
type: docx
token: P66AdsWbooIL47xykGkcsI5ZnAg
sidebar_position: 1
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterDatabaseProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties

この操作は、既存のデータベースのプロパティを変更します。

```go
func (c *Client) AlterDatabaseProperties(ctx context.Context, option AlterDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AlterDatabaseProperties() のリクエストを作成します。

```go
option := milvusclient.NewAlterDatabasePropertiesOption(dbName).
    WithProperty(key, value)

err := client.AlterDatabaseProperties(ctx, option)
```

**パラメーター:**

- **dbName** (*string*) -

    **[REQUIRED]**

    データベースの名前。

**ビルダーメソッド:**

- `NewAlterDatabasePropertiesOption(dbName string)`

    データベースのプロパティを変更するためのオプションを作成します。`dbName` は、プロパティを変更するデータベースを指定します。

- `WithProperty(key string, value any)`

    値を文字列表現に変換した後、データベースのプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

データベースのプロパティが変更されると nil を返します。操作が失敗した場合はエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。リクエストの構築または RPC が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

AlterDatabaseProperties() の使用例を示します。

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

err = cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("test_db").
	WithProperty("database.replica.number", "2"))
if err != nil {
	// handle error
}
```
