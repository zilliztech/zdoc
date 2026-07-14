---
title: "NGRAM | Cloud"
slug: /ngram-index-type
sidebar_label: "NGRAM"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリおよび適用可能な正規表現フィルタを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを固定長 n の短い重なり合う部分文字列（n-gram と呼ばれる）に分割します。たとえば、n = 3 の場合、単語 \"Zilliz Cloud\" は 3-gram の \"Mil\"、\"ilv\"、\"lvu\"、\"vus\" に分割されます。これらの n-gram はその後、各 gram をそれが出現するドキュメント ID にマッピングする倒立インデックスに保存されます。クエリ時には、このインデックスにより、元のフィルタ条件を検証する前に、Zilliz Cloud は検索対象を少数の候補にすばやく絞り込めます。 | Cloud"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NGRAM

Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリおよび適用可能な正規表現フィルタを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを固定長 *n* の短い重なり合う部分文字列（*n-grams* と呼ばれる）に分割します。たとえば、*n = 3* の場合、*"Zilliz Cloud"* という単語は 3-gram として *"Mil"*、*"ilv"*、*"lvu"*、*"vus"* に分割されます。これらの n-gram はその後、各 gram をそれが出現するドキュメント ID にマッピングする倒立インデックスに保存されます。クエリ時には、このインデックスにより、元のフィルタ条件を検証する前に、Zilliz Cloud は検索対象を少数の候補にすばやく絞り込めます。

次のような高速な prefix、suffix、infix、wildcard、または適用可能な正規表現フィルタリングが必要な場合に使用します。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

- `message =~ "error.*timeout"`

- `url =~ "/api/v[0-9]+/users"`

<Admonition type="info" icon="📘" title="注記">

`LIKE` および正規表現フィルタ式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

</Admonition>

## 仕組み\{#how-it-works}

Zilliz Cloud は `NGRAM` インデックスを 2 段階のプロセスで実装します。

1. **インデックスを構築**: 各ドキュメントに対して n-gram を生成し、取り込み時に倒立インデックスを構築します。

1. **クエリを高速化** : インデックスを使用して候補セットを小さく絞り込み、その後で正確な一致を検証します。

### フェーズ 1: インデックスを構築する\{#phase-1-build-the-index}

データ取り込み時に、Zilliz Cloud は 2 つの主なステップを実行して NGRAM インデックスを構築します。

1. **テキストを n-gram に分解**: Zilliz Cloud は対象フィールド内の各文字列に対して長さ *n* のウィンドウをスライドさせ、重なり合う部分文字列、すなわち *n-grams* を抽出します。これらの部分文字列の長さは、設定可能な範囲 `[min_gram, max_gram]` に収まります。

- `min_gram`: 生成する最短の n-gram。これは、インデックスの恩恵を受けられるクエリ部分文字列の最小長も定義します。

- `max_gram`: 生成する最長の n-gram。クエリ時には、長いクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

たとえば、`min_gram=2` および `max_gram=3` の場合、文字列 `"AI database"` は次のように分解されます。

![Build Ngram Index](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/build-ngram-index.png)

- **2-grams:** `AI`, `I_`, `_d`, `da`, `at`, ...

- **3-grams:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

<div class="alert note">

- 範囲 `[min_gram, max_gram]` に対して、Zilliz Cloud はその 2 つの値の間（両端を含む）のすべての長さについて n-gram を生成します。たとえば、`[2,4]` と単語 `"text"` の場合、Zilliz Cloud は次を生成します。

- **2-grams:** `te`, `ex`, `xt`

- **3-grams:** `tex`, `ext`

- **4-grams:** `text`

- N-gram 分解は文字ベースであり、言語に依存しません。たとえば、中国語では、`min_gram = 2` の `"向量数据库"` は `"向量"`、`"量数"`、`"数据"`、`"据库"` に分解されます。

- 分解時には、スペースや句読点も文字として扱われます。

- 分解では元の大文字小文字が保持され、一致は大文字小文字を区別します。たとえば、`"Database"` と `"database"` は異なる n-gram を生成し、クエリ時には正確な大文字小文字の一致が必要です。

