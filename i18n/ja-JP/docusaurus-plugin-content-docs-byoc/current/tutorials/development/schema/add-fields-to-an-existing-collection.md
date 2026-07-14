---
title: "Collection Schema の変更 | BYOC"
slug: /add-fields-to-an-existing-collection
sidebar_label: "Schema の変更（Managed Collection）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "collection が開発から本番へ移行するにつれて、各エンティティに関連する field はしばしば変化します。フィルタリングやアプリケーションロジックのために `sourceuri` や `reviewstatus` のような scalar field を追加したり、アプリケーションが生成した埋め込み用の新しい vector field を追加したり、既存テキストに対する語彙検索のために BM25 生成の sparse vector field を追加したり、不要になった field を削除したりすることがあります。Alter Collection Schema を使うと、collection を再作成する代わりに、サポートされている field 変更をその場で行えます。 | BYOC"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Collection Schema の変更

collection が開発から本番へ移行するにつれて、各エンティティに関連する field はしばしば変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` のような scalar field を追加したり、アプリケーションが生成した埋め込み用の新しい vector field を追加したり、既存テキストに対する語彙検索のために BM25 生成の sparse vector field を追加したり、不要になった field を削除したりすることがあります。Alter Collection Schema を使うと、collection を再作成する代わりに、サポートされている field 変更をその場で行えます。

<Admonition type="info" icon="📘" title="注意">

- このガイドでは、既存の collection における field レベルの schema 変更を扱います。`VARCHAR` field の `max_length` や `ARRAY` field の `max_capacity` の変更のような field プロパティの変更については、Alter Collection Field を参照してください。dynamic field の動作については、[Dynamic Field](./enable-dynamic-field) および [Modify Collection](./modify-collections) を参照してください。

- このページでは、managed collection に field を追加する方法を説明します。external collection に field を追加するには、[Alter External Collection Schema](./alter-external-collection-schema) を参照してください。

</Admonition>

## Limits\{#limits}

**ユーザー定義 field の追加**

- 追加するユーザー定義 field は nullable でなければなりません。`add_collection_field()` を呼び出す際に `nullable=True` を設定してください。既存のエンティティでは、`default_value` を持つ scalar field を追加しない限り、追加された field は `NULL` になります。

- ユーザー定義 scalar field の追加は Milvus 2.6.x 以降でサポートされています。ユーザー定義 vector field の追加は Milvus 2.6.18 以降でサポートされています。

- field 名は collection 内の他の field と重複してはいけません。

**関数によって生成される vector field の追加**

- 1 回の schema 更新で追加できるのは、1 つの function と 1 つの生成 vector field のみです。

- サポートされる function によって、生成される vector field の型が決まります。`BM25` は `SPARSE_FLOAT_VECTOR` field を生成し、`MINHASH` は `BINARY_VECTOR` field を生成します。

- 生成される vector field は新しい field でなければなりません。collection schema にすでに存在する field を指すことはできません。

- 生成される vector field は nullable にできません。

- function が使用する入力 field は、すでに collection に存在していなければなりません。

**ユーザー定義 field の削除**

- primary key field、partition key field、clustering key field、または collection 内の最後の vector field は削除できません。

- `ARRAY<STRUCT>` field 全体は削除できますが、`ARRAY<STRUCT>` field 内の個別の sub-field は削除できません。

- function の入力 field として使われている field、または function の出力 field として生成される field は直接削除できません。function の出力 field を削除するには、それを生成している function を削除してください。

**関数によって生成される vector field の削除**

- この schema 変更ワークフローでは、function を削除すると、その function と生成された出力 field も削除されます。function の入力 field は collection schema に残ります。

- function の出力 field を削除すると collection に vector field が 1 つも残らなくなる場合、その function の削除は拒否されます。

<Admonition type="info" icon="📘" title="注意">

サポートされている追加および削除操作以外の schema 変更については、collection を再作成するか移行してください。

</Admonition>

## 既存の collection に field を追加する\{#add-fields-to-an-existing-collection}

field の値がどのように生成されるかに応じて、field 追加の方法を選択します。

- フィルタリング、クエリ出力、またはアプリケーションロジックのために新しいメタデータが必要な場合は、[ユーザー定義 scalar field を追加する](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields) を使用します。

- アプリケーションが埋め込みを生成し、vector 値を Zilliz Cloud に書き込む場合は、[ユーザー定義 vector field を追加する](./add-fields-to-an-existing-collection#add-user-defined-vector-fields) を使用します。

- BM25 sparse vector やテキストからの MinHash シグネチャのように、既存の field から Zilliz Cloud が vector 値を生成する必要がある場合は、[関数によって生成される vector field を追加する](./add-fields-to-an-existing-collection#add-vector-fields-generated-by-functions) を使用します。

これらの場合、field の総数は Zilliz Cloud の field 数上限を超えてはいけません。詳細は、[Zilliz Cloud Limits](./limits#fields) を参照してください。

### ユーザー定義 scalar field を追加する\{#add-user-defined-scalar-fields}

既存の collection にユーザー定義 scalar field を追加するには、`add_collection_field()` を使用します。

これは、dynamic field に任意のキーを保存するのとは異なります。schema 更新が反映されると、新しい scalar field は collection schema の通常の一部になります。そこへ値を insert または upsert でき、サポートされている場合はその field に index を作成でき、クエリや検索フィルタで利用でき、クエリまたは検索の出力として返すこともできます。

既存のエンティティは新しい field が存在する前に insert されていたため、追加するすべてのユーザー定義 scalar field は nullable でなければなりません。

- `nullable=True` かつ `default_value` なしで scalar field を追加した場合、既存のエンティティは新しい field に対して `NULL` を返します。

- `nullable=True` かつ `default_value` ありで scalar field を追加した場合、既存のエンティティは `NULL` ではなくデフォルト値を返します。

scalar フィルタ式は `NULL` の scalar 値には一致しません。詳細は、[Nullable Fields](./nullable-fields) を参照してください。

**例: nullable な scalar field を追加する**

次の例では、既存の `product_catalog` という名前の collection に nullable な `source` field を追加します。

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

field が追加された後、すでに collection に存在していたエンティティは `source` に対して `NULL` を返します。新しいエンティティは insert または upsert の際に `source` を設定できます。

**例: デフォルト値付きの scalar field を追加する**

既存のエンティティに `NULL` ではなく具体的な値を返させたい場合は、field の追加時に `default_value` を指定します。次の例では、`review_status` field を追加し、`"unreviewed"` をデフォルト値として使用します。

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

field が追加された後、すでに collection に存在していたエンティティは `review_status` に対して `"unreviewed"` を返します。新しいエンティティは別の値を設定することも、値を指定しない場合はデフォルト値を使うこともできます。

### StructArray field を追加する\{#add-structarray-fields}

struct の配列を受け取る StructArray field を追加するには、`add_collection_struct_field()` を使用します。StructArray field を追加するには、次の手順に従ってください。

1. サポートされているデータ型の必要な sub-field を含む StructSchema を作成します。適用可能なデータ型については、[Data type support](./use-array-of-structs) を参照してください。

1. 上で作成した StructSchema を参照し、`add_collection_struct_field()` で field の最大容量を設定します。

1. リクエストで `nullable` を `True` に設定します。

**例: nullable な StructArray field を追加する**

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

StructArray field が追加された後、すでに collection に存在するエンティティは、すべての sub-field にわたって `chunks` に対して null を返します。新しいエンティティを insert する際は、すべての sub-field が null であるか、有効な値を持つことを確認してください。一部の sub-field を null にし、他を有効な値にしたエンティティを insert するとエラーになります。

### ユーザー定義 vector field を追加する\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、vector 値を Zilliz Cloud に書き込む場合、ユーザー定義 vector field を追加するには `add_collection_field()` を使用します。

追加するすべてのユーザー定義 vector field は nullable でなければなりません。既存のエンティティは、upsert またはバックフィルワークフローを通じて vector 値を書き込むまで、新しい vector field に対して `NULL` を持ちます。新しいエンティティは insert 時にその vector field を含めることができます。vector search では、vector 値が `NULL` のエンティティはスキップされます。詳細は、[Nullable Fields](./nullable-fields) を参照してください。

**例: nullable な vector field を追加する**

次の例では、既存の collection に `embedding_v2` という名前の nullable な dense vector field を追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定してください。

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

field が追加された後、その field を検索に使う前に新しい vector field に index を作成してください。

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

既存のエンティティは `embedding_v2` に対して `NULL` を持ち、この field に対して検索するとスキップされます。既存のエンティティを `embedding_v2` 経由で検索可能にするには、upsert ワークフローを通じて `NULL` でない vector 値を書き込んでください。新しいエンティティは insert 時に `embedding_v2` を含めることができます。

### 関数によって生成される vector field を追加する\{#add-vector-fields-generated-by-functions}

既存の collection にすでにテキストが保存されていて、語彙検索を追加したい場合は、BM25 生成の sparse vector field を追加します。Milvus は、重複に近いデータの検出のために、MinHash 生成の binary vector field もサポートしています。

関数によって生成される vector field を追加すると、collection schema に次の 2 つの関連部分が追加されます。

- `text_sparse` のような生成 vector 出力 field。Zilliz Cloud が生成した値を格納します。

- `text_bm25` のような function。既存の入力 field を読み取り、生成 vector field に書き込みます。

サポートされる function によって、生成される vector field の型が決まります。

| **Function** | **生成される vector field の型** | **一般的な入力 field** |
| --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | analyzer が有効な `VARCHAR` または `TEXT` field |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` または `TEXT` field |

