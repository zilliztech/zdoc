---
title: "Collection スキーマの変更 | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_label: "スキーマの変更（Managed Collection）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "collection が開発から本番へ移行するにつれて、各エンティティに関連するフィールドはしばしば変化します。フィルタリングやアプリケーションロジックのために `sourceuri` や `reviewstatus` のような scalar フィールドを追加したり、アプリケーションが生成した埋め込み用に新しい vector フィールドを追加したり、既存テキストに対する語彙検索用に BM25 生成の疎ベクトルフィールドを追加したり、使われなくなったフィールドを削除したりすることがあります。Alter Collection Schema を使うと、collection を再作成する代わりに、サポートされているフィールド変更をその場で行えます。 | Cloud"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Collection スキーマの変更

collection が開発から本番へ移行するにつれて、各エンティティに関連するフィールドはしばしば変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` のような scalar フィールドを追加したり、アプリケーションが生成した埋め込み用に新しい vector フィールドを追加したり、既存テキストに対する語彙検索用に BM25 生成の疎ベクトルフィールドを追加したり、使われなくなったフィールドを削除したりすることがあります。Alter Collection Schema を使うと、collection を再作成する代わりに、サポートされているフィールド変更をその場で行えます。

<Admonition type="info" icon="📘" title="注意">

- このガイドでは、既存 collection に対するフィールドレベルのスキーマ変更を扱います。`VARCHAR` フィールドの `max_length` や `ARRAY` フィールドの `max_capacity` の変更など、フィールドプロパティの変更については Alter Collection Field を参照してください。dynamic field の動作については、[Dynamic Field](./enable-dynamic-field) および [Modify Collection](./modify-collections) を参照してください。

- このページでは、managed collection にフィールドを追加する方法を説明します。external collection にフィールドを追加する場合は、[Alter External Collection Schema](./alter-external-collection-schema) を参照してください。

</Admonition>

## Limits\{#limits}

**ユーザー定義フィールドの追加**

- 追加するユーザー定義フィールドは nullable である必要があります。`add_collection_field()` を呼び出す際に `nullable=True` を設定してください。既存エンティティでは、`default_value` を持つ scalar フィールドを追加しない限り、追加されたフィールドは `NULL` になります。

- ユーザー定義 scalar フィールドの追加は Milvus 2.6.x 以降でサポートされています。ユーザー定義 vector フィールドの追加は Milvus 2.6.18 以降でサポートされています。

- フィールド名は、collection 内の他のフィールド名と重複してはなりません。

**関数によって生成される vector フィールドの追加**

- 1 回のスキーマ更新で追加できるのは、1 つの関数と 1 つの生成 vector フィールドのみです。

- サポートされる関数によって、生成される vector フィールドの型が決まります。`BM25` は `SPARSE_FLOAT_VECTOR` フィールドを生成し、`MINHASH` は `BINARY_VECTOR` フィールドを生成します。

- 生成される vector フィールドは新しいフィールドでなければなりません。collection スキーマにすでに存在するフィールドを指すことはできません。

- 生成される vector フィールドは nullable にできません。

- 関数が使用する入力フィールドは、すでに collection に存在している必要があります。

**ユーザー定義フィールドの削除**

- 主キー フィールド、partition key フィールド、clustering key フィールド、または collection 内の最後の vector フィールドは削除できません。

- `ARRAY<STRUCT>` フィールド全体は削除できますが、`ARRAY<STRUCT>` フィールド内の個別のサブフィールドは削除できません。

- 関数の入力フィールドとして使用されているフィールド、または関数の出力フィールドとして生成されるフィールドは直接削除できません。関数出力フィールドを削除するには、それを生成している関数を削除してください。

**関数によって生成される vector フィールドの削除**

- このスキーマ変更ワークフローでは、関数を削除すると、その関数と生成された出力フィールドが削除されます。関数の入力フィールドは collection スキーマに残ります。

- その関数の出力フィールドを削除すると collection に vector フィールドが 1 つも残らなくなる場合、関数の削除は拒否されます。

<Admonition type="info" icon="📘" title="注意">

サポートされている追加・削除操作以外のスキーマ変更については、collection を再作成または移行してください。

</Admonition>

## 既存 collection へのフィールド追加\{#add-fields-to-an-existing-collection}

フィールド値がどのように生成されるかに応じて、追加方法を選択してください。

- フィルタリング、クエリ出力、またはアプリケーションロジックのために新しいメタデータが必要な場合は、[ユーザー定義 scalar フィールドを追加](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields) を使用します。

- アプリケーションが埋め込みを生成し、vector 値を Zilliz Cloud に書き込む場合は、[ユーザー定義 vector フィールドを追加](./add-fields-to-an-existing-collection#add-user-defined-vector-fields) を使用します。

- BM25 疎ベクトルやテキストからの MinHash シグネチャのように、既存フィールドから Zilliz Cloud が vector 値を生成する必要がある場合は、[関数によって生成される vector フィールドを追加](./add-fields-to-an-existing-collection#add-vector-fields-generated-by-functions) を使用します。

これらの場合、フィールド総数は Zilliz Cloud のフィールド数制限を超えることはできません。詳細は [Zilliz Cloud Limits](./limits#fields) を参照してください。

### ユーザー定義 scalar フィールドを追加\{#add-user-defined-scalar-fields}

既存 collection にユーザー定義 scalar フィールドを追加するには `add_collection_field()` を使用します。

これは dynamic field に任意のキーを保存する方法とは異なります。スキーマ更新が反映されると、新しい scalar フィールドは collection スキーマの通常の一部になります。そこに値を insert または upsert でき、サポートされている場合はインデックスを作成でき、クエリや検索フィルタで使用でき、クエリまたは検索結果として返すこともできます。

既存エンティティは新しいフィールドが存在する前に insert されているため、追加するすべてのユーザー定義 scalar フィールドは nullable である必要があります。

- `nullable=True` で `default_value` なしの scalar フィールドを追加した場合、既存エンティティでは新しいフィールドは `NULL` を返します。

- `nullable=True` かつ `default_value` を指定して scalar フィールドを追加した場合、既存エンティティでは `NULL` の代わりにデフォルト値を返します。

scalar フィルタ式は `NULL` の scalar 値には一致しません。詳細は [Nullable Fields](./nullable-fields) を参照してください。

**例: nullable な scalar フィールドを追加**

次の例では、`product_catalog` という既存 collection に nullable な `source` フィールドを追加します。

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

フィールド追加後、collection にすでに存在していたエンティティでは `source` は `NULL` を返します。新しいエンティティでは、insert または upsert 時に `source` を設定できます。

**例: デフォルト値付き scalar フィールドを追加**

既存エンティティで `NULL` ではなく具体的な値を返したい場合は、フィールド追加時に `default_value` を指定してください。次の例では `review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

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

