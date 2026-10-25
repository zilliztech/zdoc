---
title: "GrantV2 | Go | v2"
slug: /go/go/v2-Authentication-GrantV2
sidebar_label: "GrantV2"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、v2 API を使用してロールに権限を付与します。 | Go | v2"
type: docx
token: UK3BdNpHNorHQPx0R2bcxyiQnTd
sidebar_position: 28
keywords: 
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - GrantV2
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GrantV2

この操作は、v2 API を使用してロールに権限を付与します。

<Admonition type="info" title="Notes">

このインターフェースは非推奨です。代わりに GrantPrivilegeV2() を使用してください。

</Admonition>

```go
func (c *Client) GrantV2(ctx context.Context, option GrantV2Option, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

GrantV2() のリクエストを作成します。

```go
option := milvusclient.NewGrantV2Option(roleName, privilegeName, dbName, collectionName).
    WithDbName(dbName)

err := client.GrantV2(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    ロールの名前です。

- **privilegeName** (*string*) -

    権限の名前です。

- **dbName** (*string*) -

    データベースの名前です。

- **collectionName** (*string*) -

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewGrantV2Option(roleName string, privilegeName string, dbName string, collectionName string)`

    v2 API を使用して権限を付与するための新しいオプションを作成します。非推奨です。代わりに `NewGrantPrivilegeV2Option` を使用してください。

- `WithDbName(dbName string)`

    操作に使用するデータベースを指定します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GrantV2() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.GrantV2(ctx, milvusclient.NewGrantV2Option("my_role", "Search", "default", "quick_setup"))
if err != nil {
	// handle error
}
```
