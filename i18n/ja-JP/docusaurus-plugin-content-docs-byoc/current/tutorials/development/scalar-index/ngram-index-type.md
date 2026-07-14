---
title: "NGRAM | BYOC"
slug: /ngram-index-type
sidebar_label: "NGRAM"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールド、または `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリや適用可能な regex フィルタを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを、n-gram と呼ばれる固定長 n の短い重なり合う部分文字列に分割します。たとえば、n = 3 の場合、単語 \"Zilliz Cloud\" は 3-gram の \"Mil\"、\"ilv\"、\"lvu\"、\"vus\" に分割されます。これらの n-gram はその後、各 gram をそれが出現するドキュメント ID に対応付ける転置インデックスに格納されます。クエリ時には、このインデックスにより、元のフィルタ条件を検証する前に Zilliz Cloud が検索対象を少数の候補にすばやく絞り込めるようになります。 | BYOC"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NGRAM

Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールド、または `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリや適用可能な regex フィルタを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを、*n-gram* と呼ばれる固定長 *n* の短い重なり合う部分文字列に分割します。たとえば、*n = 3* の場合、単語 *"Zilliz Cloud"* は 3-gram である *"Mil"*、*"ilv"*、*"lvu"*、*"vus"* に分割されます。これらの n-gram はその後、各 gram をそれが出現するドキュメント ID に対応付ける転置インデックスに格納されます。クエリ時には、このインデックスにより、元のフィルタ条件を検証する前に Zilliz Cloud が検索対象を少数の候補にすばやく絞り込めるようになります。

以下のような高速な prefix、suffix、infix、wildcard、または適用可能な regex フィルタリングが必要な場合に使用します。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

- `message =~ "error.*timeout"`

- `url =~ "/api/v[0-9]+/users"`

<Admonition type="info" icon="📘" title="注意">

`LIKE` および regex フィルタ式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

</Admonition>

## 仕組み\{#how-it-works}

Zilliz Cloud は、`NGRAM` インデックスを 2 段階のプロセスで実装します。

1. **インデックスの構築**: 取り込み時に各ドキュメントの n-gram を生成し、転置インデックスを構築します。

1. **クエリの高速化** : インデックスを使用して候補セットを小さく絞り込み、その後で完全一致を検証します。

### フェーズ 1: インデックスの構築\{#phase-1-build-the-index}

データ取り込み中、Zilliz Cloud は 2 つの主要なステップを実行して NGRAM インデックスを構築します。

1. **テキストを n-gram に分解**: Zilliz Cloud は対象フィールド内の各文字列に対して *n* のウィンドウをスライドさせ、重なり合う部分文字列、すなわち *n-gram* を抽出します。これらの部分文字列の長さは、設定可能な範囲 `[min_gram, max_gram]` に収まります。

- `min_gram`: 生成する最短の n-gram。これは、インデックスの恩恵を受けられる最短のクエリ部分文字列長も定義します。

- `max_gram`: 生成する最長の n-gram。クエリ時には、長いクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

たとえば、`min_gram=2` および `max_gram=3` の場合、文字列 `"AI database"` は次のように分解されます。

![Build Ngram Index](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/build-ngram-index.png)

- **2-grams:** `AI`, `I_`, `_d`, `da`, `at`, ...

- **3-grams:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

<div class="alert note">

- 範囲 `[min_gram, max_gram]` に対して、Zilliz Cloud は両方の値の間（両端含む）のすべての長さについて n-gram を生成します。たとえば、`[2,4]` と単語 `"text"` の場合、Zilliz Cloud は次を生成します。

- **2-grams:** `te`, `ex`, `xt`

- **3-grams:** `tex`, `ext`

- **4-grams:** `text`

- N-gram 分解は文字ベースで言語非依存です。たとえば、中国語では、`min_gram = 2` の `"向量数据库"` は `"向量"`、`"量数"`、`"数据"`、`"据库"` に分解されます。

- 分解時にはスペースと句読点も文字として扱われます。

- 分解では元の大文字・小文字が保持され、一致は大文字・小文字を区別します。たとえば、`"Database"` と `"database"` は異なる n-gram を生成し、クエリ時には正確な大文字・小文字一致が必要です。

</div>

1. **転置インデックスを構築**: 生成された各 n-gram を、それを含むドキュメント ID のリストに対応付ける **転置インデックス** が作成されます。

たとえば、2-gram `"AI"` が ID 1、5、6、8、9 のドキュメントに出現する場合、インデックスには `{"AI": [1, 5, 6, 8, 9]}` が記録されます。このインデックスはその後、クエリ時に検索範囲をすばやく絞り込むために使用されます。

