---
title: "NGRAM | Cloud"
slug: /ngram-index-type
sidebar_key: ngram-index-type
sidebar_label: "NGRAM"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリを高速化するために構築されています。インデックスの作成前に、Zilliz Cloud はテキストを固定長 n の短い重複部分文字列（n-gram）に分割します。例えば、n = 3 の場合、単語「Milvus」は「Mil」、「ilv」、「lvu」、「vus」という 3-gram に分割されます。これらの n-gram は、各 gram が出現するドキュメント ID をマッピングする転置インデックスに格納されます。クエリ実行時、このインデックスにより Zilliz Cloud は検索対象を少数の候補に迅速に絞り込むことができ、クエリの実行が大幅に高速化されます。 | Cloud"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - スカラーフィールド
  - varchar
  - ngram

---

import Admonition from '@theme/Admonition';


# NGRAM

Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSONパス に対して `LIKE` クエリを高速化するために構築されます。インデックスを構築する前に、Zilliz Cloud はテキストを固定長 *n* の短い重複部分を持つ部分文字列（*n-gram*）に分割します。たとえば、*n = 3* の場合、単語 *"Milvus"* は 3-gram に分割され、*"Mil"*, *"ilv"*, *"lvu"*, *"vus"* となります。これらの n-gram はその後、各 gram が出現するドキュメント ID をマッピングする転置インデックスに格納されます。クエリ時、このインデックスにより Zilliz Cloud は候補を少数に絞り込むことができ、結果としてクエリ実行が大幅に高速化されます。

以下のようなプレフィックス、サフィックス、インフィックス、ワイルドカードによる高速なフィルタリングが必要な場合に使用します：

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

<Admonition type="info" icon="📘" title="Notes">

<p>フィルター式の構文の詳細については、<a href="./basic-filtering-operators#range-operators">基本演算子</a>を参照してください。</p>

</Admonition>

## 動作原理\{#how-it-works}

Zilliz Cloud では、`NGRAM` インデックスを以下の 2 段階のプロセスで実装しています：

1. **インデックスの構築**: 各ドキュメントの n-gram を生成し、データ取り込み時に転置インデックスを構築します。

1. **クエリの高速化**: インデックスを使用して候補セットを小さく絞り込み、その後正確な一致を検証します。

### フェーズ 1: インデックスの構築\{#phase-1-build-the-index}

データ取り込み中に、Zilliz Cloud は NGRAM インデックスを次の 2 つの主要ステップで構築します：

