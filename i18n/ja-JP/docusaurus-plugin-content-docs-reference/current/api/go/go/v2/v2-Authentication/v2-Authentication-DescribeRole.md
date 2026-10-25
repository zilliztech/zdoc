---
title: "DescribeRole | Go | v2"
slug: /go/go/v2-Authentication-DescribeRole
sidebar_label: "DescribeRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、説明と権限を含むロールの詳細情報を返します。 | Go | v2"
type: docx
token: TfY6dRxjhoz0hexPK8xchxQ4nsh
sidebar_position: 6
keywords: 
  - LLM 評価
  - スパースと密
  - 密ベクトル
  - 階層型ナビゲーブルスモールワールド
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeRole
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeRole

この操作は、説明と権限を含むロールの詳細情報を返します。

```go
func (c *Client) DescribeRole(ctx context.Context, option DescribeRoleOption, callOptions ...grpc.CallOption) (*entity.Role, error)
```

## リクエスト構文\{#request-syntax}

DescribeRole() のリクエストを作成します。

```go
option := milvusclient.NewDescribeRoleOption(roleName).
    WithDbName(dbName)

result, err := client.DescribeRole(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    **[必須]**

    ロールを記述するためのオプションです。`NewDescribeRoleOption` を使用して構築します。

**ビルダーメソッド:**

- `NewDescribeRoleOption(roleName string)`

    ロールを記述するためのオプションを作成します。`roleName` は記述するロールを指定します。

- `WithDbName(dbName string)`

    操作に使用するデータベースを指定します。

**戻り値の型:**

&ast;*entity.Role, error*

**戻り値:**

ロール名、説明、権限を含むロールの説明です。ロールが見つからない場合、または操作が失敗した場合はエラーを返します。

```go
type Role struct {
    RoleName string
    Privileges []GrantItem
}
```

**パラメーター:**

- **RoleName** (*string*) -

    ロールの名前。

- **Privileges** (*[]GrantItem*) -

    付与された権限のリスト。

**エラーハンドリング:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DescribeRole() の使用方法を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

role, err := cli.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("my_role"))
if err != nil {
	// handle error
}
log.Println(role)
```
