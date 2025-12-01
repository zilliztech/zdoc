---
title: "NGRAM | BYOC"
slug: /ngram-index-type
sidebar_label: "NGRAM"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudの`NGRAM`インデックスは、`VARCHAR`フィールドまたは`JSON`フィールド内の特定のJSONパスに対する`LIKE`クエリを高速化するために構築されています。インデックスを構築する前に、Zilliz Cloudはテキストを長さnの短い重複する部分文字列（n-gramと呼ばれます）に分割します。例えば、n = 3の場合、単語「Milvus」は3-gram「Mil」、「ilv」、「lvu」、「vus」に分割されます。これらのn-gramは、各gramが出現するドキュメントIDにマッピングされる逆インデックスに格納されます。クエリ時に、このインデックスによりZilliz Cloudは検索を少数の候補に迅速に絞り込むことができ、結果としてはるかに高速なクエリ実行が可能になります。| BYOC"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - スカラーフィールド
  - varchar
  - ngram
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベース比較
  - Faiss

---

import Admonition from '@theme/Admonition';


# NGRAM

Zilliz Cloudの`NGRAM`インデックスは、`VARCHAR`フィールドまたは`JSON`フィールド内の特定のJSONパスに対する`LIKE`クエリを高速化するために構築されています。インデックスを構築する前に、Zilliz Cloudはテキストを長さ*n*の短い重複する部分文字列（n-gramと呼ばれます）に分割します。例えば、*n = 3*の場合、単語*"Milvus"*は3-gram *"Mil"*、*"ilv"*、*"lvu"*、および*"vus"*に分割されます。これらのn-gramは、各gramが出現するドキュメントIDにマッピングされる逆インデックスに格納されます。クエリ時に、このインデックスによりZilliz Cloudは検索を少数の候補に迅速に絞り込むことができ、結果としてはるかに高速なクエリ実行が可能になります。

次のような高速なプレフィックス、サフィックス、インフィックス、またはワイルドカードによるフィルタリングが必要な場合に使用します。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

<Admonition type="info" icon="📘" title="備考">

<p>フィルター式の構文の詳細については、<a href="./basic-filtering-operators#range-operators">基本演算子</a>を参照してください。</p>

</Admonition>

## 仕組み\{#how-it-works}

Zilliz Cloudは、`NGRAM`インデックスを2段階のプロセスで実装しています。

1. **インデックスの構築**: 各ドキュメントのn-gramを生成し、取り込み中に逆インデックスを構築します。

1. **クエリの高速化**: インデックスを使用して少数の候補セットにフィルタリングし、その後正確な一致を確認します。

### フェーズ1: インデックスの構築\{#phase-1-build-the-index}

データ取り込み中に、Zilliz Cloudは2つの主なステップを実行してNGRAMインデックスを構築します。

1. **テキストをn-gramに分解**: Zilliz Cloudは、ターゲットフィールド内の各文字列にわたって長さ*n*のウィンドウをスライドさせ、重複する部分文字列（n-gram）を抽出します。これらの部分文字列の長さは設定可能な範囲`[min_gram, max_gram]`内にあります。

    - `min_gram`: 生成する最短のn-gramです。これにより、インデックスから恩恵を受けることができる最小のクエリ部分文字列長も定義されます。

    - `max_gram`: 生成する最長のn-gramです。クエリ実行時には、長く続くクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

    たとえば、`min_gram=2`および`max_gram=3`の場合、文字列`"AI database"`は次のように分解されます。

![QZqlwniNDhE82ZbzE09cd7uHnWd](/img/QZqlwniNDhE82ZbzE09cd7uHnWd.png)

    - **2-gram:** `AI`, `I_`, `_d`, `da`, `at`, ...

    - **3-gram:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

    <Admonition type="info" icon="📘" title="備考">

    <ul>
    <li><p>範囲<code>[min_gram, max_gram]</code>において、Zilliz Cloudは2つの値の間のすべての長さ(両端を含む)に対してすべてのn-gramを生成します。たとえば、<code>[2,4]</code>と単語<code>"text"</code>の場合、Zilliz Cloudは以下を生成します。</p></li>
    <li><p><strong>2-gram:</strong> <code>te</code>, <code>ex</code>, <code>xt</code></p></li>
    <li><p><strong>3-gram:</strong> <code>tex</code>, <code>ext</code></p></li>
    <li><p><strong>4-gram:</strong> <code>text</code></p></li>
    <li><p>N-gram分解は文字ベースで言語に依存せず、例えば中国語では、<code>min_gram = 2</code>の<code>"向量数据库"</code>は次のように分解されます：<code>"向量"</code>、<code>"量数"</code>、<code>"数据"</code>、<code>"据库"</code>。</p></li>
    <li><p>スペースと句読点は分解時に文字として扱われます。</p></li>
    <li><p>分解は元のケースを保持し、照合は大文字小文字を区別します。たとえば、<code>"Database"</code>と<code>"database"</code>は異なるn-gramを生成し、クエリ実行時には正確なケースマッチが必要です。</p></li>
    </ul>

    </Admonition>

