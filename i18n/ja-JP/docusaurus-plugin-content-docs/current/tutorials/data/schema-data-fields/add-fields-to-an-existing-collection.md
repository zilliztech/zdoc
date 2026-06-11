---
title: "コレクションスキーマの変更 | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_key: add-fields-to-an-existing-collection
sidebar_label: "コレクションスキーマの変更"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "コレクションが開発段階から本番環境へ移行するにつれて、各エンティティに関連するフィールドは頻繁に変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` などのスカラーフィールドを追加したり、アプリケーションが生成した埋め込み用の新しいベクトルフィールドを追加したりできます。コレクションスキーマの変更では、コレクションを作成し直す代わりに、サポートされているフィールド変更をその場で実行できます。 | Cloud"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 19
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - field properties
  - add collection fields

---

import Admonition from '@theme/Admonition';


# コレクションスキーマの変更

コレクションが開発段階から本番環境へ移行するにつれて、各エンティティに関連するフィールドは頻繁に変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` などのスカラーフィールドを追加したり、アプリケーションが生成した埋め込み用の新しいベクトルフィールドを追加したりできます。コレクションスキーマの変更では、コレクションを作成し直す代わりに、サポートされているフィールド変更をその場で実行できます。

<Admonition type="info" icon="📘" title="Notes">

<p>このガイドでは、既存のコレクションに対するフィールドレベルのスキーマ変更について説明します。<code>VARCHAR</code> フィールドの <code>max_length</code> や <code>ARRAY</code> フィールドの <code>max_capacity</code> の変更など、フィールドプロパティの変更については「Alter Collection Field」を参照してください。動的フィールドの動作については、<a href="./enable-dynamic-field">Dynamic Field</a> と <a href="./modify-collections">Modify Collection</a> を参照してください。</p>

</Admonition>

## 制限\{#limits}

- 追加するユーザー定義フィールドは null 許容である必要があります。`add_collection_field()` を呼び出すときに `nullable=True` を設定してください。既存のエンティティでは、`default_value` を指定してスカラーフィールドを追加した場合を除き、追加されたフィールドは `NULL` になります。

- ユーザー定義スカラーフィールドの追加は Milvus 2.6.x 以降でサポートされています。ユーザー定義ベクトルフィールドの追加は Milvus 2.6.18 以降でサポートされています。

- フィールド名は、コレクション内のフィールド間で一意である必要があります。

<Admonition type="info" icon="📘" title="Notes">

<p>サポートされている追加および削除操作以外のスキーマ変更では、コレクションを作成し直すか、移行してください。</p>

</Admonition>

## 既存のコレクションにフィールドを追加する\{#add-fields-to-an-existing-collection}

フィールド値がどのように生成されるかに応じて、追加するフィールドの種類を選択してください。

- フィルタリング、クエリ出力、アプリケーションロジックのために新しいメタデータが必要な場合は、[ユーザー定義スカラーフィールドを追加する](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields)を参照してください。

- アプリケーションが埋め込みを生成し、そのベクトル値を Zilliz Cloud に書き込む場合は、[ユーザー定義ベクトルフィールドを追加する](./add-fields-to-an-existing-collection#add-user-defined-vector-fields)を参照してください。

これらの場合、フィールドの総数は Zilliz Cloud のフィールド数制限を超えることはできません。詳細については、[Zilliz Cloud の制限](./limits#fields)を参照してください。

### ユーザー定義スカラーフィールドを追加する\{#add-user-defined-scalar-fields}

既存のコレクションにユーザー定義スカラーフィールドを追加するには、`add_collection_field()` を使用します。

これは、動的フィールドに任意のキーを保存する方法とは異なります。スキーマ更新が利用可能になると、新しいスカラーフィールドはコレクションスキーマの通常の一部になります。そのフィールドに値を insert または upsert したり、サポートされている場合はインデックスを作成したり、クエリや検索フィルターで使用したり、クエリまたは検索の出力で返したりできます。

既存のエンティティは新しいフィールドが存在する前に挿入されているため、追加するすべてのユーザー定義スカラーフィールドは null 許容である必要があります。

- `nullable=True` を設定し、`default_value` を指定せずにスカラーフィールドを追加した場合、既存のエンティティでは新しいフィールドが `NULL` として返されます。

- `nullable=True` と `default_value` を指定してスカラーフィールドを追加した場合、既存のエンティティでは `NULL` ではなくデフォルト値が返されます。

スカラーのフィルター式は、`NULL` のスカラー値には一致しません。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

**例: null 許容スカラーフィールドを追加する**

次の例では、`product_catalog` という既存のコレクションに、null 許容の `source` フィールドを追加します。

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

フィールドが追加された後、コレクション内にすでに存在していたエンティティでは `source` が `NULL` として返されます。新しいエンティティでは、insert または upsert 時に `source` を設定できます。

**例: デフォルト値付きのスカラーフィールドを追加する**

既存のエンティティで `NULL` ではなく具体的な値を返したい場合は、フィールドを追加するときに `default_value` を指定します。次の例では、`review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

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

