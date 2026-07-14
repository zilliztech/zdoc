---
title: "JSON Shredding | BYOC"
slug: /json-shredding
sidebar_label: "Shredding"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON shredding は、従来の行ベースのストレージを最適化されたカラムナストレージに変換することで、JSON クエリを高速化します。JSON のデータモデリングにおける柔軟性を維持しながら、Zilliz Cloud はバックグラウンドでカラムナ最適化を実行し、アクセス効率とクエリ効率を大幅に向上させます。 | BYOC"
type: origin
token: Dh8MwFuZliYf9Wkhee3c1FhUnGd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON Shredding

JSON shredding は、従来の行ベースのストレージを最適化されたカラムナストレージに変換することで、JSON クエリを高速化します。JSON のデータモデリングにおける柔軟性を維持しながら、Zilliz Cloud はバックグラウンドでカラムナ最適化を実行し、アクセス効率とクエリ効率を大幅に向上させます。

JSON shredding は、ほとんどの JSON クエリシナリオで効果的です。特に次のような場合に、パフォーマンス上の利点がより顕著になります。

- **より大きく複雑な JSON ドキュメント** - ドキュメントサイズが大きくなるほど、より大きなパフォーマンス向上が得られます

- **読み取り中心のワークロード** - JSON キーに対するフィルタリング、ソート、検索を頻繁に行う場合

- **混在したクエリパターン** - 異なる JSON キーにまたがるクエリは、ハイブリッドストレージアプローチの恩恵を受けます

## 仕組み\{#how-it-works}

JSON shredding のプロセスは、高速な取得に向けてデータを最適化するために、3 つの明確なフェーズで行われます。

### フェーズ 1: 取り込みとキー分類\{#phase-1-ingestion-and-key-classification}

新しい JSON ドキュメントが書き込まれると、Zilliz Cloud は継続的にそれらをサンプリングおよび分析し、各 JSON キーの統計情報を構築します。この分析には、キーの出現率と型の安定性（ドキュメント間でそのデータ型が一貫しているかどうか）が含まれます。

これらの統計に基づいて、JSON キーは最適なストレージのために次のように分類されます。

#### JSON キーのカテゴリ\{#categories-of-json-keys}

| キータイプ | 説明 |
| --- | --- |
| Typed keys | ほとんどのドキュメントに存在し、常に同じデータ型を持つキー（例: すべて整数、またはすべて文字列）。 |
| Dynamic keys | 頻繁に出現するが、データ型が混在しているキー（例: 文字列の場合もあれば整数の場合もある）。 |
| Shared keys | 出現頻度が低いキー、または設定可能な頻度しきい値を下回るネストされたキー。 |

#### 分類例\{#example-classification}

以下の JSON キーを含むサンプル JSON データを考えてみましょう。

```json
{"a": 10, "b": "str1", "f": 1}
{"a": 20, "b": "str2", "f": 2}  
{"a": 30, "b": "str3", "f": 3}
{"a": 40, "b": 1, "f": 4}       // b becomes mixed type
{"a": 50, "b": 2, "e": "rare"}  // e appears infrequently
```

このデータに基づくと、キーは次のように分類されます。

- **Typed keys**: `a` と `f`（常に整数）

- **Dynamic keys**: `b`（文字列と整数が混在）

- **Shared keys**: `e`（出現頻度の低いキー）

### フェーズ 2: ストレージ最適化\{#phase-2-storage-optimization}

