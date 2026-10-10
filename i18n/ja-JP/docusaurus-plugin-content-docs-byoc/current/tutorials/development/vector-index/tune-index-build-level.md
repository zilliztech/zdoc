---
title: "インデックス構築レベルを調整する | BYOC"
slug: /tune-index-build-level
sidebar_label: "構築レベルを調整する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、`buildlevel` というパラメーターが導入されており、対象コレクションのストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低いコレクションや、より多くのストレージ容量が必要なコレクションでは、再現率がわずかに低下する代わりに、ストレージ容量を大幅に増やすことができ、その逆も同様です。本ガイドでは、利用可能なオプションと、それらを使用してコレクションのインデックスを構築する方法について説明します。 | BYOC"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# インデックス構築レベルを調整する

Zilliz Cloud では、`build_level` というパラメーターが導入されており、これにより、対象コレクションのストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低いコレクションや、より多くのストレージ容量が必要なコレクションでは、再現率がわずかに低下する代わりに、ストレージ容量を大幅に増やすことができ、その逆も同様です。本ガイドでは、利用可能なオプションと、それらを使用してコレクションのインデックスを構築する方法について説明します。

<Admonition type="info" title="Notes">

この機能は現在 **PUBLIC REVIEW** 段階にあり、次の条件を満たす Dedicated クラスターにのみ適用されます。

- クラスターが **Performance-optimized**、**Capacity-optimized**、**Tiered-storage** タイプであること。

- クラスターが **Milvus v2.6.x** と互換性があること。

クラスターをアップグレードしてこの機能をテストできます。さらに説明が必要な事項がある場合は、お問い合わせください。

</Admonition>

## 概要\{#overview}

タイプの異なる Zilliz Cloud クラスターでは、公称ストレージ容量が大きく異なります。Performance-optimized クラスター内のコレクションが使用頻度の低い用途向けである場合や、追加のストレージが必要な場合は、コレクション内の **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点ベクトル型のベクトルフィールドにインデックスを作成する際に、`build_level` を Capacity-first オプションに設定することを検討してください。これにより再現率がわずかに低下する可能性がありますが、ストレージ容量を **30%** から **40%** 増やすことができます。

`build_level` パラメーターには、**Precision-first**（2）、**Balanced**（1）、**Capacity-first**（0）の 3 つのオプションがあります。

- **Balanced**（1）

    これはデフォルトのオプションで、ほとんどのシナリオで検索精度とストレージ容量のバランスを取ります。

- **Precision-first**（2）

    このオプションは検索パフォーマンスと高い再現率を優先し、高い精度が求められるコレクションに適しています。

- **Capacity-first**（0）

    このオプションはストレージ容量を重視し、追加のストレージ容量が必要なコレクションに最適です。

社内ベンチマークテストで示されているように、デフォルトのオプションはクラスターのタイプに関係なくすべてのクラスターのストレージ容量を増やします。Performance-optimized クラスターでは、デフォルトのオプションによってストレージ容量が **60%** 増加し、パフォーマンス（QPS）が **17%** 向上します。

### Performance-optimized クラスター\{#performance-optimized-clusters}

次の表は、`build_level` の導入前後における Performance-optimized クラスターの容量、QPS、再現率を比較したものです。デフォルトのオプションが再現率を維持し、QPS とストレージ容量の両方を増やしていることがわかります。

| 構築レベルオプション | 容量（CU あたり） | QPS | 再現率 |
| --- | --- | --- | --- |
| Capacity-first（0） | 500 万個の 768 次元ベクトル | &#126; 1,800 | 90% - 95% |
| Balanced（1） | 200 万個の 768 次元ベクトル | &#126; 2,800 | 91% - 97% |
| Precison-first（2） | 150 万個の 768 次元ベクトル | &#126; 2,900 | 92% - 98%（↑） |

### Capacity-optimized クラスター\{#capacity-optimized-clusters}

次の表は、`build_level` の導入前後における Capacity-optimized クラスターの容量、QPS、再現率を比較したものです。デフォルトのオプションが再現率を維持し、QPS とストレージ容量の両方を増やしていることがわかります。

| 構築レベルオプション | 容量（CU あたり） | QPS | 再現率 |
| --- | --- | --- | --- |
| Capacity-first（0） | 1,200 万個の 768 次元ベクトル | &#126; 200 | 89% - 97% |
| Balanced（1） | 800 万個の 768 次元ベクトル | &#126; 300 | 93% - 98% |
| Precision-first（2） | 500 万個の 768 次元ベクトル | &#126; 350 | 94% - 98% |

### Tiered-storage クラスター\{#tiered-storage-clusters}

データの大部分は S3 に保存されるため、メモリはもはや主要なボトルネックではありません。その結果、クラスターの最大容量は比較的安定したままとなり、最も大きな影響を受けるのは **再現率** です。また、量子化レベルの違いにより、パフォーマンスがわずかに変動します。

- **Balanced（1）:** これは現在の状態を表しており、パフォーマンスは既存のベンチマークと一致したままです。

