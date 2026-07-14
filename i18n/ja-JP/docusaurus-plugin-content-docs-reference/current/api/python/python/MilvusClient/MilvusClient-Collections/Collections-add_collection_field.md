---
title: "add_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_field
sidebar_label: "add_collection_field()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection を再作成することなく新しい scalar field を追加します。内部スキーマ同期により最小限の遅延で、field はほぼ即座に利用可能になります。 | Python | MilvusClient"
type: docx
token: IquldHhyGo9s4IxF3cicOXGnnNf
sidebar_position: 20
keywords: 
  - マルチモーダル RAG
  - llm のハルシネーション
  - ハイブリッド検索
  - 語彙検索
  - zilliz
  - zilliz cloud
  - クラウド
  - add_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_collection_field()

この操作は、既存の collection を再作成することなく新しい scalar field を追加します。内部スキーマ同期により最小限の遅延で、field はほぼ即座に利用可能になります。

<Admonition type="info" icon="📘" title="注意">

collection で dynamic field が有効になっていて、既存の dynamic field キーと同じ名前の static field を追加した場合、static field が dynamic field キーをマスクします。元の dynamic 値には、`$meta['field_name']` 構文を使って引き続きアクセスできます。

</Admonition>

<Admonition type="info" icon="📘" title="注意">

これは external collection には適用されません。

</Admonition>

## Request Syntax\{#request-syntax}

```python
add_collection_field(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** *(string)* –

    **[REQUIRED]**

    対象 collection の名前。

- **field_name** *(string)* –

    **[REQUIRED]**

    新しい field の名前。

- **data_type** *(DataType)* –

    **[REQUIRED]**

    新しい field のデータ型。サポートされている型については DataType を参照してください。

- **desc** *(string, optional)* –

    field の簡単な説明。

- **timeout** *(float)* –

    RPC リクエストのタイムアウト（秒）。`None` の場合、呼び出しは無期限に待機します。

- **kwargs** *(dict, optional)* –

    追加パラメータは以下のとおりです。

    - **nullable** *(bool)*:

        新しく追加する field には値を持たない既存の entity に対応するため、動的に追加される field では `True` に設定する必要があります。

    - **default_value** *(DataType-specific)*:

        データ挿入時に値が指定されなかった場合の field のデフォルト値。

    - **max_length** *(int)*:

        `DataType.VARCHAR` field で必須です。文字列に許可される最大バイト長（1 ～ 65,535）を設定します。

    - **element_type** *(DataType)*:

        `DataType.ARRAY` field で必須です。配列内の要素のデータ型を指定します。

    - **max_capacity** *(int)*:

        `DataType.ARRAY` field で必須です。配列内の要素数の最大値を定義します。

**RETURN TYPE:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## Examples\{#examples}

**Example 1:** 基本的な nullable field を追加する

```python
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",
    data_type=DataType.INT64,
    nullable=True  # Added fields に必要
)
```

**Example 2:** デフォルト値付きの field を追加する

```python
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",
    data_type=DataType.VARCHAR,
    max_length=20,
    nullable=True,          # Added fields に必要
    default_value="standard"  # 既存 entity のデフォルト値
)
```
