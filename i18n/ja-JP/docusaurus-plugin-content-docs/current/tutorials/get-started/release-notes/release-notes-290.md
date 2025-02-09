---
title: "リリースノート（2024年6月18日） | Cloud"
slug: /release-notes-290
sidebar_label: "リリースノート（2024年6月18日）"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz CloudはMilvus 2.4によってバックアップされた新しい機能の配列を発表しました。これには、スパースベクトルサポート、強化されたマルチベクトルおよびハイブリッド検索、より高速なクエリのための反転インデックスとファジーマッチング、およびドキュメントレベルのリコールのためのグループ化検索が含まれます。また、Float 16およびBFloat 16データ型を導入して、検索効率を向上させています。さらに、パイプライン機能は、データの取り込みと検索リクエストごとにトークン使用統計を追跡し、パフォーマンスモニタリングを効率化しています。詳細な統計情報は請求書ページで確認できます。 | Cloud"
type: origin
token: XcDewg5DmibYwXk3K6ucJQAInRd
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年6月18日）

このリリースでは、Zilliz CloudはMilvus 2.4によってバックアップされた新しい機能の配列を発表しました。これには、スパースベクトルサポート、強化されたマルチベクトルおよびハイブリッド検索、より高速なクエリのための反転インデックスとファジーマッチング、およびドキュメントレベルのリコールのためのグループ化検索が含まれます。また、Float 16およびBFloat 16データ型を導入して、検索効率を向上させています。さらに、パイプライン機能は、データの取り込みと検索リクエストごとにトークン使用統計を追跡し、パフォーマンスモニタリングを効率化しています。詳細な統計情報は請求書ページで確認できます。

### Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.3. x**と互換性があります。

クラスタをBETAにアップグレードしたい場合は、アップグレード後に**Milvus 2.4. x**の機能を利用できます。

## Zilliz CloudでMilvus 2.4. xの新機能が利用可能になりました。{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4は、RAGおよびマルチモーダルデータ検索のための多くの効率的な機能を提供します。これらの新機能を試したい場合は、クラスタをBETAに更新することができます。

<Admonition type="info" icon="📘" title="ノート">

<p>Milvus 2.4は安定版に達していません。本番環境でMilvus 2.4の機能を採用する際は注意してください。</p>

</Admonition>

### 疎ベクトル{#sparse-vector}

疎ベクトルは、非ゼロのものがわずかしかなく、次元数が数桁高くなる傾向があるため、密ベクトルと異なります。この機能は、用語ベースの性質により、より良い解釈性を提供し、特定の領域でより効果的になることがあります。SPLADEv 2/BGE-M 3などの学習済み疎モデルは、一般的な第一段階のランキングタスクに役立つことが証明されています。この新機能の主な用途は、SPLADEv 2/BGE-M 3などのニューラルモデルやBM 25アルゴリズムなどの統計モデルによって生成された疎ベクトルに対する効率的な近似意味最近傍探索を可能にすることです。Zilliz Cloudは、疎ベクトルの効果的かつ高性能なストレージ、インデックス付け、および検索(MIPS、最大内積検索)をサポートしています。

詳細については、[疎ベクトル](./use-sparse-vector)ガイドと[hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py)のサンプルコードを参照してください。*Zilliz Cloudクラスタの認証情報を使用して、サンプルコードの接続詳細を必ず更新してください。*

### マルチ埋め込み&ハイブリッド検索{#multi-embedding-and-hybrid-search}

マルチベクトルサポートは、マルチモデルデータ処理や密なベクトルと疎なベクトルの混合を必要とするアプリケーションの基盤となります。マルチベクトルサポートにより、以下のことが可能になります:

- 複数のモデルから生成された非構造化テキスト、画像、またはオーディオサンプルのベクトル埋め込みを保存します。

- 各エンティティに複数のベクトルを持つコレクションに対してANN検索を実行します。

- 異なる埋め込みモデルに重みを割り当てることで、検索戦略をカスタマイズできます。

- 最適なモデルの組み合わせを見つけるために、さまざまな埋め込みモデルを実験してください。

マルチベクトルサポートにより、FLOAT_VECTORやSPARSE_FLOAT_VECTORなど、異なるタイプの複数のベクトルフィールドに対して、コレクションに格納、インデックス化、再ランキング戦略を適用することができます。現在、2つの再ランキング戦略が利用可能です。**相互ランクフュージョン(RRF)**と**平均重み付けスコアリング**です。両方の戦略は、異なるベクトルフィールドからの検索結果を統一された結果セットに結合します。最初の戦略は、さまざまなベクトルフィールドからの検索結果に一貫して表示されるエンティティを優先し、もう一方の戦略は、各ベクトルフィールドからの検索結果に重みを割り当てて、最終結果セットでの重要性を決定します。

