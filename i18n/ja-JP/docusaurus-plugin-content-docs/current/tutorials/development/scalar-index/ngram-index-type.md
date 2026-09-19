---
title: "NGRAM | Cloud"
slug: /ngram-index-type
sidebar_label: "NGRAM"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリおよび適用可能な正規表現フィルタを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを、n-gram と呼ばれる固定長 n の短い重なり合う部分文字列に分割します。たとえば、n = 3 の場合、単語 \"Milvus\" は 3-gram の \"Mil\"、\"ilv\"、\"lvu\"、\"vus\" に分割されます。これらの n-gram はその後、各 gram をそれが出現するドキュメント ID にマッピングする転置インデックスに保存されます。クエリ時には、このインデックスにより、Zilliz Cloud は元のフィルタ条件を検証する前に検索対象を少数の候補にすばやく絞り込めます。 | Cloud"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NGRAM

Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリおよび適用可能な正規表現フィルタを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを、*n-grams* と呼ばれる固定長 *n* の短い重なり合う部分文字列に分割します。たとえば、*n = 3* の場合、単語 *"Milvus"* は 3-gram の *"Mil"*、*"ilv"*、*"lvu"*、*"vus"* に分割されます。これらの n-gram はその後、各 gram をそれが出現するドキュメント ID にマッピングする転置インデックスに保存されます。クエリ時には、このインデックスにより、Zilliz Cloud は元のフィルタ条件を検証する前に、検索対象を少数の候補にすばやく絞り込むことができます。

次のような高速なプレフィックス一致、サフィックス一致、中間一致、ワイルドカード一致、または適用可能な正規表現フィルタリングが必要な場合に使用します。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

- `message =~ "error.*timeout"`

- `url =~ "/api/v[0-9]+/users"`

<Admonition type="info" title="Notes">

`LIKE` および正規表現フィルタ式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

</Admonition>

## 仕組み\{#how-it-works}

Zilliz Cloud は `NGRAM` インデックスを 2 段階のプロセスで実装します。

1. **インデックスを構築**: 取り込み時に各ドキュメントの n-gram を生成し、転置インデックスを構築します。

1. **クエリを高速化** : インデックスを使用して少数の候補セットに絞り込み、その後で完全一致を検証します。

### フェーズ 1: インデックスを構築する\{#phase-1-build-the-index}

データ取り込み時に、Zilliz Cloud は 2 つの主要なステップを実行して NGRAM インデックスを構築します。

1. **テキストを n-gram に分解**: Zilliz Cloud は対象フィールド内の各文字列に対して長さ *n* のウィンドウをスライドさせ、重なり合う部分文字列（*n-grams*）を抽出します。これらの部分文字列の長さは、設定可能な範囲 `[min_gram, max_gram]` に収まります。

- `min_gram`: 生成する最短の n-gram。これは、インデックスの効果を得られるクエリ部分文字列の最小長も定義します。

- `max_gram`: 生成する最長の n-gram。クエリ時には、長いクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

たとえば、`min_gram=2` および `max_gram=3` の場合、文字列 `"AI database"` は次のように分解されます。

![Ngram インデックスの構築](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/build-ngram-index.png)

- **2-gram:** `AI`, `I_`, `_d`, `da`, `at`, ...

- **3-gram:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

<div class="alert note">

- 範囲 `[min_gram, max_gram]` に対して、Zilliz Cloud は 2 つの値の間（両端を含む）のすべての長さの n-gram を生成します。たとえば、`[2,4]` と単語 `"text"` の場合、Zilliz Cloud は次を生成します。

- **2-gram:** `te`, `ex`, `xt`

- **3-gram:** `tex`, `ext`

- **4-gram:** `text`

- N-gram 分解は文字ベースで言語に依存しません。たとえば、中国語では、`min_gram = 2` の `"向量数据库"` は `"向量"`、`"量数"`、`"数据"`、`"据库"` に分解されます。

- 分解時には、スペースと句読点も文字として扱われます。

- 分解では元の大文字小文字が保持され、マッチングでは大文字小文字が区別されます。たとえば、`"Database"` と `"database"` は異なる n-gram を生成し、クエリ時には正確な大文字小文字の一致が必要です。

</div>

1. **転置インデックスを構築**: 生成された各 n-gram を、それを含むドキュメント ID のリストにマッピングする**転置インデックス**が作成されます。

