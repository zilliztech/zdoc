---
title: "AddPrivilegesToGroup | Go | v2"
slug: /go/go/v2-Authentication-AddPrivilegesToGroup
sidebar_label: "AddPrivilegesToGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存の権限グループに1つ以上の権限を追加します。 | Go | v2"
type: docx
token: VCAedbFRIoAQS8x97rRcN32unMg
sidebar_position: 1
keywords: 
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - AddPrivilegesToGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddPrivilegesToGroup

この操作は、既存の権限グループに1つ以上の権限を追加します。

```go
func (c *Client) AddPrivilegesToGroup(ctx context.Context, option AddPrivilegeToGroupOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AddPrivilegesToGroup() のリクエストを作成します。

```go
option := milvusclient.NewAddPrivilegesToGroupOption(groupName, privilegeNames...)

err := client.AddPrivilegesToGroup(ctx, option)
```

**パラメーター:**

- **groupName** (*string*) -

    **[必須]**

    権限グループの名前です。

- **privileges** (*...string*) -

    **[必須]**

    グループに追加する権限の名前です。

**ビルダーメソッド:**

- `NewAddPrivilegesToGroupOption(groupName string, privileges ...string)`

    権限グループに権限を追加するための新しいオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

AddPrivilegesToGroup() の使用方法を示します。

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

err = cli.AddPrivilegesToGroup(ctx, milvusclient.NewAddPrivilegesToGroupOption("my_priv_group", "Search", "Query"))
if err != nil {
	// handle error
}
```
