---
title: "ARRAY 演算子 | Cloud"
slug: /array-filtering-operators
sidebar_label: "Array"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ARRAY フィールドのフィルタリングや値の部分更新に使用できる ARRAY 演算子を提供します。 | Cloud"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ARRAY 演算子

Zilliz Cloud は、ARRAY フィールドのフィルタリングや値の部分更新に使用できる ARRAY 演算子を提供します。

注: 配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーン文字列として扱われます。そのため、ARRAY フィールドを扱う際は、過度に深いネストを避け、パフォーマンスを最大化するためにデータ構造を可能な限りフラットに保つことを推奨します。

Zilliz Cloud の ARRAY 演算子は、主に以下の 2 つの用途で使用されます。

- クエリおよび検索におけるフィルター式。

- `upsert` リクエストにおける部分更新。

## 利用可能な ARRAY 演算子\{#available-array-operators}

次の表に、Zilliz Cloud で利用可能な ARRAY 演算子の一覧を示します。

| **演算子** | **用途** | **説明** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | フィルター式 | ARRAY フィールド内に特定の要素が存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | フィルター式 | 指定したリストのすべての要素が ARRAY フィールド内に存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | フィルター式 | 指定したリストのいずれかの要素が ARRAY フィールド内に存在するかどうかを確認します。 |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | フィルター式 | ARRAY フィールドの要素数を返します。比較演算子と組み合わせてフィルタリング条件として使用できます。 |
| [ARRAY_APPEND](./array-filtering-operators#arrayappend) | `upsert` と `field_ops` | 既存の ARRAY フィールドにペイロードの要素を追加します。 |
| [ARRAY_REMOVE](./array-filtering-operators#arrayremove) | `upsert` と `field_ops` | リクエストペイロード内の値と一致するすべての要素を、既存の ARRAY フィールドから削除します。 |

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、配列フィールド内に特定の要素が存在するかどうかを確認します。配列内に指定した要素を含むエンティティを検索する場合に便利です。

**例**

各年の最低気温を記録した配列フィールド `history_temperatures` があるとします。この配列に値 `23` が含まれるすべてのエンティティを検索するには、次のフィルター式を使用します。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_temperatures` 配列に値 `23` が含まれるすべてのエンティティが返されます。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定したリストのすべての要素が配列フィールド内に存在するかどうかを確認します。配列内に複数の値をすべて含むエンティティを検索する場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれるすべてのエンティティを検索するには、次を使用します。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に指定した両方の値が含まれるすべてのエンティティが返されます。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定したリストのいずれかの要素が配列フィールド内に存在するかどうかを確認します。配列内に指定した値の少なくとも 1 つを含むエンティティを検索する場合に便利です。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかが含まれるすべてのエンティティを検索するには、次を使用します。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に値 `23` または `24` の少なくとも 1 つが含まれるすべてのエンティティが返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。引数として配列フィールド識別子を 1 つだけ受け取ります。

**例**

`history_temperatures` 配列の要素数が 10 未満であるすべてのエンティティを検索するには、次を使用します。

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures` 配列の要素数が 10 未満であるすべてのエンティティが返されます。

## ARRAY_APPEND\{#arrayappend}

`ARRAY_APPEND` 演算子は、`upsert` リクエスト時に既存の ARRAY フィールドへペイロードの要素を追加します。これはフィルター式ではありません。現在の配列値を事前に取得することなく、配列に値を追加したい場合に使用します。

次の例では、主キーが `1` のエンティティにある `tags` ARRAY フィールドへ `"premium"` を追加しています。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

`field_ops` を介してフィールドに `ARRAY_APPEND` を適用すると、そのフィールドで部分更新セマンティクスが有効になります。ワークフロー全体、サポートされる要素型、制限事項については、「[Upsert ARRAY fields in merge mode](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode)」を参照してください。

## ARRAY_REMOVE\{#arrayremove}

`ARRAY_REMOVE` 演算子は、`upsert` リクエスト時に、リクエストペイロード内の値と一致するすべての要素を既存の ARRAY フィールドから削除します。これはフィルター式ではありません。現在の配列値を事前に取得することなく、配列から一致する値を削除したい場合に使用します。

次の例では、主キーが `1` のエンティティにある `tags` ARRAY フィールドから `"trial"` を削除しています。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

`field_ops` を介してフィールドに `ARRAY_REMOVE` を適用すると、そのフィールドで部分更新セマンティクスが有効になります。ワークフロー全体、サポートされる要素型、制限事項については、「[Upsert ARRAY fields in merge mode](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode)」を参照してください。
