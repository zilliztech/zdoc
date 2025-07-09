---
title: "フィルターテンプレート | Cloud"
slug: /filtering-templating
sidebar_label: "フィルターテンプレート"
beta: FALSE
notebook: FALSE
description: "にZillizクラウド複数の要素を含む複雑なフィルタ式、特にCJK文字のような非ASCII文字を含むものは、クエリのパフォーマンスに大きな影響を与える可能性があります。これに対処するために、Zillizクラウド複雑な式の解析にかかる時間を短縮し、効率を向上させるために設計されたフィルタ式テンプレートメカニズムを紹介します。このページでは、検索、クエリ、削除操作でのフィルタ式テンプレートの使用方法について説明します。 | Cloud"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - filtering templating
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';


# フィルターテンプレート

にZillizクラウド複数の要素を含む複雑なフィルタ式、特にCJK文字のような非ASCII文字を含むものは、クエリのパフォーマンスに大きな影響を与える可能性があります。これに対処するために、Zillizクラウド複雑な式の解析にかかる時間を短縮し、効率を向上させるために設計されたフィルタ式テンプレートメカニズムを紹介します。このページでは、検索、クエリ、削除操作でのフィルタ式テンプレートの使用方法について説明します。

## 概要について{#overview}

フィルター式のテンプレートを使用すると、プレースホルダーを持つフィルター式を作成し、クエリの実行中に動的に値に置き換えることができます。テンプレートを使用すると、大きな配列や複雑な式をフィルターに直接埋め込む必要がなくなり、解析時間が短縮され、クエリのパフォーマンスが向上します。

`age`と`city`の2つのフィールドを含むフィルター式があり、年齢が大なり25歳で「北京」(Beijing)または「上海」(Shanghai)に住んでいるすべての人を見つけたいとします。フィルター式に値を直接埋め込む代わりに、テンプレートを使用できます

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

ここで、`{age}`と`{city}`は、クエリの実行時に`filter_params`の実際の値に置き換えられるプレースホルダーです。

フィルター式のテンプレートを使用するZillizクラウドいくつかの主な利点があります:

- **解析時間の短縮**:大きなまたは複雑なフィルター式をプレースホルダーで置き換えることにより、システムはフィルターの解析と処理にかかる時間を短縮します。

- 改善されたクエリパフォーマンス:解析オーバーヘッドを減らすことで、クエリパフォーマンスが向上し、QPSが向上し、応答時間が短縮されます。

- スケーラビリティ:データセットが増え、フィルター式が複雑になるにつれて、テンプレート化によりパフォーマンスが効率的かつスケーラブルに保たれます。

## 検索オペレーション{#search-operations}

検索操作のためにZillizクラウド`filter`式はフィルタリング条件を定義するために使用され、`filter_params`パラメーターはプレースホルダーの値を指定するために使用されます。`filter_params`ディクショナリには、動的な値が含まれていますZillizクラウドフィルタ式に代入するために使用されます。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.search(
    "hello_milvus",
    vectors[:nq],
    filter=expr,
    limit=10,
    output_fields=["age", "city"],
    search_params={"metric_type": "COSINE", "params": {"search_list": 100}},
    filter_params=filter_params,
)
```

この例では、Zillizクラウド検索実行時に、`{age}`を`25`に、`{city}`を`["北京", "上海"]`に動的に置き換えます。

## クエリ操作{#query-operations}

同じテンプレートメカニズムは、クエリ操作にも適用できますZillizクラウド`query`関数では、フィルター式を定義し、`filter_params`を使用して置換する値を指定します。

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

`filter_params`を使用することで、Zillizクラウド値の動的挿入を効率的に処理し、クエリ実行の速度を向上させます。

## 操作の削除{#delete-operations}

削除操作でフィルター式のテンプレートを使用することもできます。検索やクエリと同様に、`filter`式は条件を定義し、`filter_params`式はプレースホルダーの動的な値を提供します。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

このアプローチは、特に複雑なフィルター条件を扱う場合に、削除操作のパフォーマンスを向上させます。

## 結論として{#conclusion}

フィルター式テンプレートは、クエリのパフォーマンスを最適化するための必須ツールですZillizクラウドプレースホルダと`filter_params`ディクショナリを使用すると、複雑なフィルタ式の解析にかかる時間を大幅に短縮できます。これにより、クエリの実行が高速化し、全体的なパフォーマンスが向上します。