---
title: "RevokeV2 | Go | v2"
slug: /go/go/v2-Authentication-RevokeV2
sidebar_label: "RevokeV2"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、v2 API を使用してロールから権限を取り消します。 | Go | v2"
type: docx
token: NylxdfK4NoqbPPxPsZ4cOF14n1f
sidebar_position: 30
keywords: 
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - RevokeV2
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokeV2

この操作は、v2 API を使用してロールから権限を取り消します。

<Admonition type="info" title="Notes">

このインターフェースは非推奨です。代わりに RevokePrivilegeV2() を使用してください。

</Admonition>

```go
func (c *Client) RevokeV2(ctx context.Context, option RevokeV2Option, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RevokeV2() のリクエストを作成します。

```go
option := milvusclient.NewRevokeV2Option(roleName, privilegeName, dbName, collectionName).
    WithDbName(dbName)

err := client.RevokeV2(ctx, option)
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

- `NewRevokeV2Option(roleName string, privilegeName string, dbName string, collectionName string)`

    v2 API を使用して権限を取り消すための新しいオプションを作成します。非推奨です。代わりに `NewRevokePrivilegeV2Option` を使用してください。

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

RevokeV2() の使用例を示します。

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

err = cli.RevokeV2(ctx, milvusclient.NewRevokeV2Option("my_role", "Search", "default", "quick_setup"))
if err != nil {
	// handle error
}
```
