---
title: "ListSnapshots() | Go | v2"
slug: /go/go/v2-Snapshot-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection のすべてのスナップショット名を一覧表示します。 | Go | v2"
type: docx
token: Bs3OdQ56zohZEbx9KaHcInM4nHh
sidebar_position: 6
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - llm ハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - ListSnapshots()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListSnapshots()

この操作は、指定された collection のすべてのスナップショット名を一覧表示します。

```go
func (c *Client) ListSnapshots(ctx context.Context, opt ListSnapshotsOption, callOptions ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewListSnapshotsOption(collectionName).
    WithDbName(dbName string)

result, err := client.ListSnapshots(option)
```

**パラメータ:**

- **collectionName** (*string*) -

    対象 collection の名前。

**ビルダーメソッド:**

- `WithDbName(dbName string)`

    データベース名を設定します。設定しない場合は、デフォルトのデータベースが使用されます。

**戻り値の型:**

*[]string, error*

**戻り値:**

スナップショット名のリスト。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewListSnapshotsOption("my_collection")

snapshots, err := cli.ListSnapshots(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(snapshots)
```
