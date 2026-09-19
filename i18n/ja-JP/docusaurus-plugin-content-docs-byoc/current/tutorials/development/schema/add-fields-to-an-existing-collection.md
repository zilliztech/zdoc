---
title: "コレクションスキーマの変更 | BYOC"
slug: /add-fields-to-an-existing-collection
sidebar_label: "スキーマの変更（マネージドコレクション）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションが開発から本番環境へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジックのために `sourceuri` や `reviewstatus` のようなスカラーフィールドを追加したり、アプリケーションが生成する埋め込み用に新しいベクトルフィールドを追加したり、既存のテキストに対する語彙検索のために BM25 関数とその生成されたスパースベクトルフィールドを追加したり、不要になったフィールドや関数を削除したりすることがあります。コレクションスキーマの変更を使用すると、コレクションを再作成する代わりに、サポートされているフィールドと関数の変更をインプレースで行えます。 | BYOC"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コレクションスキーマの変更

コレクションが開発から本番環境へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` のようなスカラーフィールドを追加したり、アプリケーションが生成する埋め込み用に新しいベクトルフィールドを追加したり、既存のテキストに対する語彙検索のために BM25 関数とその生成されたスパースベクトルフィールドを追加したり、不要になったフィールドや関数を削除したりすることがあります。コレクションスキーマの変更を使用すると、コレクションを再作成する代わりに、サポートされているフィールドと関数の変更をインプレースで行えます。

<Admonition type="info" title="Notes">

- このガイドでは、マネージドコレクションにおけるユーザー定義フィールドと、生成されたベクトルフィールドを持つ関数のスキーマ変更について説明します。フィールドプロパティの変更（`VARCHAR` フィールドの `max_length` や `ARRAY` フィールドの `max_capacity` の変更など）については、[コレクションフィールドの変更](./alter-collection-field) を参照してください。動的フィールドの動作については、[動的フィールド](./enable-dynamic-field) および [コレクションの変更](./modify-collections) を参照してください。

- このページでは、マネージドコレクションにフィールドを追加する方法について説明します。外部コレクションにフィールドを追加する場合は、[外部コレクションスキーマの変更](./alter-external-collection-schema) を参照してください。

</Admonition>

## 制限\{#limits}

**ユーザー定義フィールドの追加**

- 追加するユーザー定義フィールドは nullable である必要があります。`add_collection_field()` を呼び出す際は `nullable=True` を設定してください。既存のエンティティでは、`default_value` を指定したスカラーフィールドを追加しない限り、追加したフィールドは `NULL` になります。

- ユーザー定義スカラーフィールドの追加は、Milvus 2.6.x 以降でサポートされています。ユーザー定義ベクトルフィールドの追加は、Milvus 2.6.18 以降でサポートされています。

- フィールド名は、コレクション内のフィールド間で一意である必要があります。

**関数とその生成されたベクトルフィールドの追加**

- 1 回のスキーマ更新で追加できるのは、1 つの関数とその生成されたベクトルフィールドだけです。

- 生成されるベクトルフィールドの型は、サポートされている関数によって決まります。`BM25` は `SPARSE_FLOAT_VECTOR` フィールドを生成し、`MINHASH` は `BINARY_VECTOR` フィールドを生成します。

- 生成されたベクトルフィールドは新しいフィールドである必要があります。コレクションスキーマにすでに存在するフィールドを指すことはできません。

- 生成されたベクトルフィールドは nullable にできません。

- 関数が使用する入力フィールドは、コレクションにすでに存在している必要があります。この既存コレクション向けのワークフローでは、BM25 と MinHash の入力は `VARCHAR` である必要があります。`TEXT` を使用する BM25 関数は、コレクションの作成時に定義してください。

**ユーザー定義フィールドの削除**

- コレクション内の主キーフィールド、パーティションキーフィールド、クラスタリングキーフィールド、または最後のベクトルフィールドは削除できません。

- `ARRAY<STRUCT>` フィールド全体は削除できますが、`ARRAY<STRUCT>` フィールド内の個々のサブフィールドは削除できません。

- 関数の入力フィールドとして使用されているフィールド、または関数の出力フィールドとして生成されたフィールドを直接削除することはできません。関数の出力フィールドを削除するには、それを生成している関数を削除してください。

**関数とその生成されたベクトルフィールドの削除**

- このスキーマ変更ワークフローでは、関数を削除すると、その関数、生成されたベクトルフィールド、および関連付けられたインデックスが削除されます。関数の入力フィールドはコレクションスキーマに残ります。

- 生成されたベクトルフィールドを削除するとコレクションにベクトルフィールドが 1 つも残らなくなる場合、関数の削除は拒否されます。

<Admonition type="info" title="Notes">

サポートされている追加・削除操作以外のスキーマ変更を行う場合は、コレクションを再作成するか移行してください。

</Admonition>

## 既存のコレクションへのフィールドと関数の追加\{#add-fields-and-functions-to-an-existing-collection}

追加するのがユーザー定義フィールドか、ベクトルフィールドを生成する関数かに応じて、ワークフローを選択してください。

- フィルタリング、クエリ出力、またはアプリケーションロジックに新しいメタデータが必要な場合は、[ユーザー定義スカラーフィールドの追加](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields) を使用します。

- アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、[ユーザー定義ベクトルフィールドの追加](./add-fields-to-an-existing-collection#add-user-defined-vector-fields) を使用します。

- Zilliz Cloud が既存のフィールドからベクトル値を生成する必要がある場合（テキストからの BM25 スパースベクトルや MinHash シグネチャなど）は、[関数とその生成されたベクトルフィールドの追加](./add-fields-to-an-existing-collection#add-a-function-and-its-generated-vector-field) を使用します。

これらの場合、フィールドの総数は Zilliz Cloud のフィールド数制限を超えることはできません。詳細は、[Zilliz Cloud Limits](./limits#fields) を参照してください。

### ユーザー定義スカラーフィールドの追加\{#add-user-defined-scalar-fields}

`add_collection_field()` を使用して、既存のコレクションにユーザー定義スカラーフィールドを追加します。

これは、動的フィールドに任意のキーを格納する場合とは異なります。スキーマ更新が利用可能になると、新しいスカラーフィールドはコレクションスキーマの通常の一部になります。そのフィールドに値を挿入または upsert したり、サポートされている場合はインデックスを作成したり、クエリや検索フィルタで使用したり、クエリまたは検索の出力で返したりできます。

既存のエンティティは新しいフィールドが存在する前に挿入されているため、追加するすべてのユーザー定義スカラーフィールドは nullable である必要があります。

- `nullable=True` を指定し、`default_value` を指定せずにスカラーフィールドを追加した場合、既存のエンティティでは新しいフィールドに `NULL` が返されます。

- `nullable=True` と `default_value` を指定してスカラーフィールドを追加した場合、既存のエンティティでは `NULL` の代わりにデフォルト値が返されます。

スカラーフィルタ式は `NULL` のスカラー値には一致しません。詳細は、[nullable フィールド](./nullable-fields) を参照してください。

**例: nullable なスカラーフィールドの追加**

次の例では、`product_catalog` という名前の既存のコレクションに、nullable な `source` フィールドを追加します。

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

フィールドを追加すると、コレクションにすでに存在していたエンティティでは `source` に `NULL` が返されます。新しいエンティティでは、挿入または upsert の際に `source` を設定できます。

**例: デフォルト値を指定したスカラーフィールドの追加**

既存のエンティティで `NULL` の代わりに具体的な値を返す必要がある場合は、フィールドを追加する際に `default_value` を指定します。次の例では、`review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

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

