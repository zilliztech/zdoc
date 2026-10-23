---
title: "DescribeAlias | Go | v2"
slug: /go/go/v2-Collection-DescribeAlias
sidebar_label: "DescribeAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、参照先のコレクションを含むエイリアスの詳細情報を返します。 | Go | v2"
type: docx
token: VTjPdvA5XopoUCxDDOLcjpkpnXd
sidebar_position: 10
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias

この操作は、参照先のコレクションを含むエイリアスの詳細情報を返します。

```go
func (c *Client) DescribeAlias(ctx context.Context, option DescribeAliasOption, callOptions ...grpc.CallOption) (*entity.Alias, error)
```

## リクエスト構文\{#request-syntax}

DescribeAlias() のリクエストを作成します。

```go
option := milvusclient.NewDescribeAliasOption(alias)

result, err := client.DescribeAlias(ctx, option)
```

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    DescribeAlias のエイリアスです。

**ビルダーメソッド:**

- `NewDescribeAliasOption(alias string)`

    エイリアスを記述するためのオプションを作成します。`alias` ではエイリアス名を指定します。

**戻り値の型:**

&ast;*entity.Alias, error*

**戻り値:**

エイリアス名、対象コレクション、およびデータベース名を含むエイリアスの説明です。操作が失敗した場合はエラーを返します。

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**パラメーター:**

- **DbName** (*string*) -

    関連付けられたデータベースの名前です。

- **Alias** (*string*) -

    エイリアス名です。

- **CollectionName** (*string*) -

    関連付けられたコレクションの名前です。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DescribeAlias() の使用方法を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

alias, err := cli.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("books_alias"))
if err != nil {
	// handle error
}
log.Println(alias)
```
