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
  - milvus open source
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

## Constructor\{#constructor}

```python
TopHits(
    size: int,
    sort: list[dict[str, str]] | None = None,
)
```

**PARAMETERS:**

- **size** (*int*) **[REQUIRED]** -

    各バケットから返される代表エンティティの最大数です。値は正の整数である必要があります。

- **sort** (*list[dict[str, str]] | None*) -

    リストの順序で評価されるヒットの並び順ルールです。各項目は、スカラーフィールド名または `_score` を `"asc"` または `"desc"` に対応付ける単一キーの辞書です。省略した場合、サーバーはデフォルトのヒット順を使用します。

**RETURN TYPE:**

*TopHits*

**EXCEPTIONS:**

- **ParamError** - `size` が正の整数ではない場合、または `sort` が有効な方向を持つ単一キーの辞書のリストではない場合に発生します。

## Example\{#example}

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
