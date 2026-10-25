---
title: "UseDatabase | Go | v2"
slug: /go/go/v2-Database-UseDatabase
sidebar_label: "UseDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在のクライアント接続のアクティブなデータベースを切り替えます。 | Go | v2"
type: docx
token: EwKhdwcBuoINVbxxLopcubz7nxa
sidebar_position: 8
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - クラウド
  - UseDatabase
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# UseDatabase

この操作は、現在のクライアント接続のアクティブなデータベースを切り替えます。

```go
func (c *Client) UseDatabase(ctx context.Context, option UseDatabaseOption) error
```

## リクエスト構文\{#request-syntax}

UseDatabase() のリクエストを作成します。

```go
option := milvusclient.NewUseDatabaseOption("my_database")

 := client.UseDatabase(ctx, option)
```

**BUILDER METHODS:**

- `NewUseDatabaseOption(dbName string)`

    UseDatabase() のリクエストを作成します。

**RETURN TYPE:**

*error*

**RETURNS:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**ERROR HANDLING:**

- **error**

    操作が失敗した場合です。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

UseDatabase() の使用例を示します。

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

err = cli.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
	// handle err
}
```