- **Precision-first（2）:** Build Level を上げると **再現率が約 3%–4% 向上します**が、その代わりに QPS がわずかに低下し、レイテンシがわずかに増加します。

- **Capacity-first（0）:** この構成はメリットが最小限であるため、まれであると予想されます。容量は変わらない一方で、QPS とレイテンシがわずかに改善する代わりに、**再現率が 3%–4% 低下します**。

## 制限事項\{#limits}

操作を開始する前に、以下の制限事項を確認してください。

- コレクションにインデックスを作成する際は、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点ベクトル型のベクトルフィールドにこのパラメーターを設定する必要があります。

- 一度設定すると、このパラメーターは変更できません。ただし、必要に応じてインデックスを削除し、目的の設定で別のインデックスを作成できます。

- 移行またはバックアップを行うと、`build_level` の設定は削除されます。移行または復元が完了した後、必要に応じてインデックスを削除し、目的の設定で別のインデックスを作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定は、検索パフォーマンス、精度、ストレージ容量のバランスを取るのに役立ちます。

Zilliz Cloud では、`build_level` をプログラムから、または Zilliz Cloud コンソールで設定できます。

### build_level をプログラムから設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点型の[ベクトルフィールドにインデックスを作成する](./autoindex-explained)ときに行う必要があります。

次の例では、コレクションがすでに作成されていることを前提としています。`build_level` を `1` に設定すると、**Balanced** オプションが適用されることを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Set up index
# 4.1. Set up the index parameters
index_params = MilvusClient.prepare_index_params()

# 4.2. Add an index on the vector field
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index",
    # highlight-next-line
    build_level=1
)

# 4.3. Create the index
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. List indexes
res = client.list_indexes(
    collection_name="customized_setup"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import io.milvus.v2.service.index.request.ListIndexesReq;
import java.util.Collections;
import java.util.List;

IndexParam indexParam = IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .indexName("vector_index")
        .extraParams(Collections.singletonMap("build_level", 1))
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName("customized_setup")
        .indexParams(Collections.singletonList(indexParam))
        .build());

// 5. List indexes
List<String> indexNames = client.listIndexes(ListIndexesReq.builder()
        .collectionName("customized_setup")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

idx := index.WithExtraIndexParams(
    index.NewAutoIndex(entity.COSINE),
    map[string]string{"build_level": "1"},
)

_, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("customized_setup", "vector", idx).WithIndexName("vector_index"))
if err != nil {
    log.Fatal(err)
}

// 5. List indexes
indexes, err := client.ListIndexes(ctx, milvusclient.NewListIndexOption("customized_setup"))
if err != nil {
    log.Fatal(err)
}
log.Println(indexes)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

const COLLECTION_NAME: &str = "customized_setup";

client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name(COLLECTION_NAME)
            .index_params(vec![
                IndexParam::new()
                    .field_name("vector")
                    .index_name("vector_index")
                    .index_type(IndexType::AutoIndex)
                    .metric_type(MetricType::Cosine)
                    .extra_params(HashMap::from([("build_level".into(), "1".into())])),
            ])
            .build()?,
    )
    .await?;

let res = client
    .list_indexes(
        ListIndexesRequest::builder()
            .collection_name(COLLECTION_NAME)
            .build()?,
    )
    .await?;
println!("{:?}", res.index_names());
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>

const std::string collection_name = "customized_setup";

milvus::IndexDesc index_vector("vector", "vector_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
index_vector.AddExtraParam("build_level", "1");
auto status = client->CreateIndex(milvus::CreateIndexRequest()
                                    .WithCollectionName(collection_name)
                                    .AddIndex(std::move(index_vector)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListIndexesResponse list_resp;
status = client->ListIndexes(milvus::ListIndexesRequest().WithCollectionName(collection_name), list_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const collectionName = 'customized_setup';

// 4. Create the index with build_level
await client.createIndex({
  collection_name: collectionName,
  field_name: 'vector',
  index_type: 'AUTOINDEX',
  index_name: 'vector_index',
  metric_type: 'COSINE',
  params: { build_level: 1 },
});

// 5. List indexes
const res = await client.listIndexes({ collection_name: collectionName });
console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "customized_setup",
    "indexParams": [
      {
        "fieldName": "vector",
        "indexName": "vector_index",
        "metricType": "COSINE",
        "indexType": "AUTOINDEX",
        "params": { "build_level": 1 }
      }
    ]
  }'

curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/list" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"collectionName": "customized_setup"}' 
```

</TabItem>
</Tabs>

### Zilliz Cloud コンソールで build_level を設定する\{#set-buildlevel-on-the-zilliz-cloud-console}

`build_level` をプログラムから設定する代わりに、コレクションを作成する際に Zilliz Cloud コンソールで設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象クラスターの コレクション タブで **+ Create Collection** をクリックします。

1. **Create Collection** ページでスキーマを設定します。

    ベクトルフィールドのデータ型が、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** のいずれかの有効なオプションであることを確認してください。

1. **Create インデックス** セクションで **Edit Index** をクリックします。

1. 表示される Edit ベクトル Index フィールドで、**Metric Type** と **Index Build Level** を設定できます。

