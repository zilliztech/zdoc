---
title: "RemovePrivilegesFromGroup | Go | v2"
slug: /go/go/v2-Authentication-RemovePrivilegesFromGroup
sidebar_label: "RemovePrivilegesFromGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、既存の権限グループから 1 つ以上の権限を削除します。 | Go | v2"
type: docx
token: Dzrhd3WaMoODFkxhtcucUCvCn9c
sidebar_position: 19
keywords: 
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - RemovePrivilegesFromGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RemovePrivilegesFromGroup

この操作では、既存の権限グループから 1 つ以上の権限を削除します。

```go
func (c *Client) RemovePrivilegesFromGroup(ctx context.Context, option RemovePrivilegeFromGroupOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RemovePrivilegesFromGroup() のリクエストを作成します。

```go
option := milvusclient.NewRemovePrivilegesFromGroupOption(groupName, privilegeNames...)

err := client.RemovePrivilegesFromGroup(ctx, option)
```

**パラメーター:**

- **groupName** (*string*) -

    **[必須]**

    権限グループの名前です。

- **privileges** (*...string*) -

    **[必須]**

    グループから削除する権限の名前です。

**ビルダーメソッド:**

- `NewRemovePrivilegesFromGroupOption(groupName string, privileges ...string)`

    権限グループから権限を削除するための新しいオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

RemovePrivilegesFromGroup() の使用方法を示します。

```go
import (
	"context"

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

err = cli.RemovePrivilegesFromGroup(ctx, milvusclient.NewRemovePrivilegesFromGroupOption("my_priv_group", "Query"))
if err != nil {
	// handle error
}
```
