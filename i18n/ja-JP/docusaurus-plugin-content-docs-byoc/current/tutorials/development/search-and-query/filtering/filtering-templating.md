---
title: "フィルターテンプレート | BYOC"
slug: /filtering-templating
sidebar_label: "テンプレート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、多数の要素を含む複雑なフィルター式、特に CJK 文字のような非 ASCII 文字を含むものは、クエリ性能に大きな影響を与える可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析に費やす時間を削減して効率を向上させるよう設計されたフィルター式テンプレート化メカニズムを導入しています。このページでは、search、query、および delete 操作でフィルター式テンプレート化を使用する方法について説明します。 | BYOC"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# フィルターテンプレート

Zilliz Cloud では、多数の要素を含む複雑なフィルター式、特に CJK 文字のような非 ASCII 文字を含むものは、クエリ性能に大きな影響を与える可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析に費やす時間を削減して効率を向上させるよう設計されたフィルター式テンプレート化メカニズムを導入しています。このページでは、search、query、および delete 操作でフィルター式テンプレート化を使用する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

フィルター式の左辺にあるリテラルは、以下の例で使用されている `age`、`city` などの collection フィールド名、または `filter = 'struct[0][subfield] > {var}'` のように特定の要素インデックスにある StructArray のサブフィールド名のいずれかです。 

StructArray フィールドにおける scalar フィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## Overview\{#overview}

フィルター式テンプレート化を使用すると、クエリ実行時に値へ動的に置き換えられるプレースホルダー付きのフィルター式を作成できます。テンプレート化を使うことで、大きな配列や複雑な式を直接フィルターに埋め込む必要がなくなり、解析時間を短縮してクエリ性能を向上させることができます。

たとえば、`age` と `city` という 2 つのフィールドを含むフィルター式があり、年齢が 25 より大きく、かつ "北京" (Beijing) または "上海" (Shanghai) に住んでいるすべての人を見つけたいとします。値をフィルター式に直接埋め込む代わりに、テンプレートを使用できます。

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

ここで、`{age}` と `{city}` はプレースホルダーであり、クエリ実行時に `filter_params` 内の実際の値に置き換えられます。

Zilliz Cloud でフィルター式テンプレート化を使用することには、いくつかの重要な利点があります。

- **解析時間の短縮**: 大きいまたは複雑なフィルター式をプレースホルダーに置き換えることで、システムがフィルターを解析および処理する時間を削減できます。

- **クエリ性能の向上**: 解析オーバーヘッドが減ることでクエリ性能が向上し、より高い QPS とより速い応答時間が実現します。

- **スケーラビリティ**: データセットが大きくなり、フィルター式がより複雑になっても、テンプレート化によって性能を効率的かつスケーラブルに維持できます。

## Search Operations\{#search-operations}

Zilliz Cloud の search 操作では、`filter` 式を使用してフィルタリング条件を定義し、`filter_params` パラメーターを使用してプレースホルダーの値を指定します。`filter_params` ディクショナリには、Zilliz Cloud がフィルター式に代入する動的な値が含まれます。

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

## Query Operations\{#query-operations}

同じテンプレート化メカニズムは、Zilliz Cloud の query 操作にも適用できます。`query` 関数では、フィルター式を定義し、`filter_params` を使用して置き換える値を指定します。

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

`filter_params` を使用することで、Zilliz Cloud は値の動的な挿入を効率的に処理し、query 実行速度を向上させます。

## Delete Operations\{#delete-operations}

delete 操作でもフィルター式テンプレート化を使用できます。search や query と同様に、`filter` 式で条件を定義し、`filter_params` でプレースホルダー用の動的な値を提供します。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

このアプローチは、特に複雑なフィルター条件を扱う場合に、delete 操作の性能を向上させます。

## Regex filter templates\{#regex-filter-templates}

正規表現フィルターでもフィルター式テンプレート化を使用できます。これは、正規表現パターンがリクエスト時に提供される場合に便利です。

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

テンプレート値は、有効な RE2 正規表現パターンを含む文字列である必要があります。Zilliz Cloud はフィルターを実行する前にそのパターンを検証します。

フィルターテンプレートでは、正規表現パターンをフィルター式に連結するのではなく、値として渡します。これにより、式解析のオーバーヘッドが削減され、パターンに引用符や演算子が含まれている場合でも誤ってフィルター構造が変更されるのを防げます。

## Conclusion\{#conclusion}

フィルター式テンプレート化は、Zilliz Cloud におけるクエリ性能最適化のための重要なツールです。プレースホルダーと `filter_params` ディクショナリを使用することで、複雑なフィルター式の解析に費やす時間を大幅に削減できます。これにより、クエリ実行が高速化され、全体的な性能が向上します。
