---
title: "RevokePrivilege | Go | v2"
slug: /go/go/v2-Authentication-RevokePrivilege
sidebar_label: "RevokePrivilege"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ロールから特定の権限を取り消します。 | Go | v2"
type: docx
token: RPbodXeOeoeiH6xVLdVcZUsenlb
sidebar_position: 21
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - RevokePrivilege
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilege

この操作は、ロールから特定の権限を取り消します。

```go
func (c *Client) RevokePrivilege(ctx context.Context, option RevokePrivilegeOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RevokePrivilege() のリクエストを作成します。

```go
option := milvusclient.NewRevokePrivilegeOption(roleName, objectType, privilegeName, objectName).
    WithDbName(dbName)

err := client.RevokePrivilege(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    **[必須]**

    ロールの名前です。

- **objectType** (*string*) -

    **[必須]**

    権限の適用対象となるオブジェクトのタイプです（例：Global、コレクション）。

- **privilegeName** (*string*) -

    **[必須]**

    権限の名前です。

- **objectName** (*string*) -

    **[必須]**

    権限の適用対象となるオブジェクトの名前です。

**ビルダーメソッド:**

- `NewRevokePrivilegeOption(roleName string, objectType string, privilegeName string, objectName string)`

    RevokePrivilege() のリクエストを作成します。

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

RevokePrivilege() の使用例を示します。

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

err = cli.RevokePrivilege(ctx, milvusclient.NewRevokePrivilegeOption("my_role", "Collection", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
