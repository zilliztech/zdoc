---
title: "BackupRBAC() | Go | v2"
slug: /go/go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザー、ロール、権限付与、および権限グループを含む RBAC メタデータの完全バックアップを作成します。 | Go | v2"
type: docx
token: Iz1ZdJDWVo0uoUxQjlPcIbS2nMo
sidebar_position: 2
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - BackupRBAC()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BackupRBAC()

この操作は、ユーザー、ロール、権限付与、および権限グループを含む RBAC メタデータの完全バックアップを作成します。

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
```

**戻り値の型:**

&ast;*[entity.RBACMeta](./v2-Authentication-RBACMeta), error*

**戻り値:**

ユーザー、ロール、権限付与、および権限グループを含む完全な RBAC メタデータのスナップショットを返します。操作が失敗した場合はエラーを返します。

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

backup, err := cli.BackupRBAC(ctx, milvusclient.NewBackupRBACOption())
if err != nil {
	// handle error
}
fmt.Println(backup)
```