1. **逆インデックスの構築**: 各生成されたn-gramを含むドキュメントIDのリストにマッピングする**逆インデックス**が作成されます。

    たとえば、2-gram `"AI"`がIDが1, 5, 6, 8, 9のドキュメントに出現する場合、インデックスは `{"AI": [1, 5, 6, 8, 9]}`を記録します。このインデックスはクエリ時に検索範囲を迅速に絞り込むために使用されます。

![BVPlwaN7Lh7UZibGopwcAcYQn1d](/img/BVPlwaN7Lh7UZibGopwcAcYQn1d.png)

    <Admonition type="info" icon="📘" title="備考">

    <p>より広い<code>[min_gram, max_gram]</code>範囲はより多くのgramとより大きなマッピングリストを作成します。メモリが限られている場合は、非常に大きなポスティングリストに対してmmapモードを検討してください。詳細については、<a href="./use-mmap">mmapの使用</a>を参照してください。</p>

    </Admonition>

### フェーズ2: クエリの高速化\{#phase-2-accelerate-queries}

`LIKE`フィルターが実行されるとき、Zilliz CloudはNGRAMインデックスを使用して以下の手順でクエリを高速化します。

![XKwRwOPv6hqzpTb3ue8cbM8WnGe](/img/XKwRwOPv6hqzpTb3ue8cbM8WnGe.png)

1. **クエリ語の抽出:** `LIKE`式からワイルドカードを含まない連続した部分文字列が抽出されます（例：`"%database%"`は`"database"`になります）。

1. **クエリ語の分解:** クエリ語はその長さ(`L`)と`min_gram`と`max_gram`の設定に基づいて*n-gram*に分解されます。

    - `L < min_gram`の場合、インデックスは使用できず、クエリは全スキャンにフォールバックします。

    - `min_gram ≤ L ≤ max_gram`の場合、クエリ語全体が単一のn-gramとして扱われ、これ以上の分解は不要です。

    - `L > max_gram`の場合、クエリ語は`max_gram`に等しいウィンドウサイズを使用して重複するgramに分解されます。

    たとえば、`max_gram`が`3`に設定され、クエリ語が長さ**8**の`"database"`である場合、`"dat"`、`"ata"`、`"tab"`など、3-gramの部分文字列に分解されます。

1. **各gramの検索と交差**: Zilliz Cloudは逆インデックス内のクエリgramそれぞれを検索し、結果のドキュメントIDリストを交差させて少数の候補ドキュメントセットを見つけます。これらの候補はクエリのすべてのgramを含んでいます。

1. **照合と結果の返却:** 元の`LIKE`フィルターが最終確認として少数の候補セットのみに適用され、正確な一致を見つけます。

## NGRAMインデックスの作成\{#create-an-ngram-index}

`VARCHAR`フィールドまたは`JSON`フィールド内の特定のパスにNGRAMインデックスを作成できます。

### 例1: VARCHARフィールドに作成\{#example-1-create-on-a-varchar-field}

`VARCHAR`フィールドの場合、`field_name`を指定し、`min_gram`と`max_gram`を設定するだけです。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # サーバーアドレスに置き換えてください

# コレクションスキーマで"テキスト"という名前のVARCHARフィールドを定義したと仮定します

# インデックスパラメータを準備
index_params = client.prepare_index_params()

# "テキスト"フィールドにNGRAMインデックスを追加
# highlight-start
index_params.add_index(
    field_name="text",   # 対象VARCHARフィールド
    index_type="NGRAM",           # インデックスタイプはNGRAM
    index_name="ngram_index",     # インデックスのカスタム名
    min_gram=2,                   # 最小部分文字列長 (例：2-gram: "st")
    max_gram=3                    # 最大部分文字列長 (例：3-gram: "sta")
)
# highlight-end