フィールドを追加すると、コレクションにすでに存在していたエンティティでは `review_status` に `"unreviewed"` が返されます。新しいエンティティでは、別の値を設定することも、値を指定しない場合にデフォルト値を使用することもできます。

### StructArray フィールドの追加\{#add-structarray-fields}

`add_collection_struct_field()` を使用して、構造体の配列を受け入れる StructArray フィールドを追加します。StructArray フィールドを追加するには、次のようにします。

1. サポートされているデータ型の必要なサブフィールドを含む StructSchema を作成します。該当するデータ型については、[Data type support](./use-array-of-structs) を参照してください。

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

StructArray フィールドを追加すると、コレクションにすでに存在するエンティティでは、`chunks` のすべてのサブフィールドに null が返されます。新しいエンティティを挿入する際は、すべてのサブフィールドが null であるか、有効な値を持つようにしてください。一部のサブフィールドを null に設定し、他を有効な値に設定してエンティティを挿入すると、エラーになります。

### ユーザー定義ベクトルフィールドの追加\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

追加するすべてのユーザー定義ベクトルフィールドは nullable である必要があります。upsert またはバックフィルワークフローでベクトル値を書き込むまで、既存のエンティティでは新しいベクトルフィールドに `NULL` が入ります。新しいエンティティでは、挿入時にそのベクトルフィールドを含めることができます。ベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。詳細は、[nullable フィールド](./nullable-fields) を参照してください。

