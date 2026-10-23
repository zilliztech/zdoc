---
title: "GrantPrivilege | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilege
sidebar_label: "GrantPrivilege"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オブジェクトタイプとオブジェクト名を明示的に指定する v1 API を使用して、ロールに権限を付与します。簡略化された v2 API を使用する場合は、`GrantPrivilegeV2()` を使用してください。 | Go | v2"
type: docx
token: DgJjdMnqgoBVB5xd6cgcMl4VnCh
sidebar_position: 11
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilege
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilege

この操作は、オブジェクトタイプとオブジェクト名を明示的に指定する v1 API を使用して、ロールに権限を付与します。簡略化された v2 API を使用する場合は、`GrantPrivilegeV2()` を使用してください。

```go
func (c *Client) GrantPrivilege(ctx context.Context, option GrantPrivilegeOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

GrantPrivilege() のリクエストを作成します。

```go
option := milvusclient.NewGrantPrivilegeOption(roleName, objectType, privilegeName, objectName).
    WithDbName(dbName)

err := client.GrantPrivilege(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    **[必須]**

    ロールの名前です。

- **objectType** (*string*) -

    **[必須]**

    権限の適用対象となるオブジェクトのタイプです（例: Global、コレクション）。

- **privilegeName** (*string*) -

    **[必須]**

    権限の名前です。

- **objectName** (*string*) -

    **[必須]**

    権限の適用対象となるオブジェクトの名前です。

**ビルダーメソッド:**

- `NewGrantPrivilegeOption(roleName string, objectType string, privilegeName string, objectName string)`

    ロールに権限を付与するための新しいオプションを作成します。

- `WithDbName(dbName string)`

    操作に使用するデータベースを指定します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GrantPrivilege() の使用例を示します。

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

err = cli.GrantPrivilege(ctx, milvusclient.NewGrantPrivilegeOption("my_role", "Collection", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
