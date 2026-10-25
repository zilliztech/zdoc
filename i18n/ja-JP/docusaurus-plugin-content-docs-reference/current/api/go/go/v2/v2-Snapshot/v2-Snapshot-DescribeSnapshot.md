---
title: "DescribeSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ソースコレクション、パーティション名、作成タイムスタンプ、保存場所を含む、特定のスナップショットに関する詳細なメタデータを取得します。 | Go | v2"
type: docx
token: NM44dNuQtoKR9UxlEbqcZrVUnpb
sidebar_position: 2
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeSnapshot()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

この操作は、ソースコレクション、パーティション名、作成タイムスタンプ、保存場所を含む、特定のスナップショットに関する詳細なメタデータを取得します。

```go
func (c *Client) DescribeSnapshot(ctx context.Context, opt DescribeSnapshotOption, callOptions ...grpc.CallOption) (*milvuspb.DescribeSnapshotResponse, error)
```

## リクエスト構文\{#request-syntax}

DescribeSnapshot() のリクエストを作成します。

```go
option := client.NewDescribeSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

result, err := client.DescribeSnapshot(option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    説明対象のスナップショットの名前です。

- **collectionName** (*string*) -

    **[必須]**

    スナップショットが属するコレクションの名前です。

**ビルダーメソッド:**

- `WithDbName(dbName string)`

**戻り値の型:**

*milvuspb.DescribeSnapshotResponse, error*

**戻り値:**

詳細なスナップショットメタデータを含む DescribeSnapshotResponse オブジェクトです。

```go
type DescribeSnapshotResponse struct {
    Name           string
    Description    string
    CollectionName string
    CreateTs       int64
    S3Location     string
    PartitionNames []string
}
```

**パラメーター:**

- **result** (*milvuspb.DescribeSnapshotResponse*) -

    詳細なスナップショットメタデータを含む DescribeSnapshotResponse オブジェクトです。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、err != nil を確認してください。

## 例\{#example}

DescribeSnapshot() の使用例を示します。

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

option := milvusclient.NewDescribeSnapshotOption("backup_20260418", "my_collection")

resp, err := cli.DescribeSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(resp.GetName())
fmt.Println(resp.GetCollectionName())
fmt.Println(resp.GetPartitionNames())
fmt.Println(resp.GetCreateTs())
fmt.Println(resp.GetS3Location())
```