フィールド追加後、collection にすでに存在していたエンティティでは `review_status` は `"unreviewed"` を返します。新しいエンティティでは別の値を設定することも、値が指定されない場合にデフォルト値を使うこともできます。

### StructArray フィールドを追加\{#add-structarray-fields}

struct の配列を受け入れる StructArray フィールドを追加するには `add_collection_struct_field()` を使用します。StructArray フィールドを追加するには、次のようにします。

1. サポートされるデータ型の必要なサブフィールドを含む StructSchema を作成します。適用可能なデータ型については、[Data type support](./use-array-of-structs) を参照してください。

1. 上で作成した StructSchema を参照し、`add_collection_struct_field()` でフィールドの最大容量を設定します。

1. リクエストで `nullable` を `True` に設定します。

**例: nullable な StructArray フィールドを追加**

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

StructArray フィールドが追加されると、collection にすでに存在するエンティティでは、そのすべてのサブフィールドにわたって `chunks` は null を返します。新しいエンティティを insert する際は、すべてのサブフィールドが null であるか、有効な値を持っていることを確認してください。一部のサブフィールドが null で、他が有効値になっているエンティティを insert するとエラーになります。

### ユーザー定義 vector フィールドを追加\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、vector 値を Zilliz Cloud に書き込む場合は、ユーザー定義 vector フィールドを追加するために `add_collection_field()` を使用します。

