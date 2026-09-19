---
title: "リリースノート（2024年6月18日） | Cloud"
slug: /release-notes-290
sidebar_label: "2024年6月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は Milvus 2.4 に支えられた一連の新機能を公開しました。これには、スパースベクトルのサポート、強化されたマルチベクトル検索とハイブリッド検索、クエリを高速化する転置インデックスとファジーマッチング、ドキュメントレベルのリコールを実現するグループ化検索が含まれます。また、検索効率を向上させる Float16 および BFloat16 データ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みリクエストと検索リクエストでトークン使用量の統計が追跡されるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 23
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年6月18日）

このリリースでは、Zilliz Cloud は Milvus 2.4 に支えられた一連の新機能を公開しました。これには、スパースベクトルのサポート、強化されたマルチベクトル検索とハイブリッド検索、クエリを高速化する転置インデックスとファジーマッチング、ドキュメントレベルのリコールを実現するグループ化検索が含まれます。また、検索効率を向上させる Float16 および BFloat16 データ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みリクエストと検索リクエストでトークン使用量の統計が追跡されるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

クラスターを BETA にアップグレードする場合は、アップグレード後に **Milvus 2.4.x** の機能を利用できます。

## Zilliz Cloud で利用可能な Milvus 2.4.x の新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4 は、RAG とマルチモーダルデータ検索のための効率的な機能を多数提供しています。これらの新機能を試したい場合は、クラスターを BETA に更新できます。

<Admonition type="info" title="Notes">

Milvus 2.4 はまだ安定版に達していません。本番環境で Milvus 2.4 の機能を採用する際は注意してください。

</Admonition>

### スパースベクトル\{#sparse-vector}

スパースベクトルは密ベクトルとは異なり、次元数が桁違いに大きく、非ゼロとなる次元はごくわずかです。この機能は用語ベースの性質により解釈性が高く、特定のドメインではより効果的である場合があります。SPLADEv2/BGE-M3 のような学習済みスパースモデルは、一般的な第 1 段階のランキングタスクに有用であることが確認されています。この新機能の主な用途は、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成されたスパースベクトルに対して、効率的な近似セマンティック最近傍検索を可能にすることです。Zilliz Cloud は、スパースベクトルの効果的かつ高性能な保存、インデックス作成、検索（MIPS、Maximum Inner Product Search）をサポートするようになりました。