詳細については、[基本的なベクトル検索](./single-vector-search)および[ハイブリッド検索](./hybrid-search)ガイド、および[hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py)のサンプルコードを参照してください。*Zilliz Cloudクラスターの認証情報を使用して、サンプルコードの接続詳細を必ず更新してください。*

### インバーテッドインデックスとファジーマッチ{#inverted-index-and-fuzzy-match}

Milvusの以前のリリースでは、メモリベースのバイナリサーチインデックスとMarisa Trieインデックスがスカラーフィールドインデックスに使用されていました。しかし、これらの方法はメモリを大量に消費しました。Zilliz Cloudの最新リリースでは、自動インデックスを使用してこれらのメカニズムを最適化し、すべての数値および文字列データ型に適用できます。この新しいインデックスは、スカラークエリのパフォーマンスを劇的に向上させ、文字列内のキーワードのクエリを10倍削減します。さらに、反転インデックスは、データ圧縮の追加最適化と内部インデックス構造のメモリマップドストレージ(MMap)メカニズムのおかげで、より少ないメモリを消費します。

このリリースでは、プレフィックス、インフィックス、およびサフィックスを使用したスカラーフィルタリングでのファジーマッチもサポートされています。

詳細については、[バイナリベクトル](./use-binary-vector)、[インデックススカラーフィールド](./index-scalar-fields)、[Use the](./basic-filtering-operators#2likeexample-2-using-like-for-pattern-matching)`like`[Operator](./basic-filtering-operators#2likeexample-2-using-like-for-pattern-matching)guide、および[inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py)と[fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py)のサンプルコードを参照してください。*Zilliz Cloudクラスターの資格情報でサンプルコードの接続詳細を更新し、代わりにAUTOINDEXを使用してください。*

### グループ検索{#grouping-search}

特定のスカラーフィールドの値によって検索結果を集計できるようになりました。これにより、RAGアプリケーションはドキュメントレベルのリコールを実装するのに役立ちます。ドキュメントのコレクションを考え、各ドキュメントはさまざまなパッセージに分割されます。各パッセージは1つのベクトル埋め込みで表され、1つのドキュメントに属します。パッセージを散らす代わりに、**group_by_field**引数を**search()**操作に含めて、ドキュメントIDで結果をグループ化することで、最も関連性の高いドキュメントを見つけることができます。

詳細については、[グループ検索](./grouping-search)ガイドと[example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py)のサンプルコードを参照してください。*Zilliz Cloudクラスターの認証情報を使用して、サンプルコードの接続詳細を必ず更新してください。*

### Float 16とBFloatベクトルデータ型{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークは、しばしばFloat 16やBFloatなどの半精度データ型を使用します。これらのデータ型はクエリの効率を向上させ、メモリ使用量を減らすことができますが、精度が低下するというトレードオフがあります。このリリースにより、Zilliz Cloudはベクトルフィールドに対してこれらのデータ型をサポートするようになりました。

deatilsについては、[リランキング](./reranking)と[float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/float16_example.py)and[bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/bfloat16_example.py)のサンプルコードを参照してください。*Zilliz Cloudクラスタの認証情報を使用して、サンプルコードの接続詳細を必ず更新してください。*

### 改良されたMilvusClientインターフェース{#refined-milvusclient-interfaces}

MilvusClientは、ORMモジュールの使いやすい代替品です。サーバーとのやり取りを簡素化するために、純粋に機能的なアプローチを採用しています。接続プールを維持する代わりに、各MilvusClientはサーバーへのgRPC接続を確立します。MilvusClientモジュールは、ORMモジュールのほとんどの機能を実装しています。MilvusClientモジュールについて詳しくは、[pymilvus](https://github.com/milvus-io/pymilvus)と[リファレンスドキュメント](/reference/python)をご覧ください。

## パイプライン{#pipelines}

Zilliz Cloudは現在、パイプラインリクエストのトークン使用状況を監視しており、詳細は請求書ページおよび各API応答内で確認できます。ただし、この機能が一般提供されるまでは、料金は請求されません。

以前の`clip-vit-base-patch32`から画像埋め込みモデルがアップグレードされ、より広い要件を満たすことができるようになりました。さらに、多言語テキストの埋め込みサポートも近日中に実装予定で`clip-vit-base-patch16`。

詳細については、[パイプラインの価格](./understand-pipelines-billing)をご覧ください。

### エンハンスメント{#enhancements}

このリリースには、一連の機能強化も含まれています。

- これで、セルフサービス方式で専用クラスタを256 CUまで拡張できます。さらに大きなクラスタについては、お問い合わせください。

