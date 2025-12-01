---
title: "JSON Shredding | Cloud"
slug: /json-shredding
sidebar_label: "JSON Shredding"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON shreddingは、従来の行ベースストレージを最適化された列ベースストレージに変換することでJSONクエリを高速化します。データモデリングの柔軟性を維持しながら、Zilliz Cloudはバックグラウンドで列ベースの最適化を実行し、アクセスおよびクエリ効率を劇的に向上させます。 | Cloud"
type: origin
token: Dh8MwFuZliYf9Wkhee3c1FhUnGd
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - json field
  - json shredding
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model

---

import Admonition from '@theme/Admonition';


# JSON Shredding

JSON shreddingは、従来の行ベースストレージを最適化された列ベースストレージに変換することでJSONクエリを高速化します。データモデリングの柔軟性を維持しながら、Zilliz Cloudはバックグラウンドで列ベースの最適化を実行し、アクセスおよびクエリ効率を劇的に向上させます。

JSON shreddingは、ほとんどのJSONクエリシナリオに有効です。パフォーマンスの利点は以下の場合により顕著になります：

- **より大きく複雑なJSONドキュメント** - ドキュメントサイズが大きくなるほどパフォーマンスの向上が大きくなります

- **読み取り中心のワークロード** - JSONキーの頻繁なフィルタリング、ソート、または検索

- **混合クエリパターン** - 異なるJSONキーにわたるクエリはハイブリッドストレージ方式から利益を得ます

## 仕組み\{#how-it-works}

JSON shreddingプロセスは、高速な取得のためにデータを最適化する三つの異なる段階で行われます。

### 段階1：インジェストおよびキー分類\{#phase-1-ingestion-and-key-classification}

新しいJSONドキュメントが書き込まれる際、Zilliz Cloudはそれらを継続的にサンプリングおよび分析してJSONキーごとに統計情報を構築します。この分析には、キーの出現率と型の安定性（ドキュメント全体でデータ型が一貫しているか）が含まれます。

これらの統計情報に基づき、JSONキーは最適なストレージ用に以下のように分類されます。

#### JSONキーのカテゴリ\{#categories-of-json-keys}

<table>
   <tr>
     <th><p>キーの種類</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>型付きキー</p></td>
     <td><p>ほとんどのドキュメントに存在し、常に同じデータ型を持つキー（例：すべて整数またはすべて文字列）です。</p></td>
   </tr>
   <tr>
     <td><p>動的キー</p></td>
     <td><p>頻繁に出現するが、混合データ型を持つキー（例：場合により文字列または整数）です。</p></td>
   </tr>
   <tr>
     <td><p>共有キー</p></td>
     <td><p>設定可能な頻度のしきい値を下回る、出現頻度が低いまたはネストされたキーです。</p></td>
   </tr>
</table>

#### 例：分類\{#example-classification}

以下のJSONキーを含むサンプルJSONデータを検討してください：

```json
{"a": 10, "b": "str1", "f": 1}
{"a": 20, "b": "str2", "f": 2}
{"a": 30, "b": "str3", "f": 3}
{"a": 40, "b": 1, "f": 4}       // bが混合型になる
{"a": 50, "b": 2, "e": "rare"}  // eが低頻度で出現
```

このデータに基づき、キーは以下のように分類されます：

- **型付きキー**: `a` および `f`（常に整数）

- **動的キー**: `b`（混合型の文字列/整数）

- **共有キー**: `e`（出現頻度が低いキー）

### 段階2：ストレージ最適化\{#phase-2-storage-optimization}

段階1の分類結果は、ストレージレイアウトを決定します。Zilliz Cloudはクエリに最適化された列ベースの形式を使用します。

![FcrMw6pY8h2jE8b2PQ3cp4fTnch](/img/FcrMw6pY8h2jE8b2PQ3cp4fTnch.png)

- **分割列**: **型付き**キーおよび**動的**キーについて、データは専用の列に書き込まれます。この列ベースストレージにより、クエリ時の高速直接スキャンが可能になり、Zilliz Cloudは指定されたキーのデータのみを処理する必要があり、ドキュメント全体を処理する必要がありません。

- **共有列**: すべての**共有**キーは、単一のコンパクトなバイナリJSON列に一緒に保存されます。共有キーの**逆インデックス**がこの列に構築されます。このインデックスは、指定されたキーを含む行のみに検索範囲を効果的に絞り込むことで、低頻度キーのクエリを高速化する上で不可欠です。