詳細については、[スパースベクトル](./use-sparse-vector) ガイドと [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud クラスターの認証情報に更新してください。*

### マルチ埋め込みとハイブリッド検索\{#multi-embedding-and-hybrid-search}

マルチベクトルのサポートは、マルチモデルのデータ処理や、密ベクトルとスパースベクトルの混在を必要とするアプリケーションの基盤です。マルチベクトルのサポートにより、次のことができるようになりました。

- 複数のモデルから、非構造化テキスト、画像、または音声のサンプル向けに生成されたベクトル埋め込みを保存します。

- 各エンティティに複数のベクトルを持つコレクションに対して ANN 検索を実行します。

- 異なる埋め込みモデルに重みを割り当てて、検索戦略をカスタマイズします。

- 最適なモデルの組み合わせを見つけるために、さまざまな埋め込みモデルを試します。

マルチベクトルのサポートにより、コレクション内の FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など、異なる型の複数のベクトルフィールドに対して、保存、インデックス作成、および再ランキング戦略の適用が可能になります。現在利用できる再ランキング戦略は 2 つあります。**Reciprocal Rank Fusion（RRF）** と **Average Weighted Scoring** です。どちらの戦略も、異なるベクトルフィールドの検索結果を 1 つの結果セットに統合します。一方の戦略は、さまざまなベクトルフィールドの検索結果に一貫して現れるエンティティを優先し、もう一方の戦略は、各ベクトルフィールドの検索結果に重みを割り当てて、最終的な結果セットにおける重要度を決定します。

詳細については、[基本的な ANN 検索](./single-vector-search) と [ハイブリッド検索](./hybrid-search) ガイド、および [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud クラスターの認証情報に更新してください。*

### 転置インデックスとファジーマッチ\{#inverted-index-and-fuzzy-match}

以前の Milvus のリリースでは、スカラーフィールドのインデックス作成にメモリベースのバイナリサーチインデックスと Marisa Trie インデックスが使用されていました。ただし、これらの方式はメモリを大量に消費するものでした。Zilliz Cloud の最新リリースでは、これらのメカニズムを最適化するために自動インデックスを採用しており、すべての数値型および文字列型のデータに適用できます。この新しいインデックスはスカラークエリのパフォーマンスを劇的に向上させ、文字列内のキーワードのクエリを 10 倍に短縮します。さらに、データ圧縮の追加最適化と、内部インデックス構造の Memory-mapped storage（MMap）メカニズムにより、転置インデックスのメモリ消費量が少なくなります。

このリリースでは、接頭辞、中置辞、接尾辞を使用したスカラーフィルタリングにおけるファジーマッチもサポートしています。

詳細については、[バイナリベクトル](./use-binary-vector)、[INVERTED](./inverted-index-type)、および [Use the ](./basic-filtering-operators)[`like`](./basic-filtering-operators)[ Operator](./basic-filtering-operators) ガイドと、[inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) および [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud クラスターの認証情報に更新し、代わりに AUTOINDEX を使用してください。*

### グループ化検索\{#grouping-search}

特定のスカラーフィールドの値で検索結果を集計できるようになりました。これにより、RAG アプリケーションでドキュメントレベルのリコールを実装しやすくなります。複数のドキュメントからなるコレクションを考えてみましょう。各ドキュメントはさまざまなパッセージに分割されます。各パッセージは 1 つのベクトル埋め込みで表され、1 つのドキュメントに属します。パッセージが散在するのではなく、最も関連性の高いドキュメントを見つけるには、**search()** 操作に **group_by_field** 引数を含めて、ドキュメント ID ごとに結果をグループ化できます。

詳細については、[グループ化検索](./grouping-search) ガイドと [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud クラスターの認証情報に更新してください。*

### Float16 および BFloat- ベクトルデータ型\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16 や BFloat- などの半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させ、メモリ使用量を削減できる一方で、精度が低下するというトレードオフがあります。このリリースにより、Zilliz Cloud はこれらのデータ型をベクトルフィールドでサポートするようになりました。

詳細については、[密ベクトル](./use-dense-vector) と、[float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) および [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) のサンプルコードを参照してください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud クラスターの認証情報に更新してください。*

### 改良された MilvusClient インターフェース\{#refined-milvusclient-interfaces}

MilvusClient は、ORM モジュールに代わる使いやすい選択肢です。サーバーとのやり取りを簡素化するために、純粋な関数型アプローチを採用しています。接続プールを維持するのではなく、各 MilvusClient がサーバーへの gRPC 接続を確立します。MilvusClient モジュールは、ORM モジュールの機能の大部分を実装しています。MilvusClient モジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus) と [reference documents](/reference/python) をご覧ください。

## Pipelines\{#pipelines}

Zilliz Cloud は、パイプラインリクエストのトークン使用量を監視するようになりました。詳細は請求書ページおよび各 API レスポンスで確認できます。ただし、この機能が一般提供されるまでは課金されません。

画像埋め込みモデルは、より幅広い要件に対応するため、以前の `clip-vit-base-patch16` から `clip-vit-base-patch32` にアップグレードされました。また、多言語テキスト埋め込みのサポートも近日中に実装される予定です。

### 機能強化\{#enhancements}

このリリースには、以下の一連の機能強化も含まれています。

- Dedicated クラスターをセルフサービス方式で 256 CU までスケールできるようになりました。さらに大規模なクラスターが必要な場合は、お問い合わせください。