たとえば、2-gram の `"AI"` が ID 1、5、6、8、9 のドキュメントに出現する場合、インデックスには `{"AI": [1, 5, 6, 8, 9]}` が記録されます。このインデックスは、クエリ時に検索範囲をすばやく絞り込むために使用されます。

![Ngram インデックスの構築 2](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/build-ngram-index-2.png)

<div class="alert note">

`[min_gram, max_gram]` の範囲が広いほど、生成される gram とマッピングリストが増えます。メモリが逼迫している場合は、非常に大きな posting list に対して mmap モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

</div>

### フェーズ 2: クエリを高速化する\{#phase-2-accelerate-queries}

`LIKE` フィルタまたは適用可能な正規表現フィルタが実行されると、Zilliz Cloud は次の手順で NGRAM インデックスを使用してクエリを高速化します。

![クエリの高速化](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/accelerate-queries.png)

1. **クエリ語を抽出:** ワイルドカードを含まない連続した部分文字列が `LIKE` 式から抽出されます（例: `"%database%"` は `"database"` になります）。正規表現フィルタの場合、Zilliz Cloud は可能な場合に正規表現パターンから固定のリテラル部分文字列を抽出します。たとえば、`message =~ "error.*timeout"` にはリテラル `error` と `timeout` が含まれます。

1. **クエリ語を分解:** クエリ語は、その長さ（`L`）と `min_gram` および `max_gram` の設定に基づいて *n-grams* に分解されます。

- `L < min_gram` の場合、インデックスは使用できず、クエリはフルスキャンにフォールバックします。

- `min_gram ≤ L ≤ max_gram` の場合、クエリ語全体が単一の n-gram として扱われ、それ以上の分解は不要です。

- `L > max_gram` の場合、クエリ語は `max_gram` に等しいウィンドウサイズを使用して、重なり合う gram に分割されます。

たとえば、`max_gram` が `3` に設定されていて、クエリ語が長さ **8** の `"database"` である場合、`"dat"`、`"ata"`、`"tab"` などの 3-gram の部分文字列に分解されます。

1. **各 gram を検索して交差する**: Zilliz Cloud はクエリの各 gram を転置インデックスで検索し、得られたドキュメント ID のリストを交差させて、少数の候補ドキュメントを見つけます。これらの候補には、クエリのすべての gram が含まれています。

1. **検証して結果を返す:** その後、元の `LIKE` または正規表現フィルタが最終チェックとして少数の候補セットにのみ適用され、完全一致が見つけられます。

## NGRAM インデックスを作成する\{#create-an-ngram-index}

NGRAM インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定のパスに作成できます。

### 例 1: VARCHAR フィールドに作成する\{#example-1-create-on-a-varchar-field}

`VARCHAR` フィールドの場合は、`field_name` を指定し、`min_gram` と `max_gram` を設定するだけです。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address

