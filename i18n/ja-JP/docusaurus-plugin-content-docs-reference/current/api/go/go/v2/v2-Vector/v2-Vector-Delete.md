---
title: "Delete() | Go | v2"
slug: /go/go/v2-Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、主キー値または filter expression によって collection からエンティティを削除します。 | Go | v2"
type: docx
token: ZIm2dVn5noFLpAxRkjbc6jiSnee
sidebar_position: 2
keywords: 
  - ベクトル化
  - k 近傍法
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - Delete()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Delete()

この操作は、主キー値または filter expression によって collection からエンティティを削除します。

```go
func (c *Client) Delete(ctx context.Context, option DeleteOption, callOptions ...grpc.CallOption) (DeleteResult, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDeleteOption(collectionName).
    WithExpr(expr).
    WithInt64IDs(fieldName, ids).
    WithStringIDs(fieldName, ids).
    WithPartition(partitionName)

result, err := client.Delete(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    対象の collection の名前。

**OPTION METHODS:**

- `WithExpr(expr string)`

    この操作の expr を設定します。

- `WithInt64IDs(fieldName string, ids []int64)`

    この操作の int64 IDs を設定します。

- `WithStringIDs(fieldName string, ids []string)`

    この操作の string IDs を設定します。

- `WithPartition(partitionName string)`

    この操作の partition を設定します。

**RETURN TYPE:**

*[DeleteResult](./v2-Vector-DeleteResult), error*

**RETURNS:**

削除結果。操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"

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

res, err := cli.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
	WithInt64IDs("id", []int64{1, 2, 3}))
if err != nil {
	// handle error
}

fmt.Println(res.DeleteCount)
```
