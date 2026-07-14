---
title: "DescribeUser() | Go | v2"
slug: /go/go/v2-Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザーに割り当てられたロールを含む、ユーザーの詳細情報を返します。 | Go | v2"
type: docx
token: EbOodxkWBoRvwAxzJOkcsM6lnic
sidebar_position: 7
keywords: 
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - 近似最近傍探索
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser()

この操作は、ユーザーに割り当てられたロールを含む、ユーザーの詳細情報を返します。

```go
func (c *Client) DescribeUser(ctx context.Context, opt DescribeUserOption, callOpts ...grpc.CallOption) (*entity.User, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDescribeUserOption(userName)

result, err := client.DescribeUser(ctx, option)
```

**パラメーター:**

- **userName** (*string*)

    ユーザーの名前。

**戻り値の型:**

**[entity.User](./v2-Authentication-User), error*

**戻り値:**

割り当てられたロールを含むユーザーの説明を返します。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
