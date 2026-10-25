---
title: "RevokePrivilegeV2 | Go | v2"
slug: /go/go/v2-Authentication-RevokePrivilegeV2
sidebar_label: "RevokePrivilegeV2"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、v2 API を使用してロールから権限を取り消します。 | Go | v2"
type: docx
token: LQj8d9Osgo8oNAx8yD2cmtYNnDc
sidebar_position: 22
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - RevokePrivilegeV2
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RevokePrivilegeV2

この操作は、v2 API を使用してロールから権限を取り消します。

```go
func (c *Client) RevokePrivilegeV2(ctx context.Context, option RevokePrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RevokePrivilegeV2() のリクエストを作成します。

```go
option := milvusclient.NewRevokePrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.RevokePrivilegeV2(ctx, option)
```

**パラメーター：**

- **roleName** (*string*) -

    **【必須】**

    ロールの名前です。

- **privilegeName** (*string*) -

    **【必須】**

    権限の名前です。

- **collectionName** (*string*) -

    **【必須】**

    対象コレクションの名前です。

**ビルダーメソッド：**

- `NewRevokePrivilegeV2Option(roleName string, privilegeName string, collectionName string)`

    RevokePrivilegeV2() のリクエストを作成します。

- `WithDbName(dbName string)`

    操作に使用するデータベースを指定します。

**戻り値の型：**

*error*

**戻り値：**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RevokePrivilegeV2() の使用例を示します。

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

err = cli.RevokePrivilegeV2(ctx, milvusclient.NewRevokePrivilegeV2Option("my_role", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
