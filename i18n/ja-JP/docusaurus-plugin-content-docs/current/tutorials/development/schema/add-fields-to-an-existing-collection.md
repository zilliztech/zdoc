---
title: "コレクションスキーマの変更 | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_label: "スキーマの変更（マネージドコレクション）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションが開発から本番へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジックのために `sourceuri` や `reviewstatus` のようなスカラーフィールドを追加したり、アプリケーションが生成した埋め込み用に新しいベクトルフィールドを追加したり、既存のテキストに対する語彙検索のために BM25 関数とその生成スパースベクトルフィールドを追加したり、使用しなくなったフィールドや関数を削除したりすることがあります。Alter コレクション スキーマ を使用すると、コレクションを再作成する代わりに、サポートされているフィールドと関数の変更をその場で行えます。 | Cloud"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コレクションスキーマの変更

コレクションが開発から本番へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` のようなスカラーフィールドを追加したり、アプリケーションが生成した埋め込み用に新しいベクトルフィールドを追加したり、既存のテキストに対する語彙検索のために BM25 関数とその生成スパースベクトルフィールドを追加したり、使用しなくなったフィールドや関数を削除したりすることがあります。Alter コレクション スキーマ を使用すると、コレクションを再作成する代わりに、サポートされているフィールドと関数の変更をその場で行えます。

<Admonition type="info" title="Notes">

- このガイドでは、マネージドコレクションにおけるユーザー定義フィールドと、その生成ベクトルフィールドを伴う関数のスキーマ変更について説明します。`VARCHAR` フィールドの `max_length` や `ARRAY` フィールドの `max_capacity` の変更など、フィールドプロパティの変更については、[コレクション Field の変更](./alter-collection-field) を参照してください。dynamic field の動作については、[Dynamic Field](./enable-dynamic-field) および [コレクションの変更](./modify-collections) を参照してください。

- このページでは、マネージドコレクションにフィールドを追加する方法について説明します。外部コレクションにフィールドを追加するには、[External コレクション スキーマの変更](./alter-external-collection-schema) を参照してください。

</Admonition>

## 制限事項\{#limits}

**ユーザー定義フィールドの追加**

- 追加するユーザー定義フィールドは nullable である必要があります。`add_collection_field()` を呼び出す際は `nullable=True` を設定してください。既存のエンティティでは、`default_value` を持つスカラーフィールドを追加しない限り、追加されたフィールドは `NULL` になります。

- ユーザー定義スカラーフィールドの追加は Milvus 2.6.x 以降でサポートされています。ユーザー定義ベクトルフィールドの追加は Milvus 2.6.18 以降でサポートされています。

- フィールド名は、コレクション内のフィールドの中で一意である必要があります。

**関数とその生成ベクトルフィールドの追加**

- 1 回のスキーマ更新で追加できるのは、1 つの関数と 1 つの生成ベクトルフィールドのみです。

- サポートされる関数によって、生成されるベクトルフィールドの型が決まります。`BM25` は `SPARSE_FLOAT_VECTOR` フィールドを生成し、`MINHASH` は `BINARY_VECTOR` フィールドを生成します。

- 生成ベクトルフィールドは新しいフィールドである必要があります。コレクションスキーマにすでに存在するフィールドを指定することはできません。

- 生成ベクトルフィールドは nullable にできません。

- 関数が使用する入力フィールドは、コレクションにすでに存在している必要があります。この既存コレクション向けのワークフローでは、BM25 と MinHash の入力は `VARCHAR` である必要があります。`TEXT` を使用する BM25 関数は、コレクションを作成するときに定義してください。

**ユーザー定義フィールドの削除**

- プライマリキーフィールド、パーティションキーフィールド、クラスタリングキーフィールド、またはコレクション内の最後のベクトルフィールドは削除できません。

- `ARRAY<STRUCT>` フィールド全体は削除できますが、`ARRAY<STRUCT>` フィールド内の個々のサブフィールドは削除できません。

- 関数の入力フィールドとして使用されているフィールドや、関数の出力として生成されるフィールドは直接削除できません。関数の出力フィールドを削除するには、それを生成する関数を削除してください。

**関数とその生成ベクトルフィールドの削除**

- このスキーマ変更ワークフローでは、関数を削除すると、その関数、生成ベクトルフィールド、および関連するインデックスが削除されます。関数の入力フィールドはコレクションスキーマに残ります。

- 生成ベクトルフィールドを削除するとコレクションにベクトルフィールドが 1 つも残らなくなる場合、関数の削除は拒否されます。

<Admonition type="info" title="Notes">

サポートされている追加および削除の操作以外のスキーマ変更については、コレクションを再作成または移行してください。

</Admonition>

## 既存のコレクションへのフィールドと関数の追加\{#add-fields-and-functions-to-an-existing-collection}

ユーザー定義フィールドを追加するのか、ベクトルフィールドを生成する関数を追加するのかに応じて、ワークフローを選択してください。

- フィルタリング、クエリ出力、またはアプリケーションロジック用の新しいメタデータが必要な場合は、[Add user-defined スカラー fields](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields) を使用します。

- アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、[Add user-defined ベクトル fields](./add-fields-to-an-existing-collection#add-user-defined-vector-fields) を使用します。

- テキストからの BM25 スパースベクトルや MinHash シグネチャなど、既存のフィールドから Zilliz Cloud がベクトル値を生成する必要がある場合は、[Add a Function and its generated ベクトル field](./add-fields-to-an-existing-collection#add-a-function-and-its-generated-vector-field) を使用します。

これらのケースでは、フィールドの総数が Zilliz Cloud のフィールド数制限を超えることはできません。詳細については、[Zilliz Cloud の制限事項](./limits#fields) を参照してください。

### ユーザー定義スカラーフィールドの追加\{#add-user-defined-scalar-fields}

`add_collection_field()` を使用して、既存のコレクションにユーザー定義スカラーフィールドを追加します。

これは、dynamic field に任意のキーを保存する場合とは異なります。スキーマ更新が反映されると、新しいスカラーフィールドはコレクションスキーマの通常の一部になります。新しいフィールドに値を挿入または upsert したり、サポートされている場合はインデックスを作成したり、クエリや検索のフィルターで使用したり、クエリや検索の出力で返したりできます。

既存のエンティティは新しいフィールドが存在する前に挿入されているため、追加するすべてのユーザー定義スカラーフィールドは nullable である必要があります。

- `nullable=True` を指定し、`default_value` を指定せずにスカラーフィールドを追加した場合、既存のエンティティは新しいフィールドに対して `NULL` を返します。

- `nullable=True` と `default_value` を指定してスカラーフィールドを追加した場合、既存のエンティティは `NULL` ではなくデフォルト値を返します。

スカラーのフィルター式は `NULL` のスカラー値には一致しません。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

**例: nullable なスカラーフィールドの追加**

次の例では、`product_catalog` という名前の既存のコレクションに nullable な `source` フィールドを追加します。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="source",
    data_type=DataType.VARCHAR,
    max_length=128,
    nullable=True,
)
# highlight-end
```

