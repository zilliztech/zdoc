---
title: "フィルタテンプレート | Cloud"
slug: /filtering-templating
sidebar_label: "テンプレート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、多数の要素を含む複雑な filter 式、特に CJK 文字のような非 ASCII 文字を含む式が、クエリパフォーマンスに大きく影響する可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析にかかる時間を削減して効率を向上させるための filter 式テンプレート機構を導入しています。このページでは、search、query、delete 操作で filter 式テンプレートを使用する方法について説明します。 | Cloud"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# フィルタテンプレート

Zilliz Cloud では、多数の要素を含む複雑な filter 式、特に CJK 文字のような非 ASCII 文字を含む式が、クエリパフォーマンスに大きく影響する可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析にかかる時間を削減して効率を向上させるための filter 式テンプレート機構を導入しています。このページでは、search、query、delete 操作で filter 式テンプレートを使用する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

filter 式の左辺にあるリテラルは、以下の例で使用されている `age`、`city` などの collection フィールド名、または `filter = 'struct[0][subfield] > {var}'` のように特定の要素インデックスにある StructArray サブフィールド名のいずれかです。 

StructArray フィールドでの scalar filtering の詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## 概要\{#overview}

filter 式テンプレートを使用すると、クエリ実行時に値へ動的に置換されるプレースホルダー付きの filter 式を作成できます。テンプレートを使うことで、大きな配列や複雑な式を filter に直接埋め込む必要がなくなり、解析時間を短縮してクエリパフォーマンスを向上させます。

たとえば、`age` と `city` の 2 つのフィールドを含む filter 式があり、年齢が 25 より大きく、かつ "北京"（Beijing）または "上海"（Shanghai）に住んでいるすべての人を見つけたいとします。値を filter 式に直接埋め込む代わりに、次のようなテンプレートを使用できます。

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

ここで、`{age}` と `{city}` はプレースホルダーであり、クエリ実行時に `filter_params` 内の実際の値に置き換えられます。

Zilliz Cloud で filter 式テンプレートを使用する主な利点は次のとおりです。

- **解析時間の短縮**: 大きい、または複雑な filter 式をプレースホルダーに置き換えることで、システムが filter の解析と処理に費やす時間を削減できます。

- **クエリパフォーマンスの向上**: 解析オーバーヘッドが減ることでクエリパフォーマンスが向上し、より高い QPS と高速な応答時間を実現できます。

- **スケーラビリティ**: データセットが増大し、filter 式がより複雑になっても、テンプレートにより効率的でスケーラブルなパフォーマンスを維持できます。

## 検索操作\{#search-operations}

Zilliz Cloud の search 操作では、`filter` 式を使って filtering 条件を定義し、`filter_params` パラメーターを使ってプレースホルダーの値を指定します。`filter_params` 辞書には、Zilliz Cloud が filter 式へ置換するために使用する動的な値が含まれます。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.search(
    "hello_milvus",
    vectors[:nq],
    filter=expr,
    limit=10,
    output_fields=["age", "city"],
    search_params={"params": {"search_list": 100}},
    filter_params=filter_params,
)
```

この例では、Zilliz Cloud は search の実行時に `{age}` を `25` に、`{city}` を `["北京", "上海"]` に動的に置き換えます。

## クエリ操作\{#query-operations}

同じテンプレート機構は、Zilliz Cloud の query 操作にも適用できます。`query` 関数では、filter 式を定義し、`filter_params` を使用して置換する値を指定します。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.query(
    "hello_milvus",
    filter=expr,
    output_fields=["age", "city"],
    filter_params=filter_params
)
```

`filter_params` を使用することで、Zilliz Cloud は値の動的挿入を効率的に処理し、query 実行速度を向上させます。

## 削除操作\{#delete-operations}

delete 操作でも filter 式テンプレートを使用できます。search や query と同様に、`filter` 式が条件を定義し、`filter_params` がプレースホルダー用の動的な値を提供します。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

この方法は、特に複雑な filter 条件を扱う場合に、delete 操作のパフォーマンスを向上させます。

## 正規表現フィルタテンプレート\{#regex-filter-templates}

regex filter でも filter 式テンプレートを使用できます。これは、regex パターンがリクエスト時に提供される場合に便利です。

```python
expr = "message =~ {pattern}"
filter_params = {"pattern": "E[0-9]{4}"}
res = client.query(
    "hello_milvus",
    filter=expr,
    output_fields=["message"],
    filter_params=filter_params,
)
```

`!~` でもテンプレートパラメーターを使用できます。

```python
expr = "message !~ {pattern}"
filter_params = {"pattern": "^DEBUG"}
```

テンプレート値は、有効な RE2 regex パターンを含む文字列である必要があります。Zilliz Cloud は filter を実行する前にパターンを検証します。

filter テンプレートでは、regex パターンを filter 式に連結するのではなく、値として渡します。これにより式解析のオーバーヘッドが減り、パターンに引用符や演算子が含まれている場合でも、誤って filter 構造が変更されるのを防げます。

## まとめ\{#conclusion}

filter 式テンプレートは、Zilliz Cloud でクエリパフォーマンスを最適化するための重要なツールです。プレースホルダーと `filter_params` 辞書を使用することで、複雑な filter 式の解析に費やす時間を大幅に削減できます。これにより、クエリ実行が高速化され、全体的なパフォーマンスが向上します。
