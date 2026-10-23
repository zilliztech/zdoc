---
title: "RenameCollection | Go | v2"
slug: /go/go/v2-Collection-RenameCollection
sidebar_label: "RenameCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションの名前を変更します。 | Go | v2"
type: docx
token: FgIgdfcnBoXz87xXstdcP0b5nFf
sidebar_position: 22
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - RenameCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RenameCollection

この操作は、既存のコレクションの名前を変更します。

```go
func (c *Client) RenameCollection(ctx context.Context, option RenameCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RenameCollection() のリクエストを作成します。

```go
option := milvusclient.NewRenameCollectionOption(oldName, newName)

err := client.RenameCollection(ctx, option)
```

**パラメータ：**

- **oldName** (*string*) -

    **[必須]**

    変更前の名前です。

- **newName** (*string*) -

    **[必須]**

    コレクションの新しい名前です。

**ビルダーメソッド：**

- `NewRenameCollectionOption(oldName string, newName string)`

    RenameCollection() のリクエストを作成します。

**戻り値の型：**

*error*

**戻り値：**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラーハンドリング：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RenameCollection() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
	// handle error
}
```
