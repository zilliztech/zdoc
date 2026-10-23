---
title: "GetCollectionStats | Go | v2"
slug: /go/go/v2-Collection-GetCollectionStats
sidebar_label: "GetCollectionStats"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、行数などのコレクションに関する統計情報を返します。 | Go | v2"
type: docx
token: GdghdqEWhon4rpxH4HBcJUddnsf
sidebar_position: 18
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - GetCollectionStats
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats

この操作は、行数などのコレクションに関する統計情報を返します。

```go
func (c *Client) GetCollectionStats(ctx context.Context, opt GetCollectionOption) (map[string]string, error)
```

## リクエスト構文\{#request-syntax}

GetCollectionStats() のリクエストを作成します。

```go
option := milvusclient.NewGetCollectionStatsOption("quick_setup")

stats, err := client.GetCollectionStats(ctx, option)
```

**ビルダーメソッド：**

- `NewGetCollectionStatsOption(collectionName string)`

    `GetCollectionStats()` のオプションを作成します。`collectionName` は、検査するコレクションを指定します。

**戻り値の型：**

*map[string]string, error*

**戻り値：**

統計情報のキーと値のペアを格納したマップを返します。操作に失敗した場合はエラーを返します。

**パラメーター：**

- **result** (*map[string]string*) -

    GetCollectionStats() が返す map[string]string の値です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GetCollectionStats() の使用例を示します。

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

stats, err := cli.GetCollectionStats(ctx, milvusclient.NewGetCollectionStatsOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(stats)
```
