---
title: "upsert() | Python | MilvusClient"
slug: /python/python/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "部分配列更新のための fieldops サポートを追加します。非同期バリアントは同期メソッドと同じパラメータ契約を共有します。 | Python | MilvusClient"
type: docx
token: UjjpdBwaooRDdlxFHScc6dKwnTg
sidebar_position: 8
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

部分配列更新のための field_ops サポートを追加します。非同期バリアントは同期メソッドと同じパラメータ契約を共有します。

<Admonition type="info" icon="📘" title="Notes">

External collection ではこの操作はサポートされていません。

</Admonition>

## Request Syntax\{#request-syntax}

```python
upsert(
    collection_name: str,
    data: Union[Dict, List[Dict]],
    timeout: Optional[float] = None,
    partition_name: Optional[str] = "",
    **kwargs,
) -> MutationResult
```

**PARAMETERS:**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  entity を upsert する collection の名前です。

- **data** (*Union[Dict, List[Dict]]*) -<br/>
  **[REQUIRED]**<br/>
  upsert する entity です。反復可能な入力は、必要に応じてリストに変換されます。

- **timeout** (*Optional[float]*) -<br/>
  Default: `None`<br/>
  RPC を待機する最大時間（秒）です。この値はクライアントのデフォルト設定を上書きします。

- **partition_name** (*Optional[str]*) -<br/>
  Default: `""`<br/>
  entity を upsert する partition の名前です。

- **kwargs** (*Any*) -<br/>
  追加の upsert オプションです。

    - **partial_update** (*bool*) -<br/>
      Default: `False`<br/>
      指定されたフィールドのみを更新するかどうかを制御するフラグです。`True` の場合、指定されていないフィールドは変更されません。

    - **field_ops** (*Optional[Dict[str, Any]]*) -<br/>
      Default: `None`<br/>
      部分更新時に適用されるフィールドごとのマージ操作です。各値には、`FieldOp` ファクトリの結果、`array_append`、`array_remove`、`replace`、または `FieldPartialUpdateOp` メッセージを指定できます。`replace` 以外の操作はすべて部分更新を有効にします。

**RETURN TYPE:**

*MutationResult*

**RETURNS:**

upsert 操作について報告された主キーと件数を含む Mutation result。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

upsert の使用方法を示します。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[{"id": 1, "vector": [0.1, 0.2, 0.3], "tags": ["science"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```
