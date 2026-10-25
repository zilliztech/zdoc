---
title: "AddCollectionField() | Go | v2"
slug: /go/go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、サーバー上のコレクションスキーマを変更して既存のコレクションに null 許容フィールドを追加し、その後、そのコレクションのクライアントのコレクションキャッシュを破棄します。 | Go | v2"
type: docx
token: NmAwdxspJop8U0xi2DPcNYpmnBe
sidebar_position: 1
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは何か
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - AddCollectionField()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddCollectionField()

この操作では、サーバー上のコレクションスキーマを変更して既存のコレクションに null 許容フィールドを追加し、その後、そのコレクションのクライアントのコレクションキャッシュを破棄します。

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AddCollectionField() のリクエストを作成します。

```go
option := milvusclient.NewAddCollectionFieldOption(collectionName, field)

err := client.AddCollectionField(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    フィールドの追加先となるコレクションの名前です。

- **field** (&ast;*entity.Field*) -

    **[必須]**

    追加するフィールドの定義です。ベクトルフィールドは null 許容である必要があります。

**ビルダーメソッド:**

- `NewAddCollectionFieldOption(collectionName string, field *entity.Field)`

    AddCollectionField() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

操作が成功すると nil を返します。クライアント側の検証または RPC が失敗した場合はエラーを返します。

**エラー処理:**

- **error**

    クライアント側の検証または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

AddCollectionField の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

field := entity.NewField().
	WithName("new_field").
	WithDataType(entity.FieldTypeInt64).
	WithNullable(true)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books", field))
if err != nil {
	// handle error
}
```
