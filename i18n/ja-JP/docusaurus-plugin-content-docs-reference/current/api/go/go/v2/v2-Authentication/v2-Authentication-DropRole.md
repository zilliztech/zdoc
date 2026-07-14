---
title: "DropRole() | Go | v2"
slug: /go/go/v2-Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はシステムからロールを削除します。 | Go | v2"
type: docx
token: QKItdAf6HoDzMVxzWEbcDVL9n5r
sidebar_position: 9
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - DropRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropRole()

この操作はシステムからロールを削除します。

```go
func (c *Client) DropRole(ctx context.Context, opt DropRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropRoleOption("my_role").
    WithForce(true)

err := cli.DropRole(ctx, option)
```

**パラメーター:**

- **opt** (*DropRoleOption*) -

    ロールを削除するためのオプションです。

**ビルダーメソッド:**

- `WithForce(force bool)`

    これにより削除操作が強制され、ユーザーに割り当てられている、または権限が付与されている場合でもロールを削除します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は err != nil を確認してください。

## 例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

// Drop a role normally
err = cli.DropRole(ctx, milvusclient.NewDropRoleOption("my_role"))
if err != nil {
	log.Fatal("failed to drop role: ", err.Error())
}

// Force drop a role that is still assigned
err = cli.DropRole(ctx, milvusclient.NewDropRoleOption("my_role").WithForce(true))
if err != nil {
	log.Fatal("failed to force drop role: ", err.Error())
}
```
