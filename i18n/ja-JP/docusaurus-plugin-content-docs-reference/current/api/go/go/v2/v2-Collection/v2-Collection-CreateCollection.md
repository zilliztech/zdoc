---
title: "CreateCollection() | Go | v2"
slug: /go/go/v2-Collection-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "`Validate()` メソッドを公開するオプション（struct-array スキーマを含む）を自動的に検証した後、collection を作成します。 | Go | v2"
type: docx
token: Jm5IdnexOoFaMpx0HqDcbXeDnGe
sidebar_position: 9
keywords: 
  - マルチモーダル ベクトル データベース 検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateCollection()

`Validate()` メソッドを公開するオプション（struct-array スキーマを含む）を自動的に検証した後、collection を作成します。

```go
func (c *Client) CreateCollection(ctx context.Context, option CreateCollectionOption, callOptions ...grpc.CallOption) error
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    作成する collection の名前です。

- **collectionSchema** (**entity.Schema*) -

    **[REQUIRED]**

    collection のフィールドと設定を定義するスキーマです。

**BUILDER METHODS:**

- `WithAutoID(autoID bool)`

    Milvus が主キーを自動生成するかどうかを設定します。

- `WithShardNum(shardNum int32)`

    collection のシャード数を設定します。

- `WithDynamicSchema(dynamicSchema bool)`

    dynamic field を有効または無効にします。

- `WithVarcharPK(varcharPK bool, maxLen int)`

    指定された最大長で VarChar 主キーを使用します。

- `WithIndexOptions(indexOpts ...CreateIndexOption)`

    collection 作成時に使用する index 作成オプションを設定します。

- `WithProperty(key string, value any)`

    値を文字列表現に変換したうえで、collection プロパティを設定します。

- `WithConsistencyLevel(cl entity.ConsistencyLevel)`

    collection の整合性レベルを設定します。

- `WithMetricType(metricType entity.MetricType)`

    デフォルトの vector index の metric type を設定します。

- `WithPKFieldName(name string)`

    主キーフィールド名を設定します。

- `WithVectorFieldName(name string)`

    vector フィールド名を設定します。

- `WithNumPartitions(numPartitions int64)`

    partition key とともに使用する partition 数を設定します。

**RETURN TYPE:**

*error*

**RETURNS:**

collection の作成後に nil を返します。スキーマ検証または RPC が失敗した場合は error を返します。

**ERROR HANDLING:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細は返された error を確認してください。

## Example\{#example}

CreateCollection() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256))

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
	WithField(entity.NewField().WithName("chunks").WithDataType(entity.FieldTypeArray).WithElementType(entity.FieldTypeStruct).WithStructSchema(structSchema))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("books", schema))
if err != nil {
	// handle error
}
```
