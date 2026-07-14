---
title: "CreateRole() | Go | v2"
slug: /go/go/v2-Authentication-CreateRole
sidebar_label: "CreateRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、アクセス制御のための新しいロールを作成します。 | Go | v2"
type: docx
token: NMsddLaMUoGUxexlFIScnY0Knpg
sidebar_position: 4
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - CreateRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateRole()

この操作は、アクセス制御のための新しいロールを作成します。

```go
func (c *Client) CreateRole(ctx context.Context, opt CreateRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewCreateRoleOption(roleName)

err := client.CreateRole(ctx, option)
```

**パラメーター:**

- **roleName** (*string*)

    ロールの名前。

**戻り値の型:**

*error*

**戻り値:**

成功時には nil を返し、失敗時には問題の内容を示すエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

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

err = cli.CreateRole(ctx, milvusclient.NewCreateRoleOption("my_role"))
if err != nil {
	// handle error
}
```