各 function の動作の詳細については、[BM25 Function](./bm25-function) および [MinHash Function](./minhash-function) を参照してください。

生成される vector field は collection にまだ存在していてはならず、nullable にもできません。function の入力 field はすでに存在している必要があります。

**例: BM25 生成の sparse vector field を追加する**

次の例では、既存の collection に `text_sparse` という名前の BM25 生成 sparse vector field を追加します。collection には、analyzer が有効な `text` という名前の `VARCHAR` テキスト field がすでに存在している必要があります。

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

BM25 function と生成 field を追加した後、それを BM25 search に使用する前に sparse vector field に index を作成してください。

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

概念的には、BM25 生成 sparse field の追加には次の schema 変更が含まれます。

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

リクエストが成功すると、`describe_collection()` は collection schema 内に新しい `text_sparse` field と `text_bm25` function の両方を返します。完全な BM25 search ワークフローについては、[Full Text Search](./full-text-search) を参照してください。

Zilliz Cloud は、重複に近いデータの検出のために、MinHash 生成の binary vector field もサポートしています。MinHash function は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力 field に書き込みます。設定の詳細は、[MinHash Function](./minhash-function) を参照してください。

## 既存の collection から field を削除する\{#drop-fields-from-an-existing-collection}

既存の collection から field を削除する方法は 2 つあります。ユーザー定義の scalar または vector field が collection モデルの一部でなくなった場合は、直接削除します。function によって生成される field は、それを生成している function を削除することで削除します。