**例: nullable なベクトルフィールドの追加**

次の例では、`embedding_v2` という名前の nullable な密ベクトルフィールドを既存のコレクションに追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定します。

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

既存のエンティティでは `embedding_v2` に `NULL` が入り、このフィールドで検索する際にスキップされます。既存のエンティティを `embedding_v2` で検索可能にするには、upsert ワークフローで NULL 以外のベクトル値を書き込んでください。新しいエンティティでは、挿入時に `embedding_v2` を含めることができます。

### 関数とその生成されたベクトルフィールドの追加\{#add-a-function-and-its-generated-vector-field}

この Milvus 3.0 のスキーマ変更ワークフローは、現在 Zilliz Cloud のオンデマンドクラスター向けに文書化されています。このページは、最初にサポートされる Cloud パッチや Serving クラスター の可用性を示すものではありません。

このワークフローは、既存のコレクションにすでに保存されているデータから新しいベクトルフィールドを生成するために使用します。たとえば、BM25 関数は既存の `VARCHAR` フィールドを読み取り、語彙検索用の `SPARSE_FLOAT_VECTOR` フィールドを生成します。一方、MinHash 関数は、ほぼ重複したデータの検出用に `BINARY_VECTOR` フィールドを生成します。このワークフローでは、関数の入力フィールドは追加も置き換えもされません。

この操作では、関数定義、新しいベクトル出力フィールド、およびバインドされたインデックス定義が追加されます。

- 既存の入力フィールドから読み取る `text_bm25` などの関数定義です。

- 関数の出力を格納する `text_sparse` などの新しいベクトル出力フィールドで、そのフィールドにバインドされたインデックス定義を伴います。

生成されるベクトルフィールドの型は、サポートされている関数によって決まります。

