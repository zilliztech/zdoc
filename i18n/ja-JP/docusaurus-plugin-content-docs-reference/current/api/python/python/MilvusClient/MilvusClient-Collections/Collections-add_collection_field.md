---
title: "add_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_field
sidebar_label: "add_collection_field()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションを再作成せずに、新しいスカラーフィールドを追加します。内部スキーマ同期により、このフィールドは最小限の遅延でほぼ即座に利用可能になります。 | Python | MilvusClient"
type: docx
token: MJmwdWRwgoLKtExkF6bcKBPTnQh
sidebar_position: 20
keywords: 
  - マルチモーダル RAG
  - LLM のハルシネーション
  - ハイブリッド検索
  - 語彙検索
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_collection_field()

この操作は、既存のコレクションを再作成せずに、新しいスカラーフィールドを追加します。内部スキーマ同期により、このフィールドは最小限の遅延でほぼ即座に利用可能になります。

<Admonition type="info" title="Notes">

コレクションで動的フィールドが有効になっており、既存の動的フィールドのキーと同じ名前の静的フィールドを追加すると、静的フィールドがその動的フィールドのキーをマスクします。元の動的な値には、`$meta['field_name']` 構文を使用して引き続きアクセスできます。

</Admonition>

<Admonition type="info" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Note">

コレクションで動的フィールドが有効になっており、既存の動的フィールドのキーと同じ名前の静的フィールドを追加すると、静的フィールドがその動的フィールドのキーをマスクします。元の動的な値には、$meta['field_name'] 構文を使用して引き続きアクセスできます。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
add_collection_field(
```

**パラメーター：**

- **collection_name** (*string*) -

    **[REQUIRED]**

    対象のコレクションの名前。

- **field_name** (*string*) -

    **[REQUIRED]**

    新しいフィールドの名前。

- **data_type** (*[DataType](./Collections-DataType)*) -

    **[REQUIRED]**

    新しいフィールドのデータ型。サポートされている型については、DataType を参照してください。

- **desc** (*string, optional*) -

    フィールドの簡単な説明。

- **timeout** (*float*) -

    RPC リクエストのタイムアウト（秒単位）です。None の場合、呼び出しは無期限に待機します。

- **kwargs** (*dict, optional*) -

    追加のパラメーターは以下のとおりです。nullable（bool）：動的に追加されたフィールドでは、新しいフィールドの値を持たない既存のエンティティに対応するため、True に設定する必要があります。default_value（DataType 固有）：データ挿入時に値が指定されない場合に使用される、このフィールドのデフォルト値です。max_length（int）：DataType.VARCHAR フィールドで必須です。文字列に許可される最大バイト長（1～65,535）を設定します。element_type（DataType）：DataType.ARRAY フィールドで必須です。配列内の要素のデータ型を指定します。max_capacity（int）：DataType.ARRAY フィールドで必須です。配列内の要素の最大数を定義します。

**戻り値の型：**

*None*

**戻り値：**

**例外：**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## 例\{#examples}

例 1：基本的な nullable フィールドを追加する

```python
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",
    data_type=DataType.INT64,
    nullable=True  # Required for added fields
)
```

例 2：デフォルト値付きのフィールドを追加する

```python
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",
    data_type=DataType.VARCHAR,
    max_length=20,
    nullable=True,          # Required for added fields
    default_value="standard"  # Default value for existing entities
)
```
