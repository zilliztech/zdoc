---
title: "JSON Shredding | Cloud"
slug: /json-shredding
sidebar_label: "Shredding"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON shredding は、従来の行ベースのストレージを最適化されたカラムナストレージに変換することで、JSON クエリを高速化します。JSON のデータモデリングにおける柔軟性を維持しながら、Zilliz Cloud はバックグラウンドでカラムナ最適化を実行し、アクセス効率とクエリ効率を大幅に向上させます。 | Cloud"
type: origin
token: Dh8MwFuZliYf9Wkhee3c1FhUnGd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON Shredding

JSON shredding は、従来の行ベースのストレージを最適化されたカラムナストレージに変換することで、JSON クエリを高速化します。JSON のデータモデリングにおける柔軟性を維持しながら、Zilliz Cloud はバックグラウンドでカラムナ最適化を実行し、アクセス効率とクエリ効率を大幅に向上させます。

JSON shredding は、ほとんどの JSON クエリのシナリオで有効です。特に次の場合に、パフォーマンス上の利点がより顕著になります。

- **より大きく、より複雑な JSON ドキュメント** - ドキュメントサイズが大きくなるほど、パフォーマンス向上の効果が大きくなります

- **読み取り中心のワークロード** - JSON key に対して頻繁にフィルタリング、ソート、検索を行う場合

- **混在するクエリパターン** - 異なる JSON key をまたぐクエリは、ハイブリッドストレージアプローチの恩恵を受けます

## 仕組み\{#how-it-works}

JSON shredding のプロセスは、高速な取得に向けてデータを最適化するために、3 つの明確なフェーズで行われます。

### フェーズ 1: 取り込みと key の分類\{#phase-1-ingestion-and-key-classification}

新しい JSON ドキュメントが書き込まれると、Zilliz Cloud はそれらを継続的にサンプリングおよび分析し、各 JSON key の統計情報を構築します。この分析には、key の出現率や型の安定性（ドキュメント間でデータ型が一貫しているかどうか）が含まれます。

これらの統計に基づいて、JSON key は最適なストレージのために以下のように分類されます。

#### JSON key のカテゴリ\{#categories-of-json-keys}

| Key Type | Description |
| --- | --- |
| Typed keys | ほとんどのドキュメントに存在し、常に同じデータ型を持つ key（例: すべて整数、またはすべて文字列）。 |
| Dynamic keys | 頻繁に出現するものの、データ型が混在している key（例: 文字列の場合もあれば整数の場合もある）。 |
| Shared keys | 出現頻度が低い key、または設定可能な頻度しきい値を下回るネストされた key**。** |

#### 分類例\{#example-classification}

以下の JSON key を含むサンプル JSON データを考えてみましょう。

```json
{"a": 10, "b": "str1", "f": 1}
{"a": 20, "b": "str2", "f": 2}  
{"a": 30, "b": "str3", "f": 3}
{"a": 40, "b": 1, "f": 4}       // b becomes mixed type
{"a": 50, "b": 2, "e": "rare"}  // e appears infrequently
```

このデータに基づくと、key は次のように分類されます。

- **Typed keys**: `a` と `f`（常に整数）

- **Dynamic keys**: `b`（文字列と整数が混在）

- **Shared keys**: `e`（出現頻度の低い key）

### フェーズ 2: ストレージの最適化\{#phase-2-storage-optimization}

