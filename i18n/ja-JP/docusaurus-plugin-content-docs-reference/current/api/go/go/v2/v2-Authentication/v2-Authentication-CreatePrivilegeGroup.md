---
title: "CreatePrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-CreatePrivilegeGroup
sidebar_label: "CreatePrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、まとめて付与できる名前付きの権限グループを作成します。 | Go | v2"
type: docx
token: CUNxd572AoblwWxPx5SclwaOn5f
sidebar_position: 3
keywords: 
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreatePrivilegeGroup

この操作では、まとめて付与できる名前付きの権限グループを作成します。

```go
func (c *Client) CreatePrivilegeGroup(ctx context.Context, option CreatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreatePrivilegeGroup() のリクエストを作成します。

```go
option := milvusclient.NewCreatePrivilegeGroupOption(groupName)

err := client.CreatePrivilegeGroup(ctx, option)
```

**パラメーター:**

- **groupName** (*string*) -

    **[必須]**

    権限グループの名前です。

**ビルダーメソッド:**

- `NewCreatePrivilegeGroupOption(groupName)`

    CreatePrivilegeGroup() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

CreatePrivilegeGroup() の使用方法を示します。

```go
import (
	"context"

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

err = cli.CreatePrivilegeGroup(ctx, milvusclient.NewCreatePrivilegeGroupOption("my_priv_group"))
if err != nil {
	// handle error
}
```
