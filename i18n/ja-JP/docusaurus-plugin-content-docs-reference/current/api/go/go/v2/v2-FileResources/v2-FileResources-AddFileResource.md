---
title: "AddFileResource | Go | v2"
slug: /go/go/v2-FileResources-AddFileResource
sidebar_label: "AddFileResource"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、リモートファイルを Milvus に登録し、名前付き参照によってサーバー側の機能から利用できるようにします。 | Go | v2"
type: docx
token: QDGzd5iVnoxc4jxfOGPcJDxVnKc
sidebar_position: 1
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - AddFileResource
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddFileResource

この操作は、リモートファイルを Milvus に登録し、名前付き参照によってサーバー側の機能から利用できるようにします。

```go
func (c *Client) AddFileResource(ctx context.Context, option AddFileResourceOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AddFileResource() のリクエストを作成します。

```go
option := milvusclient.NewAddFileResourceOption(name, path)

err := cli.AddFileResource(ctx, option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    ファイルリソースを参照するための名前です。

- **path** (*string*) -

    **[必須]**

    リモートファイルのパスです。

**ビルダーメソッド:**

- `NewAddFileResourceOption(name string, path string)`

    リモートファイルを登録するための新しいオプションを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、操作が失敗した場合はエラーを返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

AddFileResource() の使用例を示します。

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

err = cli.AddFileResource(ctx, milvusclient.NewAddFileResourceOption("embedding_model", "/models/embedding.bin"))
if err != nil {
	// handle error
}
```
