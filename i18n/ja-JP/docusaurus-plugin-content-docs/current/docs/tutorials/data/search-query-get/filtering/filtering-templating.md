---
title: "フィルターテンプレート | Cloud"
slug: /filtering-templating
sidebar_label: "フィルターテンプレート"
beta: PUBLIC
notebook: FALSE
description: "Zilliz Cloudにおいて、特にC JK文字のような非ASCII文字を含む多数の要素を持つ複雑なフィルタ式は、クエリのパフォーマンスに大きな影響を与える可能性があります。これを解決するために、Zilliz Cloudは、複雑な式の解析にかかる時間を短縮するために設計されたフィルタ式テンプレートメカニズムを導入しています。このページでは、検索、クエリ、削除操作でフィルタ式テンプレートを使用する方法について説明します。 | Cloud"
type: origin
token: QyrHwOGKQigS1dkBX5fcbRqsnEf
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
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database

---

import Admonition from '@theme/Admonition';


# フィルターテンプレート

Zilliz Cloudにおいて、特にC JK文字のような非ASCII文字を含む多数の要素を持つ複雑なフィルタ式は、クエリのパフォーマンスに大きな影響を与える可能性があります。これを解決するために、Zilliz Cloudは、複雑な式の解析にかかる時間を短縮するために設計されたフィルタ式テンプレートメカニズムを導入しています。このページでは、検索、クエリ、削除操作でフィルタ式テンプレートを使用する方法について説明します。

## 概要について{#}

フィルター式のテンプレートを使用すると、プレースホルダーを持つフィルター式を作成し、クエリの実行中に動的に値に置き換えることができます。テンプレートを使用すると、大きな配列や複雑な式をフィルターに直接埋め込む必要がなくなり、解析時間が短縮され、クエリのパフォーマンスが向上します。

例えば、`年齢`と`都市`の2つのフィールドを含むフィルター式があり、年齢が大なり25歳で「北京」または「上海」に住んでいるすべての人を見つけたいとします。フィルター式に値を直接埋め込む代わりに、テンプレートを使用することができます

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

ここで、`{age}`と`{city}`はプレースホルダーであり、クエリが実行されると`filter_params`内の実際の値に置き換えられます。

Zilliz Cloudでフィルター式テンプレートを使用すると、いくつかの重要な利点があります。

- **解析時間の短縮**:大きなまたは複雑なフィルター式をプレースホルダーで置き換えることで、システムはフィルターの解析と処理にかかる時間を短縮できます。

- **クエリパフォーマンスの向上**:解析のオーバーヘッドを削減することで、クエリパフォーマンスが向上し、QPSが向上し、応答時間が短縮されます。

- **スケーラビリティ**:データセットが増え、フィルター式が複雑になっても、テンプレートによってパフォーマンスが効率的かつスケーラブルに保たれます。

## 検索オペレーション{#}

Zilliz Cloudでの検索操作では、`フィルタ`条件を定義するためにフィルタ式が使用され、`filter_params`パラメータはプレースホルダの値を指定するために使用されます。`filter_params`ディクショナリには、Zilliz Cloudがフィルタ式に置き換えるために使用する動的な値が含まれています。

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

この例では、Zilliz Cloudは、検索を実行する際に`{age}`を`25`に、`{city}`を`["北京","上海"]`に動的に置き換えます。

## クエリ操作{#}

Zilliz Cloudでは、同じテンプレートメカニズムをクエリ操作に適用できます。`クエリ`関数では、フィルタ式を定義し、`filter_params`を使用して置換する値を指定します。

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

Zilliz Cloudは、`filter_params`を使用することで、動的な値の挿入を効率的に処理し、クエリの実行速度を向上させます。

## 操作の削除{#}

削除操作でもフィルター式のテンプレートを使用できます。検索やクエリと同様に、`フィルター`式は条件を定義し、`filter_params`はプレースホルダーの動的な値を提供します。

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

## 結論として{#}

フィルタ式のテンプレートは、Zilliz Cloudでクエリのパフォーマンスを最適化するための必須ツールです。プレースホルダーと`filter_params`辞書を使用することで、複雑なフィルタ式の解析にかかる時間を大幅に短縮できます。これにより、クエリの実行が高速化し、全体的なパフォーマンスが向上します。