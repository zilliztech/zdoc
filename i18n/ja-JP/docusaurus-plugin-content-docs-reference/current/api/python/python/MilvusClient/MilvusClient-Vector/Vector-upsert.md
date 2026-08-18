---
title: "upsert() | Python | MilvusClient"
slug: /python/python/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクション内の新しいデータを挿入するか、既存のデータを更新します。配列フィールドの部分更新もオプションでサポートしています。 | Python | MilvusClient"
type: docx
token: UjjpdBwaooRDdlxFHScc6dKwnTg
sidebar_position: 8
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

この操作は、特定のコレクションに新しいデータを挿入するか、既存のデータを更新します。配列フィールドの部分更新もオプションでサポートしています。

<Admonition type="info" icon="📘" title="Notes">

外部コレクションではこの操作をサポートしていません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
upsert(
    collection_name: str,
    data: Union[Dict, List[Dict]],
    timeout: Optional[float] = None,
    partition_name: Optional[str] = "",
    **kwargs,
) -> MutationResult
```

**パラメーター:**

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  エンティティをアップサートするコレクションの名前。

- **data** (*Union[Dict, List[Dict]]*) -<br/>
  **[必須]**<br/>
  アップサートするエンティティ。必要に応じて、イテラブル入力はリストに変換されます。

- **timeout** (*Optional[float]*) -<br/>
  デフォルト: `None`<br/>
  RPC を待機する最大時間（秒）。この値はクライアントのデフォルトを上書きします。

- **partition_name** (*Optional[str]*) -<br/>
  デフォルト: `""`<br/>
  エンティティをアップサートするパーティションの名前。

- **kwargs** (*Any*) -<br/>
  追加のアップサートオプション。

    - **partial_update** (*bool*) -<br/>
      デフォルト: `False`<br/>
      指定したフィールドのみを更新するかどうかを制御するフラグ。`True` の場合、指定されていないフィールドは変更されません。

    - **field_ops** (*Optional[Dict[str, Any]]*) -<br/>
      デフォルト: `None`<br/>
      部分更新時に適用されるフィールドごとのマージ操作。各値には、`FieldOp` ファクトリの結果、`array_append`、`array_remove`、または `replace`、あるいは `FieldPartialUpdateOp` メッセージを指定できます。`replace` 以外の操作は部分更新を有効にします。

**戻り値の型:**

*MutationResult*

**戻り値:**

アップサート操作で報告された主キーと件数を含む変更結果。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

アップサートの使用方法を示します。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[{"id": 1, "vector": [0.1, 0.2, 0.3], "tags": ["science"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```