</div>

1. **倒立インデックスを構築**: 生成された各 n-gram を、それを含むドキュメント ID のリストにマッピングする **倒立インデックス** が作成されます。

たとえば、2-gram `"AI"` が ID 1、5、6、8、9 のドキュメントに出現する場合、インデックスには `{"AI": [1, 5, 6, 8, 9]}` と記録されます。このインデックスは、クエリ時に検索範囲をすばやく絞り込むために使用されます。

![Build Ngram Index 2](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/build-ngram-index-2.png)

<div class="alert note">

より広い `[min_gram, max_gram]` の範囲では、より多くの gram と、より大きなマッピングリストが作成されます。メモリが逼迫している場合は、非常に大きな posting list に対して mmap モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

</div>

### フェーズ 2: クエリを高速化する\{#phase-2-accelerate-queries}

`LIKE` フィルタまたは適用可能な正規表現フィルタが実行されると、Zilliz Cloud は次のステップで NGRAM インデックスを使用してクエリを高速化します。

![Accelerate Queries](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/accelerate-queries.png)

1. **クエリ語を抽出:** `LIKE` 式からワイルドカードを含まない連続した部分文字列が抽出されます（例: `"%database%"` は `"database"` になります）。正規表現フィルタの場合、Zilliz Cloud は可能であれば正規表現パターンから固定のリテラル部分文字列を抽出します。たとえば、`message =~ "error.*timeout"` には `error` と `timeout` というリテラルが含まれます。

1. **クエリ語を分解:** クエリ語は、その長さ (`L`) と `min_gram` および `max_gram` の設定に基づいて *n-grams* に分解されます。

- `L < min_gram` の場合、インデックスは使用できず、クエリはフルスキャンにフォールバックします。

- `min_gram ≤ L ≤ max_gram` の場合、クエリ語全体が単一の n-gram として扱われるため、追加の分解は不要です。

- `L > max_gram` の場合、クエリ語は `max_gram` に等しいウィンドウサイズを使用して重なり合う gram に分割されます。

たとえば、`max_gram` が `3` に設定され、長さ **8** のクエリ語が `"database"` の場合、これは `"dat"`、`"ata"`、`"tab"` などの 3-gram 部分文字列に分解されます。

1. **各 gram を検索して積集合を取る**: Zilliz Cloud はクエリ gram のそれぞれを倒立インデックスで検索し、得られたドキュメント ID リストの積集合を取ることで、小さな候補ドキュメント集合を見つけます。これらの候補には、クエリに含まれるすべての gram が含まれています。

1. **検証して結果を返す:** その後、元の `LIKE` または正規表現フィルタが、小さな候補集合のみに対して最終チェックとして適用され、正確な一致を見つけます。

## NGRAM インデックスを作成する\{#create-an-ngram-index}

`VARCHAR` フィールド、または `JSON` フィールド内の特定のパスに対して NGRAM インデックスを作成できます。

### 例 1: VARCHAR フィールドに作成する\{#example-1-create-on-a-varchar-field}

`VARCHAR` フィールドの場合、`field_name` を指定し、`min_gram` と `max_gram` を設定するだけです。

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

この設定では、`text` 内の各文字列に対して 2-gram と 3-gram が生成され、それらが倒立インデックスに保存されます。

### 例 2: JSON パスに作成する\{#example-2-create-on-a-json-path}

`JSON` フィールドの場合、gram の設定に加えて、次も指定する必要があります。

- `params.json_path` – インデックス化したい値を指す JSON パス。

- `params.json_cast_type` – NGRAM インデックスは文字列に対して動作するため、`"varchar"`（大文字小文字を区別しない）である必要があります。

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

- `json_field["body"]` にある値のみがインデックス化されます。

- n-gram トークン化の前に、その値は `VARCHAR` にキャストされます。

- Zilliz Cloud は長さ 2 から 4 の部分文字列を生成し、それらを倒立インデックスに保存します。

