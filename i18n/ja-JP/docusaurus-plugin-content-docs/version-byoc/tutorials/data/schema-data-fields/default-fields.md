---
title: "デフォルト値 | BYOC"
slug: /default-fields
sidebar_key: default-fields
sidebar_label: "デフォルト値"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、スカラーフィールド（プライマリフィールドを除く）にデフォルト値を設定できます。フィールドにデフォルト値が構成されている場合、挿入時にデータが提供されていないと、Zilliz Cloud が自動的にこの値を適用します。| BYOC"
type: origin
token: SsGkwyGJDirNDwk170rcHbUjnVe
sidebar_position: 15
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - デフォルト値

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# デフォルト値

Zilliz Cloud では、スカラーフィールド（主キーフィールドを除く）にデフォルト値を設定できます。フィールドにデフォルト値が構成されている場合、挿入時にデータが提供されていないと、Zilliz Cloud が自動的にこの値を適用します。

デフォルト値は、既存のデフォルト値設定を維持することで、他のデータベースシステムから Zilliz Cloud へのデータ移行を簡素化します。また、挿入時点で値が不確実なフィールドにもデフォルト値を使用できます。

## 制限\{#limits}

- スカラーフィールドのみがデフォルト値をサポートします。主キーフィールドおよびベクトルフィールドにはデフォルト値を設定できません。

- `JSON` フィールドおよび `ARRAY` フィールドはデフォルト値をサポートしません。

- デフォルト値はコレクション作成時のみ構成でき、後から変更することはできません。

## デフォルト値の設定\{#set-default-values}

コレクションを作成する際、`add_field()` の `default_value` パラメータを使用して、フィールドのデフォルト値を定義します。

以下の例では、デフォルト値を持つ 2 つのスカラーフィールドを含むコレクションを作成します。`age` のデフォルト値は `18`、`status` のデフォルト値は `"active"` です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri='YOUR_CLUSTER_ENDPOINT')

# Define collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_schema=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
# highlight-start
schema.add_field(field_name="age", datatype=DataType.INT64, default_value=18)
schema.add_field(field_name="status", datatype=DataType.VARCHAR, default_value="active", max_length=10)
# highlight-end

# Set index params
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="L2")

# Create collection
client.create_collection(collection_name="my_collection", schema=schema, index_params=index_params)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## Insert entities\{#insert-entities}

データを挿入する際、デフォルト値が設定されているフィールドを省略するか、明示的に NULL に設定した場合、Zilliz Cloud は自動的に構成されたデフォルト値を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    # All fields provided explicitly
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"},
    # age and status omitted → both use default values (18 and "active")
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]},
    # status set to None → uses default value "active"
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": None},
    # age set to None → uses default value 18
    {"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": None, "status": "inactive"}
]

client.insert(collection_name="my_collection", data=data)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## デフォルト値を使用した検索とクエリ\{#search-and-query-with-default-values}

デフォルト値を含むエンティティは、ベクトル検索およびスカラーによるフィルタリング中に他のエンティティと同様に動作します。`search` 操作および `query` 操作の両方で、デフォルト値によるフィルタリングが可能です。

次の例では、`age` がデフォルト値 `18` に等しいエンティティを検索します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.4, 0.3, 0.5]],
    search_params={"params": {"nprobe": 16}},
    filter="age == 18",
    limit=10,
    output_fields=["id", "age", "status"]
)

print("Search results (age == 18):")
for hit in res[0]:
    print(f"  id: {hit['id']}, age: {hit['entity']['age']}, status: {hit['entity']['status']}")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

<details>

<summary>予想される出力</summary>

```plaintext
Output:
Search results (age == 18):
  id: 2, age: 18, status: active
  id: 4, age: 18, status: inactive
```

</details>

デフォルト値を直接照合してエンティティをクエリすることもできます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query entities where age equals the default value (18)
default_age_results = client.query(
    collection_name="my_collection",
    filter="age == 18",
    output_fields=["id", "age", "status"]
)

print("\nQuery results (age == 18):")
for r in default_age_results:
    print(f"  id: {r['id']}, age: {r['age']}, status: {r['status']}")

# Query entities where status equals the default value ("active")
default_status_results = client.query(
    collection_name="my_collection",
    filter='status == "active"',
    output_fields=["id", "age", "status"]
)

print("\nQuery results (status == 'active'):")
for r in default_status_results:
    print(f"  id: {r['id']}, age: {r['age']}, status: {r['status']}")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

<details>

<summary>予想される出力</summary>

```plaintext
Query results (age == 18):
  id: 2, age: 18, status: active
  id: 4, age: 18, status: inactive

Query results (status == 'active'):
  id: 2, age: 18, status: active
  id: 3, age: 25, status: active
```

</details>

## 適用ルール\{#applicable-rules}

フィールドに対して `nullable` と `default_value` の両方が構成されている場合、以下のルールにより、挿入時に Zilliz Cloud が NULL 入力または欠落したフィールド値をどのように処理するかが決定されます。

<table>
   <tr>
     <th><p>NULL 許容</p></th>
     <th><p>デフォルト値</p></th>
     <th><p>ユーザー入力</p></th>
     <th><p>結果</p></th>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>✅ (NULL 以外)</p></td>
     <td><p>NULL または省略</p></td>
     <td><p>デフォルト値が使用されます</p></td>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>NULL または省略</p></td>
     <td><p>NULL として保存されます</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅ (NULL 以外)</p></td>
     <td><p>NULL または省略</p></td>
     <td><p>デフォルト値が使用されます</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>NULL または省略</p></td>
     <td><p>エラーが発生します</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅ (NULL)</p></td>
     <td><p>NULL または省略</p></td>
     <td><p>エラーが発生します</p></td>
   </tr>
</table>

**主なポイント:**

- フィールドに NULL 以外のデフォルト値がある場合、`nullable` が有効かどうかに関わらず、その値が使用されます。

- `nullable=True` だがデフォルト値が設定されていない場合、フィールドには NULL が保存されます。

- `nullable=False` かつデフォルト値が設定されていない場合、挿入はエラーで失敗します。

- NULL 許容でないフィールドに NULL デフォルト値を設定することは無効であり、エラーの原因となります。