1. **テキストをn-gramに分解する**: Zilliz Cloud は対象フィールド内の各文字列に対して長さ *n* のスライディングウィンドウを適用し、重複する部分文字列（*n-gram*）を抽出します。これらの部分文字列の長さは、設定可能な範囲 `[min_gram, max_gram]` 内に収まります。

    - `min_gram`: 生成される最短の n-gram。これはまた、インデックスの恩恵を受けられる最小クエリ部分文字列長でもあります。

    - `max_gram`: 生成される最長の n-gram。クエリ時には、長いクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

    たとえば、`min_gram=2` および `max_gram=3` の場合、文字列 `"AI database"` は次のように分解されます：

    ![QZqlwniNDhE82ZbzE09cd7uHnWd](https://zdoc-images.s3.us-west-2.amazonaws.com/QZqlwniNDhE82ZbzE09cd7uHnWd.png)

    - **2-grams:** `AI`, `I_`, `_d`, `da`, `at`, ...

    - **3-grams:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>範囲 <code>[min_gram, max_gram]</code> に対して、Zilliz Cloud はその範囲内のすべての長さの n-gram を生成します（両端を含む）。たとえば、<code>[2,4]</code> かつ単語 <code>"text"</code> の場合、Zilliz Cloud は次を生成します：</p></li>
    <li><p><strong>2-grams:</strong> <code>te</code>, <code>ex</code>, <code>xt</code></p></li>
    <li><p><strong>3-grams:</strong> <code>tex</code>, <code>ext</code></p></li>
    <li><p><strong>4-grams:</strong> <code>text</code></p></li>
    <li><p>n-gram 分解は文字ベースであり、言語に依存しません。たとえば中国語の場合、<code>"向量数据库"</code> は <code>min_gram = 2</code> で <code>"向量"</code>, <code>"量数"</code>, <code>"数据"</code>, <code>"据库"</code> に分解されます。</p></li>
    <li><p>スペースや句読点は分解時に文字として扱われます。</p></li>
    <li><p>分解は元のケースを保持し、マッチングは大文字小文字を区別します。たとえば、<code>"データベース"</code> と <code>"database"</code> は異なる n-gram を生成し、クエリ時は完全一致の大文字小文字が要求されます。</p></li>
    </ul>

    </Admonition>

1. **Build an 転置インデックス**: 生成された各 n-gram をその gram を含むドキュメント ID のリストにマッピングする**転置インデックス**が作成されます。

    たとえば、2-gram `"AI"` が ID 1, 5, 6, 8, 9 のドキュメントに出現する場合、インデックスには `{"AI": [1, 5, 6, 8, 9]}` と記録されます。このインデックスはクエリ時に検索範囲を迅速に絞り込むために使用されます。

    ![BVPlwaN7Lh7UZibGopwcAcYQn1d](https://zdoc-images.s3.us-west-2.amazonaws.com/BVPlwaN7Lh7UZibGopwcAcYQn1d.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p><code>[min_gram, max_gram]</code> の範囲が広いほど、より多くの gram と大きなマッピングリストが生成されます。メモリが限られている場合は、非常に大きなポスティングリストに対して mmap モードを検討してください。詳細については、<a href="./use-mmap">Use mmap</a> を参照してください。</p>

    </Admonition>

### フェーズ 2: クエリの高速化\{#phase-2-accelerate-queries}

`LIKE` フィルターが実行されると、Zilliz Cloud は NGRAM インデックスを使用して以下の手順でクエリを高速化します：

![XKwRwOPv6hqzpTb3ue8cbM8WnGe](https://zdoc-images.s3.us-west-2.amazonaws.com/XKwRwOPv6hqzpTb3ue8cbM8WnGe.png)

1. **Extract the query term:** `LIKE` 式からワイルドカードを含まない連続した部分文字列を抽出します（例：`"%database%"` → `"database"`）。

1. **Decompose the query term:** クエリ用語はその長さ（`L`）および `min_gram`、`max_gram` 設定に基づいて *n-gram* に分解されます。

    - `L < min_gram` の場合、インデックスは使用できず、クエリはフルスキャンにフォールバックします。

    - `min_gram ≤ L ≤ max_gram` の場合、クエリ用語全体が単一の n-gram として扱われ、それ以上の分解は不要です。

    - `L > max_gram` の場合、クエリ用語は `max_gram` に等しいウィンドウサイズを使用して重複する gram に分解されます。

    たとえば、`max_gram` が `3` に設定されており、クエリ用語が長さ **8** の `"database"` である場合、`"dat"`, `"ata"`, `"tab"` などの 3-gram 部分文字列に分解されます。

1. **Look for each gram & intersect**: Zilliz Cloud は各クエリ gram を転置インデックスで検索し、得られたドキュメント ID リストを共通部分（インターセクト）して、少量の候補ドキュメントセットを取得します。これらの候補はクエリのすべての gram を含んでいます。

1. **Verify and return results:** 元の `LIKE` フィルターが最終チェックとしてこの少量の候補セットにのみ適用され、正確な一致が検出されます。

## NGRAM インデックスの作成\{#create-an-ngram-index}

`VARCHAR` フィールド、または `JSON` フィールド内の特定のパスに対して NGRAM インデックスを作成できます。

### 例 1: VARCHAR フィールド上に作成\{#example-1-create-on-a-varchar-field}

`VARCHAR` フィールドの場合、単に `field_name` を指定し、`min_gram` と `max_gram` を設定します。

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

この設定により、`text` 内の各文字列に対して 2-gram および 3-gram が生成され、転置インデックスに格納されます。

### 例 2: JSONパス上に作成する\{#example-2-create-on-a-json-path}

`JSON` フィールドの場合、gram 設定に加えて、以下の項目も指定する必要があります。

- `params.json_path` – インデックスを作成したい値を指す JSONパス。

- `params.json_cast_type` – NGRAM インデックスは文字列に対して動作するため、`"varchar"`（大文字小文字を区別しない）でなければなりません。

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

この例では、以下のようになります。

- `json_field["body"]` の値のみがインデックスされます。

- 値は n-gram トークン化の前に `VARCHAR` 型にキャストされます。

- Zilliz Cloud は長さ 2〜4 の部分文字列を生成し、それらを転置インデックスに格納します。

JSON フィールドのインデックス作成方法の詳細については、[JSON インデックス作成](./json-indexing) を参照してください。

## NGRAM によって高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAM インデックスを適用するには、以下の条件を満たす必要があります。

- クエリは `NGRAM` インデックスが作成された `VARCHAR` フィールド（または JSONパス）を対象とする必要があります。

- `LIKE` パターンのリテラル部分は、少なくとも `min_gram` 文字以上である必要があります。  
  *（例: 最短の想定クエリ語が2文字の場合、インデックス作成時に min_gram=2 を設定します。）*

サポートされているクエリタイプ:

- **前方一致**

    ```python
    # Match any string that starts with the substring "database"
    filter = 'text LIKE "database%"'
    ```

- **後方一致**

    ```python
    # Match any string that ends with the substring "database"
    filter = 'text LIKE "%database"'
    ```

- **中間一致**

    ```python
    # Match any string that contains the substring "database" anywhere
    filter = 'text LIKE "%database%"'
    ```

- **ワイルドカード一致**

    Zilliz Cloud は、`%`（ゼロ個以上の文字）と `_`（ちょうど1つの文字）の両方をサポートしています。

    ```python
    # Match any string where "st" appears first, and "um" appears later in the text 
    filter = 'text LIKE "%st%um%"'
    ```

- **JSONパス クエリ**

    ```python
    filter = 'json_field["body"] LIKE "%database%"'
    ```

フィルター式の構文の詳細については、[基本演算子](./basic-filtering-operators)を参照してください。

## インデックスの削除\{#drop-an-index}

既存のインデックスをコレクションから削除するには、`drop_index()` メソッドを使用します。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Milvus v2.6.x</strong> と互換性のあるクラスターでは、スカラーインデックスが不要になった時点で直接削除できます。コレクションを事前にリリースする必要はありません。</p>

</Admonition>

```python
client.drop_index(
    collection_name="Documents",   # Name of the collection
    index_name="ngram_index" # Name of the index to drop
)
```

## 使用上の注意\{#usage-notes}

- **フィールド型**: `VARCHAR` および `JSON` フィールドでサポートされています。JSON の場合は、`params.json_path` と `params.json_cast_type="varchar"` の両方を指定してください。

- **Unicode**: NGRAM 分解は文字単位で行われ、言語に依存せず、空白や句読点も含みます。

- **空間的・時間的トレードオフ**: より広いグラム範囲 `[min_gram, max_gram]` はより多くのグラムと大きなインデックスを生成します。メモリが限られている場合は、大規模なポスティングリストに対して `mmap` モードを検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

- **不変性**: `min_gram` および `max_gram` はインプレースで変更できません。これらを調整するにはインデックスを再構築する必要があります。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせて min_gram と max_gram を選択する**

    - `min_gram=2`、`max_gram=3` から始めることを推奨します。

    - `min_gram` は、ユーザーが入力すると想定される最短のリテラル長に設定します。

    - `max_gram` は、意味のある部分文字列の典型的な長さに近い値に設定します。`max_gram` を大きくするとフィルタリング性能が向上しますが、必要なストレージ容量も増加します。

- **選択性の低いグラムを避ける**

    高度に繰り返されるパターン（例: `"aaaaaa"`）はフィルタリング効果が弱く、効果が限定的になる可能性があります。

- **一貫して正規化する**

    必要に応じて、取り込まれるテキストとクエリのリテラルに対して同じ正規化処理（例: 小文字化、トリミング）を適用します。