JSON フィールドのインデックス化方法の詳細については、[JSON Indexing](./json-indexing) を参照してください。

## NGRAM によって高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAM インデックスを適用するには、次の条件を満たす必要があります。

- クエリは、`NGRAM` インデックスが付いた `VARCHAR` フィールド（または JSON パス）を対象にしている必要があります。

- `LIKE` パターンのリテラル部分は、少なくとも `min_gram` 文字の長さが必要です。

    *(たとえば、想定される最短のクエリ語が 2 文字なら、インデックス作成時に min_gram=2 を設定します。)*

サポートされるクエリタイプ:

- **前方一致**

```python # Match any string that starts with the substring "database" filter = 'text LIKE "database%"'` ``

- **後方一致**

```python # Match any string that ends with the substring "database" filter = 'text LIKE "%database"'` ``

- **中間一致**

```python # Match any string that contains the substring "database" anywhere filter = 'text LIKE "%database%"'` ``

- **ワイルドカード一致**

Zilliz Cloud は `%`（0 文字以上）と `_`（ちょうど 1 文字）の両方をサポートします。

```python # Match any string where "st" appears first, and "um" appears later in the text filter = 'text LIKE "%st%um%"'` ``

- **JSON パスクエリ**

```python filter = 'json_field["body"] LIKE "%database%"'` ``

- **正規表現フィルタ**

```python # Match log messages that contain "error" followed later by "timeout" filter = 'text =~ "error.*timeout"'` ``

- **JSON パスに対する正規表現フィルタ**

```python filter = 'json_field["body"] =~ "error.*timeout"'` ``

フィルタ式構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

## インデックスを削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、collection から既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="注記">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になった scalar index を直接削除できます。先に collection を release する必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="Documents",   # Name of the collection
    index_name="ngram_index" # Name of the index to drop
)
```

## 使用上の注意\{#usage-notes}

- **フィールド型**: `VARCHAR` および `JSON` フィールドでサポートされます。JSON の場合は、`params.json_path` と `params.json_cast_type="varchar"` の両方を指定してください。

- **正規表現の高速化**: `NGRAM` は、Zilliz Cloud が正規表現パターンから固定のリテラル部分文字列を抽出できる場合にのみ、正規表現フィルタを高速化します。`[a-z]+` のようなパターンは固定リテラルを含まないため、スキャンにフォールバックすることがあります。

- **大文字小文字を区別しない正規表現**: `(?i)` を含む正規表現パターンはサポートされていますが、インデックスが元の大文字小文字を保持するため、`NGRAM` 最適化をスキップする場合があります。

- **検証ステップ**: 正規表現フィルタでは、`NGRAM` は候補を生成し、Zilliz Cloud は完全な RE2 正規表現パターンでそれらを検証します。そのため、インデックス高速化によって一致結果が変わることはありません。

- **Unicode**: NGRAM 分解は文字ベースであり、言語に依存せず、空白や句読点も含みます。

- **空間と時間のトレードオフ**: より広い gram 範囲 `[min_gram, max_gram]` は、より多くの gram とより大きなインデックスを生成します。メモリが逼迫している場合は、大きな posting list に対して `mmap` モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

- **不変性**: `min_gram` と `max_gram` はその場では変更できません。調整するにはインデックスを再構築してください。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせて min_gram と max_gram を選ぶ**

    - `min_gram=2`, `max_gram=3` から始めます。

    - `min_gram` は、ユーザーが入力すると想定される最短のリテラルに設定します。

    - `max_gram` は、意味のある部分文字列の一般的な長さに近づけて設定します。`max_gram` を大きくするとフィルタリングは向上しますが、必要な領域は増加します。

- **選択性の低い gram を避ける**

    非常に繰り返しの多いパターン（例: `"aaaaaa"`）はフィルタリング効果が弱く、改善が限定的になる可能性があります。

- **一貫して正規化する**

    ユースケースで必要な場合は、取り込まれたテキストとクエリリテラルに同じ正規化（例: 小文字化、トリミング）を適用してください。

