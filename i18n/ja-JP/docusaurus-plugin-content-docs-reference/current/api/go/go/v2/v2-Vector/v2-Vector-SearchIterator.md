---
title: "SearchIterator | Go | v2"
slug: /go/go/v2-Vector-SearchIterator
sidebar_label: "SearchIterator"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ANN 検索結果をバッチ単位で取得する検索イテレーターを作成します。大規模な結果セットを一度にメモリへ読み込む必要がない場合に使用します。 | Go | v2"
type: docx
token: O8iodvuRpoZswVxoC8Ncq2Wlnqf
sidebar_position: 18
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - クラウド
  - SearchIterator
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# SearchIterator

この操作は、ANN 検索結果をバッチ単位で取得する検索イテレーターを作成します。大規模な結果セットを一度にメモリへ読み込む必要がない場合に使用します。

```go
func (c *Client) SearchIterator(ctx context.Context, option SearchIteratorOption, callOptions ...grpc.CallOption) (SearchIterator, error)
```

## リクエスト構文\{#request-syntax}

SearchIterator() のリクエストを作成します。

```go
client.SearchIterator(ctx, milvusclient.NewSearchIteratorOption(collectionName, vector).
    WithBatchSize(batchSize).
    WithIteratorLimit(limit).
    WithPartitions(partitionNames...).
    WithFilter(expr).
    WithOutputFields(fieldNames...).
    WithConsistencyLevel(consistencyLevel).
    WithANNSField(annsField).
    WithAnnParam(ap),
)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **ベクトル** (*entity.ベクトル*) -

    **[必須]**

    検索に使用するクエリベクトルです。

**ビルダーメソッド:**

- `NewSearchIteratorOption(collectionName string, vector entity.Vector)`

    **[必須]** 指定したコレクションとクエリベクトルに使用する新しい検索イテレーターオプションを作成します。

- `WithBatchSize(batchSize int)`

    イテレーションのバッチごとに返すエンティティの数です。デフォルト値: `1000`。

- `WithIteratorLimit(limit int64)`

    反復処理するエンティティの最大総数です。負の値は無制限を意味します。デフォルト値: `Unlimited`（-1）。

- `WithPartitions(partitionNames ...string)`

    検索するパーティションです。指定しない場合は、すべてのパーティションが検索されます。

- `WithNamespace(namespace string)`

    検索イテレーターをコレクションの名前空間にスコープします。

- `WithFilter(expr string)`

    エンティティを絞り込むためのブール式です。式に一致するエンティティのみが返されます。

- `WithTemplateParam(key string, val any)`

    式評価用のテンプレートパラメーターを設定します。

- `WithOffset(offset int)`

    一致結果を返す前にスキップする結果数を設定します。

- `WithOutputFields(fieldNames ...string)`

    返されるエンティティに含めるフィールドです。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    検索の整合性レベルです。デフォルト値: `Bounded`。

- `WithANNSField(annsField string)`

    コレクションに複数のベクトルフィールドがある場合に、検索対象とするベクトルフィールドを指定します。

- `WithGroupByField(groupByField string)`

    指定したフィールドで検索結果をグループ化します。

- `WithGroupSize(groupSize int)`

    グループ化が有効な場合に、グループごとに返す結果数を設定します。

- `WithStrictGroupSize(strictGroupSize bool)`

    グループサイズの厳密な上限を適用します。

- `WithIgnoreGrowing(ignoreGrowing bool)`

    検索中に growing セグメントを無視します。

- `WithAnnParam(ap index.AnnParam)`

    近似最近傍検索のパラメーター（nprobe、ef など）を設定します。

- `WithSearchParam(key, value string)`

    カスタム検索パラメーターのキーと値のペアを設定します。

**戻り値の型:**

**SearchIterator, error**

**戻り値:**

*SearchIterator, error* SearchIterator インターフェースは、検索結果へのページ単位のアクセスを提供します。`io.EOF` が返されるまで `Next()` を繰り返し呼び出します。

**パラメーター:**

- **result** (&ast;*SearchIterator*) -

    SearchIterator() から返される &ast;SearchIterator の値です。

**エラー処理:**

- **error**

    操作は失敗します。指定したコレクションが存在しない、サーバーが検索イテレーターをサポートしていない、パラメーターが無効である、またはサーバーに到達できない場合です。

## 例\{#example}

SearchIterator() の使用方法を示します。

```go
import (
	"context"
	"fmt"
	"io"

	"github.com/milvus-io/milvus/client/v3/entity"
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

queryVector := entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835})

iter, err := cli.SearchIterator(ctx, milvusclient.NewSearchIteratorOption("quick_setup", queryVector).
	WithBatchSize(500).
	WithIteratorLimit(1000),
)
if err != nil {
	// handle error
}

for {
	rs, err := iter.Next(ctx)
	if err == io.EOF {
		break
	}
	if err != nil {
		// handle error
	}
	fmt.Printf("Got %d results\n", rs.Len())
}
```