フィールドを追加した後、コレクションにすでに存在していたエンティティは `source` に対して `NULL` を返します。新しいエンティティは、insert または upsert の際に `source` を設定できます。

**例: デフォルト値を持つスカラーフィールドの追加**

既存のエンティティが `NULL` ではなく具体的な値を返すようにする場合は、フィールドを追加するときに `default_value` を指定します。次の例では `review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="review_status",
    data_type=DataType.VARCHAR,
    max_length=32,
    nullable=True,
    default_value="unreviewed",
)
# highlight-end
```

フィールドを追加した後、コレクションにすでに存在していたエンティティは `review_status` に対して `"unreviewed"` を返します。新しいエンティティは、別の値を設定するか、値を指定しない場合はデフォルト値を使用できます。

### StructArray フィールドの追加\{#add-structarray-fields}

`add_collection_struct_field()` を使用して、構造体の配列を受け入れる StructArray フィールドを追加します。StructArray フィールドを追加するには、次のようにします。

1. サポートされているデータ型の必要なサブフィールドを含む StructSchema を作成します。該当するデータ型については、[データ型のサポート](./use-array-of-structs) を参照してください。

1. 上で作成した StructSchema を参照し、`add_collection_struct_field()` でフィールドの最大容量を設定します。

1. リクエストで `nullable` を `True` に設定します。

