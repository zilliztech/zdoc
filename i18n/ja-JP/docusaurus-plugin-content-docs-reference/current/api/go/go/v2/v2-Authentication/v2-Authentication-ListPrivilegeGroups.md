---
title: "ListPrivilegeGroups | Go | v2"
slug: /go/go/v2-Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、すべての権限グループと、それらに含まれる権限を一覧表示します。 | Go | v2"
type: docx
token: XbybdCKjgoveJExG4SDcpBjenkg
sidebar_position: 14
keywords: 
  - Chroma ベクトルデータベース
  - NLP 検索
  - LLM ハルシネーション
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - cloud
  - ListPrivilegeGroups
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPrivilegeGroups

この操作では、すべての権限グループと、それらに含まれる権限を一覧表示します。

```go
func (c *Client) ListPrivilegeGroups(ctx context.Context, option ListPrivilegeGroupsOption, callOptions ...grpc.CallOption) ([]*entity.PrivilegeGroup, error)
```

## リクエスト構文\{#request-syntax}

ListPrivilegeGroups() のリクエストを作成します。

```go
option := milvusclient.NewListPrivilegeGroupsOption()

groups, err := client.ListPrivilegeGroups(ctx, option)
```

**ビルダーメソッド：**

- `NewListPrivilegeGroupsOption()`

    ListPrivilegeGroups() のリクエストを作成します。

**戻り値の型：**

<em>[]</em>entity.PrivilegeGroup, error&ast;

**戻り値：**

権限グループと、それらに含まれる権限のリストです。操作が失敗した場合はエラーを返します。

```go
type PrivilegeGroup struct {
    GroupName string
    Privileges []string
}
```

**パラメーター：**

- **GroupName** (*string*) -

    権限グループの名前です。

- **Privileges** (*[]string*) -

    付与された権限のリストです。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ListPrivilegeGroups() の使用例を示します。

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

groups, err := cli.ListPrivilegeGroups(ctx, milvusclient.NewListPrivilegeGroupsOption())
if err != nil {
	// handle error
}
fmt.Println(groups)
```
