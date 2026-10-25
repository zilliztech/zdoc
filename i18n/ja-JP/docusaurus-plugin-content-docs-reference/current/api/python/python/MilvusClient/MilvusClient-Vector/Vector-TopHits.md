---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "TopHits インスタンスは、各 SearchAggregation バケットから返される代表エンティティを設定します。 | Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 17
keywords: 
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - cloud
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# TopHits

TopHits インスタンスは、各 SearchAggregation バケットから返される代表エンティティを設定します。

## リクエスト構文\{#request-syntax}

```python
__init__(
    size: int,
    sort: Optional[List[Dict[str, str]]] = None
)
```

**パラメーター:**

- **size** (*int*) -

    **[必須]**

    各バケットから返される代表エンティティの最大数です。値は正の整数である必要があります。

- **sort** (*list[dict[str, str]] | None*) -

    リストの順序で評価されるヒットの並び順ルールです。各項目は、フィールド名または _score を "asc" または "desc" にマッピングする単一キーの辞書です。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。失敗の正確な理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import TopHits

top = TopHits(
    size=3,
    sort=[{"_score": "desc"}],
)
```
