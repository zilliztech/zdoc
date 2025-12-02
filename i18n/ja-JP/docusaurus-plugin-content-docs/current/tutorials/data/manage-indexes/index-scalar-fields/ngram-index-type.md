---
title: "NGRAM | Cloud"
slug: /ngram-index-type
sidebar_label: "NGRAM"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudの`NGRAM`インデックスは、`VARCHAR`フィールドまたは`JSON`フィールド内の特定のJSONパスの`LIKE`クエリを高速化するために構築されています。インデックスを構築する前に、Zilliz Cloudはテキストを固定長nの短い重複するサブストリングに分割します。これはn-gramとして知られています。例えば、n = 3の場合、単語「Milvus」は3-gramの「Mil」、「ilv」、「lvu」、および「vus」に分割されます。これらのn-gramは、各グラムをそのグラムが出現するドキュメントIDにマッピングする反転インデックスに格納されます。クエリ時には、このインデックスによりZilliz Cloudは検索を候補の少数に迅速に絞り込むことができ、はるかに高速なクエリ実行が可能になります。 | Cloud"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - scalar field
  - varchar
  - ngram
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search

---

import Admonition from '@theme/Admonition';


# NGRAM

Zilliz Cloudの`NGRAM`インデックスは、`VARCHAR`フィールドまたは`JSON`フィールド内の特定のJSONパスの`LIKE`クエリを高速化するために構築されています。インデックスを構築する前に、Zilliz Cloudはテキストを固定長nの短い重複するサブストリングに分割します。これはn-gramとして知られています。例えば、n = 3の場合、単語「Milvus」は3-gramの「Mil」、「ilv」、「lvu」、および「vus」に分割されます。これらのn-gramは、各グラムをそのグラムが出現するドキュメントIDにマッピングする反転インデックスに格納されます。クエリ時には、このインデックスによりZilliz Cloudは検索を候補の少数に迅速に絞り込むことができ、はるかに高速なクエリ実行が可能になります。

以下のような高速なプレフィックス、サフィックス、インフィックス、またはワイルドカードフィルタリングが必要な場合に使用してください。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

<Admonition type="info" icon="📘" title="注意">

<p>フィルター式の構文の詳細については、<a href="./basic-filtering-operators#range-operators">基本的な演算子</a>を参照してください。</p>

</Admonition>

## 仕組み\{#how-it-works}

Zilliz Cloudは、`NGRAM`インデックスを2段階のプロセスで実装しています。

1. **インデックスの構築**: 各ドキュメントのn-gramを生成し、インジェスト中に反転インデックスを構築します。

1. **クエリの高速化**: インデックスを使用して少数の候補セットにフィルタリングし、その後正確な一致を検証します。

### フェーズ1: インデックスの構築\{#phase-1-build-the-index}

データインジェスト中に、Zilliz CloudはNGRAMインデックスを構築するために以下の2つの主なステップを実行します。

1. **テキストをn-gramに分解する**: Zilliz Cloudは、対象フィールド内の各文字列にnのウィンドウをスライドさせ、重複するサブストリング（n-gram）を抽出します。これらのサブストリングの長さは、設定可能な範囲`[min_gram, max_gram]`内にあります。

    - `min_gram`: 生成する最小のn-gram。また、インデックスの恩恵を受けることができる最小クエリ部分文字列長も定義します。

    - `max_gram`: 生成する最大のn-gram。クエリ時にも、長いクエリ文字列を分割する際の最大ウィンドウサイズとして使用されます。

    例えば、`min_gram=2`および`max_gram=3`の場合、文字列`"AI database"`は以下のように分解されます。

![QZqlwniNDhE82ZbzE09cd7uHnWd](/img/QZqlwniNDhE82ZbzE09cd7uHnWd.png)

    - **2-grams:** `AI`, `I_`, `_d`, `da`, `at`, ...

    - **3-grams:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

    <Admonition type="info" icon="📘" title="注意">

    <ul>
    <li><p>範囲<code>[min_gram, max_gram]</code>に対して、Zilliz Cloudは2つの値（両端を含む）の間のすべての長さについてn-gramを生成します。例えば、<code>[2,4]</code>と単語<code>"text"</code>の場合、Zilliz Cloudは以下を生成します。</p></li>
    <li><p><strong>2-grams:</strong> <code>te</code>, <code>ex</code>, <code>xt</code></p></li>
    <li><p><strong>3-grams:</strong> <code>tex</code>, <code>ext</code></p></li>
    <li><p><strong>4-grams:</strong> <code>text</code></p></li>
    <li><p>N-gramの分解は文字ベースであり、言語に依存しません。例えば中国語では、<code>"向量数据库"</code>（<code>min_gram = 2</code>）は<code>"向量"</code>、<code>"量数"</code>、<code>"数据"</code>、<code>"据库"</code>に分解されます。</p></li>
    <li><p>スペースや句読点は分解中に文字として扱われます。</p></li>
    <li><p>分解では元のケースが維持され、一致は大文字小文字を区別します。例えば、<code>"Database"</code>と<code>"database"</code>は異なるn-gramを生成し、クエリ時に正確なケースマッチングが必要になります。</p></li>
    </ul>

    </Admonition>

