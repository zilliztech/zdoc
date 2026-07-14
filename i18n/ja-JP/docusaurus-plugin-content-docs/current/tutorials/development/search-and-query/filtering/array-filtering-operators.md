---
title: "ARRAY 演算子 | Cloud"
slug: /array-filtering-operators
sidebar_label: "Array"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ARRAY フィールドのフィルタリングと ARRAY フィールド値の部分更新のための ARRAY 演算子を提供します。 | Cloud"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ARRAY 演算子

Zilliz Cloud は、ARRAY フィールドのフィルタリングと ARRAY フィールド値の部分更新のための ARRAY 演算子を提供します。

注: 配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーン文字列として扱われます。したがって、ARRAY フィールドを扱う際は、過度に深いネストを避け、最適なパフォーマンスのためにデータ構造をできるだけフラットに保つことを推奨します。

Zilliz Cloud の ARRAY 演算子は、次の 2 つの使用シナリオをカバーしています。

- query および search のフィルタ式。

- `upsert` リクエストでの部分更新。

## 利用可能な ARRAY 演算子\{#available-array-operators}

次の表は、Zilliz Cloud で利用可能な ARRAY 演算子を示しています。

| **演算子** | **使用箇所** | **説明** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | フィルタ式 | ARRAY フィールドに特定の要素が存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | フィルタ式 | 指定したリスト内のすべての要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | フィルタ式 | 指定したリスト内のいずれかの要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | フィルタ式 | ARRAY フィールド内の要素数を返し、比較演算子と組み合わせてフィルタリングに使用できます。 |
| [ARRAY_APPEND](./array-filtering-operators#arrayappend) | `field_ops` を指定した `upsert` | ペイロード要素を既存の ARRAY フィールドに追加します。Zilliz Cloud v2.6.17 以降で利用可能です。 |
| [ARRAY_REMOVE](./array-filtering-operators#arrayremove) | `field_ops` を指定した `upsert` | リクエストペイロード内の値に一致する要素を、既存の ARRAY フィールドからすべて削除します。 |

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、特定の要素が配列フィールド内に存在するかどうかを確認します。これは、指定した要素が配列内に含まれている entity を見つけたい場合に便利です。

**例**

異なる年の記録された最低気温を含む配列フィールド `history_temperatures` があるとします。配列に値 `23` が含まれるすべての entity を見つけるには、次のフィルタ式を使用できます。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_temperatures` 配列に値 `23` が含まれるすべての entity が返されます。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定したリストのすべての要素が配列フィールド内に存在することを保証します。この演算子は、配列内に複数の値を含む entity をマッチさせたい場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれるすべての entity を見つけたい場合は、次を使用できます。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に指定した両方の値が含まれるすべての entity が返されます。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定したリストのいずれかの要素が配列フィールド内に存在するかどうかを確認します。これは、配列内に指定した値のうち少なくとも 1 つを含む entity をマッチさせたい場合に便利です。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかが含まれるすべての entity を見つけるには、次を使用できます。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に値 `23` または `24` の少なくとも 1 つが含まれるすべての entity が返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。受け取るパラメータは 1 つだけで、配列フィールドの識別子です。

**例**

`history_temperatures` 配列の要素数が 10 未満であるすべての entity を見つけるには:

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures` 配列の要素数が 10 未満であるすべての entity が返されます。

## ARRAY_APPEND\{#arrayappend}

`ARRAY_APPEND` 演算子は、`upsert` リクエスト中にペイロード要素を既存の ARRAY フィールドに追加します。これはフィルタ式ではありません。現在の配列値を最初に query せずに配列へ値を追加したい場合に使用します。

次の Python の例では、主キーが `1` の entity の `tags` ARRAY フィールドに `"premium"` を追加します。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

`field_ops` を通じてフィールドに `ARRAY_APPEND` を付与すると、そのフィールドで部分更新セマンティクスが有効になります。完全なワークフロー、サポートされる要素型、および制限については、[マージモードでの ARRAY フィールドの Upsert](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。

## ARRAY_REMOVE\{#arrayremove}

`ARRAY_REMOVE` 演算子は、`upsert` リクエスト中に、リクエストペイロード内の値に一致するすべての要素を既存の ARRAY フィールドから削除します。これはフィルタ式ではありません。現在の配列値を最初に query せずに、配列から一致する値を削除したい場合に使用します。

次の Python の例では、主キーが `1` の entity の `tags` ARRAY フィールドから `"trial"` を削除します。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

`field_ops` を通じてフィールドに `ARRAY_REMOVE` を付与すると、そのフィールドで部分更新セマンティクスが有効になります。完全なワークフロー、サポートされる要素型、および制限については、[マージモードでの ARRAY フィールドの Upsert](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。
