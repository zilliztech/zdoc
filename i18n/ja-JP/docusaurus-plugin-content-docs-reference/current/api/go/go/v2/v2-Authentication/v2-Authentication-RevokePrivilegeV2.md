---
title: "RevokePrivilegeV2() | Go | v2"
slug: /go/go/v2-Authentication-RevokePrivilegeV2
sidebar_label: "RevokePrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、v2 API を使用してロールから権限を取り消します。 | Go | v2"
type: docx
token: StUJd0OCho7PKcxWOU7cPNzhn0d
sidebar_position: 22
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - RevokePrivilegeV2()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilegeV2()

この操作は、v2 API を使用してロールから権限を取り消します。

```go
func (c *Client) RevokePrivilegeV2(ctx context.Context, option RevokePrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewRevokePrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.RevokePrivilegeV2(ctx, option)
```

**パラメーター:**

- **roleName** (*string*)

    ロールの名前。

- **privilegeName** (*string*)

    権限の名前。

- **collectionName** (*string*)

    対象 collection の名前。

**オプションメソッド:**

- `WithDbName(dbName string)`

    この操作で使用するデータベースを指定します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

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

err = cli.RevokePrivilegeV2(ctx, milvusclient.NewRevokePrivilegeV2Option("my_role", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
