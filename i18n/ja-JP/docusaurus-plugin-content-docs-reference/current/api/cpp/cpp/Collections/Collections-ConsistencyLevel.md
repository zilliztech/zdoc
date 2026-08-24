---
title: "ConsistencyLevel | Cloud"
slug: /cpp/cpp/Collections-ConsistencyLevel
sidebar_label: "ConsistencyLevel"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この列挙型は、検索およびクエリ操作におけるデータの可視性保証を制御します。整合性レベルは、リクエストごとに `SearchRequest:WithConsistencyLevel()` や `QueryRequest::WithConsistencyLevel()` で指定できるほか、コレクションのデフォルトとして `CreateCollectionRequest::WithConsistencyLevel()` で設定することも可能です。 | Cloud"
type: docx
token: PSxodxjuFo7SZFxP9qZc09ELn5c
sidebar_position: 12
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - ConsistencyLevel
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ConsistencyLevel

この列挙型は、検索およびクエリ操作におけるデータの可視性保証を制御します。整合性レベルは、リクエストごとに `SearchRequest::WithConsistencyLevel()` や `QueryRequest::WithConsistencyLevel()` で指定できるほか、コレクションのデフォルトとして `CreateCollectionRequest::WithConsistencyLevel()` で設定することも可能です。

```c++
enum class ConsistencyLevel {
    NONE      = -1,
    STRONG    = 0,
    SESSION   = 1,
    BOUNDED   = 2,
    EVENTUALLY = 3,
};
```

**値:**

- **NONE** (-1)

    このリクエストでは整合性レベルが指定されていません。コレクションレベルのデフォルト値が適用されます。

- **STRONG** (0)

    すべての読み取り操作で、最新のコミット済み書き込みが反映されます。これは最も厳格な保証ですが、クエリノードが最新データのレプリケーション完了を待つ必要があるため、レイテンシーが高くなる可能性があります。

- **SESSION** (1)

    単一のクライアントセッション内では、読み取り時に同じセッション内でそれ以前に行われた書き込みを常に参照できます。他のセッションからの書き込みは、すぐには反映されない場合があります。

- **BOUNDED** (2)

    読み取り結果が最新の書き込みより遅れる場合がありますが、その遅延は設定可能な時間幅（デフォルト5秒）内に収まります。データの鮮度とスループットのバランスが取れており、ほとんどの本番ワークロードに適しています。

- **EVENTUALLY** (3)

    データの鮮度は保証されません。クエリノードはローカルに保持しているデータに基づいて結果を返します。結果が古くなる可能性はありますが、最も低いレイテンシーを実現できます。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/ConsistencyLevel.h>
using namespace milvus;

// Per-request: require strong consistency for a critical query
QueryRequest query;
query.WithCollectionName("my_collection")
     .WithFilter("id in [1, 2, 3]")
     .AddOutputField("vec")
     .WithConsistencyLevel(ConsistencyLevel::STRONG);

// Per-request: accept bounded staleness for a high-throughput search
SearchRequest search;
search.WithCollectionName("my_collection")
      .WithAnnsField("vec")
      .WithLimit(10)
      .WithConsistencyLevel(ConsistencyLevel::BOUNDED);

// Collection-level default: set when creating the collection
auto status = client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("my_collection")
        .WithCollectionSchema(schema)
        .WithConsistencyLevel(ConsistencyLevel::BOUNDED));
```
