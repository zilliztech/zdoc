---
title: "フィルターテンプレート | BYOC"
slug: /filtering-templating
sidebar_label: "フィルターテンプレート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、多数の要素を含む複雑なフィルター式、特にCJK文字などの非ASCII文字を含むフィルター式は、クエリパフォーマンスに大きな影響を与える可能性があります。これに対処するため、Zilliz Cloudは複雑な式の解析時間を短縮することで効率を向上させるために設計されたフィルター式テンプレートメカニズムを導入しています。このページでは、検索、クエリ、削除操作におけるフィルター式テンプレートの使用方法について説明します。 | BYOC"
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
  - 管理型ベクトルデータベース
  - Pineconeベクトルデータベース
  - 音声検索
  - セマンティック検索とは

---

import Admonition from '@theme/Admonition';


# フィルターテンプレート

Zilliz Cloudでは、多数の要素を含む複雑なフィルター式、特にCJK文字などの非ASCII文字を含むフィルター式は、クエリパフォーマンスに大きな影響を与える可能性があります。これに対処するため、Zilliz Cloudは複雑な式の解析時間を短縮することで効率を向上させるために設計されたフィルター式テンプレートメカニズムを導入しています。このページでは、検索、クエリ、削除操作におけるフィルター式テンプレートの使用方法について説明します。

## 概要\{#overview}

フィルター式テンプレートを使用すると、プレースホルダーを含むフィルター式を作成でき、クエリ実行中に動的に値を置換できます。テンプレートを使用することで、フィルターに大きな配列や複雑な式を直接埋め込むことを避け、解析時間を短縮し、クエリパフォーマンスを向上させることができます。

例えば、`age`と`city`の2つのフィールドを含むフィルター式があり、年齢が25歳より大きく、「北京」(北京)または「上海」(上海)に住んでいるすべての人を見つけるとします。フィルター式に値を直接埋め込む代わりに、テンプレートを使用できます。

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

ここで、`{age}`および`{city}`はプレースホルダーであり、クエリ実行時に`filter_params`内の実際の値に置き換えられます。

Zilliz Cloudでフィルター式テンプレートを使用するには、いくつかの重要な利点があります：

- **解析時間の短縮**: 大きなまたは複雑なフィルター式をプレースホルダーで置き換えることで、システムがフィルターの解析および処理に費やす時間が短縮されます。

- **クエリパフォーマンスの向上**: 解析オーバーヘッドが削減されたため、クエリパフォーマンスが向上し、より高いQPSと迅速な応答時間を実現します。

- **スケーラビリティ**: データセットが増加し、フィルター式が複雑になっても、テンプレートによりパフォーマンスが効率的でスケーラブルなまま維持されます。

## 検索操作\{#search-operations}

Zilliz Cloudの検索操作では、`filter`式を使用してフィルタリング条件を定義し、`filter_params`パラメータを使用してプレースホルダーの値を指定します。`filter_params`辞書には、Zilliz Cloudがフィルター式に置換するための動的値が含まれています。

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

この例では、Zilliz Cloudは検索を実行する際に`{age}`を`25`に、`{city}`を`["北京", "上海"]`に動的に置換します。

## クエリ操作\{#query-operations}

同じテンプレートメカニズムをZilliz Cloudのクエリ操作にも適用できます。`query`関数では、フィルター式を定義し、`filter_params`を使用して置換する値を指定します。

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

`filter_params`を使用することで、Zilliz Cloudは値の動的挿入を効率的に処理し、クエリ実行の速度を向上させます。

## 削除操作\{#delete-operations}

削除操作でもフィルター式テンプレートを使用できます。検索およびクエリと同様に、`filter`式は条件を定義し、`filter_params`はプレースホルダーの動的値を提供します。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

この方法により、特に複雑なフィルター条件を処理する場合の削除操作のパフォーマンスが向上します。

## 結論\{#conclusion}

フィルター式テンプレートは、Zilliz Cloudのクエリパフォーマンスを最適化するための重要なツールです。プレースホルダーと`filter_params`辞書を使用することで、複雑なフィルター式の解析に費やす時間を大幅に短縮できます。これにより、迅速なクエリ実行とより良い全体的なパフォーマンスが実現されます。