---
title: "DropRole() | Go | v2"
slug: /go/go/v2-Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、システムからロールを削除します。 | Go | v2"
type: docx
token: QKItdAf6HoDzMVxzWEbcDVL9n5r
sidebar_position: 9
keywords: 
  - ベクトル検索
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - クラウド
  - DropRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropRole()

この操作は、システムからロールを削除します。

```go
func (c *Client) DropRole(ctx context.Context, opt DropRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropRole() のリクエストを作成します。

```go
option := milvusclient.NewDropRoleOption("my_role").
    WithForce(true)

err := cli.DropRole(ctx, option)
```

**パラメーター：**

- **roleName** (*string*) -

    ロールの名前です。

**ビルダーメソッド：**

- `NewDropRoleOption(roleName string)`

    DropRole() のリクエストを作成します。

- `WithForce(force bool)`

    ドロップ操作を強制し、ロールがユーザーに割り当てられている場合や権限が付与されている場合でも、そのロールを削除します。

**戻り値の型：**

*error*

**戻り値：**

成功した場合は nil を返し、問題が発生した場合はその内容を説明するエラーを返します。

**エラーハンドリング：**

- **error**

    操作が失敗します。失敗の詳細について err != nil を確認してください。

## 例\{#example}

DropRole() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
