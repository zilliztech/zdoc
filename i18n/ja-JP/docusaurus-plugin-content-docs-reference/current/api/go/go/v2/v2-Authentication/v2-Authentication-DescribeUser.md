---
title: "DescribeUser | Go | v2"
slug: /go/go/v2-Authentication-DescribeUser
sidebar_label: "DescribeUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、割り当てられたロールを含むユーザーの詳細情報を返します。 | Go | v2"
type: docx
token: PQHKdFLGXohyD3xIjALcEDa7n6g
sidebar_position: 7
keywords: 
  - milvus lite
  - milvus ベンチマーク
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeUser

この操作は、割り当てられたロールを含むユーザーの詳細情報を返します。

```go
func (c *Client) DescribeUser(ctx context.Context, opt DescribeUserOption, callOpts ...grpc.CallOption) (*entity.User, error)
```

## リクエスト構文\{#request-syntax}

DescribeUser() のリクエストを作成します。

```go
option := milvusclient.NewDescribeUserOption(userName)

result, err := client.DescribeUser(ctx, option)
```

**パラメーター:**

- **userName** (*string*) -

    **[必須]**

    ユーザーの名前です。

**ビルダーメソッド:**

- `NewDescribeUserOption(userName)`

    DescribeUser() のリクエストを作成します。

**戻り値の型:**

&ast;*entity.User, error*

**戻り値:**

割り当てられたロールを含むユーザーの説明です。操作が失敗した場合は、エラーを返します。

```go
type User struct {
    UserName string
    Roles []string
}
```

**パラメーター:**

- **UserName** (*string*) -

    ユーザーの名前です。

- **Roles** (*[]string*) -

    割り当てられたロールのリストです。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DescribeUser() の使用例を示します。

```go
import (
	"context"
	"fmt"

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

user, err := cli.DescribeUser(ctx, milvusclient.NewDescribeUserOption("my_user"))
if err != nil {
	// handle error
}
fmt.Println(user)
```
