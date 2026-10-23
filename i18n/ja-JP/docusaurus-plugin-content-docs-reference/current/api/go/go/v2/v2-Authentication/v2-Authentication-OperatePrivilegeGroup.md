---
title: "OperatePrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-OperatePrivilegeGroup
sidebar_label: "OperatePrivilegeGroup"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、低レベル v2 API を使用して、権限グループに権限を追加するか、権限グループから権限を削除します。 | Go | v2"
type: docx
token: GCIadDUe1o31qKx66HCcLL3FnPf
sidebar_position: 29
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - OperatePrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# OperatePrivilegeGroup

この操作では、低レベル v2 API を使用して、権限グループに権限を追加するか、権限グループから権限を削除します。

<Admonition type="info" title="Notes">

このインターフェースは非推奨です。代わりに AddPrivilegesToGroup() または RemovePrivilegesFromGroup() を使用してください。

</Admonition>

```go
func (c *Client) OperatePrivilegeGroup(ctx context.Context, option OperatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

OperatePrivilegeGroup() のリクエストを作成します。

```go
option := milvusclient.NewOperatePrivilegeGroupOption(groupName, privileges, operateType)

err := client.OperatePrivilegeGroup(ctx, option)
```

**パラメーター:**

- **groupName** (*string*) -

    **[必須]**

    権限グループの名前です。

- **privileges** (<em>[]</em>milvuspb.PrivilegeEntity&ast;) -

    **[必須]**

    グループに追加する権限、またはグループから削除する権限です。

- **operateType** (*milvuspb.OperatePrivilegeGroupType*) -

    **[必須]**

    実行する操作です。指定した権限を追加または削除します。

**ビルダーメソッド:**

- `NewOperatePrivilegeGroupOption(groupName string, privileges []*milvuspb.PrivilegeEntity, operateType milvuspb.OperatePrivilegeGroupType)`

    権限グループへの権限の追加または削除を行うための新しいオプションを作成します。非推奨です。代わりに `NewAddPrivilegesToGroupOption` または `NewRemovePrivilegesFromGroupOption` を使用してください。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

OperatePrivilegeGroup() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus-proto/go-api/v3/milvuspb"
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

privileges := []*milvuspb.PrivilegeEntity{
	{Name: "Search"},
}

err = cli.OperatePrivilegeGroup(ctx, milvusclient.NewOperatePrivilegeGroupOption("my_priv_group", privileges, milvuspb.OperatePrivilegeGroupType_AddPrivilegesToGroup))
if err != nil {
	// handle error
}
```