追加するすべてのユーザー定義 vector フィールドは nullable である必要があります。既存エンティティでは、upsert またはバックフィルのワークフローを通じて vector 値を書き込むまで、新しい vector フィールドは `NULL` になります。新しいエンティティでは insert 時にその vector フィールドを含めることができます。vector 検索では、vector 値が `NULL` のエンティティはスキップされます。詳細は [Nullable Fields](./nullable-fields) を参照してください。

**例: nullable な vector フィールドを追加**

次の例では、既存 collection に `embedding_v2` という名前の nullable な dense vector フィールドを追加します。`dim` は、アプリケーションが生成する埋め込みの次元数に設定してください。

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

フィールド追加後、そのフィールドで検索する前に新しい vector フィールドにインデックスを作成してください。

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

既存エンティティでは `embedding_v2` は `NULL` となり、このフィールドで検索してもスキップされます。既存エンティティを `embedding_v2` 経由で検索可能にするには、upsert ワークフローを通じて `NULL` でない vector 値を書き込んでください。新しいエンティティでは insert 時に `embedding_v2` を含めることができます。

### 関数によって生成される vector フィールドを追加\{#add-vector-fields-generated-by-functions}

既存 collection にすでにテキストが保存されていて、語彙検索を追加したい場合は、BM25 によって生成される疎ベクトルフィールドを追加します。Milvus は、重複に近いデータの検出のために MinHash によって生成されるバイナリ vector フィールドもサポートしています。

関数によって生成される vector フィールドを追加すると、collection スキーマに次の 2 つの関連要素が追加されます。

- `text_sparse` のように、Zilliz Cloud が生成した値を格納する生成 vector 出力フィールド

- `text_bm25` のように、既存の入力フィールドを読み取り、生成 vector フィールドに書き込む関数

サポートされる関数によって、生成される vector フィールドの型が決まります。

| **Function** | **Generated vector field type** | **Typical input field** |
| --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | analyzer が有効な `VARCHAR` または `TEXT` フィールド |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` または `TEXT` フィールド |

各関数の動作の詳細については、[BM25 Function](./bm25-function) および [MinHash Function](./minhash-function) を参照してください。

生成される vector フィールドは collection にすでに存在していてはならず、nullable にもできません。関数の入力フィールドはすでに存在している必要があります。

**例: BM25 によって生成される疎ベクトルフィールドを追加**

次の例では、既存 collection に `text_sparse` という名前の BM25 生成疎ベクトルフィールドを追加します。collection には、analyzer が有効な `text` という名前の `VARCHAR` テキストフィールドがすでに存在している必要があります。

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

# highlight-start
client.add_function_field(
    collection_name="product_catalog",
    field_schema=sparse_field,
    func=bm25_function,
)
# highlight-end
```

BM25 関数と生成フィールドを追加した後、BM25 検索に使う前にその疎 vector フィールドにインデックスを作成してください。

```python
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

client.create_index(
    collection_name="product_catalog",
    index_params=index_params,
)
```

概念的には、BM25 生成疎フィールドの追加には次のスキーマ変更が含まれます。

```plaintext
New output field:
  name: "text_sparse"
  data_type: SPARSE_FLOAT_VECTOR
  nullable: false

New function:
  name: "text_bm25"
  type: BM25
  input_field_names: ["text"]
  output_field_names: ["text_sparse"]
```

リクエストが成功すると、`describe_collection()` は collection スキーマ内に新しい `text_sparse` フィールドと `text_bm25` 関数の両方を返します。BM25 検索の完全なワークフローについては、[Full Text Search](./full-text-search) を参照してください。

Zilliz Cloud は、重複に近いデータの検出のために MinHash 生成バイナリ vector フィールドもサポートしています。MinHash 関数は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力フィールドに書き込みます。設定の詳細については、[MinHash Function](./minhash-function) を参照してください。

## 既存 collection からフィールドを削除\{#drop-fields-from-an-existing-collection}

既存 collection からのフィールド削除には 2 つの方法があります。ユーザー定義 scalar または vector フィールドが collection モデルの一部でなくなった場合は直接削除します。関数によって生成されるフィールドは、それを生成している関数を削除して削除します。