| **関数** | **生成されるベクトルフィールドの型** | **一般的な入力フィールド** |
| --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | アナライザーが有効な `VARCHAR` フィールド |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` フィールド |

各関数の動作の詳細については、[BM25 Function](./bm25-function) および [MinHash Function](./minhash-function) を参照してください。

生成されたベクトルフィールドはコレクションにまだ存在していてはならず、nullable にすることもできません。関数の入力フィールドはすでに存在している必要があります。この既存コレクション向けのワークフローでは、`VARCHAR` の入力を使用してください。`TEXT` の入力を使用する BM25 関数は、コレクションの作成時に定義する必要があります。そうでない場合は、スキーマに関数を含めた状態でコレクションを再作成するか移行してください。

**例: BM25 関数とその生成されたスパースベクトルフィールドの追加**

次の例では、`text_bm25` という名前の BM25 関数と、その生成された `text_sparse` という名前のスパースベクトルフィールドを既存のコレクションに追加します。コレクションには、アナライザーが有効な `text` という名前の `VARCHAR` フィールドがすでに存在している必要があります。

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

`index_params` オブジェクトには、新しい関数出力フィールド用のインデックス定義を正確に 1 つ含める必要があります。関数、その生成されたベクトルフィールド、およびバインドされたインデックス定義は、同じスキーマ変更で送信されます。`add_function_field()` の後に `create_index()` を別途呼び出さないでください。

概念的には、この操作では次の関数、生成された出力フィールド、およびバインドされたインデックス定義が追加されます。

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

リクエストが成功すると、`describe_collection()` はコレクションスキーマ内に新しい `text_bm25` 関数とその生成された `text_sparse` ベクトルフィールドの両方を返します。BM25 検索ワークフローの全体については、[Full Text Search](./full-text-search) を参照してください。

MinHash 関数とその生成されたバイナリベクトルフィールドは、ほぼ重複したデータの検出をサポートします。MinHash 関数は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力フィールドに書き込みます。設定の詳細については、[MinHash Function](./minhash-function) を参照してください。

## 既存のコレクションからのフィールドと関数の削除\{#drop-fields-and-functions-from-an-existing-collection}

ユーザー定義フィールドがコレクションモデルの一部でなくなった場合は、そのフィールドを直接削除できます。関数とその生成されたベクトルフィールドを削除するには、関数を削除します。生成されたフィールドとそのインデックスは、同じスキーマ変更で削除されます。

### ユーザー定義フィールドの削除\{#drop-user-defined-fields}

`drop_collection_field()` を使用して、コレクションモデルの一部でなくなったユーザー定義のスカラーまたはベクトルフィールドを削除します。

フィールドを削除すると、まずコレクションスキーマとフィールドの可視性が変更されます。

- `drop_collection_field()` が成功すると、コレクションスキーマが更新されます。`describe_collection()` は削除されたフィールドを返さなくなり、クエリや検索では、`output_fields` でそのフィールドを返したり式で使用したりできなくなります。

- 削除されたフィールドに作成されたインデックスは、スキーマ更新の一部としてクリーンアップされます。

ストレージのクリーンアップは、スキーマのクリーンアップとは別に処理されます。詳細は、[フィールドを削除した後、ストレージ領域はいつ解放されますか？](./add-fields-to-an-existing-collection) を参照してください。

**例: ユーザー定義スカラーフィールドの削除**

次の例では、`experiment_tag` が `product_catalog` のユーザー定義スカラーフィールドであることを前提とし、コレクションから削除します。

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

次の例では、`chunks` フィールドが `my_collection` の StructArray フィールドであることを前提とし、コレクションから削除します。

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

同じ `drop_collection_field()` メソッドを使用してベクトルフィールドを削除できますが、削除後もコレクションに少なくとも 1 つのベクトルフィールドが残っている必要があります。これは、一時的に複数のベクトル表現を持ち、後でそのうちの 1 つに統一するコレクションに役立ちます。

次の例では、`image_vector` が `hybrid_catalog` のユーザー定義ベクトルフィールドであり、コレクションに `text_vector` などの別のベクトルフィールドがまだ残っていることを前提としています。

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

### 関数とその生成されたベクトルフィールドの削除\{#drop-a-function-and-its-generated-vector-field}

BM25 関数とその生成されたスパースベクトルフィールドなど、関数やその生成されたベクトルフィールドが不要になった場合は、この操作を使用します。

関数名を指定して `drop_function_field()` を呼び出します。この操作では、関数の入力フィールドを保持したまま、関数、その生成されたベクトルフィールド、および関連付けられたインデックスが削除されます。

**例: BM25 関数とその生成されたスパースベクトルフィールドの削除**

次の例では、`text_bm25` が `product_catalog` の BM25 関数であり、`text_sparse` という名前のスパースベクトル出力フィールドを生成することを前提としています。

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

操作が成功すると、`describe_collection()` は削除された関数とその生成されたベクトルフィールドを返さなくなります。関数の入力フィールドはスキーマに残ります。

関数の出力フィールドを削除するとコレクションにベクトルフィールドが 1 つも残らなくなる場合、操作は拒否されます。

## FAQ\{#faq}

### フィールドまたは関数を追加するにはどのメソッドを使用すればよいですか？\{#which-method-should-i-use-to-add-a-field-or-function}

アプリケーションがフィルタリング、クエリ出力、またはアプリケーションロジック用のスカラー値を提供する場合は、`add_collection_field()` を使用してユーザー定義スカラーフィールドを追加します。

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

既存のフィールドからベクトル値を生成する必要がある場合は、`add_function_field()` を使用します。これは、同じスキーマ変更で関数、その生成されたベクトルフィールド、およびバインドされたインデックス定義を追加します。このガイドでは、語彙検索のための BM25 の手順を示します。MinHash 関数は、ほぼ重複したデータの検出用にバイナリベクトルフィールドを生成します。

### 追加したユーザー定義フィールドはなぜ nullable である必要がありますか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しいフィールドが存在する前に挿入されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、またはスカラーフィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud は欠損値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加するユーザー定義スカラーフィールドとユーザー定義ベクトルフィールドに適用されます。nullable にできない関数の生成されたベクトルフィールドには適用されません。

### ユーザー定義フィールドを追加すると、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義スカラーフィールドの場合、`default_value` を設定しない限り、既存のエンティティは `NULL` を返します。`default_value` を設定した場合、既存のエンティティはそのデフォルト値を返します。

ユーザー定義ベクトルフィールドの場合、既存のエンティティでは新しいベクトルフィールドに `NULL` が入ります。追加したフィールドでのベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。既存のエンティティを新しいベクトルフィールドで検索可能にするには、upsert またはバックフィルワークフローで NULL 以外のベクトル値を書き込んでください。新しいエンティティでは、挿入時に新しいベクトルフィールドを含めることができます。

### 既存のコレクションに BM25 関数とその生成されたスパースベクトルフィールドを追加できますか？\{#can-i-add-a-bm25-function-and-its-generated-sparse-vector-field-to-an-existing-collection}

はい。コレクションにアナライザーが有効な `VARCHAR` フィールドがすでにある場合は、語彙検索用の BM25 関数とその生成されたスパースベクトルフィールドを追加できます。この操作では、同じスキーマ変更で関数、新しい `SPARSE_FLOAT_VECTOR` 出力フィールド、およびバインドされたインデックス定義が追加されます。このスキーマ変更ワークフローでは、既存の `TEXT` フィールドを BM25 の入力として使用することはできません。`TEXT` を使用するには、コレクションの作成時にフィールドと BM25 関数を定義してください。そうでない場合は、スキーマに関数を含めた状態でコレクションを再作成するか移行してください。

`add_function_field()` を呼び出す際は、新しい出力フィールド用に `metric_type="BM25"` を指定した 1 つの `SPARSE_INVERTED_INDEX` インデックスを含む `index_params` オブジェクトを指定します。インデックス定義は、同じスキーマ変更の一部として生成されたフィールドにバインドされます。

### 関数とその生成されたベクトルフィールドを削除するにはどうすればよいですか？\{#how-do-i-drop-a-function-and-its-generated-vector-field}

関数名を指定して `drop_function_field()` を呼び出します。この操作では、関数の入力フィールドを保持したまま、関数、その生成されたベクトルフィールド、および関連付けられたインデックスがまとめて削除されます。

### コレクションスキーマを変更した後、待機する必要はありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動での待機は必要ありません。次の操作が更新後のスキーマに依存する場合は、先に `describe_collection()` を呼び出して、Zilliz Cloud が現在返しているスキーマを確認できます。

分散デプロイでは、Zilliz Cloud のコンポーネントがコレクションメタデータを更新する間、短い伝播期間が生じることがあります。スキーマ変更の直後の操作がスキーマ関連のエラーで失敗した場合は、スキーマを更新してから操作を再試行してください。

### フィールドを削除した後、ストレージ領域はいつ解放されますか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

フィールドを削除すると、そのフィールドは現在のスキーマと通常の query/search の可視性から除外されますが、そのフィールドの履歴データがオブジェクトストレージから直ちに物理削除されるわけではありません。

ストレージ領域は、後で Compaction 中に解放されることがあります。Compaction は、既存のデータファイルを再編成してよりコンパクトな新しいファイルにするバックグラウンドプロセスです。フィールドを削除した後、新しく Compaction されたファイルは現在のスキーマに従い、削除されたフィールドを含みません。Zilliz Cloud は、フィールドを削除した後にストレージ領域が即座に、または一定時間で削減されることを保証しません。

### 動的フィールドのキーと同じ名前のスカラーフィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

動的フィールドが有効な場合、既存の動的フィールドのキーと同じ名前のスカラーフィールドを追加できます。新しいスカラーフィールドは、通常のクエリ出力では動的フィールドのキーをマスクしますが、元の動的データは `$meta` に保持されます。

たとえば、既存のエンティティが `source` という名前の動的キーを格納しており、後から `source` という名前のスカラーフィールドを追加した場合、`source` の通常の出力はスカラーフィールドを指します。元の動的な値にアクセスするには、`$meta["source"]` のような &#36;meta パス構文を使用します。