# Assume you have defined a VARCHAR field named "text" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add NGRAM index on the "text" field
# highlight-start
index_params.add_index(
    field_name="text",   # Target VARCHAR field
    index_type="NGRAM",           # Index type is NGRAM
    index_name="ngram_index",     # Custom name for the index
    min_gram=2,                   # Minimum substring length (e.g., 2-gram: "st")
    max_gram=3                    # Maximum substring length (e.g., 3-gram: "sta")
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この設定では、`text` 内の各文字列に対して 2-gram と 3-gram が生成され、転置インデックスに保存されます。

### 例 2: JSON パスに作成する\{#example-2-create-on-a-json-path}

`JSON` フィールドの場合は、gram 設定に加えて、次も指定する必要があります。

- `params.json_path` – インデックスを作成する値を指す JSON パス。

- `params.json_cast_type` – `"varchar"`（大文字小文字を区別しません）である必要があります。NGRAM インデックスは文字列を対象に動作するためです。

```python
# Assume you have defined a JSON field named "json_field" in your collection schema, with a JSON path named "body"

# Prepare index parameters
index_params = client.prepare_index_params()

# Add NGRAM index on a JSON field
# highlight-start
index_params.add_index(
    field_name="json_field",              # Target JSON field
    index_type="NGRAM",                   # Index type is NGRAM
    index_name="json_ngram_index",        # Custom index name
    min_gram=2,                           # Minimum n-gram length
    max_gram=4,                           # Maximum n-gram length
    params={
        "json_path": "json_field[\"body\"]",  # Path to the value inside the JSON field
        "json_cast_type": "varchar"                  # Required: cast the value to varchar
    }
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この例では:

- `json_field["body"]` の値のみがインデックス化されます。

- 値は n-gram トークン化の前に `VARCHAR` にキャストされます。

- Zilliz Cloud は長さ 2 から 4 の部分文字列を生成し、それらを転置インデックスに保存します。

JSON フィールドのインデックス作成方法の詳細については、[JSON Indexing](./json-indexing) を参照してください。

## NGRAM で高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAM インデックスが適用されるには、次の条件を満たす必要があります。

- クエリは、`NGRAM` インデックスが付いた `VARCHAR` フィールド（または JSON パス）を対象にしている必要があります。

- `LIKE` パターンのリテラル部分は、少なくとも `min_gram` 文字の長さである必要があります。

    *(たとえば、想定される最短のクエリ語が 2 文字の場合、インデックス作成時に min_gram=2 を設定します。)*

サポートされるクエリタイプ:

- **プレフィックス一致**

```python # Match any string that starts with the substring "database" filter = 'text LIKE "database%"'` ``

- **Suffix match**

```python # Match any string that ends with the substring "database" filter = 'text LIKE "%database"'` ``

- **Infix match**

```python # Match any string that contains the substring "database" anywhere filter = 'text LIKE "%database%"'` ``

- **Wildcard match**

Zilliz Cloud supports both `%` (zero or more characters) and `_` (exactly one character).

```python # Match any string where "st" appears first, and "um" appears later in the text filter = 'text LIKE "%st%um%"'` ``

- **JSON path queries**

```python filter = 'json_field["body"] LIKE "%database%"'` ``

- **Regex filter**

```python # Match log messages that contain "error" followed later by "timeout" filter = 'text =~ "error.*timeout"'` ``

- **Regex filter on a JSON path**

```python filter = 'json_field["body"] =~ "error.*timeout"'` ``

For more information on filter expression syntax, refer to [Pattern Matching](./pattern-match).

## Drop an index\{#drop-an-index}

Use the `drop_index()` method to remove an existing index from a collection.

<Admonition type="info" title="Notes">

In your cluster compatible with **Milvus v2.6.x**, you can drop a scalar index directly once it’s no longer needed—no need to release the collection first.

</Admonition>

```python
client.drop_index(
    collection_name="Documents",   # Name of the collection
    index_name="ngram_index" # Name of the index to drop
)
```

## 使用上の注意\{#usage-notes}

- **フィールド型**: `VARCHAR` および `JSON` フィールドでサポートされます。JSON の場合は、`params.json_path` と `params.json_cast_type="varchar"` の両方を指定してください。

- **正規表現の高速化**: `NGRAM` が正規表現フィルタを高速化するのは、Zilliz Cloud が正規表現パターンから固定のリテラル部分文字列を抽出できる場合のみです。`[a-z]+` のようなパターンは固定リテラルを含まないため、スキャンにフォールバックすることがあります。

- **大文字小文字を区別しない正規表現**: `(?i)` を含む正規表現パターンはサポートされていますが、インデックスが元の大文字小文字を保持するため、`NGRAM` による最適化がスキップされる場合があります。

- **検証ステップ**: 正規表現フィルタの場合、`NGRAM` が候補を生成し、Zilliz Cloud が完全な RE2 正規表現パターンでそれらを検証します。そのため、インデックスの高速化によって一致結果が変わることはありません。

- **Unicode**: NGRAM 分解は文字ベースで言語に依存せず、空白と句読点も含みます。

- **空間と時間のトレードオフ**: gram 範囲 `[min_gram, max_gram]` が広いほど、生成される gram が増え、インデックスが大きくなります。メモリが逼迫している場合は、大きな posting list に対して `mmap` モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

- **不変性**: `min_gram` と `max_gram` はその場では変更できません。変更するにはインデックスを再構築してください。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせて `min_gram` と `max_gram` を選ぶ**

    - `min_gram=2`、`max_gram=3` から始めます。

    - `min_gram` は、ユーザーが入力すると想定される最短のリテラルに設定します。

    - `max_gram` は、意味のある部分文字列の一般的な長さに近づけて設定します。`max_gram` を大きくするとフィルタリング性能は向上しますが、必要な領域は増加します。

- **選択性の低い gram を避ける**

    繰り返しの多いパターン（例: `"aaaaaa"`）はフィルタリング効果が弱く、得られる効果は限定的な場合があります。

- **一貫した正規化を行う**

    ユースケースで必要な場合は、取り込まれるテキストとクエリのリテラルに同じ正規化（例: 小文字化、トリム）を適用してください。