![Build Ngram Index 2](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/build-ngram-index-2.png)

<div class="alert note">

より広い `[min_gram, max_gram]` 範囲では、より多くの gram とより大きなマッピングリストが作成されます。メモリが厳しい場合は、非常に大きな posting list に対して mmap モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

</div>

### フェーズ 2: クエリの高速化\{#phase-2-accelerate-queries}

`LIKE` フィルタまたは適用可能な regex フィルタが実行されると、Zilliz Cloud は以下の手順で NGRAM インデックスを使用してクエリを高速化します。

![Accelerate Queries](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/accelerate-queries.png)

1. **クエリ語句の抽出:** `LIKE` 式からワイルドカードを含まない連続部分文字列が抽出されます（例: `"%database%"` は `"database"` になります）。regex フィルタの場合、Zilliz Cloud は可能なときに regex パターンから固定のリテラル部分文字列を抽出します。たとえば、`message =~ "error.*timeout"` には `error` と `timeout` というリテラルが含まれます。

1. **クエリ語句の分解:** クエリ語句は、その長さ (`L`) と `min_gram` および `max_gram` の設定に基づいて *n-gram* に分解されます。

- `L < min_gram` の場合、インデックスは使用できず、クエリはフルスキャンにフォールバックします。

- `min_gram ≤ L ≤ max_gram` の場合、クエリ語句全体が単一の n-gram として扱われ、それ以上の分解は必要ありません。

- `L > max_gram` の場合、クエリ語句は `max_gram` に等しいウィンドウサイズを使用して重なり合う gram に分解されます。

たとえば、`max_gram` が `3` に設定され、長さ **8** のクエリ語句 `"database"` の場合、`"dat"`、`"ata"`、`"tab"` などの 3-gram 部分文字列に分解されます。

1. **各 gram を検索して積集合を取る**: Zilliz Cloud はクエリの各 gram を転置インデックスで検索し、結果として得られたドキュメント ID リストの積集合を取って、小さな候補ドキュメント集合を見つけます。これらの候補には、クエリに含まれるすべての gram が含まれています。

1. **検証して結果を返す:** その後、元の `LIKE` または regex フィルタが、小さな候補集合に対してのみ最終チェックとして適用され、正確な一致が見つけられます。

## NGRAM インデックスの作成\{#create-an-ngram-index}

`VARCHAR` フィールド、または `JSON` フィールド内の特定のパスに対して NGRAM インデックスを作成できます。

### 例 1: VARCHAR フィールドに作成\{#example-1-create-on-a-varchar-field}

`VARCHAR` フィールドの場合、`field_name` を指定し、`min_gram` と `max_gram` を設定するだけです。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # サーバーアドレスに置き換えてください

# collection schema に "text" という名前の VARCHAR フィールドが定義されているとします

# インデックスパラメータを準備
index_params = client.prepare_index_params()

# "text" フィールドに NGRAM インデックスを追加
# highlight-start
index_params.add_index(
    field_name="text",   # 対象の VARCHAR フィールド
    index_type="NGRAM",           # インデックスタイプは NGRAM
    index_name="ngram_index",     # インデックスのカスタム名
    min_gram=2,                   # 最小部分文字列長（例: 2-gram: "st"）
    max_gram=3                    # 最大部分文字列長（例: 3-gram: "sta"）
)
# highlight-end

# collection にインデックスを作成
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この設定では、`text` 内の各文字列に対して 2-gram と 3-gram が生成され、転置インデックスに格納されます。

### 例 2: JSON パスに作成\{#example-2-create-on-a-json-path}

`JSON` フィールドの場合、gram の設定に加えて、以下も指定する必要があります。

- `params.json_path` – インデックス化したい値を指す JSON パス。

- `params.json_cast_type` – NGRAM インデックスは文字列に対して動作するため、`"varchar"`（大文字・小文字は区別されない）である必要があります。

