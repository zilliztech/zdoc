---
title: "GrantPrivilegeV2() | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、簡略化されたパラメータを使用する v2 API を使って、ロールに権限を付与します。 | Go | v2"
type: docx
token: ZO8adFZzAotVzfxEko2cKjHvnfb
sidebar_position: 12
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilegeV2()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2()

この操作は、簡略化されたパラメータを使用する v2 API を使って、ロールに権限を付与します。

```go
func (c *Client) GrantPrivilegeV2(ctx context.Context, option GrantPrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewGrantPrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.GrantPrivilegeV2(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*)

    ロールの名前。

- **privilegeName** (*string*)

    権限の名前。

- **collectionName** (*string*)

    対象 collection の名前。

**OPTION METHODS:**

- `WithDbName(dbName string)`

    操作に使用するデータベースを指定します。

**RETURN TYPE:**

*error*

**RETURNS:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**EXCEPTIONS:**

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