[フェーズ 1](./json-shredding#phase-1-ingestion-and-key-classification) での分類によって、ストレージレイアウトが決まります。Zilliz Cloud は、クエリに最適化されたカラムナ形式を使用します。

![FcrMw6pY8h2jE8b2PQ3cp4fTnch](https://zdoc-images.s3.us-west-2.amazonaws.com/FcrMw6pY8h2jE8b2PQ3cp4fTnch.png)

- **Shredded columns**: **typed** および **dynamic** **keys** については、データは専用の列に書き込まれます。このカラムナストレージにより、クエリ時の高速で直接的なスキャンが可能になります。これは、Zilliz Cloud がドキュメント全体を処理することなく、指定されたキーに必要なデータのみを読み取れるためです。

- **Shared column**: すべての **shared keys** は、1 つのコンパクトなバイナリ JSON 列にまとめて格納されます。この列には、shared-key **inverted index** が構築されます。この index は、低頻度キーに対するクエリを高速化するために重要です。Zilliz Cloud がデータをすばやく枝刈りし、指定されたキーを含む行のみに検索空間を効果的に絞り込めるようになるためです。

### フェーズ 3: クエリ実行\{#phase-3-query-execution}

最後のフェーズでは、最適化されたストレージレイアウトを活用して、各クエリ述語に対して最速のパスをインテリジェントに選択します。

- **Fast path**: typed/dynamic keys に対するクエリ（例: `json['a'] < 100`）は専用列に直接アクセスします

- **Optimized path**: shared keys に対するクエリ（例: `json['e'] = 'rare'`）は inverted index を使用して関連ドキュメントをすばやく特定します

## パフォーマンスベンチマーク\{#performance-benchmarks}

当社のテストでは、さまざまな JSON キータイプとクエリパターンにおいて、大幅なパフォーマンス向上が確認されています。

### テスト環境と方法論\{#test-environment-and-methodology}

- **ハードウェア**: 1 core/8GB cluster

- **データセット**: [JSONBench](https://github.com/ClickHouse/JSONBench.git) の 100 万ドキュメント

- **平均ドキュメントサイズ**: 478.89 bytes

- **テスト期間**: QPS とレイテンシを測定する 100 秒間

### 結果: typed keys\{#results-typed-keys}

このテストでは、ほとんどのドキュメントに存在するキーをクエリした際のパフォーマンスを測定しました。

| Query Expression | Key Value Type | QPS (without shredding) | QPS (with shredding) | Performance Boost |
| --- | --- | --- | --- | --- |
| `json['time_us'] > 0` | Integer | 8.69 | 287.50 | 33x |
| `json['kind'] == 'commit'` | String | 8.42 | 126.1 | 14.9x |

### 結果: shared keys\{#results-shared-keys}

このテストでは、"shared" カテゴリに分類されるスパースなネストキーのクエリに焦点を当てました。

| Query Expression | Key Value Type | QPS (without shredding) | QPS (with shredding) | Performance Boost |
| --- | --- | --- | --- | --- |
| `json['identity']['seq'] > 0` | Nested Integer | 4.33 | 385 | 88.9x |
| `json['identity']['did'] == 'xxxxx'` | Nested String | 7.6 | 352 | 46.3x |

### 主な知見\{#key-insights}

- **Shared key クエリ**では、最も劇的な改善が見られます（最大 89 倍高速）

- **Typed key クエリ**では、15～30 倍の一貫したパフォーマンス向上が得られます

- **すべてのクエリタイプ**が JSON Shredding の恩恵を受け、パフォーマンス低下はありません

## FAQ\{#faq}

- **JSON shredding と JSON indexing はどのように選べばよいですか？**

    - **JSON shredding** は、ドキュメント内に頻繁に現れるキー、特に複雑な JSON 構造を持つ場合に最適です。カラムナストレージと inverted indexing の利点を組み合わせており、多くの異なるキーをクエリする読み取り中心のシナリオに適しています。ただし、非常に小さな JSON ドキュメントには推奨されません。パフォーマンス向上が最小限だからです。キーの値が JSON ドキュメント全体のサイズに占める割合が小さいほど、shredding によるパフォーマンス最適化の効果は高くなります。

    - **JSON indexing** は、特定のキーに基づくクエリを狙って最適化する場合に適しており、ストレージオーバーヘッドも低く抑えられます。よりシンプルな JSON 構造に向いています。なお、JSON shredding は配列内のキーに対するクエリには対応していないため、それらを高速化するには JSON index が必要です。

    詳細については、[JSON Field Overview](./json-field-overview#next-accelerate-json-queries) を参照してください。

