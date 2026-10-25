---
title: "RestoreRBAC | Go | v2"
slug: /go/go/v2-Authentication-RestoreRBAC
sidebar_label: "RestoreRBAC"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、以前に `BackupRBAC()` で取得した、ユーザー、ロール、グラント、および権限グループを含む RBAC メタデータの完全バックアップを復元します。 | Go | v2"
type: docx
token: UcL8dziUMoCFrDxhMu3ccOJMnUb
sidebar_position: 20
keywords: 
  - LLM ハルシネーション
  - ハイブリッド検索
  - 語彙検索
  - 最近傍探索
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreRBAC
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RestoreRBAC

この操作は、以前に `BackupRBAC()` で取得した、ユーザー、ロール、グラント、および権限グループを含む RBAC メタデータの完全バックアップを復元します。

```go
func (c *Client) RestoreRBAC(ctx context.Context, option RestoreRBACOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RestoreRBAC() のリクエストを作成します。

```go
option := milvusclient.NewRestoreRBACOption(meta)

err := client.RestoreRBAC(ctx, option)
```

**パラメーター:**

- **meta** (*entity.RBACMeta*) -

    復元する RBAC メタデータです。通常は、`BackupRBAC()` によって返されるスナップショットです。

**ビルダーメソッド:**

- `NewRestoreRBACOption(meta *entity.RBACMeta)`

    復元する RBAC メタデータを指定して、新しいオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、問題が発生した場合はその内容を説明するエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RestoreRBAC() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

backup, err := cli.BackupRBAC(ctx, milvusclient.NewBackupRBACOption())
if err != nil {
	// handle error
}

meta := &entity.RBACMeta{
	Users:           backup.Users,
	Roles:           backup.Roles,
	RoleGrants:      backup.RoleGrants,
	PrivilegeGroups: backup.PrivilegeGroups,
}

err = cli.RestoreRBAC(ctx, milvusclient.NewRestoreRBACOption(meta))
if err != nil {
	// handle error
}
```