1. **反転インデックスを構築する**: 各生成されたn-gramを含むドキュメントIDのリストにマッピングする**反転インデックス**が作成されます。

    例えば、2-gram `"AI"`がIDが1、5、6、8、および9のドキュメントに出現する場合、インデックスは`{"AI": [1, 5, 6, 8, 9]}`を記録します。このインデックスはクエリ時に検索範囲を迅速に絞り込むために使用されます。

![BVPlwaN7Lh7UZibGopwcAcYQn1d](/img/BVPlwaN7Lh7UZibGopwcAcYQn1d.png)

    <Admonition type="info" icon="📘" title="注意">

    <p>より広い<code>[min_gram, max_gram]</code>範囲は、より多くのグラムとより大きなマッピングリストを作成します。メモリが限られている場合は、非常に大きなポスティングリストにはmmapモードを検討してください。詳細については、<a href="./use-mmap">mmapの使用</a>を参照してください。</p>

    </Admonition>

### フェーズ2: クエリの高速化\{#phase-2-accelerate-queries}

`LIKE`フィルタが実行される際、Zilliz CloudはNGRAMインデックスを使用して以下の手順でクエリを高速化します。

![XKwRwOPv6hqzpTb3ue8cbM8WnGe](/img/XKwRwOPv6hqzpTb3ue8cbM8WnGe.png)

1. **クエリ語の抽出:** ワイルドカードを含まない連続した部分文字列が`LIKE`式から抽出されます（例：`"%database%"`は`"database"`になります）。

1. **クエリ語の分解:** クエリ語はその長さ（`L`）と`min_gram`および`max_gram`の設定に基づいて*n-gram*に分解されます。

    - `L < min_gram`の場合、インデックスは使用できず、クエリは全スキャンにフォールバックします。

    - `min_gram ≤ L ≤ max_gram`の場合、クエリ語全体が単一のn-gramとして扱われ、これ以上の分解は不要です。

    - `L > max_gram`の場合、クエリ語は`max_gram`に等しいウィンドウサイズを使用して重複するグラムに分解されます。

    例えば、`max_gram`が`3`に設定され、クエリ語が長さ**8**の`"database"`の場合、`"dat"`、`"ata"`、`"tab"`などの3-gramサブストリングに分解されます。

1. **各グラムの検索と交差**: Zilliz Cloudは反転インデックス内の各クエリグラムを検索し、結果のドキュメントIDリストを交差させて少数の候補ドキュメントを検索します。これらの候補はクエリのすべてのグラムを含みます。

1. **検証と結果の返却:** 元の`LIKE`フィルタが正確な一致を検索するために少数の候補セットのみに最終確認として適用されます。

## NGRAMインデックスの作成\{#create-an-ngram-index}

`VARCHAR`フィールドまたは`JSON`フィールド内の特定のパスにNGRAMインデックスを作成できます。

### 例1: VARCHARフィールドでの作成\{#example-1-create-on-a-varchar-field}

`VARCHAR`フィールドでは、`field_name`を指定し、`min_gram`と`max_gram`を設定するだけです。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # サーバーアドレスに置き換えてください

# コレクションスキーマに"test"という名前のVARCHARフィールドを定義したと仮定します

# インデックスパラメータを準備
index_params = client.prepare_index_params()

# "text"フィールドにNGRAMインデックスを追加
# highlight-start
index_params.add_index(
    field_name="text",   # 対象VARCHARフィールド
    index_type="NGRAM",           # インデックスタイプはNGRAM
    index_name="ngram_index",     # インデックスのカスタム名
    min_gram=2,                   # 最小部分文字列長（例：2-gram: "st"）
    max_gram=3                    # 最大部分文字列長（例：3-gram: "sta"）
)
# highlight-end

# コレクションにインデックスを作成
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この構成は、`text`内の各文字列に対して2-gramと3-gramを生成し、反転インデックスに格納します。

### 例2: JSONパスでの作成\{#example-2-create-on-a-json-path}

`JSON`フィールドでは、グラム設定に加えて、以下のパラメータを指定する必要があります。

- `params.json_path` – インデックス化する値を指すJSONパス。