### 段階3：クエリ実行\{#phase-3-query-execution}

最終段階では、最適化されたストレージレイアウトを活用して、各クエリ条件に最速のパスを賢く選択します。

- **高速パス**: 型付き/動的なキーのクエリ（例：`json['a'] < 100`）は専用の列に直接アクセスします

- **最適化パス**: 共有キーのクエリ（例：`json['e'] = 'rare'`）は逆インデックスを使用して関連ドキュメントを迅速に特定します

## パフォーマンスベンチマーク\{#performance-benchmarks}

テストでは、異なるJSONキー型およびクエリパターンで著しいパフォーマンス向上が確認されました。

### テスト環境および方法論\{#test-environment-and-methodology}

- **ハードウェア**: 1コア/8GBクラスター

- **データセット**: [JSONBench](https://github.com/ClickHouse/JSONBench.git) から100万ドキュメント

- **平均ドキュメントサイズ**: 478.89バイト

- **テスト期間**: QPSおよびレイテンシを測定した100秒

### 結果：型付きキー\{#results-typed-keys}

このテストでは、ほとんどのドキュメントに存在するキーのクエリ時のパフォーマンスを測定しました。

<table>
   <tr>
     <th><p>クエリ式</p></th>
     <th><p>キーの値の型</p></th>
     <th><p>QPS（shreddingなし）</p></th>
     <th><p>QPS（shreddingあり）</p></th>
     <th><p>パフォーマンス向上</p></th>
   </tr>
   <tr>
     <td><p><code>json['time_us'] &gt; 0</code></p></td>
     <td><p>整数</p></td>
     <td><p>8.69</p></td>
     <td><p>287.50</p></td>
     <td><p>33倍</p></td>
   </tr>
   <tr>
     <td><p><code>json['kind'] == 'commit'</code></p></td>
     <td><p>文字列</p></td>
     <td><p>8.42</p></td>
     <td><p>126.1</p></td>
     <td><p>14.9倍</p></td>
   </tr>
</table>

### 結果：共有キー\{#results-shared-keys}

このテストでは、"共有"カテゴリに分類されるスパースなネストされたキーのクエリに焦点を当てました。

<table>
   <tr>
     <th><p>クエリ式</p></th>
     <th><p>キーの値の型</p></th>
     <th><p>QPS（shreddingなし）</p></th>
     <th><p>QPS（shreddingあり）</p></th>
     <th><p>パフォーマンス向上</p></th>
   </tr>
   <tr>
     <td><p><code>json['identity']['seq'] &gt; 0</code></p></td>
     <td><p>ネストされた整数</p></td>
     <td><p>4.33</p></td>
     <td><p>385</p></td>
     <td><p>88.9倍</p></td>
   </tr>
   <tr>
     <td><p><code>json['identity']['did'] == 'xxxxx'</code></p></td>
     <td><p>ネストされた文字列</p></td>
     <td><p>7.6</p></td>
     <td><p>352</p></td>
     <td><p>46.3倍</p></td>
   </tr>
</table>

### 主な知見\{#key-insights}

- **共有キークエリ**は最も劇的な改善を示します（最大89倍高速）

- **型付きキークエリ**は一貫した15-30倍のパフォーマンス向上を提供します

- **すべてのクエリ型**は、パフォーマンスの低下なしにJSON Shreddingの恩益を受けます

## よくある質問\{#faq}

- **JSON shreddingとJSONインデックスの選択肢をどう選べばよいですか？**

    - **JSON shredding**はドキュメント内に頻繁に出現するキーに最適で、特に複雑なJSON構造に適しています。列ベースストレージと逆インデックスの利点を組み合わせており、多くの異なるキーをクエリする読み取り中心のシナリオに適しています。ただし、非常に小さなJSONドキュメントには推奨されません。shreddingによるパフォーマンス最適化の恩益は、JSONドキュメント全体に対するキー値の割合が小さいほどよく得られます。

    - **JSONインデックス**は特定のキーベースクエリのターゲット最適化に適しており、ストレージオーバーヘッドが低くなります。単純なJSON構造に適しています。JSON shreddingは配列内のキーに対するクエリをカバーしないことに注意してください。そのため、それらを高速化するにはJSONインデックスが必要です。

    詳細については[JSONフィールドの概要](./json-field-overview#next-accelerate-json-queries)を参照してください。