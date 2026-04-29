---
title: "リリースノート（2024 年 6 月 18 日） | Cloud"
slug: /release-notes-290
sidebar_key: release-notes-290
sidebar_label: "2024 年 6 月 18 日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Milvus 2.4 を基盤とした Zilliz Cloud の新機能群を発表しました。スパースベクトルのサポート、マルチベクトル検索とハイブリッド検索の強化、クエリ高速化のための転置インデックスとファジーマッチング、ドキュメントレベルの再現率を実現するグループ化検索が含まれます。また、検索効率を向上させる Float16 および BFloat16 データ型も導入されました。さらに、Pipelines 機能では、データ取り込みおよび検索リクエストごとにトークン使用量統計を追跡できるようになり、パフォーマンス監視が簡素化されました。詳細な統計情報は請求書ページでご確認いただけます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 19
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年6月18日）

今回のリリースでは、Zilliz Cloud が Milvus 2.4 に基づく多数の新機能を提供します。これには、疎ベクトル（sparse vector）のサポート、強化されたマルチベクトルおよびハイブリッド検索、より高速なクエリを実現する転置インデックスとあいまい一致（fuzzy matching）、ドキュメントレベルでのリコールを可能にするグルーピング検索が含まれます。また、検索効率を向上させるための Float16 および BFloat16 データ型も導入されました。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストごとにトークン使用量の統計情報を追跡するようになり、パフォーマンス監視が容易になりました。詳細な統計情報は請求書ページで確認できます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

クラスターを BETA にアップグレードすることを選択した場合、**Milvus 2.4.x** の機能を利用できるようになります。

## Zilliz Cloud で利用可能な Milvus 2.4.x の新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4 は、RAG やマルチモーダルデータ検索に向けた多くの効率的な機能を提供します。これらの新機能を試したい場合は、クラスターを BETA に更新してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus 2.4 はまだ安定版に達していません。本番環境で Milvus 2.4 の機能を採用する際は十分に注意してください。</p>

</Admonition>

### 疎ベクトル（Sparse Vector）\{#sparse-vector}

疎ベクトルは密ベクトルとは異なり、次元数が非常に多く、そのうち非ゼロの要素はごくわずかです。この特性により、用語ベースの性質から解釈可能性が高く、特定のドメインにおいてより効果的です。SPLADEv2 や BGE-M3 のような学習済み疎モデルは、一般的な第1段階ランキングタスクにおいて有用であることが証明されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3 などのニューラルモデルや BM25 アルゴリズムなどの統計モデルによって生成された疎ベクトルに対して、効率的な近似意味的最近傍検索（MIPS：Maximum 内積 Search）を実行することです。Zilliz Cloud は現在、疎ベクトルの効率的かつ高性能な保存、インデックス作成、および検索をサポートしています。

詳細については、[Sparse Vector](./use-sparse-vector) ガイドおよび [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) のサンプルコードをご参照ください。*サンプルコード内の接続情報を、お客様の Zilliz Cloud クラスター認証情報に必ず更新してください。*

### マルチ埋め込み & ハイブリッド検索\{#multi-embedding-and-hybrid-search}

マルチベクトルのサポートは、マルチモデルデータ処理や密ベクトルと疎ベクトルの組み合わせを必要とするアプリケーションの基盤となります。マルチベクトルサポートにより、以下が可能になります：

- 複数のモデルによって生成された、非構造化テキスト・画像・音声サンプルのベクトル埋め込みを保存。
- 各エンティティに複数のベクトルを持つコレクションに対して ANN 検索を実行。
- 異なる埋め込みモデルに重みを割り当てることで、検索戦略をカスタマイズ。
- 複数の埋め込みモデルを試し、最適なモデルの組み合わせを探索。

マルチベクトルサポートにより、FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など異なるタイプの複数のベクトルフィールドを1つのコレクション内で保存・インデックス作成し、再ランキング戦略を適用できます。現在、利用可能な再ランキング戦略は **Reciprocal Rank Fusion (RRF)** および **平均加重スコアリング** の2つです。どちらの戦略も、異なるベクトルフィールドからの検索結果を統合された結果セットにまとめます。前者は複数のベクトルフィールドの検索結果に一貫して現れるエンティティを優先し、後者は各ベクトルフィールドの検索結果に重みを付与して最終結果における重要度を決定します。

