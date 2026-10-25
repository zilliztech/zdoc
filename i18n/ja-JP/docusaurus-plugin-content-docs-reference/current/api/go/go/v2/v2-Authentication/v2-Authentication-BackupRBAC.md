---
title: "BackupRBAC | Go | v2"
slug: /go/go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ユーザー、ロール、権限付与、および権限グループを含む RBAC メタデータの完全バックアップを作成します。 | Go | v2"
type: docx
token: IXV9dcjNHoDBgXx5jJucsAbYnPd
sidebar_position: 2
keywords: 
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - 異常検出
  - zilliz
  - zilliz cloud
  - cloud
  - BackupRBAC
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BackupRBAC

この操作は、ユーザー、ロール、権限付与、および権限グループを含む RBAC メタデータの完全バックアップを作成します。

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
```

## リクエスト構文\{#request-syntax}

BackupRBAC() のリクエストを作成します。

```go
option := milvusclient.NewBackupRBACOption()

backup, err := client.BackupRBAC(ctx, option)
```

**ビルダーメソッド:**

- `NewBackupRBACOption()`

    BackupRBAC() のリクエストを作成します。

**戻り値の型:**

&ast;*entity.RBACMeta, error*

**戻り値:**

ユーザー、ロール、権限付与、および権限グループを含む完全な RBAC メタデータのスナップショットです。操作が失敗した場合はエラーを返します。

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

**パラメーター:**

- **Users** (<em>[]</em>UserInfo&ast;) -

    ユーザーです。

- **Roles** (<em>[]</em>Role&ast;) -

    割り当てられたロールの一覧です。

- **RoleGrants** (<em>[]</em>RoleGrants&ast;) -

    ロールの権限付与です。

- **PrivilegeGroups** (<em>[]</em>PrivilegeGroup&ast;) -

    権限グループです。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

BackupRBAC() の使用例を示します。

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

backup, err := cli.BackupRBAC(ctx, milvusclient.NewBackupRBACOption())
if err != nil {
	// handle error
}
fmt.Println(backup)
```
