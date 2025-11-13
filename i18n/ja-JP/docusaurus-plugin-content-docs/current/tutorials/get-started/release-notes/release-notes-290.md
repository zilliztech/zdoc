---
title: "リリースノート (2024年6月18日) | Cloud"
slug: /release-notes-290
sidebar_label: "リリースノート (2024年6月18日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz CloudはMilvus 2.4を基盤とした多数の新機能を発表しました。これには、スパースベクトルサポート、強化されたマルチベクトルおよびハイブリッド検索、高速クエリのための逆インデックスおよびファジー一致、およびドキュメントレベルのリコールのためのグループ検索が含まれます。また、検索効率を向上させるためにFloat16およびBFloat16データ型を導入します。さらに、Pipelines機能はデータインジェストおよび検索リクエストごとにトークン使用統計を追跡し、パフォーマンス監視を合理化します。請求書ページで詳細な統計を確認できます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 14
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年6月18日)

このリリースでは、Zilliz CloudはMilvus 2.4を基盤とした多数の新機能を発表しました。これには、スパースベクトルサポート、強化されたマルチベクトルおよびハイブリッド検索、高速クエリのための逆インデックスおよびファジー一致、およびドキュメントレベルのリコールのためのグループ検索が含まれます。また、検索効率を向上させるためにFloat16およびBFloat16データ型を導入します。さらに、Pipelines機能はデータインジェストおよび検索リクエストごとにトークン使用統計を追跡し、パフォーマンス監視を合理化します。請求書ページで詳細な統計を確認できます。

### Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.3.x**と互換性があります。

クラスターをBETAにアップグレードしたい場合は、**Milvus 2.4.x**機能はアップグレード後に利用可能です。

## Zilliz Cloudで利用可能なMilvus 2.4.xの新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4は、RAGおよびマルチモーダルデータ検索のための多数の効率的な機能を提供します。これらの新機能を試したい場合は、クラスターをBETAに更新できます。

<Admonition type="info" icon="📘" title="注釈">

<p>Milvus 2.4は安定版に達していません。本番環境でMilvus 2.4機能を採用する際には注意してください。</p>

</Admonition>

### スパースベクトル\{#sparse-vector}

スパースベクトルは、高次元数を持つにもかかわらずゼロでない値が少数であるという点で密ベクトルとは異なります。これは用語ベースの性質により解釈性が向上し、特定のドメインでより効果的である可能性があります。SPLADEv2/BGE-M3などの学習済みスパースモデルは、一般的な最初の段階のランキングタスクに有用であることが証明されています。この新機能の主な使用例は、SPLADEv2/BGE-M3およびBM25アルゴリズムなどのニューラルモデルおよび統計モデルによって生成されたスパースベクトルに対する効率的な近似セマンティック最近傍検索を可能にすることです。Zilliz Cloudは、スパースベクトルの効果的かつ高性能な保存、インデックス作成、および検索（MIPS、最大内部積検索）をサポートするようになりました。

詳細については、[スパースベクトル](./use-sparse-vector)ガイドおよび[hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py)の例コードを確認してください。*例コード内の接続詳細をZilliz Cloudクラスタの資格情報で必ず更新してください。*

### マルチ埋め込みおよびハイブリッド検索\{#multi-embedding-and-hybrid-search}

マルチベクトルサポートは、マルチモデルデータ処理または密ベクトルとスパースベクトルの混合を必要とするアプリケーションの基盤です。マルチベクトルサポートにより、現在以下が可能になります：

- 非構造化テキスト、画像、または音声サンプル用に複数のモデルから生成されたベクトル埋め込みを保存します。

- 各エンティティに複数のベクトルを含むコレクションに対してANN検索を実行します。

- 異なる埋め込みモデルに重みを割り当てることで検索戦略をカスタマイズします。

- さまざまな埋め込みモデルを実験して最適なモデルの組み合わせを見つけます。

マルチベクトルサポートにより、FLOAT_VECTORおよびSPARSE_FLOAT_VECTORなどの異なるタイプの複数ベクトルフィールドに対する保存、インデックス作成、およびリランク戦略の適用が可能になります。現在、2つのリランク戦略が利用可能です：**逆ランクフュージョン（RRF）**および**平均重み付きスコア付け**。両方の戦略は、異なるベクトルフィールドからの検索結果を統一された結果セットに結合します。最初の戦略は、さまざまなベクトルフィールドからの検索結果に一貫して出現するエンティティを優先し、もう一方の戦略は各ベクトルフィールドからの検索結果に重みを割り当てて、最終的な結果セットにおける重要度を決定します。

