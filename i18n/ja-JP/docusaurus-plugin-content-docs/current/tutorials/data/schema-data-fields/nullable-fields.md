---
title: "NULL 許容フィールド | Cloud"
slug: /nullable-fields
sidebar_key: nullable-fields
sidebar_label: "NULL 許容フィールド"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は NULL 許容フィールドをサポートしており、フィールド値を欠落させるか、明示的に NULL に設定することができます。NULL 許容性はスキーマレベルで定義され、データの取り込み、インデックス作成、検索、およびクエリ操作全体で一貫して適用されます。| Cloud"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 14
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コレクション
  - スキーマ
  - NULL 許容

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NULL 許容フィールド

Zilliz Cloud は NULL 許容フィールドをサポートしており、フィールド値を欠落させるか、明示的に NULL に設定することができます。NULL 許容性はスキーマレベルで定義され、データの取り込み、インデックス作成、検索、およびクエリ操作全体で一貫して適用されます。

以下のケースで NULL 許容フィールドを使用します：

- 欠損値を許可する外部システムからデータを取り込む場合

- メタデータの一部がオプションであるか、データセットの一部でのみ利用可能な場合

- ベクトル埋め込みが非同期に生成され、後で挿入される場合

## 制限\{#limits}

- NULL 値を許可するベクトルフィールドは、`IS NULL` または `IS NOT NULL` フィルター式をサポートしません。ベクトルフィールドの値が NULL かどうかに基づいてエンティティを明示的にフィルタリングすることはできません。

- 構造体の配列フィールドは NULL 値をサポートしません。構造体の配列フィールド、またはその内部にネストされた任意のフィールドを NULL 許容としてマークすることはできません。

- `nullable` 属性はフィールド作成時に定義され、後から変更することはできません。既存のフィールドに対して NULL 許容性を有効化または無効化することはできません。

- NULL 許容としてマークされたフィールドはパーティションキーとして使用できません。パーティションキーフィールドは常に有効な非 NULL 値を含む必要があります。

## NULL 許容フィールドとは何か？\{#what-is-a-nullable-field}

Zilliz Cloud では、フィールドが NULL 値を格納できるかどうかは、`nullable` という名前のスキーマレベルのフィールド属性によって制御されます。

フィールドが `nullable=True` で定義されている場合、Zilliz Cloud はデータ取り込み中にそのフィールド値の欠落を許可します。実際には、Zilliz Cloud は以下の 2 つの入力を同等として扱い、フィールド値を NULL として格納します：

- 入力エンティティからフィールドが省略されている場合

- フィールドが明示的に NULL に設定されている場合（例：Python での `None`）

フィールドが NULL 許容として定義されていない場合（デフォルトの動作）、すべてのエンティティはそのフィールドに対して有効な値を提供する必要があります。フィールドを省略するか、明示的に NULL 値を割り当てると、挿入またはインポート操作は失敗します。

NULL 許容属性は、コレクションスキーマ内の**スカラーフィールドとベクトルフィールド**の両方でサポートされています。ただし、構造体の配列フィールドは NULL 許容属性をサポートしません。

<Admonition type="info" icon="📘" title="Notes">

<p>NULL 許容性はフィールド値が欠落してもよいかどうかを決定しますが、フィールドが欠落した場合に使用される値を定義するものではありません。</p>
<ul>
<li><p>NULL 許容フィールドがデフォルト値なしで構成されている場合、フィールドを省略すると格納される値は NULL になります。</p></li>
<li><p>デフォルト値が構成されている場合、Zilliz Cloud は代わりにデフォルト値を格納することがあります。詳細については、<a href="./default-fields">デフォルト値</a> を参照してください。</p></li>
</ul>

</Admonition>

## コレクションスキーマで NULL 許容フィールドを定義する\{#define-a-nullable-field-in-the-collection-schema}

NULL 許容フィールドを使用するには、コレクションスキーマを定義する際に `nullable` 属性を有効にする必要があります。

この例では、コレクションスキーマが `nullable=True` の `embedding` という名前のベクトルフィールドを定義しています。これにより、コレクション内のエンティティはデータ取り込み中にベクトル値を省略するか、明示的に NULL に設定することができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Define schema fields
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True) # Primary field
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
    # highlight-next-line
    nullable=True, # Enable the nullable attribute; defaults to False
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
)
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

このスキーマでは、以下のようになります。

- `embedding` フィールドは明示的に NULL 許容としてマークされています。

- エンティティは挿入時に `embedding` フィールドを省略するか、NULL 値を割り当てることができます。

- NULL 値を許容するかどうかの決定は、コレクション作成時に固定されます。