### ユーザー定義 field を削除する\{#drop-user-defined-fields}

collection モデルの一部でなくなったユーザー定義 scalar または vector field を削除するには、`drop_collection_field()` を使用します。

field を削除すると、まず collection schema と field の可視性が変更されます。

- `drop_collection_field()` が成功すると、collection schema は更新されます。`describe_collection()` は削除された field を返さなくなり、クエリや検索でも `output_fields` でその field を返したり、式で使用したりできなくなります。

- 削除された field 上に作成された index は、schema 更新の一部としてクリーンアップされます。

ストレージのクリーンアップは schema のクリーンアップとは別に処理されます。詳細は、[field を削除した後、ストレージ容量はいつ回収されますか？](./add-fields-to-an-existing-collection) を参照してください。

**例: ユーザー定義 scalar field を削除する**

次の例では、`experiment_tag` が `product_catalog` 内のユーザー定義 scalar field であることを前提に、その field を collection から削除します。

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

field を削除した後、`describe_collection()` を呼び出して、その field が schema の一部でなくなったことを確認できます。

**例: StructArray field を削除する**

次の例では、`chunks` field が `my_collection` 内の StructArray field であることを前提に、その field を collection から削除します。

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

**例: ユーザー定義 vector field を削除する**

同じ `drop_collection_field()` メソッドで vector field も削除できますが、削除後も collection には少なくとも 1 つの vector field が残っていなければなりません。これは、一時的に複数の vector 表現を持つ collection が、後でそのうち 1 つに標準化する場合に便利です。

次の例では、`image_vector` が `hybrid_catalog` 内のユーザー定義 vector field であり、collection に `text_vector` のような別の vector field がまだ残っていることを前提にしています。

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

`image_vector` が collection 内の最後の vector field である場合、削除操作は拒否されます。

### 関数によって生成される vector field を削除する\{#drop-vector-fields-generated-by-functions}

BM25 生成 sparse vector field のように、function によって生成される vector field が不要になった場合は、この操作を使用します。

生成 vector field を削除するには、それを生成している function に対して `drop_collection_function()` を呼び出します。このワークフローでは、Zilliz Cloud は collection schema から function を削除し、同時にその生成 vector 出力 field も削除します。

function の入力 field や function の出力 field に対して `drop_collection_field()` を呼び出さないでください。対象 field が function 出力 field である場合は、代わりに `drop_collection_function()` を呼び出してください。function の入力 field は、function を削除した後も保持されます。

**例: function によって生成される field を削除する**

次の例では、`text_bm25` が `product_catalog` 内の BM25 function であり、`text_sparse` という名前の sparse vector 出力 field を生成していることを前提としています。

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

操作が成功すると、`describe_collection()` は削除された function とその生成出力 field を返さなくなります。function の入力 field は schema に残ります。