### ユーザー定義フィールドを削除\{#drop-user-defined-fields}

collection モデルの一部でなくなったユーザー定義 scalar または vector フィールドを削除するには `drop_collection_field()` を使用します。

フィールドを削除すると、まず collection スキーマとフィールドの可視性が変更されます。

- `drop_collection_field()` が成功すると、collection スキーマが更新されます。`describe_collection()` は削除されたフィールドを返さなくなり、クエリまたは検索ではそのフィールドを `output_fields` として返したり、式で使用したりできなくなります。

- 削除されたフィールド上に作成されていたインデックスは、スキーマ更新の一部としてクリーンアップされます。

ストレージのクリーンアップは、スキーマのクリーンアップとは別に処理されます。詳細は [フィールド削除後、ストレージ領域はいつ回収されますか？](./add-fields-to-an-existing-collection) を参照してください。

**例: ユーザー定義 scalar フィールドを削除**

次の例では、`experiment_tag` が `product_catalog` のユーザー定義 scalar フィールドであることを前提に、それを collection から削除します。

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

フィールド削除後、`describe_collection()` を呼び出して、そのフィールドがスキーマの一部ではなくなっていることを確認できます。

**例: StructArray フィールドを削除**

次の例では、`chunks` フィールドが `my_collection` の StructArray フィールドであることを前提に、それを collection から削除します。

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

**例: ユーザー定義 vector フィールドを削除**

同じ `drop_collection_field()` メソッドで vector フィールドも削除できますが、削除後も collection には少なくとも 1 つの vector フィールドが残っている必要があります。これは、複数の vector 表現を一時的に保持し、その後そのうちの 1 つに標準化する collection に便利です。

次の例では、`image_vector` が `hybrid_catalog` のユーザー定義 vector フィールドであり、collection には `text_vector` など別の vector フィールドが引き続き存在することを前提としています。

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

`image_vector` が collection 内の最後の vector フィールドである場合、削除操作は拒否されます。

### 関数によって生成される vector フィールドを削除\{#drop-vector-fields-generated-by-functions}

BM25 生成疎ベクトルフィールドのような、関数によって生成される vector フィールドが不要になった場合は、この操作を使用します。

生成 vector フィールドを削除するには、それを生成している関数に対して `drop_collection_function()` を呼び出します。このワークフローでは、Zilliz Cloud は collection スキーマから関数を削除し、その生成 vector 出力フィールドも削除します。

関数の入力フィールドや関数の出力フィールドに対して `drop_collection_field()` を呼び出さないでください。対象フィールドが関数出力フィールドである場合は、代わりに `drop_collection_function()` を呼び出してください。関数入力フィールドは関数削除後も保持されます。

**例: 関数によって生成されるフィールドを削除**

