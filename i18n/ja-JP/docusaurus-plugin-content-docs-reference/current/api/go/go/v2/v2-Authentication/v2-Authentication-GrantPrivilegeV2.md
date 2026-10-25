---
title: "GrantPrivilegeV2 | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、簡素化されたパラメーターを使用する v2 API により、ロールに権限を付与します。 | Go | v2"
type: docx
token: SQmOdGshmoWjeexP0GLcZoCZnEc
sidebar_position: 12
keywords: 
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - GrantPrivilegeV2
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2

この操作では、簡素化されたパラメーターを使用する v2 API により、ロールに権限を付与します。

```go
func (c *Client) GrantPrivilegeV2(ctx context.Context, option GrantPrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

GrantPrivilegeV2() のリクエストを作成します。

```go
option := milvusclient.NewGrantPrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.GrantPrivilegeV2(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    **【必須】**

    ロールの名前です。

- **privilegeName** (*string*) -

    **【必須】**

    権限の名前です。

- **collectionName** (*string*) -

    **【必須】**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewGrantPrivilegeV2Option(roleName string, privilegeName string, collectionName string)`

    GrantPrivilegeV2() のリクエストを作成します。

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

GrantPrivilegeV2() の使用例を示します。

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

err = cli.GrantPrivilegeV2(ctx, milvusclient.NewGrantPrivilegeV2Option("my_role", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
