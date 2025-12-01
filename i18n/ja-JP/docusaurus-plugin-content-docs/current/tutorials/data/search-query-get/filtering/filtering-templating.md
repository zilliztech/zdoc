---
title: "フィルター テンプレート | Cloud"
slug: /filtering-templating
sidebar_label: "フィルター テンプレート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、多数の要素を含む複雑なフィルター式、特にCJK文字のような非ASCII文字を含む式は、クエリパフォーマンスに大きな影響を与える可能性があります。これを解決するため、Zilliz Cloudでは複雑な式の解析に要する時間を短縮し効率を改善するために設計されたフィルター式テンプレートメカニズムを導入しています。このページでは、検索、クエリ、削除操作におけるフィルター式テンプレートの使用方法を説明します。| Cloud"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - フィルタリングテンプレート
  - ベクトルデータベース
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル

---

import Admonition from '@theme/Admonition';


# フィルター テンプレート

Zilliz Cloudでは、多数の要素を含む複雑なフィルター式、特にCJK文字のような非ASCII文字を含む式は、クエリパフォーマンスに大きな影響を与える可能性があります。これを解決するため、Zilliz Cloudでは複雑な式の解析に要する時間を短縮し効率を改善するために設計されたフィルター式テンプレートメカニズムを導入しています。このページでは、検索、クエリ、削除操作におけるフィルター式テンプレートの使用方法を説明します。

## 概要\{#overview}

フィルター式テンプレートを使用すると、プレースホルダーを含むフィルター式を作成し、クエリ実行中に動的に値を代入できます。テンプレートを使用することで、フィルターに大きな配列や複雑な式を直接埋め込むことを避け、解析時間を短縮しクエリパフォーマンスを向上させることができます。

`age`と`city`の2つのフィールドを含むフィルター式があり、年齢が25より大きく、"北京"（北京）または"上海"（上海）に住んでいるすべての人を見つけるとします。フィルター式に直接値を埋め込む代わりに、テンプレートを使用できます：

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

ここで、`{age}`と`{city}`はプレースホルダーであり、クエリが実行されるときに`filter_params`内の実際の値に置き換えられます。

Zilliz Cloudでフィルター式テンプレートを使用するには、いくつかの主な利点があります：

- **解析時間の短縮**：大きなまたは複雑なフィルター式をプレースホルダーで置き換えることで、システムがフィルターの解析と処理に費やす時間が短縮されます。

- **クエリパフォーマンスの向上**：解析のオーバーヘッドが減少することで、クエリパフォーマンスが向上し、より高いQPSと高速な応答時間につながります。

- **スケーラビリティ**：データセットが増大しフィルター式が複雑になるにつれて、テンプレート化によりパフォーマンスが効率的でスケーラブルな状態を維持します。

## 検索操作\{#search-operations}

Zilliz Cloudの検索操作では、`filter`式を使用してフィルタリング条件を定義し、`filter_params`パラメータを使用してプレースホルダーの値を指定します。`filter_params`辞書には、Zilliz Cloudがフィルター式に代入する動的値が含まれています。

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

この例では、Zilliz Cloudは検索を実行する際に、`{age}`を`25`に、`{city}`を`["北京", "上海"]`に動的に置き換えます。

## クエリ操作\{#query-operations}

同じテンプレートメカニズムをZilliz Cloudのクエリ操作にも適用できます。`query`関数では、フィルター式を定義し、`filter_params`を使用して代入する値を指定します。

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

`filter_params`を使用することで、Zilliz Cloudは値の動的挿入を効率的に処理し、クエリ実行の高速化を実現します。

## 削除操作\{#delete-operations}

削除操作でもフィルター式テンプレートを使用できます。検索およびクエリと同様に、`filter`式が条件を定義し、`filter_params`がプレースホルダーの動的値を提供します。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

このアプローチにより、特に複雑なフィルター条件を処理する場合に削除操作のパフォーマンスが向上します。

## 結論\{#conclusion}

フィルター式テンプレートは、Zilliz Cloudでクエリパフォーマンスを最適化するための重要なツールです。プレースホルダーと`filter_params`辞書を使用することで、複雑なフィルター式の解析に要する時間を大幅に短縮できます。これにより、クエリ実行が高速化され、全体的なパフォーマンスが向上します。