**例: nullable な StructArray フィールドの追加**

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Create a struct schema
struct_schema = client.create_struct_field_schema()

# add a scalar field to the struct
struct_schema.add_field("text", DataType.VARCHAR, max_length=65535)
struct_schema.add_field("chapter", DataType.VARCHAR, max_length=512)

# add a vector field to the struct with mmap enabled
struct_schema.add_field("text_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)
struct_schema.add_field("chapter_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)

# highlight-start
client.add_collection_struct_field(
    collection_name="books",
    field_name="chunks",
    struct_schema=struct_schema,
    max_capacity=1024,
    nullable=True
)
# highlight-end
```

StructArray フィールドを追加した後、コレクションにすでに存在するエンティティは、`chunks` のすべてのサブフィールドに対して null を返します。新しいエンティティを挿入するときは、すべてのサブフィールドが null であるか、有効な値を持っていることを確認してください。一部のサブフィールドを null に設定し、他のサブフィールドに有効な値を設定したエンティティを挿入すると、エラーになります。

### ユーザー定義ベクトルフィールドの追加\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

追加するすべてのユーザー定義ベクトルフィールドは nullable である必要があります。既存のエンティティは、upsert またはバックフィルのワークフローでベクトル値を書き込むまで、新しいベクトルフィールドに対して `NULL` を持ちます。新しいエンティティは、insert の際にベクトルフィールドを含めることができます。ベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

**例: nullable なベクトルフィールドの追加**

次の例では、`embedding_v2` という名前の nullable な dense ベクトルフィールドを既存のコレクションに追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定します。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
)
# highlight-end
```

フィールドを追加した後、新しいベクトルフィールドを検索する前に、そのフィールドにインデックスを作成します。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_catalog",
    index_params=index_params,
)
```

既存のエンティティは `embedding_v2` に対して `NULL` を持ち、このフィールドで検索するとスキップされます。`embedding_v2` を通じて既存のエンティティを検索可能にするには、upsert ワークフローで非 NULL のベクトル値を書き込んでください。新しいエンティティは、insert の際に `embedding_v2` を含めることができます。

### 関数とその生成ベクトルフィールドの追加\{#add-a-function-and-its-generated-vector-field}

この Milvus 3.0 のスキーマ変更ワークフローは、現在 Zilliz Cloud オンデマンドクラスター向けに文書化されています。このページは、最初にサポートされる Cloud パッチや Serving クラスター の可用性を確定するものではありません。

このワークフローを使用すると、既存のコレクションにすでに保存されているデータから新しいベクトルフィールドを生成できます。たとえば、BM25 関数は既存の `VARCHAR` フィールドを読み取り、語彙検索用の `SPARSE_FLOAT_VECTOR` フィールドを生成し、MinHash 関数は近似重複の検出用に `BINARY_VECTOR` フィールドを生成します。このワークフローは、関数の入力フィールドを追加または置き換えるものではありません。

この操作では、関数定義、新しいベクトル出力フィールド、およびバインドされたインデックス定義が追加されます。

- 既存の入力フィールドから読み取る関数定義（`text_bm25` など）。

- 関数の出力を格納する新しいベクトル出力フィールド（`text_sparse` など）と、そのフィールドにバインドされたインデックス定義。

サポートされる関数によって、生成されるベクトルフィールドの型が決まります。

| **関数** | **生成されるベクトルフィールドの型** | **一般的な入力フィールド** |
| --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | analyzer が有効な `VARCHAR` フィールド |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` フィールド |

各関数の動作の詳細については、[BM25 関数](./bm25-function) および [MinHash 関数](./minhash-function) を参照してください。

生成ベクトルフィールドはコレクションにすでに存在していてはならず、nullable にできません。関数の入力フィールドはすでに存在している必要があります。この既存コレクション向けのワークフローでは、`VARCHAR` の入力を使用してください。`TEXT` 入力を使用する BM25 関数は、コレクションを作成するときに定義する必要があります。そうでない場合は、その関数をスキーマに含めてコレクションを再作成または移行してください。

**例: BM25 関数とその生成スパースベクトルフィールドの追加**

次の例では、`text_bm25` という名前の BM25 関数と、その生成スパースベクトルフィールドである `text_sparse` を既存のコレクションに追加します。コレクションには、analyzer が有効な `text` という名前の `VARCHAR` フィールドがすでに存在している必要があります。

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sparse_field = client.create_field_schema(
    name="text_sparse",
    data_type=DataType.SPARSE_FLOAT_VECTOR,
    desc="BM25-generated sparse vector field",
)

bm25_function = Function(
    name="text_bm25",
    input_field_names=["text"],
    output_field_names=["text_sparse"],
    function_type=FunctionType.BM25,
)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="text_sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)

# highlight-start
client.add_function_field(
    collection_name="product_catalog",
    field_schema=sparse_field,
    func=bm25_function,
    index_params=index_params,
)
# highlight-end
```

`index_params` オブジェクトには、新しい関数出力フィールドに対するインデックス定義を正確に 1 つ含める必要があります。関数、その生成ベクトルフィールド、およびバインドされたインデックス定義は、同じスキーマ変更で送信されます。`add_function_field()` の後に `create_index()` を別途呼び出さないでください。

概念上、この操作では次の関数、生成出力フィールド、およびバインドされたインデックス定義が追加されます。

```plaintext
New Function:
  name: "text_bm25"
  type: BM25
  input_field_names: ["text"]
  output_field_names: ["text_sparse"]

New generated output field:
  name: "text_sparse"
  data_type: SPARSE_FLOAT_VECTOR
  nullable: false

Bound index:
  field_name: "text_sparse"
  index_type: SPARSE_INVERTED_INDEX
  metric_type: BM25
```

リクエストが成功すると、`describe_collection()` は新しい `text_bm25` 関数とその生成ベクトルフィールドである `text_sparse` の両方をコレクションスキーマに返します。BM25 検索の完全なワークフローについては、[フルテキスト検索](./full-text-search) を参照してください。

MinHash 関数とその生成バイナリベクトルフィールドは、近似重複の検出をサポートします。MinHash 関数は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力フィールドに書き込みます。設定の詳細については、[MinHash 関数](./minhash-function) を参照してください。

## 既存のコレクションからのフィールドと関数の削除\{#drop-fields-and-functions-from-an-existing-collection}

ユーザー定義フィールドがコレクションモデルの一部でなくなった場合は、それらを直接削除できます。関数とその生成ベクトルフィールドを削除するには、関数を削除します。生成フィールドとそのインデックスは、同じスキーマ変更で削除されます。

### ユーザー定義フィールドの削除\{#drop-user-defined-fields}

コレクションモデルの一部でなくなったユーザー定義スカラーフィールドまたはベクトルフィールドを削除するには、`drop_collection_field()` を使用します。

フィールドを削除すると、まずコレクションスキーマとフィールドの可視性が変更されます。

- `drop_collection_field()` が成功すると、コレクションスキーマが更新されます。`describe_collection()` は削除されたフィールドを返さなくなり、クエリや検索は `output_fields` でそのフィールドを返したり、式でそのフィールドを使用したりできなくなります。

- 削除されたフィールドに作成されたインデックスは、スキーマ更新の一部としてクリーンアップされます。

ストレージのクリーンアップはスキーマのクリーンアップとは別に処理されます。詳細については、[フィールドを削除した後、ストレージ容量はいつ回収されますか？](./add-fields-to-an-existing-collection) を参照してください。

**例: ユーザー定義スカラーフィールドの削除**

次の例では、`experiment_tag` が `product_catalog` のユーザー定義スカラーフィールドであると仮定し、それをコレクションから削除します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="product_catalog",
    field_name="experiment_tag",
)
# highlight-end
```

フィールドを削除した後、`describe_collection()` を呼び出して、そのフィールドがスキーマの一部でなくなったことを確認できます。

**例: StructArray フィールドの削除**

次の例では、`chunks` フィールドが `my_collection` の StructArray フィールドであると仮定し、それをコレクションから削除します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="my_collection",
    field_name="chunks",
)
# highlight-end
```

**例: ユーザー定義ベクトルフィールドの削除**

同じ `drop_collection_field()` メソッドでベクトルフィールドを削除できますが、削除後もコレクションに少なくとも 1 つのベクトルフィールドが含まれている必要があります。これは、一時的に複数のベクトル表現を持ち、後でそのうちの 1 つに標準化するコレクションに役立ちます。

次の例では、`image_vector` が `hybrid_catalog` のユーザー定義ベクトルフィールドであり、コレクションに `text_vector` など別のベクトルフィールドがまだ残っていると仮定しています。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="hybrid_catalog",
    field_name="image_vector",
)
# highlight-end
```

