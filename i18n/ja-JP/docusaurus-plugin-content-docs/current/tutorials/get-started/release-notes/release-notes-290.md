---
title: "リリースノート (2024年6月18日) | Cloud"
slug: /release-notes-290
sidebar_key: release-notes-290
sidebar_label: "2024年6月18日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud が Milvus 2.4 をベースとした多数の新機能を公開しました。スパースベクトル対応、強化されたマルチベクトルおよびハイブリッド検索、高速なクエリのための転置インデックスとファジーマッチング、ドキュメントレベルの再呼び出しのためのグルーピング検索などが含まれます。また、検索効率の向上のため Float16 および BFloat16 データ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストでトークン使用量の統計を追跡し、パフォーマンス監視を効率化します。詳細な統計は請求ページで確認できます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 21
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年6月18日)

このリリースでは、Zilliz CloudがMilvus 2.4をベースとした多数の新機能を公開しました。これには、疎ベクトルのサポート、強化されたマルチベクトルおよびハイブリッド検索、より高速なクエリのための転置インデックスとファジーマッチング、ドキュメントレベルの再呼び出しのためのグルーピング検索などが含まれます。また、検索効率の向上を目的としたFloat16およびBFloat16データ型も導入されています。さらに、Pipelines機能では、すべてのデータ取り込みおよび検索リクエストでトークン使用量の統計を追跡するようになり、パフォーマンス監視が効率化されました。詳細な統計は請求ページで確認できます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

クラスターをBETAにアップグレードする場合は、アップグレード後に **Milvus 2.4.x** の機能が利用可能になります。

## Zilliz Cloud で利用可能な Milvus 2.4.x の新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4は、RAGおよびマルチモーダルデータ検索のための多くの効率的な機能を提供します。これらの新機能を試したい場合は、クラスターをBETAに更新できます。

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus 2.4は安定版に達していません。本番環境でMilvus 2.4の機能を採用する際は注意してください。</p>

</Admonition>

### 疎ベクトル\{#sparse-vector}

疎ベクトルは密なベクトルとは異なり、次元数が数倍から数十倍高く、非ゼロの値を持つ次元がごくわずかである傾向があります。この機能は、用語ベースの性質により解釈性が高く、特定のドメインではより効果的です。SPLADEv2/BGE-M3などの学習済み疎モデルは、一般的な第一段階のランキングタスクで有用であることが実証されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3などのニューラルモデルやBM25アルゴリズムなどの統計モデルによって生成された疎ベクトルに対する効率的な近似意味的近傍検索を可能にすることです。Zilliz Cloudは、疎ベクトルの効率的かつ高性能なストレージ、インデックス作成、および検索（MIPS、Maximum 内積 Search）をサポートするようになりました。

詳細については、[疎ベクトル](./use-sparse-vector) ガイドおよび [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) のサンプルコードを参照してください。*サンプルコードの接続詳細は、Zilliz Cloud クラスターの認証情報で必ず更新してください。*

### マルチ埋め込みとハイブリッド検索\{#multi-embedding-and-hybrid-search}

マルチベクトルサポートは、マルチモデルデータ処理や密ベクトルと疎ベクトルの混在を必要とするアプリケーションの基盤となります。マルチベクトルサポートにより、以下が可能になりました：

- 複数のモデルから生成された非構造化テキスト、画像、または音声サンプルのベクトル埋め込みをストレージに保存する。

- 各エンティティに複数のベクトルを持つコレクションに対してANN検索を実行する。

- 異なる埋め込みモデルに重みを割り当てて検索戦略をカスタマイズする。

- 最適なモデル組み合わせを見つけるために、さまざまな埋め込みモデルを試す。

マルチベクトルサポートにより、FLOAT_VECTORやSPARSE_FLOAT_VECTORなどの異なるタイプの複数のベクトルフィールドをコレクションに保存、インデックス作成し、リランキング戦略を適用できます。現在、2つのリランキング戦略が利用可能です：**Reciprocal Rank Fusion (RRF)** と **平均加重スコアリング** です。両方の戦略は、異なるベクトルフィールドからの検索結果を統一された結果セットに結合します。最初の戦略は、さまざまなベクトルフィールドの検索結果に一貫して出現するエンティティを優先し、もう一方の戦略は、各ベクトルフィールドからの検索結果に重みを割り当てて、最終的な結果セットにおける重要度を決定します。

