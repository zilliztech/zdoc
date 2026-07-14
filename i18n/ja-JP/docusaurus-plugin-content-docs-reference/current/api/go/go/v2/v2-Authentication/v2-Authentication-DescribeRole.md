---
title: "DescribeRole() | Go | v2"
slug: /go/go/v2-Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、付与された権限を含むロールの詳細情報を返します。 | Go | v2"
type: docx
token: EAs8dmRIuoMvW5xXLHdcDw2Gn0d
sidebar_position: 6
keywords: 
  - ハイブリッド検索
  - 語彙検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole()

この操作は、付与された権限を含むロールの詳細情報を返します。

```go
func (c *Client) DescribeRole(ctx context.Context, option DescribeRoleOption, callOptions ...grpc.CallOption) (*entity.Role, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDescribeRoleOption(roleName).
    WithDbName(dbName)

result, err := client.DescribeRole(ctx, option)
```

**パラメータ:**

- **roleName** (*string*)

    ロールの名前。

**オプションメソッド:**

- `WithDbName(dbName string)`

    操作に使用するデータベースを指定します。

**戻り値の型:**

**[entity.Role](./v2-Authentication-Role), error*

**戻り値:**

付与された権限を含むロールの詳細。操作が失敗した場合はエラーを返します。

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

role, err := cli.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("my_role"))
if err != nil {
	// handle error
}
fmt.Println(role)
```