わかりやすくするため、以下の例では NULL 許容のベクトルフィールド（`embedding`）に焦点を当てています。スカラーフィールドを NULL 許容として定義することは任意であり、このガイドの残りの部分に従うために必須ではありません。

<details>

<summary>**任意：NULL 許容のスカラーフィールドを定義する**</summary>

スカラーフィールドも同様に `nullable` 属性を使用して NULL 許容として定義でき、取り込み時にも同じルールに従います。例えば：

```python
schema.add_field(
    field_name="age",
    datatype=DataType.INT64,
    # highlight-next-line
    nullable=True,
)
```

</details>

## 欠落値または NULL 値がある場合の挿入動作\{#insert-behavior-with-missing-or-null-values}

コレクションスキーマでフィールドが nullable として定義されると、Zilliz Cloud はデータ取り込み中にそのフィールド値を欠落させるか、明示的に NULL に設定することを許可します。

以下の例では、[ステップ 1](./nullable-fields#define-a-nullable-field-in-the-collection-schema) で作成したコレクションに 3 つのエンティティを挿入し、これらの異なるケースを示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4],
    },
    {
        "id": 2,
        "embedding": None,   # Explicitly set to NULL
    },
    {
        "id": 3,             # Field omitted → stored as NULL
    },
]

client.insert(
    collection_name="my_collection",
    data=data,
)
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

この例では：

- エンティティ **id = 1** は有効なベクトル値を提供します。

- エンティティ **id = 2** は埋め込みフィールドに明示的に NULL 値を割り当てます。

- エンティティ **id = 3** は埋め込みフィールドを完全に省略します。Zilliz Cloud はこれを NULL として保存します。

## インデックスの動作（nullable フィールド）\{#index-behavior-on-nullable-fields}

データを挿入した後、通常どおり nullable フィールドにインデックスを構築できます。主な違いは、インデックス構築中に Zilliz Cloud が NULL 値をどのように処理するかです：

- 非 NULL 値を持つエンティティのみがインデックスに追加されます。

- NULL 値を持つエンティティはスキップされ、インデックス構築に参加しません。

nullable ベクトルフィールドの場合、これは有効なベクトルを持つエンティティのみがベクトル類似性によって検索可能になることを意味します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

# Create index
client.create_index(
    collection_name="my_collection",
    index_params=index_params,
)

# Load collection for future search operations
client.load_collection(collection_name="my_collection")
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

この時点で：

- 有効な `embedding` 値を持つエンティティはインデックス化され、検索可能な状態になります。

- `embedding` が NULL のエンティティはコレクションに残りますが、ベクトルインデックスには含まれません。

## nullable フィールドにおける検索動作\{#search-behavior-with-nullable-fields}

nullable フィールドに対して検索操作を実行すると、Zilliz Cloud は検索に使用されるフィールドの値が NULL でないエンティティのみを評価します。ベクトルフィールドが NULL のエンティティは自動的にスキップされます。

この例のように `embedding` などの nullable ベクトルフィールドの場合：

- 有効なベクトル値を持つエンティティのみが評価され、ランク付けされます。

- NULL ベクトルを持つエンティティによってエラーが発生することはありません。

- 有効なベクトルの数が要求された topK（`limit`）より少ない場合、Zilliz Cloud は `limit` よりも少ない結果を返す可能性があります。

次の例では、nullable ベクトルフィールド `embedding` に対してベクトル検索を実行します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="embedding",
    limit=3,
    output_fields=["embedding"],
)

print(res)
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

この検索では：

- `embedding` の値が NULL でないエンティティのみが候補として考慮されます。

- `embedding` の値が NULL であるエンティティは評価から除外されます。

- 返される結果の数は、コレクション内に存在する有効なベクトルの数に依存します。

## クエリとフィルタリングへの影響\{#query-and-filtering-implications}

前述の例はベクトルフィールドに焦点を当てています。このセクションでは、**スカラー フィルター式**における NULL 値の動作について説明します。

スカラー フィールドは `nullable=True` として定義でき、ベクトルフィールドと同様の取り込みルールに従います。ただし、**NULL のスカラー値はフィルター式において常に false と評価されます**。

たとえば、nullable なスカラー フィールド `age` がある場合、次のフィルターは `age` が 18 より大きいエンティティを選択します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > 18"
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

`age` が NULL であるエンティティは、NULL 値がフィルター条件を満たさないため、結果から除外されます。

同様に、等価チェックは NULL 値と一致しません。例えば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "status == \"active\""
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

`status` が NULL であるエンティティは結果から除外されます。

## Applicable rules\{#applicable-rules}

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

- NULL 許容ではないフィールドに NULL のデフォルト値を設定することは無効であり、エラーの原因となります。