詳細については、[基本的なANN検索](./single-vector-search) および [ハイブリッド検索](./hybrid-search) ガイド、および [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) のサンプルコードを参照してください。*サンプルコードの接続詳細は、Zilliz Cloud クラスターの認証情報で必ず更新してください。*

### 転置インデックスとファジーマッチ\{#inverted-index-and-fuzzy-match}

これまでのMilvusのリリースでは、スカラーフィールドのインデックス作成にメモリベースのバイナリ検索インデックスとMarisa Trieインデックスが使用されていました。しかし、これらの方法はメモリを多く消費していました。最新のZilliz Cloudリリースでは、これらのメカニズムを最適化するためにauto-indexを採用しており、すべての数値および文字列データ型に適用できます。この新しいインデックスはスカラークエリのパフォーマンスを劇的に向上させ、文字列内のキーワードクエリを10分の1に削減します。さらに、転置インデックスは、データ圧縮と内部インデックス構造のMemory-mapped storage（MMap）メカニズムの追加の最適化により、より少ないメモリを消費します。

このリリースでは、プレフィックス、インフィックス、およびサフィックスを使用したスカラーフィルタリングでのファジーマッチもサポートされています。

詳細については、[バイナリベクトル](./use-binary-vector)、[スカラーフィールドのインデックス作成](./index-scalar-fields)、および [`like`](./basic-filtering-operators#example-2-using-like-for-pattern-matching) [演算子の使用](./basic-filtering-operators#example-2-using-like-for-pattern-matching) ガイド、および [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) と [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) のサンプルコードを参照してください。*サンプルコードの接続詳細は、Zilliz Cloud クラスターの認証情報で必ず更新し、AUTOINDEXを使用してください。*

### グルーピング検索\{#grouping-search}

特定のスカラーフィールドの値で検索結果を集約できるようになりました。これにより、RAGアプリケーションでドキュメントレベルの再呼び出しを実装できます。ドキュメントのコレクションを考えてみましょう。各ドキュメントはさまざまなパッセージに分割されています。各パッセージは1つのベクトル埋め込みで表現され、1つのドキュメントに属しています。分散したパッセージではなく、最も関連性の高いドキュメントを見つけるために、**search()** 操作に **group_by_field** 引数を含めて、ドキュメントIDで結果をグループ化できます。

詳細については、[グルーピング検索](./grouping-search) ガイドおよび [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) のサンプルコードを参照してください。*サンプルコードの接続詳細は、Zilliz Cloud クラスターの認証情報で必ず更新してください。*

### Float16およびBFloat16ベクトルデータ型\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16やBFloat16などの半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させ、メモリ使用量を削減できますが、精度の低下というトレードオフがあります。このリリースにより、Zilliz Cloudはベクトルフィールドでこれらのデータ型をサポートするようになりました。

詳細については、[検索とリランク](./search-query-get) および [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) と [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) のサンプルコードを参照してください。*サンプルコードの接続詳細は、Zilliz Cloud クラスターの認証情報で必ず更新してください。*

### 改良されたMilvusClientインターフェース\{#refined-milvusclient-interfaces}

MilvusClientは、ORMモジュールの使いやすい代替手段です。サーバーとのやり取りを簡素化するために、純粋に関数型のアプローチを採用しています。コネクションプールを維持するのではなく、各MilvusClientはサーバーにgRPC接続を確立します。MilvusClientモジュールは、ORMモジュールのほとんどの機能を実装しています。MilvusClientモジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus) および [リファレンスドキュメント](/reference/python) を参照してください。

## Pipelines\{#pipelines}

Zilliz Cloudは、パイプラインレクエストのトークン使用量を監視するようになりました。詳細は請求ページおよび各APIレスポンス内で確認できます。ただし、この機能が一般提供されるまでは課金されません。

画像埋め込みモデルは、以前の `clip-vit-base-patch16` から `clip-vit-base-patch32` にアップグレードされ、より広範な要件に対応しています。また、多言語テキスト埋め込みのサポートも間もなく実装される予定です。

### 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれています：

- 専用クラスターをセルフサービスで256 CUまでスケールできるようになりました。さらに大規模なクラスターが必要な場合は、お問い合わせください。

