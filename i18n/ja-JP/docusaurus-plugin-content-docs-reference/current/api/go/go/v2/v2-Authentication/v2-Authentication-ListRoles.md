---
title: "ListRoles | Go | v2"
slug: /go/go/v2-Authentication-ListRoles
sidebar_label: "ListRoles"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべてのロールの名前を返します。 | Go | v2"
type: docx
token: AwuYdyq81ob9TKx3BEPcww6fnxb
sidebar_position: 15
keywords: 
  - milvus とは
  - milvus データベース
  - milvus lite
  - milvus ベンチマーク
  - zilliz
  - zilliz cloud
  - cloud
  - ListRoles
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListRoles

この操作は、すべてのロールの名前を返します。

```go
func (c *Client) ListRoles(ctx context.Context, opt ListRoleOption, callOpts ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

ListRoles() のリクエストを作成します。

```go
option := milvusclient.NewListRoleOption()

result, err := client.ListRoles(ctx, option)
```

**パラメータ:**

- **option** (*ListRoleOption*) -

    ロールを一覧表示するためのオプションです。構築には `NewListRoleOption` を使用します。

**ビルダーメソッド:**

- `NewListRoleOption()`

    すべてのロールを一覧表示するオプションを作成します。

**戻り値の型:**

*[]string, error*

**戻り値:**

ロール名のリストです。操作が失敗した場合はエラーを返します。

**パラメータ:**

- **result** (*[]string*) -

    ListRoles() から返される []string 値です。

**エラー処理:**

- **error**

    操作が失敗した場合です。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ListRoles() の使用方法を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

roles, err := cli.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
	// handle error
}
fmt.Println(roles)
```