function の出力 field を削除すると collection に vector field が 1 つも残らなくなる場合、その操作は拒否されます。

## FAQ\{#faq}

### どの field 追加メソッドを使うべきですか？\{#which-add-field-method-should-i-use}

アプリケーションがフィルタリング、クエリ出力、またはアプリケーションロジックのための scalar 値を提供する場合、ユーザー定義 scalar field の追加には `add_collection_field()` を使用します。

アプリケーションが埋め込みを生成し、vector 値を Zilliz Cloud に書き込む場合、ユーザー定義 vector field の追加には `add_collection_field()` を使用します。

Zilliz Cloud が既存の field から vector 値を生成すべき場合は、生成 vector field のワークフローを使用します。このガイドでは、語彙検索のために `add_function_field()` を使った BM25 の手順を示しています。Zilliz Cloud は、重複に近いデータの検出のための MinHash 生成 binary vector field もサポートしています。

### 追加するユーザー定義 field はなぜ nullable でなければならないのですか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しい field が存在する前に insert されているため、その field の値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、または scalar field の場合はデフォルト値が適用されるまで、Zilliz Cloud はその欠損値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加されるユーザー定義 scalar field とユーザー定義 vector field に適用されます。nullable にできない function 生成 vector field には適用されません。

### ユーザー定義 field を追加した後、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義 scalar field の場合、`default_value` を設定しない限り、既存のエンティティは `NULL` を返します。`default_value` を設定した場合、既存のエンティティはそのデフォルト値を返します。

ユーザー定義 vector field の場合、既存のエンティティは新しい vector field に対して `NULL` を持ちます。追加した field に対する vector search では、vector 値が `NULL` のエンティティはスキップされます。既存のエンティティを新しい vector field 経由で検索可能にするには、upsert またはバックフィルワークフローを通じて `NULL` でない vector 値を書き込んでください。新しいエンティティは insert 時に新しい vector field を含めることができます。

### 既存の collection に BM25 語彙検索を追加できますか？\{#can-i-add-bm25-lexical-search-to-an-existing-collection}

はい。collection にすでに analyzer が有効な `VARCHAR` または `TEXT` field がある場合、語彙検索のために BM25 生成 sparse vector field を追加できます。このワークフローでは、Zilliz Cloud は新しい `SPARSE_FLOAT_VECTOR` 出力 field と、その値を生成する BM25 function を追加します。

BM25 生成 sparse vector field を追加した後、その field を BM25 search に使用する前に、`metric_type="BM25"` を指定した `SPARSE_INVERTED_INDEX` index を作成してください。

### function によって生成される vector field を直接削除できますか？\{#can-i-drop-a-vector-field-generated-by-a-function-directly}

いいえ。function によって生成される vector field は、その function の schema 契約の一部です。代わりに `drop_collection_function()` を使用してください。この schema 変更ワークフローでは、Zilliz Cloud は function とその生成 vector 出力 field をまとめて削除し、入力 field は保持します。

### collection schema を変更した後、待つ必要はありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動で待機する必要はありません。次の操作が更新済み schema に依存する場合は、先に `describe_collection()` を呼び出して、Zilliz Cloud が現在返している schema を確認できます。

分散デプロイメントでは、Zilliz Cloud の各コンポーネントが collection メタデータを更新する間に、短い伝播時間が発生することがあります。schema 変更の直後の操作が schema 関連エラーで失敗した場合は、schema を更新してから操作を再試行してください。

### field を削除した後、ストレージ容量はいつ回収されますか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

field を削除すると、現在の schema および通常のクエリ/検索の可視性からは取り除かれますが、その field の履歴データが object storage からすぐに物理削除されるわけではありません。

ストレージ容量は、後で compaction 中に回収される可能性があります。compaction は、既存のデータファイルをよりコンパクトな新しいファイルに再編成するバックグラウンドプロセスです。field が削除された後、新しく compaction されたファイルは現在の schema に従い、削除された field を含みません。Zilliz Cloud は、field 削除後のストレージ容量削減について、即時または固定時間での実施を保証しません。

### dynamic field のキーと同じ名前の scalar field を追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

dynamic field が有効な場合、既存の dynamic field キーと同じ名前の scalar field を追加できます。新しい scalar field は通常のクエリ出力では dynamic field キーをマスクしますが、元の dynamic データは `$meta` に保持されます。

たとえば、既存のエンティティが `source` という名前の dynamic キーを保存していて、その後に `source` という名前の scalar field を追加した場合、通常の `source` 出力は scalar field を指します。元の dynamic 値にアクセスするには、`$meta["source"]` のような $meta パス構文を使用してください。