詳細については、[基本ANN検索](./single-vector-search)および[ハイブリッド検索](./hybrid-search)ガイドおよび[hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py)の例コードを確認してください。*例コード内の接続詳細をZilliz Cloudクラスタの資格情報で必ず更新してください。*

### 逆インデックスおよびファジーマッチ\{#inverted-index-and-fuzzy-match}

Milvusの以前のリリースでは、スカラーインデックスにメモリベースのバイナリ検索インデックスおよびMarisa Trieインデックスが使用されていました。しかし、これらの方法はメモリを多く消費します。Zilliz Cloudの最新リリースでは、自動インデックスを使用してこれらのメカニズムを最適化し、すべての数値および文字列データ型に適用できます。この新しいインデックスにより、スカラークエリパフォーマンスが劇的に向上し、文字列内のキーワード検索を10倍短縮します。さらに、データ圧縮および内部インデックス構造のメモリマッピング（MMap）メカニズムの追加最適化により、逆インデックスはメモリ消費が少なくなります。

このリリースでは、接頭辞、接頭語、および接尾辞を使用したスカラーフィルタリングでのファジーマッチもサポートしています。

詳細については、[バイナリベクトル](./use-binary-vector)、[スカラーインデックスフィールド](./index-scalar-fields)、および[使用方法](./basic-filtering-operators#example-2-using-like-for-pattern-matching)[`like`](./basic-filtering-operators#example-2-using-like-for-pattern-matching)[演算子](./basic-filtering-operators#example-2-using-like-for-pattern-matching)ガイドおよび[inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py)および[fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py)の例コードを確認してください。*例コード内の接続詳細をZilliz Cloudクラスタの資格情報で必ず更新し、AUTOINDEXを使用してください。*

### グループ検索\{#grouping-search}

特定のスカラーインデックスの値で検索結果を集約できます。これにより、RAGアプリケーションがドキュメントレベルのリコールを実装できます。ドキュメントのコレクションを検討してください。各ドキュメントはさまざまなパッセージに分割されます。各パッセージは1つのベクトル埋め込みで表され、1つのドキュメントに属します。散らばったパッセージではなく最も関連性の高いドキュメントを検索するには、**search()**操作に**group_by_field**引数を含めて、ドキュメントIDで結果をグループ化できます。

詳細については、[グループ検索](./grouping-search)ガイドおよび[example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py)の例コードを確認してください。*例コード内の接続詳細をZilliz Cloudクラスタの資格情報で必ず更新してください。*

### Float16およびBFloatベクトルデータ型\{#float16-and-bfloat-vector-datatype}

機械学習およびニューラルネットワークでは、Float16およびBFloat-などの半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させ、メモリ使用量を削減できますが、精度の低下というトレードオフがあります。このリリースにより、Zilliz Cloudはベクトルフィールドに対するこれらのデータ型をサポートするようになりました。

詳細については、[検索およびリランク](./search-query-get)および[float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py)および[bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py)の例コードを参照してください。*例コード内の接続詳細をZilliz Cloudクラスタの資格情報で必ず更新してください。*

### 洗練されたMilvusClientインターフェース\{#refined-milvusclient-interfaces}

MilvusClientはORMモジュールの使いやすい代替手段です。サーバーとのインタラクションを簡素化するため、純粋な関数的アプローチを採用します。接続プールを維持する代わりに、各MilvusClientはサーバーへのgRPC接続を確立します。MilvusClientモジュールはORMモジュールの大部分の機能を実装しています。MilvusClientモジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus)および[リファレンスドキュメント](/reference/python)を参照してください。

## パイプライン\{#pipelines}

Zilliz Cloudは、請求書ページおよび各API応答で詳細を確認できるパイプラインリクエストのトークン使用量を監視するようになりました。ただし、この機能が一般提供されるまでは課金されません。

画像埋め込みモデルは、より広範な要件を満たすために、以前の`clip-vit-base-patch16`から`clip-vit-base-patch32`にアップグレードされました。さらに、多言語テキスト埋め込みのサポートはまもなく実装予定です。

### 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれます：

- 専用クラスターを256CUまでセルフサービスでスケーリングできるようになりました。さらに大きなクラスターが必要な場合は、お問い合わせください。