---
title: "RevokeRole | Go | v2"
slug: /go/go/v2-Authentication-RevokeRole
sidebar_label: "RevokeRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、ユーザーからロールを削除します。 | Go | v2"
type: docx
token: OuG9dQJKJoMzmOxOoNNcdDRDnJd
sidebar_position: 23
keywords: 
  - Elastic ベクトルデータベース
  - Pinecone と Milvus の比較
  - Chroma と Milvus の比較
  - Annoy ベクトル検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - RevokeRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokeRole

この操作では、ユーザーからロールを削除します。

```go
func (c *Client) RevokeRole(ctx context.Context, opt RevokeRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RevokeRole() のリクエストを作成します。

```go
option := milvusclient.NewRevokeRoleOption(userName, roleName)

err := client.RevokeRole(ctx, option)
```

**パラメーター:**

- **userName** (*string*) -

    **[必須]**

    ユーザーの名前です。

- **roleName** (*string*) -

    **[必須]**

    ロールの名前です。

**ビルダーメソッド:**

- `NewRevokeRoleOption(userName string, roleName string)`

    RevokeRole() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RevokeRole() の使用例を示します。

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

err = cli.RevokeRole(ctx, milvusclient.NewRevokeRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```
