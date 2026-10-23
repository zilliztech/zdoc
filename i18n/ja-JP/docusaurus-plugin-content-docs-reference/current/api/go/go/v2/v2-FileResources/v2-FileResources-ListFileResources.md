---
title: "ListFileResources | Go | v2"
slug: /go/go/v2-FileResources-ListFileResources
sidebar_label: "ListFileResources"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus に登録されているすべてのリモートファイルを一覧表示します。 | Go | v2"
type: docx
token: Ubf9dGyiLoRBOyxHBktcvGAdndg
sidebar_position: 3
keywords: 
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - Zilliz Cloud
  - クラウド
  - ListFileResources
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListFileResources

この操作は、Milvus に登録されているすべてのリモートファイルを一覧表示します。

```go
func (c *Client) ListFileResources(ctx context.Context, option ListFileResourcesOption, callOptions ...grpc.CallOption) ([]*entity.FileResource, error)
```

## リクエスト構文\{#request-syntax}

ListFileResources() のリクエストを作成します。

```go
option := milvusclient.NewListFileResourcesOption()

resources, err := cli.ListFileResources(ctx, option)
```

**ビルダーメソッド:**

- `NewListFileResourcesOption()`

    登録済みファイルを一覧表示するための新しいオプションを作成します。

**戻り値の型:**

<em>[]</em>entity.FileResource, error&ast;

**戻り値:**

各レコードに `ID`、`Name`、`Path` フィールドを持つ [entity.FileResource](./v2-FileResources-FileResource) レコードの一覧です。操作に失敗した場合はエラーを返します。

```go
type FileResource struct {
    ID   int64
    Name string
    Path string
}
```

**パラメーター:**

- **ID** (*int64*) -

    ファイルリソースの一意の識別子です。

- **Name** (*string*) -

    ファイルリソースの名前です。

- **Path** (*string*) -

    ファイルリソースのパスです。

**エラー処理:**

- **error**

    操作に失敗します。失敗の詳細を確認するには、`err != nil` を確認してください。

## 例\{#example}

ListFileResources() の使用例を示します。

```go
import (
	"context"
	"fmt"

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

resources, err := cli.ListFileResources(ctx, milvusclient.NewListFileResourcesOption())
if err != nil {
	// handle error
}

for _, resource := range resources {
	fmt.Printf("ID: %d, Name: %s, Path: %s\n", resource.ID, resource.Name, resource.Path)
}
```