- `params.json_cast_type` – `"varchar"`（大文字小文字を区別しない）である必要があります。NGRAMインデックスは文字列で動作します。

```python
# コレクションスキーマに"json_field"という名前のJSONフィールドを定義し、"body"という名前のJSONパスがあると仮定します

# インデックスパラメータを準備
index_params = client.prepare_index_params()

# JSONフィールドにNGRAMインデックスを追加
# highlight-start
index_params.add_index(
    field_name="json_field",              # 対象JSONフィールド
    index_type="NGRAM",                   # インデックスタイプはNGRAM
    index_name="json_ngram_index",        # カスタムインデックス名
    min_gram=2,                           # 最小n-gram長
    max_gram=4,                           # 最大n-gram長
    params={
        "json_path": "json_field[\"body\"]",  # JSONフィールド内の値へのパス
        "json_cast_type": "varchar"                  # 必須: 値をvarcharにキャスト
    }
)
# highlight-end

# コレクションにインデックスを作成
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この例では:

- `json_field["body"]`の値のみがインデックス化されます。

- 値はn-gramトークナイズの前に`VARCHAR`にキャストされます。

- Zilliz Cloudは長さ2から4のサブストリングを生成し、反転インデックスに格納します。

JSONフィールドのインデックス作成の詳細については、[JSONインデックス](./json-indexing)を参照してください。

## NGRAMによって高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAMインデックスが適用されるには:

- クエリは`NGRAM`インデックスを持つ`VARCHAR`フィールド（またはJSONパス）を対象にする必要があります。

- `LIKE`パターンのリテラル部分は少なくとも`min_gram`文字の長さである必要があります。
*（例えば、最も短いクエリ語が2文字の場合、インデックス作成時にmin_gram=2を設定してください。）*

サポートされているクエリタイプ:

- **プレフィックスマッチ**

    ```python
    # "database"で始まる任意の文字列にマッチ
    filter = 'text LIKE "database%"'
    ```

- **サフィックスマッチ**

    ```python
    # "database"で終わる任意の文字列にマッチ
    filter = 'text LIKE "%database"'
    ```

- **インフィックスマッチ**

    ```python
    # どこかに"database"という部分文字列を含む任意の文字列にマッチ
    filter = 'text LIKE "%database%"'
    ```

- **ワイルドカードマッチ**

    Zilliz Cloudは`%`（0文字以上）と`_`（正確に1文字）の両方をサポートしています。

    ```python
    # "st"が最初に出現し、その後に"text"内に"um"が出現する任意の文字列にマッチ
    filter = 'text LIKE "%st%um%"'
    ```

- **JSONパスクエリ**

    ```python
    filter = 'json_field["body"] LIKE "%database%"'
    ```

フィルター式の構文の詳細については、[基本的な演算子](./basic-filtering-operators)を参照してください。

## インデックスの削除\{#drop-an-index}

`drop_index()`メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="注意">

<p><strong>Milvus v2.6.x</strong>互換のクラスターでは、スカラーインデックスが不要になった時点で直接削除できます。まずコレクションを解放する必要はありません。</p>

</Admonition>

```python
client.drop_index(
    collection_name="Documents",   # コレクション名
    index_name="ngram_index" # 削除するインデックス名
)
```

## 使用上の注意\{#usage-notes}

- **フィールドタイプ**: `VARCHAR`および`JSON`フィールドでサポートされています。JSONでは、`params.json_path`と`params.json_cast_type="varchar"`の両方を指定してください。

- **Unicode**: NGRAM分解は文字ベースであり、言語に依存せず、空白と句読点を含みます。

- **スペース・時間のトレードオフ**: 広いグラム範囲`[min_gram, max_gram]`はより多くのグラムと大きなインデックスを生成します。メモリが限られている場合は、大きなポスティングリストには`mmap`モードを検討してください。詳細については、[mmapの使用](./use-mmap)を参照してください。

- **不変性**: `min_gram`と`max_gram`はインプレースでは変更できません。調整するにはインデックスを再構築してください。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせてmin_gramとmax_gramを選択する**

    - `min_gram=2`、`max_gram=3`から始めてください。

    - `min_gram`は、ユーザーが入力すると予想される最も短いリテラルに設定してください。

    - `max_gram`は、意味のある部分文字列の典型的な長さに近づけてください。より大きな`max_gram`はフィルタリングを改善しますが、スペースも増加します。

- **低選択性のグラムを避ける**

    高く反復するパターン（例：`"aaaaaa"`）は弱いフィルタリングを提供し、限定的な利点しか得られない可能性があります。

- **一貫した正規化**

    使用ケースで必要であれば、インジェストされたテキストとクエリリテラルに同じ正規化（例：小文字化、トリミング）を適用してください。