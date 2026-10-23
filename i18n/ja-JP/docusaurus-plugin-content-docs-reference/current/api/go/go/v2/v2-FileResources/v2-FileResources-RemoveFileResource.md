---
title: "RemoveFileResource | Go | v2"
slug: /go/go/v2-FileResources-RemoveFileResource
sidebar_label: "RemoveFileResource"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus からリモートファイルの登録を解除します。参照されなくなったファイルリソースをクリーンアップする場合に使用します。 | Go | v2"
type: docx
token: V6XSdI2msohQzaxLXNdch5ZJnP2
sidebar_position: 6
keywords: 
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - Milvus ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - RemoveFileResource
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RemoveFileResource

この操作は、Milvus からリモートファイルの登録を解除します。参照されなくなったファイルリソースをクリーンアップする場合に使用します。

```go
func (c *Client) RemoveFileResource(ctx context.Context, option RemoveFileResourceOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

RemoveFileResource() のリクエストを作成します。

```go
option := milvusclient.NewRemoveFileResourceOption(name)

err := cli.RemoveFileResource(ctx, option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    登録解除するファイルリソースの名前です。

**ビルダーメソッド:**

- `NewRemoveFileResourceOption(name string)`

    リモートファイルの登録を解除するための新しいオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、操作が失敗した場合はエラーを返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

RemoveFileResource() の使用例を示します。

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

err = cli.RemoveFileResource(ctx, milvusclient.NewRemoveFileResourceOption("embedding_model"))
if err != nil {
	// handle error
}
```
