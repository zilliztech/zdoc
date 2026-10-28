---
title: "ListSnapshots() | Go | v2"
slug: /go/go/v2-Snapshot-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションのすべてのスナップショット名を一覧表示します。 | Go | v2"
type: docx
token: Bs3OdQ56zohZEbx9KaHcInM4nHh
sidebar_position: 7
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - ListSnapshots()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListSnapshots()

この操作は、指定したコレクションのすべてのスナップショット名を一覧表示します。

```go
func (c *Client) ListSnapshots(ctx context.Context, opt ListSnapshotsOption, callOptions ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

ListSnapshots() のリクエストを作成します。

```go
option := client.NewListSnapshotsOption(collectionName).
    WithDbName(dbName string)

result, err := client.ListSnapshots(option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `WithDbName(dbName string)`

    データベース名を設定します。設定しない場合は、デフォルトのデータベースが使用されます。

**戻り値の型:**

*[]string, error*

**戻り値:**

スナップショット名のリストです。操作が失敗した場合は、エラーを返します。

**パラメーター:**

- **result** (*[]string*) -

    ListSnapshots() によって返される []string 値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

ListSnapshots() の使用方法を示します。

```go
import (
	"log"
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
