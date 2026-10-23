---
title: "GetPersistentSegmentInfo | Go | v2"
slug: /go/go/v2-Management-GetPersistentSegmentInfo
sidebar_label: "GetPersistentSegmentInfo"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の永続データセグメントに関する情報を返します。 | Go | v2"
type: docx
token: WYiEdG01Oo8BgHxnjA3ci72insg
sidebar_position: 13
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - GetPersistentSegmentInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPersistentSegmentInfo

この操作は、コレクション内の永続データセグメントに関する情報を返します。

```go
func (c *Client) GetPersistentSegmentInfo(ctx context.Context, option GetPersistentSegmentInfoOption) ([]*entity.Segment, error)
```

## リクエスト構文\{#request-syntax}

GetPersistentSegmentInfo() のリクエストを作成します。

```go
option := milvusclient.NewGetPersistentSegmentInfoOption("quick_setup")

segments, err := client.GetPersistentSegmentInfo(ctx, option)
```

**ビルダーメソッド：**

- `NewGetPersistentSegmentInfoOption(collectionName string)`

    GetPersistentSegmentInfo() のリクエストを作成します。

**戻り値の型：**

<em>[]</em>entity.Segment, error&ast;

**戻り値：**

永続セグメントの詳細のリストです。操作が失敗した場合はエラーを返します。

```go
type Segment struct {
    ID           int64
    CollectionID int64
    ParititionID int64
    NumRows      int64
    State        commonpb.SegmentState
}
```

**パラメーター：**

- **ID** (*int64*) -

    セグメントの一意の識別子です。

- **CollectionID** (*int64*) -

    セグメントが属するコレクションの識別子です。

- **ParititionID** (*int64*) -

    セグメントが属するパーティションの識別子です。

- **NumRows** (*int64*) -

    セグメント内の行数です。

- **State** (*commonpb.SegmentState*) -

    セグメントの現在の状態です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細を確認するには、`err != nil` をチェックしてください。

## 例\{#example}

GetPersistentSegmentInfo() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

segments, err := cli.GetPersistentSegmentInfo(ctx, milvusclient.NewGetPersistentSegmentInfoOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(segments)
```
