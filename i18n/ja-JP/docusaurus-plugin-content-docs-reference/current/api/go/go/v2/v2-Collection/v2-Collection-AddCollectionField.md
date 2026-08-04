---
title: "AddCollectionField() | Go | v2"
slug: /go/go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "クライアント側でフィールドオプションを検証した後、既存の collection に nullable フィールドを追加します。 | Go | v2"
type: docx
token: NmAwdxspJop8U0xi2DPcNYpmnBe
sidebar_position: 1
keywords: 
  - AI チャットボット
  - cosine distance
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionField()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionField()

クライアント側でフィールドオプションを検証した後、既存の collection に nullable フィールドを追加します。

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    フィールドを追加する collection の名前。

- **field** (**entity.Field*) -

    **[REQUIRED]**

    追加するフィールド定義。vector フィールドは nullable である必要があります。

**RETURN TYPE:**

*error*

**RETURNS:**

フィールドの追加後に nil を返します。クライアント側の検証または RPC が失敗した場合はエラーを返します。

**ERROR HANDLING:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細は返された error を確認してください。

## Example\{#example}

AddCollectionField() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

field := entity.NewField().
	WithName("new_field").
	WithDataType(entity.FieldTypeInt64).
	WithNullable(true)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books", field))
if err != nil {
	// handle error
}
```