```python
# collection schema に "json_field" という名前の JSON フィールドが定義されており、その中に "body" という JSON パスがあるとします

# インデックスパラメータを準備
index_params = client.prepare_index_params()

# JSON フィールドに NGRAM インデックスを追加
# highlight-start
index_params.add_index(
    field_name="json_field",              # 対象の JSON フィールド
    index_type="NGRAM",                   # インデックスタイプは NGRAM
    index_name="json_ngram_index",        # カスタムインデックス名
    min_gram=2,                           # 最小 n-gram 長
    max_gram=4,                           # 最大 n-gram 長
    params={
        "json_path": "json_field[\"body\"]",  # JSON フィールド内の値へのパス
        "json_cast_type": "varchar"                  # 必須: 値を varchar にキャスト
    }
)
# highlight-end

# collection にインデックスを作成
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この例では、

- `json_field["body"]` の値だけがインデックス化されます。

- 値は n-gram トークン化の前に `VARCHAR` にキャストされます。

- Zilliz Cloud は長さ 2 から 4 の部分文字列を生成し、それらを転置インデックスに格納します。

JSON フィールドのインデックス作成方法の詳細については、[JSON Indexing](./json-indexing) を参照してください。

## NGRAM によって高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAM インデックスが適用されるには、次の条件を満たす必要があります。

- クエリは、`NGRAM` インデックスを持つ `VARCHAR` フィールド（または JSON パス）を対象にしている必要があります。

- `LIKE` パターンのリテラル部分は、少なくとも `min_gram` 文字以上である必要があります。

    *(たとえば、想定される最短のクエリ語句が 2 文字である場合、インデックス作成時に min_gram=2 を設定してください。)*

サポートされるクエリタイプ:

- **Prefix match**

```python # Match any string that starts with the substring "database" filter = 'text LIKE "database%"'` ``

- **Suffix match**

```python # Match any string that ends with the substring "database" filter = 'text LIKE "%database"'` ``

- **Infix match**

```python # Match any string that contains the substring "database" anywhere filter = 'text LIKE "%database%"'` ``

- **Wildcard match**

Zilliz Cloud は `%`（0 文字以上）と `_`（ちょうど 1 文字）の両方をサポートしています。

```python # Match any string where "st" appears first, and "um" appears later in the text filter = 'text LIKE "%st%um%"'` ``

- **JSON path queries**

```python filter = 'json_field["body"] LIKE "%database%"'` ``

- **Regex filter**

```python # Match log messages that contain "error" followed later by "timeout" filter = 'text =~ "error.*timeout"'` ``

- **Regex filter on a JSON path**

```python filter = 'json_field["body"] =~ "error.*timeout"'` ``

フィルタ式構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

## インデックスの削除\{#drop-an-index}

`drop_index()` メソッドを使用して、collection から既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="注意">

**Milvus v2.6.x** と互換性のある cluster では、不要になった scalar index を直接削除できます。先に collection を release する必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="Documents",   # collection 名
    index_name="ngram_index" # 削除するインデックス名
)
```

## 使用上の注意\{#usage-notes}

- **フィールド型**: `VARCHAR` フィールドと `JSON` フィールドでサポートされています。JSON の場合は、`params.json_path` と `params.json_cast_type="varchar"` の両方を指定してください。

- **Regex の高速化**: `NGRAM` は、Zilliz Cloud が regex パターンから固定のリテラル部分文字列を抽出できる場合にのみ regex フィルタを高速化します。`[a-z]+` のようなパターンは、固定リテラルを含まないためスキャンにフォールバックすることがあります。

- **大文字・小文字を区別しない regex**: `(?i)` を含む regex パターンはサポートされていますが、インデックスが元の大文字・小文字を保持するため、`NGRAM` 最適化をスキップする場合があります。

- **検証ステップ**: regex フィルタに対して、`NGRAM` は候補を生成し、Zilliz Cloud が完全な RE2 regex パターンでそれらを検証するため、インデックス高速化によって一致結果が変わることはありません。

- **Unicode**: NGRAM 分解は文字ベースで言語非依存であり、空白文字や句読点も含みます。

- **空間–時間のトレードオフ**: より広い gram 範囲 `[min_gram, max_gram]` は、より多くの gram とより大きなインデックスを生成します。メモリが厳しい場合は、大きな posting list に対して `mmap` モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

- **不変性**: `min_gram` と `max_gram` はその場で変更できません。調整するにはインデックスを再構築してください。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせて min_gram と max_gram を選択する**

    - `min_gram=2`, `max_gram=3` から始めてください。

    - `min_gram` は、ユーザーが入力すると想定される最短のリテラルに設定してください。

    - `max_gram` は、意味のある部分文字列の典型的な長さに近づけて設定してください。`max_gram` を大きくするとフィルタリング性能は向上しますが、必要な容量も増えます。

- **選択性の低い gram を避ける**

    非常に反復的なパターン（例: `"aaaaaa"`）はフィルタリング効果が弱く、得られる改善も限定的になる場合があります。

- **一貫して正規化する**

    ユースケースで必要な場合は、取り込みテキストとクエリリテラルの両方に同じ正規化（例: 小文字化、トリミング）を適用してください。