次の例では、`text_bm25` が `product_catalog` の BM25 関数であり、`text_sparse` という名前の疎 vector 出力フィールドを生成していることを前提としています。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_function(
    collection_name="product_catalog",
    function_name="text_bm25",
)
# highlight-end
```

この操作が成功すると、`describe_collection()` は削除された関数も、その生成出力フィールドも返さなくなります。関数入力フィールドはスキーマに残ります。

関数出力フィールドを削除すると collection に vector フィールドが 1 つも残らなくなる場合、その操作は拒否されます。

## FAQ\{#faq}

### どのフィールド追加メソッドを使うべきですか？\{#which-add-field-method-should-i-use}

フィルタリング、クエリ出力、またはアプリケーションロジックのためにアプリケーションが scalar 値を提供する場合は、ユーザー定義 scalar フィールドの追加に `add_collection_field()` を使用してください。

アプリケーションが埋め込みを生成し、vector 値を Zilliz Cloud に書き込む場合は、ユーザー定義 vector フィールドの追加に `add_collection_field()` を使用してください。

既存フィールドから Zilliz Cloud が vector 値を生成する必要がある場合は、生成 vector フィールドのワークフローを使用してください。このガイドでは、語彙検索のための `add_function_field()` を使った BM25 の経路を示しています。Zilliz Cloud は、重複に近いデータ検出のために MinHash 生成バイナリ vector フィールドもサポートしています。

### 追加するユーザー定義フィールドはなぜ nullable でなければならないのですか？\{#why-must-added-user-defined-fields-be-nullable}

既存エンティティは新しいフィールドが存在する前に insert されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、または scalar フィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud はその欠損値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加されるユーザー定義 scalar フィールドおよびユーザー定義 vector フィールドに適用されます。関数によって生成される vector フィールドには適用されません。これらは nullable にできないためです。

### ユーザー定義フィールドを追加すると、既存エンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義 scalar フィールドの場合、`default_value` を設定しなければ既存エンティティは `NULL` を返します。`default_value` を設定すると、既存エンティティはそのデフォルト値を返します。

ユーザー定義 vector フィールドの場合、既存エンティティでは新しい vector フィールドは `NULL` になります。追加されたフィールドでの vector 検索では、vector 値が `NULL` のエンティティはスキップされます。既存エンティティを新しい vector フィールド経由で検索可能にするには、upsert またはバックフィルのワークフローを通じて `NULL` でない vector 値を書き込んでください。新しいエンティティでは insert 時に新しい vector フィールドを含めることができます。

### 既存 collection に BM25 語彙検索を追加できますか？\{#can-i-add-bm25-lexical-search-to-an-existing-collection}

はい。collection に analyzer が有効な `VARCHAR` または `TEXT` フィールドがすでにある場合、語彙検索のために BM25 生成疎ベクトルフィールドを追加できます。このワークフローでは、Zilliz Cloud は新しい `SPARSE_FLOAT_VECTOR` 出力フィールドと、その値を生成する BM25 関数を追加します。

BM25 生成疎ベクトルフィールドを追加した後、そのフィールドを BM25 検索に使う前に、`metric_type="BM25"` を指定した `SPARSE_INVERTED_INDEX` インデックスを作成してください。

### 関数によって生成される vector フィールドを直接削除できますか？\{#can-i-drop-a-vector-field-generated-by-a-function-directly}

いいえ。関数によって生成される vector フィールドは、その関数のスキーマ契約の一部です。代わりに `drop_collection_function()` を使用してください。このスキーマ変更ワークフローでは、Zilliz Cloud は関数とその生成 vector 出力フィールドをまとめて削除し、入力フィールドは保持します。

### collection スキーマ変更後に待機は必要ですか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動で待機する必要はありません。次の操作が更新後のスキーマに依存する場合は、まず `describe_collection()` を呼び出して、Zilliz Cloud が現在返しているスキーマを確認できます。

分散デプロイメントでは、Zilliz Cloud の各コンポーネントが collection メタデータを更新するまでに短い伝播時間が発生することがあります。スキーマ変更直後の操作がスキーマ関連エラーで失敗した場合は、スキーマを再取得して操作を再試行してください。

### フィールド削除後、ストレージ領域はいつ回収されますか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

フィールドを削除すると、現在のスキーマおよび通常のクエリ/検索での可視性からは除外されますが、そのフィールドの履歴データが object storage から即座に物理削除されるわけではありません。

ストレージ領域は、後で compaction 中に回収されることがあります。compaction は、既存のデータファイルを再編成して、よりコンパクトな新しいファイルにまとめるバックグラウンドプロセスです。フィールドが削除された後、新たに compaction されたファイルは現在のスキーマに従い、削除されたフィールドを含みません。Zilliz Cloud は、フィールド削除後にストレージ領域が即時に、または一定時間後に削減されることを保証しません。

### dynamic field キーと同じ名前の scalar フィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

dynamic field が有効な場合、既存の dynamic field キーと同じ名前の scalar フィールドを追加できます。新しい scalar フィールドは通常のクエリ出力ではその dynamic field キーをマスクしますが、元の dynamic データは `$meta` に保持されます。

たとえば、既存エンティティが `source` という dynamic キーを保存していて、後から `source` という名前の scalar フィールドを追加した場合、通常の `source` 出力は scalar フィールドを参照します。元の dynamic 値にアクセスするには、`$meta["source"]` のような $meta パス構文を使用してください。