詳細については、[Basic ANN Search](./single-vector-search) および [Hybrid Search](./hybrid-search) ガイド、ならびに [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) のサンプルコードをご参照ください。*サンプルコード内の接続情報を、お客様の Zilliz Cloud クラスター認証情報に必ず更新してください。*

### 転置インデックスとあいまい一致\{#inverted-index-and-fuzzy-match}

以前の Milvus リリースでは、スカラー フィールドのインデックスにメモリベースのバイナリ検索インデックスおよび Marisa Trie インデックスが使用されていましたが、これらはメモリを大量に消費していました。最新の Zilliz Cloud リリースでは、これらのメカニズムを最適化するために auto-index を採用しており、これはすべての数値型および文字列型データに適用可能です。この新しいインデックスにより、スカラークエリのパフォーマンスが大幅に向上し、文字列内のキーワード検索が10倍高速化されます。さらに、データ圧縮および内部インデックス構造のメモリマップ（MMap）機構による追加の最適化により、転置インデックスのメモリ消費量が削減されています。

今回のリリースでは、スカラー フィルタリングにおいてプレフィックス、インフィックス、サフィックスを使用したあいまい一致もサポートしています。

詳細については、[Binary Vector](./use-binary-vector)、[Index Scalar Fields](./index-scalar-fields)、および [`like`](./basic-filtering-operators#example-2-using-like-for-pattern-matching) 演算子に関するガイド、ならびに [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) および [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) のサンプルコードをご参照ください。*サンプルコード内の接続情報を、お客様の Zilliz Cloud クラスター認証情報に必ず更新し、AUTOINDEX を使用してください。*

### グルーピング検索\{#grouping-search}

特定のスカラー フィールドの値に基づいて検索結果を集約できるようになりました。これにより、RAG アプリケーションでドキュメントレベルのリコールを実装できます。例えば、ドキュメントのコレクションがあり、各ドキュメントが複数のパッセージに分割されているとします。各パッセージは1つのベクトル埋め込みで表現され、1つのドキュメントに属します。パッセージが散在するのではなく、最も関連性の高いドキュメントを取得するには、**search()** 操作に **group_by_field** 引数を指定して、ドキュメント ID で結果をグループ化できます。

詳細については、[Grouping Search](./grouping-search) ガイドおよび [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) のサンプルコードをご参照ください。*サンプルコード内の接続情報を、お客様の Zilliz Cloud クラスター認証情報に必ず更新してください。*

### Float16 および BFloat16 ベクトルデータ型\{#float16-and-bfloat-vector-datatype}

機械学習およびニューラルネットワークでは、Float16 や BFloat16 といった半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させメモリ使用量を削減できますが、精度が低下するトレードオフがあります。今回のリリースにより、Zilliz Cloud はベクトルフィールドでこれらのデータ型をサポートするようになりました。

詳細については、[Search & Rerank](./search-query-get) および [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) と [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) のサンプルコードをご参照ください。*サンプルコード内の接続情報を、お客様の Zilliz Cloud クラスター認証情報に必ず更新してください。*

### 改善された MilvusClient インターフェース\{#refined-milvusclient-interfaces}

MilvusClient は ORM モジュールに代わる使いやすい選択肢です。これは純粋に関数的なアプローチを採用し、サーバーとのやり取りを簡素化します。接続プールを維持する代わりに、各 MilvusClient はサーバーへの gRPC 接続を確立します。MilvusClient モジュールは、ORM モジュールのほとんどの機能を実装しています。MilvusClient モジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus) および [リファレンスドキュメント](/reference/python) をご覧ください。

## Pipelines\{#pipelines}

Zilliz Cloud は現在、パイプラインリクエストのトークン使用量を監視しており、その詳細は請求書ページおよび各 API レスポンス内で確認できます。ただし、この機能が正式に提供されるまでは課金されません。

画像埋め込みモデルが従来の `clip-vit-base-patch16` から `clip-vit-base-patch32` にアップグレードされ、より幅広い要件に対応できるようになりました。また、多言語テキスト埋め込みのサポートも近日中に実装予定です。

### 機能強化\{#enhancements}

今回のリリースには以下の機能強化も含まれています：

- 専用クラスターをセルフサービスで最大 256 CU までスケーリング可能になりました。さらに大規模なクラスターをご希望の場合は、お問い合わせください。