# コレクションにインデックスを作成
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この設定では、`text`内の各文字列に対して2-gramと3-gramを生成し、逆インデックスに格納します。

### 例2: JSONパスに作成\{#example-2-create-on-a-json-path}

`JSON`フィールドの場合、gram設定に加えて、以下も指定する必要があります。

- `params.json_path` – インデックス化したい値を指すJSONパス。

- `params.json_cast_type` – 必ず"varchar"（大文字小文字を区別しない）です。NGRAMインデックスは文字列で動作するため。

```python
# コレクションスキーマで"json_field"という名前のJSONフィールドを定義し、"body"という名前のJSONパスがあると仮定します

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
        "json_cast_type": "varchar"                  # 必須：値をvarcharにキャスト
    }
)
# highlight-end

# コレクションにインデックスを作成
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

この例では：

- `json_field["body"]`の値のみがインデックス化されます。

- 値はn-gramトークン化の前に`VARCHAR`にキャストされます。

- Zilliz Cloudは長さ2〜4の部分文字列を生成し、逆インデックスに格納します。

JSONフィールドのインデックス作成の詳細については、[JSONインデックス](./json-indexing)を参照してください。

## NGRAMによって高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAMインデックスを適用するには：

- クエリは`NGRAM`インデックスを持つ`VARCHAR`フィールド（またはJSONパス）を対象とする必要があります。

- `LIKE`パターンのリテラル部分は少なくとも`min_gram`文字以上である必要があります。
*（たとえば、最も短い予想されるクエリ語が2文字の場合、インデックス作成時にmin_gram=2を設定します。）*

サポートされるクエリタイプ：

- **プレフィックスマッチ**

    ```python
    # "database"という部分文字列で始まる任意の文字列にマッチ
    filter = 'text LIKE "database%"'
    ```

- **サフィックスマッチ**

    ```python
    # "database"という部分文字列で終わる任意の文字列にマッチ
    filter = 'text LIKE "%database"'
    ```

- **インフィックスマッチ**

    ```python
    # どこかに部分文字列"database"を含む任意の文字列にマッチ
    filter = 'text LIKE "%database%"'
    ```

- **ワイルドカードマッチ**

    Zilliz Cloudは`%`（0文字以上）と`_`（正確に1文字）の両方をサポートします。

    ```python
    # "st"が最初に出現し、テキストの後ろの方に"um"が出現する任意の文字列にマッチ
    filter = 'text LIKE "%st%um%"'
    ```

- **JSONパスクエリ**

    ```python
    filter = 'json_field["body"] LIKE "%database%"'
    ```

フィルター式の構文の詳細については、[基本演算子](./basic-filtering-operators)を参照してください。

## インデックスの削除\{#drop-an-index}

`drop_index()`メソッドを使用して、コレクションから既存のインデックスを削除します。

```python
client.drop_index(
    collection_name="Documents",   # コレクション名
    index_name="ngram_index" # 削除するインデックス名
)
```

## 使用上の注意\{#usage-notes}

- **フィールドタイプ**: `VARCHAR`および`JSON`フィールドでサポートされています。JSONの場合は、`params.json_path`と`params.json_cast_type="varchar"`の両方を指定します。

- **Unicode**: NGRAM分解は文字ベースで言語に依存せず、空白文字と句読点を含みます。

- **時間と空間のトレードオフ**: 広いgram範囲`[min_gram, max_gram]`はより多くのgramとより大きなインデックスを生成します。メモリが限られている場合は、大きなポスティングリストに対して`mmap`モードを検討してください。詳細については、[mmapの使用](./use-mmap)を参照してください。

- **不変性**: `min_gram`と`max_gram`は場所で変更できません。調整するにはインデックスを再構築します。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせたmin_gramとmax_gramの選択**

    - `min_gram=2`、`max_gram=3`から始めてください。

    - `min_gram`をユーザーが入力すると予想される最短のリテラルに設定します。

    - `max_gram`は、意味のある部分文字列の典型的な長さに近づけてください。より大きな`max_gram`はフィルタリングを改善しますが、スペースが増加します。

- **低選択性gramの回避**

    高く繰り返されるパターン（例："aaaaaa"）は弱いフィルタリングを提供し、限られた利点しか得られない可能性があります。

- **一貫した正規化**

    使用例に必要であれば、取り込まれたテキストとクエリリテラルに同じ正規化を適用してください（例：小文字化、トリミング）。