[フェーズ 1](./json-shredding#phase-1-ingestion-and-key-classification) での分類によって、ストレージレイアウトが決まります。Zilliz Cloud は、クエリ向けに最適化されたカラムナ形式を使用します。

![FcrMw6pY8h2jE8b2PQ3cp4fTnch](https://zdoc-images.s3.us-west-2.amazonaws.com/FcrMw6pY8h2jE8b2PQ3cp4fTnch.png)

- **Shredded columns**: **typed** および **dynamic** **keys** のデータは、専用の列に書き込まれます。このカラムナストレージにより、クエリ時に高速かつ直接的なスキャンが可能になります。Zilliz Cloud は、ドキュメント全体を処理することなく、特定の key に必要なデータだけを読み取れるためです。

- **Shared column**: すべての **shared keys** は、単一のコンパクトなバイナリ JSON 列にまとめて保存されます。この列には、shared-key の **inverted index** が構築されます。この index は、低頻度 key に対するクエリを高速化するうえで重要です。Zilliz Cloud は指定された key を含む行だけに検索範囲を効果的に絞り込み、データを素早くプルーニングできます。

### フェーズ 3: クエリ実行\{#phase-3-query-execution}

最後のフェーズでは、最適化されたストレージレイアウトを活用し、各クエリ述語に対して最速の経路をインテリジェントに選択します。

- **Fast path**: typed/dynamic key に対するクエリ（例: `json['a'] < 100`）は、専用列に直接アクセスします

- **Optimized path**: shared key に対するクエリ（例: `json['e'] = 'rare'`）は、inverted index を使用して関連ドキュメントを迅速に特定します

## パフォーマンスベンチマーク\{#performance-benchmarks}

当社のテストでは、さまざまな JSON key の種類とクエリパターンにわたって、大幅なパフォーマンス向上が確認されました。

### テスト環境と方法論\{#test-environment-and-methodology}

- **Hardware**: 1 core/8GB cluster

- **Dataset**: [JSONBench](https://github.com/ClickHouse/JSONBench.git) の 100 万件のドキュメント

- **Average document size**: 478.89 bytes

- **Test duration**: QPS とレイテンシを測定する 100 秒間

### 結果: typed keys\{#results-typed-keys}

このテストでは、ほとんどのドキュメントに存在する key をクエリした場合のパフォーマンスを測定しました。

| Query Expression | Key Value Type | QPS (without shredding) | QPS (with shredding) | Performance Boost |
| --- | --- | --- | --- | --- |
| `json['time_us'] > 0` | Integer | 8.69 | 287.50 | 33x |
| `json['kind'] == 'commit'` | String | 8.42 | 126.1 | 14.9x |

### 結果: shared keys\{#results-shared-keys}

このテストでは、"shared" カテゴリに分類される、まばらでネストされた key に対するクエリに焦点を当てました。

| Query Expression | Key Value Type | QPS (without shredding) | QPS (with shredding) | Performance Boost |
| --- | --- | --- | --- | --- |
| `json['identity']['seq'] > 0` | Nested Integer | 4.33 | 385 | 88.9x |
| `json['identity']['did'] == 'xxxxx'` | Nested String | 7.6 | 352 | 46.3x |

### 主なポイント\{#key-insights}

- **Shared key のクエリ** では、最も劇的な改善が見られます（最大 89 倍高速）

- **Typed key のクエリ** では、一貫して 15～30 倍のパフォーマンス向上が得られます

- **すべてのクエリタイプ** が JSON Shredding の恩恵を受け、パフォーマンス低下はありません

## FAQ\{#faq}

- **JSON shredding と JSON indexing はどう選べばよいですか？**

    - **JSON shredding** は、ドキュメント内に頻繁に出現する key、特に複雑な JSON 構造を持つ場合に最適です。これはカラムナストレージと inverted indexing の利点を組み合わせたもので、多くの異なる key をクエリする読み取り中心のシナリオに適しています。ただし、非常に小さな JSON ドキュメントには推奨されません。パフォーマンス向上が最小限だからです。key の値が JSON ドキュメント全体のサイズに占める割合が小さいほど、shredding によるパフォーマンス最適化の効果は高くなります。

    - **JSON indexing** は、特定の key ベースのクエリをピンポイントで最適化するのに適しており、ストレージのオーバーヘッドも低くなります。よりシンプルな JSON 構造に向いています。なお、JSON shredding は配列内の key に対するクエリを対象としていないため、それらを高速化するには JSON index が必要です。

    詳細については、[JSON Field の概要](./json-field-overview#next-accelerate-json-queries) を参照してください。