`image_vector` がコレクション内の最後のベクトルフィールドである場合、削除操作は拒否されます。

### 関数とその生成ベクトルフィールドの削除\{#drop-a-function-and-its-generated-vector-field}

BM25 関数とその生成スパースベクトルフィールドなど、関数やその生成ベクトルフィールドが不要になった場合は、この操作を使用します。

関数名を指定して `drop_function_field()` を呼び出します。この操作では、関数の入力フィールドを保持したまま、関数、その生成ベクトルフィールド、および関連するインデックスがまとめて削除されます。

**例: BM25 関数とその生成スパースベクトルフィールドの削除**

次の例では、`text_bm25` が `product_catalog` の BM25 関数であり、`text_sparse` という名前のスパースベクトル出力フィールドを生成すると仮定しています。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_function_field(
    collection_name="product_catalog",
    function_name="text_bm25",
)
# highlight-end
```

操作が成功すると、`describe_collection()` は削除された関数とその生成ベクトルフィールドを返さなくなります。関数の入力フィールドはスキーマに残ります。

関数の出力フィールドを削除するとコレクションにベクトルフィールドが 1 つも残らなくなる場合、操作は拒否されます。

## FAQ\{#faq}

### フィールドまたは関数を追加するには、どのメソッドを使用すればよいですか？\{#which-method-should-i-use-to-add-a-field-or-function}

フィルタリング、クエリ出力、またはアプリケーションロジック用のスカラー値をアプリケーションが提供する場合は、`add_collection_field()` を使用してユーザー定義スカラーフィールドを追加します。

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

既存のフィールドからベクトル値を生成する必要がある場合は、`add_function_field()` を使用します。これは、関数、その生成ベクトルフィールド、およびバインドされたインデックス定義を同じスキーマ変更で追加します。このガイドでは、語彙検索向けの BM25 の手順を示します。MinHash 関数は、近似重複の検出用のバイナリベクトルフィールドを生成します。

### 追加したユーザー定義フィールドを nullable にする必要があるのはなぜですか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しいフィールドが存在する前に挿入されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、またはスカラーフィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud は欠落した値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加するユーザー定義スカラーフィールドとユーザー定義ベクトルフィールドに適用されます。nullable にできない関数の生成ベクトルフィールドには適用されません。

### ユーザー定義フィールドを追加した後、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義スカラーフィールドの場合、`default_value` を設定しない限り、既存のエンティティは `NULL` を返します。`default_value` を設定した場合、既存のエンティティはそのデフォルト値を返します。

ユーザー定義ベクトルフィールドの場合、既存のエンティティは新しいベクトルフィールドに対して `NULL` を持ちます。追加したフィールドでのベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。新しいベクトルフィールドを通じて既存のエンティティを検索可能にするには、upsert またはバックフィルのワークフローで非 NULL のベクトル値を書き込んでください。新しいエンティティは、insert の際に新しいベクトルフィールドを含めることができます。

### 既存のコレクションに BM25 関数とその生成スパースベクトルフィールドを追加できますか？\{#can-i-add-a-bm25-function-and-its-generated-sparse-vector-field-to-an-existing-collection}

はい。コレクションに analyzer が有効な `VARCHAR` フィールドがすでにある場合は、語彙検索のために BM25 関数とその生成スパースベクトルフィールドを追加できます。この操作では、関数、新しい `SPARSE_FLOAT_VECTOR` 出力フィールド、およびバインドされたインデックス定義が同じスキーマ変更で追加されます。このスキーマ変更ワークフローでは、既存の `TEXT` フィールドを BM25 の入力として使用することはできません。`TEXT` を使用するには、コレクションを作成するときにフィールドと BM25 関数を定義してください。そうでない場合は、その関数をスキーマに含めてコレクションを再作成または移行してください。

`add_function_field()` を呼び出す際は、新しい出力フィールドに対して、`metric_type="BM25"` を指定した `SPARSE_INVERTED_INDEX` インデックスを 1 つ含む `index_params` オブジェクトを指定します。インデックス定義は、同じスキーマ変更の一部として生成フィールドにバインドされます。

### 関数とその生成ベクトルフィールドを削除するにはどうすればよいですか？\{#how-do-i-drop-a-function-and-its-generated-vector-field}

関数名を指定して `drop_function_field()` を呼び出します。この操作では、関数の入力フィールドを保持したまま、関数、その生成ベクトルフィールド、および関連するインデックスがまとめて削除されます。

### コレクションスキーマを変更した後、待機する必要はありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動での待機は必要ありません。次の操作が更新後のスキーマに依存する場合は、まず `describe_collection()` を呼び出して、Zilliz Cloud が現在返すスキーマを確認できます。

分散デプロイメントでは、Zilliz Cloud のコンポーネントがコレクションメタデータを更新する間に、短い伝播ウィンドウが生じることがあります。スキーマ変更の直後の操作がスキーマ関連のエラーで失敗する場合は、スキーマを更新して操作を再試行してください。

### フィールドを削除した後、ストレージ容量はいつ回収されますか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

フィールドを削除すると、そのフィールドは現在のスキーマと通常の query/search の可視性から除外されますが、そのフィールドの履歴データはオブジェクトストレージからすぐに物理削除されるわけではありません。

ストレージ容量は、後で Compaction 中に回収される可能性があります。Compaction は、既存のデータファイルをより小さくコンパクトな新しいファイルに再編成するバックグラウンドプロセスです。フィールドを削除した後、新しく Compaction されたファイルは現在のスキーマに従い、削除されたフィールドを含みません。Zilliz Cloud は、フィールドの削除後にストレージ容量が即座に、または一定時間で削減されることを保証しません。

### 動的フィールドのキーと同じ名前のスカラーフィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

dynamic field が有効な場合、既存の dynamic field キーと同じ名前のスカラーフィールドを追加できます。新しいスカラーフィールドは通常のクエリ出力で dynamic field キーをマスクしますが、元の動的データは `$meta` に保持されます。

たとえば、既存のエンティティが `source` という名前の dynamic キーを保存しており、後で `source` という名前のスカラーフィールドを追加するとします。`source` の通常の出力はスカラーフィールドを指します。元の dynamic 値にアクセスするには、`$meta["source"]` のような &#36;meta パス構文を使用します。
