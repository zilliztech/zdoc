---
title: "DropPrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-DropPrivilegeGroup
sidebar_label: "DropPrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、特権グループを削除します。 | Go | v2"
type: docx
token: Vt7adLFyNoUVsJxfYpdcDdVanae
sidebar_position: 8
keywords: 
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルデータベース
  - ベクトルデータベースの例
  - zilliz
  - Zilliz Cloud
  - クラウド
  - DropPrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropPrivilegeGroup

この操作では、特権グループを削除します。

```go
func (c *Client) DropPrivilegeGroup(ctx context.Context, option DropPrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropPrivilegeGroup() のリクエストを作成します。

```go
option := milvusclient.NewDropPrivilegeGroupOption(groupName)

err := client.DropPrivilegeGroup(ctx, option)
```

**パラメーター:**

- **groupName** (*string*) -

    **必須**

    特権グループの名前です。

**ビルダーメソッド:**

- `NewDropPrivilegeGroupOption(groupName)`

    DropPrivilegeGroup() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropPrivilegeGroup() の使用例を示します。

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

err = cli.DropPrivilegeGroup(ctx, milvusclient.NewDropPrivilegeGroupOption("my_priv_group"))
if err != nil {
	// handle error
}
```
