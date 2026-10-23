---
title: "DescribeCollection | Go | v2"
slug: /go/go/v2-Collection-DescribeCollection
sidebar_label: "DescribeCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スキーマやプロパティを含むコレクションの詳細情報を返します。 | Go | v2"
type: docx
token: Gqw1dx2TLodFGCx2prYcTgminRe
sidebar_position: 11
keywords: 
  - ANNS
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection

この操作は、スキーマやプロパティを含むコレクションの詳細情報を返します。

```go
func (c *Client) DescribeCollection(ctx context.Context, option DescribeCollectionOption, callOptions ...grpc.CallOption) (collection *entity.Collection, err error)
```

## リクエスト構文\{#request-syntax}

DescribeCollection() のリクエストを作成します。

```go
option := milvusclient.NewDescribeCollectionOption(name)

result, err := client.DescribeCollection(ctx, option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewDescribeCollectionOption(name string)`

    DescribeCollection() のリクエストを作成します。

**戻り値の型:**

*entity.コレクション, error*

**戻り値:**

スキーマ、フィールド、プロパティを含むコレクションの説明です。操作が失敗した場合はエラーを返します。

```go
type Collection struct {
    ID               int64
    Name             string
    Schema           *Schema
    PhysicalChannels []string
    VirtualChannels  []string
    Loaded           bool
    ConsistencyLevel ConsistencyLevel
    ShardNum         int32
    Properties       map[string]string
    UpdateTimestamp  uint64
}
```

**パラメーター:**

- **ID** (*int64*) -

    コレクションの一意の識別子です。

- **Name** (*string*) -

    コレクションの名前です。

- **スキーマ** ([スキーマ](./v2-Collection-Schema)) -

    フィールド定義と主キーを含むコレクションスキーマです。

- **PhysicalChannels** (*[]string*) -

    コレクションが使用する物理メッセージチャネルです。

- **VirtualChannels** (*[]string*) -

    コレクションが使用する仮想メッセージチャネルです。

- **Loaded** (*bool*) -

    コレクションが現在読み込まれているかどうかです。

- **ConsistencyLevel** ([ConsistencyLevel](./v2-Collection-ConsistencyLevel)) -

    コレクションの整合性レベルです。

- **ShardNum** (*int32*) -

    コレクション内のシャード数です。

- **Properties** (*map[string]string*) -

    コレクションのプロパティ（TTL 設定など）です。

- **UpdateTimestamp** (*uint64*) -

    コレクションの更新タイムスタンプです。通常、内部の変更検出に使用されます。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DescribeCollection() の使用例を示します。

```go
import (
	"context"
	"fmt"
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

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(collection)
```
