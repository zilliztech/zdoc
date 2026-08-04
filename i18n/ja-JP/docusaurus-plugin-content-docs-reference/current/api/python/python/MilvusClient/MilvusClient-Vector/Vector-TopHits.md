---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`TopHits` インスタンスは、各 `SearchAggregation` バケットから返される代表エンティティを設定します。 | Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 14
keywords: 
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

`TopHits` インスタンスは、各 `SearchAggregation` バケットから返される代表エンティティを設定します。

```python
class pymilvus.TopHits
```

## コンストラクタ\{#constructor}

```python
TopHits(
    size: int,
    sort: list[dict[str, str]] | None = None,
)
```

**PARAMETERS:**

- **size** (*int*) **[REQUIRED]** -

    各バケットから返される代表エンティティの最大数。値は正の整数である必要があります。

- **sort** (*list[dict[str, str]] | None*) -

    リストの順序で評価されるヒットの並び順ルール。各項目は、スカラーフィールド名または `_score` を `"asc"` または `"desc"` にマッピングする単一キーの辞書です。省略した場合、サーバーはデフォルトのヒット順序を使用します。

**RETURN TYPE:**

*TopHits*

**EXCEPTIONS:**

- **ParamError** - `size` が正の整数でない場合、または `sort` が有効な方向を持つ単一キー辞書のリストでない場合に発生します。

## 例\{#example}

```python
from pymilvus import SearchAggregation, TopHits

aggregation = SearchAggregation(
    fields=["brand"],
    size=10,
    top_hits=TopHits(
        size=3,
        sort=[{"rating": "desc"}, {"_score": "desc"}],
    ),
)
```