フィールドが追加された後、コレクション内にすでに存在していたエンティティでは `review_status` が `"unreviewed"` として返されます。新しいエンティティでは別の値を設定することも、値が指定されていない場合にデフォルト値を使用することもできます。

### ユーザー定義ベクトルフィールドを追加する\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、そのベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

追加するすべてのユーザー定義ベクトルフィールドは null 許容である必要があります。upsert またはバックフィルワークフローでベクトル値を書き込むまで、既存のエンティティでは新しいベクトルフィールドが `NULL` になります。新しいエンティティでは、insert 時にベクトルフィールドを含めることができます。ベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

**例: null 許容ベクトルフィールドを追加する**

次の例では、`embedding_v2` という null 許容の密ベクトルフィールドを既存のコレクションに追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定してください。

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

フィールドを追加した後、そのフィールドで検索する前に新しいベクトルフィールドにインデックスを作成します。

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

既存のエンティティでは `embedding_v2` が `NULL` になり、このフィールドで検索するときはスキップされます。既存のエンティティを `embedding_v2` で検索可能にするには、upsert ワークフローで非 `NULL` のベクトル値を書き込んでください。新しいエンティティでは、insert 時に `embedding_v2` を含めることができます。

## FAQ\{#faq}

### 追加するユーザー定義フィールドはなぜ null 許容である必要があるのですか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しいフィールドが存在する前に挿入されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、またはスカラーフィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud は欠落した値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加されるユーザー定義スカラーフィールドとユーザー定義ベクトルフィールドに適用されます。関数によって生成されるベクトルフィールドには適用されません。関数生成のベクトルフィールドは null 許容にできません。

### ユーザー定義フィールドを追加すると、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義スカラーフィールドの場合、`default_value` を設定しない限り、既存のエンティティでは `NULL` が返されます。`default_value` を設定した場合、既存のエンティティではそのデフォルト値が返されます。

ユーザー定義ベクトルフィールドの場合、既存のエンティティでは新しいベクトルフィールドが `NULL` になります。追加されたフィールドでベクトル検索を実行すると、ベクトル値が `NULL` のエンティティはスキップされます。既存のエンティティを新しいベクトルフィールドで検索可能にするには、upsert またはバックフィルワークフローで非 `NULL` のベクトル値を書き込んでください。新しいエンティティでは、insert 時に新しいベクトルフィールドを含めることができます。

### コレクションスキーマの変更後、待機する必要がありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動で待機する必要はありません。次の操作が更新後のスキーマに依存する場合は、まず `describe_collection()` を呼び出して、Zilliz Cloud が現在返すスキーマを確認できます。

分散デプロイメントでは、Zilliz Cloud のコンポーネントがコレクションメタデータを更新する間、短い伝播期間が発生することがあります。スキーマ変更の直後に実行した操作がスキーマ関連のエラーで失敗した場合は、スキーマを更新して操作を再試行してください。

### 動的フィールドキーと同じ名前のスカラーフィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

動的フィールドが有効になっている場合、既存の動的フィールドキーと同じ名前のスカラーフィールドを追加できます。新しいスカラーフィールドは通常のクエリ出力で動的フィールドキーをマスクしますが、元の動的データは `$meta` に保持されます。

たとえば、既存のエンティティに `source` という動的キーが保存されていて、その後 `source` というスカラーフィールドを追加した場合、通常の出力での `source` はスカラーフィールドを指します。元の動的値にアクセスするには、`$meta["source"]` などの $meta パス構文を使用します。
