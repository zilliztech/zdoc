---
title: "CreateCollection() | Go | v2"
slug: /go/go/v2-Collection-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたスキーマとオプションで新しい collection を作成します。 | Go | v2"
type: docx
token: PP2kdYCHnoZQ96xJqWUcAW8enG9
sidebar_position: 9
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - cloud
  - CreateCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateCollection()

この操作は、指定されたスキーマとオプションで新しい collection を作成します。

```go
func (c *Client) CreateCollection(ctx context.Context, option CreateCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewCreateCollectionOption(name, collectionSchema).
    WithAutoID(autoID).
    WithShardNum(shardNum).
    WithDynamicSchema(dynamicSchema).
    WithVarcharPK(varcharPK, maxLen).
    WithIndexOptions(indexOpts).
    WithProperty(key, value).
    WithConsistencyLevel(cl).
    WithMetricType(metricType).
    WithPKFieldName(name).
    WithVectorFieldName(name).
    WithNumPartitions(numPartitions)

// Alternative constructor(s):
// option := milvusclient.SimpleCreateCollectionOptions(name string, dim int64)

err := client.CreateCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*)

    対象 collection の名前。

- **collectionSchema** (**[entity.Schema](./v2-Collection-Schema)*)

    collection のフィールドとそのデータ型を定義するスキーマ。

**OPTION METHODS:**

- `WithAutoID(autoID bool)`

    挿入されたエンティティの ID を自動生成するかどうかを設定します。

- `WithShardNum(shardNum int32)`

    ノード間でデータを分散するための shard 数を設定します。

- `WithDynamicSchema(dynamicSchema bool)`

    柔軟なフィールド挿入のために、動的スキーマ機能を有効または無効にします。

- `WithVarcharPK(varcharPK bool, maxLen int)`

    最大長を指定して、collection が varchar を主キー型として使用するように設定します。

- `WithIndexOptions(indexOpts ...[CreateIndexOption](./v2-Management-CreateIndex#request-syntax))`

    collection の作成時に適用する index オプションを指定します。

- `WithProperty(key string, value any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

- `WithConsistencyLevel(cl [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    操作の整合性レベルを設定します（Strong、Bounded、Session、または Eventually）。

- `WithMetricType(metricType [entity.MetricType](./v2-Management-MetricType))`

    vector 類似検索の距離メトリックタイプを設定します（例: COSINE、L2、IP）。

- `WithPKFieldName(name string)`

    主キーフィールドの名前を設定します。

- `WithVectorFieldName(name string)`

    vector フィールドの名前を設定します。

- `WithNumPartitions(numPartitions int64)`

    collection の partition 数を設定します。

## Validation\{#validation}

CreateCollection は、リクエストを送信する前に指定されたスキーマを検証します。v2.6.5 では、struct-array フィールドの検証が自動的に適用され、無効な struct サブフィールド定義はリクエスト送信前にエラーを返します。

**RETURN TYPE:**

*error*

**RETURNS:**

成功時は nil を返し、失敗時は問題の内容を説明する error を返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

indexOptions := []milvusclient.CreateIndexOption{
	milvusclient.NewCreateIndexOption(collectionName, "my_vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("my_vector"),
	milvusclient.NewCreateIndexOption(collectionName, "my_id", index.NewSortedIndex()).WithIndexName("my_id"),
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true).
	WithField(entity.NewField().WithName("my_id").WithIsAutoID(true).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
	WithField(entity.NewField().WithName("my_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5)).
	WithField(entity.NewField().WithName("my_varchar").WithDataType(entity.FieldTypeVarChar).WithMaxLength(512))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema).
	WithIndexOptions(indexOptions...),
)
if err != nil {
	// handle error
}
```
