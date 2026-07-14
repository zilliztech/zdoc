---
title: "ARRAY 演算子 | BYOC"
slug: /array-filtering-operators
sidebar_label: "Array"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ARRAY フィールドのフィルタリングおよび ARRAY フィールド値の部分更新のための ARRAY 演算子を提供します。 | BYOC"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ARRAY 演算子

Zilliz Cloud は、ARRAY フィールドのフィルタリングおよび ARRAY フィールド値の部分更新のための ARRAY 演算子を提供します。

注: 配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーンな文字列として扱われます。そのため、ARRAY フィールドを扱う際は、過度に深いネストを避け、最適なパフォーマンスのためにできるだけフラットなデータ構造にすることを推奨します。

Zilliz Cloud の ARRAY 演算子は、次の 2 つのユースケースをカバーしています。

- query および search のフィルター式

- `upsert` リクエストでの部分更新

## 利用可能な ARRAY 演算子\{#available-array-operators}

次の表は、Zilliz Cloud で使用可能な ARRAY 演算子を示しています。

| **演算子** | **使用箇所** | **説明** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | フィルター式 | ARRAY フィールドに特定の要素が存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | フィルター式 | 指定したリスト内のすべての要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | フィルター式 | 指定したリスト内のいずれかの要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | フィルター式 | ARRAY フィールド内の要素数を返し、フィルタリングのために比較演算子と組み合わせて使用できます。 |
| [ARRAY_APPEND](./array-filtering-operators#arrayappend) | `field_ops` を使用した `upsert` | ペイロード要素を既存の ARRAY フィールドに追加します。Zilliz Cloud v2.6.17 以降で利用可能です。 |
| [ARRAY_REMOVE](./array-filtering-operators#arrayremove) | `field_ops` を使用した `upsert` | リクエストペイロード内の値に一致するすべての要素を既存の ARRAY フィールドから削除します。 |

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、特定の要素が配列フィールド内に存在するかどうかを確認します。配列内に特定の要素が含まれている entity を見つけたい場合に便利です。

**例**

異なる年の記録された最低気温を含む配列フィールド `history_temperatures` があるとします。配列に値 `23` を含むすべての entity を見つけるには、次のフィルター式を使用できます。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_temperatures` 配列に値 `23` を含むすべての entity が返されます。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定したリストのすべての要素が配列フィールド内に存在することを保証します。この演算子は、配列内に複数の値を含む entity を一致させたい場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方を含むすべての entity を見つけたい場合は、次を使用できます。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に指定した両方の値を含むすべての entity が返されます。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定したリストのいずれかの要素が配列フィールド内に存在するかどうかを確認します。これは、配列内に指定した値のうち少なくとも 1 つを含む entity を一致させたい場合に便利です。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかを含むすべての entity を見つけるには、次を使用できます。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に `23` または `24` の少なくとも 1 つを含むすべての entity が返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。受け取るパラメータは 1 つだけで、配列フィールドの識別子です。

**例**

`history_temperatures` 配列の要素数が 10 未満のすべての entity を見つけるには:

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures` 配列の要素数が 10 未満のすべての entity が返されます。

## ARRAY_APPEND\{#arrayappend}

`ARRAY_APPEND` 演算子は、`upsert` リクエスト中にペイロード要素を既存の ARRAY フィールドに追加します。これはフィルター式ではありません。現在の配列値を先に query することなく、配列に値を追加したい場合に使用します。

次の Python の例では、主キーが `1` の entity の `tags` ARRAY フィールドに `"premium"` を追加します。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

`field_ops` を通じてフィールドに `ARRAY_APPEND` を関連付けることで、そのフィールドに対する部分更新セマンティクスが有効になります。完全なワークフロー、サポートされる要素型、および制限については、[merge モードでの ARRAY フィールドの Upsert](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。

## ARRAY_REMOVE\{#arrayremove}

`ARRAY_REMOVE` 演算子は、`upsert` リクエスト中に、リクエストペイロード内の値に一致するすべての要素を既存の ARRAY フィールドから削除します。これはフィルター式ではありません。現在の配列値を先に query することなく、配列から一致する値を削除したい場合に使用します。

次の Python の例では、主キーが `1` の entity の `tags` ARRAY フィールドから `"trial"` を削除します。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

`field_ops` を通じてフィールドに `ARRAY_REMOVE` を関連付けることで、そのフィールドに対する部分更新セマンティクスが有効になります。完全なワークフロー、サポートされる要素型、および制限については、[merge モードでの ARRAY フィールドの Upsert](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。
