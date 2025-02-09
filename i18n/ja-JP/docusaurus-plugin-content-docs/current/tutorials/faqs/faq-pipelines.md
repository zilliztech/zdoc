---
title: "FAQ:パイプライン | CLOUD"
slug: /faq-pipelines
sidebar_label: "FAQ:パイプライン"
beta: FALSE
notebook: FALSE
description: "このトピックでは、パイプラインを使用する際に発生する可能性のある問題について説明します。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 5

---

# FAQ:パイプライン

このトピックでは、パイプラインを使用する際に発生する可能性のある問題について説明します。

## Contents

- [Zilliz Cloud Pipelinesは、私のセマンティック検索機能をどのように強化できますか?](#how-can-zilliz-cloud-pipelines-enhance-my-semantic-search-capabilities)
- [パイプラインはどのZilliz Cloud製品層で利用可能ですか?](#which-zilliz-cloud-product-tiers-are-pipelines-available-in)
- [Zilliz Cloud Pipelinesはどの埋め込みモデルを使用していますか?](#which-embedding-model-does-zilliz-cloud-pipelines-use)
- [Zilliz Cloud Pipelinesはどのように課金されますか?](#how-is-zilliz-cloud-pipelines-charged)
- [Zilliz Cloud Pipelinesをスタンドアロンで使用できますか?](#can-i-use-zilliz-cloud-pipelines-standalone)
- [Ingestion Pipelinesがサポートするデータソースは何ですか?](#what-data-sources-are-supported-by-ingestion-pipelines)
- [Pipelinesでサポートされているドキュメントファイル形式は何ですか?](#what-document-file-formats-are-supported-by-pipelines)

## FAQs




### Zilliz Cloud Pipelinesは、私のセマンティック検索機能をどのように強化できますか?{#how-can-zilliz-cloud-pipelines-enhance-my-semantic-search-capabilities}

パイプラインは、関連する意味検索結果の基盤となる高品質のベクトル埋め込みを作成するのに役立ちます。

### パイプラインはどのZilliz Cloud製品層で利用可能ですか?{#which-zilliz-cloud-product-tiers-are-pipelines-available-in}

Zilliz Cloud Pipelineは、GCP us-west 1でクラスタを作成している限り、すべての階層で利用できます。

### Zilliz Cloud Pipelinesはどの埋め込みモデルを使用していますか?{#which-embedding-model-does-zilliz-cloud-pipelines-use}

テキストと文書の取り込みと検索パイプラインは、さまざまな埋め込みモデルをサポートしています。

- **英語の場合:**

    - zilliz/bge-based-en-v 1.5-ダウンロード

        BAAIによってリリースされたこの最先端のオープンソースモデルは、Zilliz Cloud上にホストされ、ベクトルデータベースと共有されており、高品質で最高のネットワークレイテンシを提供します。これがデフォルトの埋め込みモデルです。

    - タイトル: voyageai/voyage-2

        Voyage AIによってホストされています。この汎用モデルは、説明的なテキストやコードを含む技術文書を取得することに優れています。軽量版voyage-lite-02-instructはMTEBリーダーボードでトップにランクされています。

    - voyageai/航海コード-2

        Voyage AIがホストしています。このモデルはソフトウェアコードに最適化されており、ソフトウェアドキュメントやソースコードを取得するための優れた品質を提供します。

    - voyageai/ヴォヤージュラージ2

        Voyage AIによってホストされています。これはVoyage AIからの最も強力なジェネラリスト埋め込みモデルです。16 kのコンテキスト長（voyage-2の4倍）をサポートし、技術的および長いコンテキスト文書を含むさまざまなタイプのテキストに優れています。

    - OPENAI/text-embedding-3-small

        Open AIによってホストされています。この非常に効率的な埋め込みモデルは、前身のtext-embedding-ada-002よりも強力なパフォーマンスを持ち、推論コストと品質のバランスを取っています。

    - OPENAI/text-embedding-3-large

        Open AIがホストしています。これはOpen AIの最高のパフォーマンスモデルです。`text-embedding-ada-002`と比較して、MTEBスコアは61.0%から64.6%に増加しました。

- **中国の場合:**

    - zilliz/bge-base-zh-v 1.5-ダウンロード

        BAAIによってリリースされたこの最先端のオープンソースモデルは、Zilliz Cloud上にホストされ、ベクトルデータベースと共有されており、高品質で最高のネットワークレイテンシを提供します。これがデフォルトの埋め込みモデルです。

画像取り込みと検索パイプラインは、次の埋め込みモデルをサポートしています

- ジリズ/vit-base-patch16-224

    Vision Transformer(ViT)は、Googleによってオープンソース化されたトランスエンコーダーモデル(BERTのようなもの)です。このモデルは、画像コンテンツの意味をベクトル空間に埋め込むために、大量の画像コレクションで事前にトレーニングされています。このモデルは、最適なレイテンシを提供するためにZilliz Cloudにホストされています。

- ジリズ/clip-vit-base-patch32

    Open AIによってリリースされたマルチモーダルモデル。このビジョンモデルとそのペアリングテキストモデルは、画像とテキストを同じベクトル空間に埋め込むことができ、視覚情報とテキスト情報の間の意味検索を可能にします。モデルはZilliz Cloudにホストされ、最高のレイテンシを提供します。

- ジリズ/clip-vit-base-patch32-multilingual-v1

    Open AIのCLIP-ViT-B 32モデルの多言語バリアントです。CLIP-ViT-B 32のビジョンモデルと連携するように設計されており、50以上の言語でテキストを過程化することができます。このモデルはZilliz Cloudにホストされ、最高のレイテンシを提供します。

### Zilliz Cloud Pipelinesはどのように課金されますか?{#how-is-zilliz-cloud-pipelines-charged}

現在、Zilliz Cloud Pipelinesでは無料のクォータを提供しています。初回のご利用料金は20ドルです。詳細については、[料金](https://zilliz.com/jp/pricing)を参照してください。

### Zilliz Cloud Pipelinesをスタンドアロンで使用できますか?{#can-i-use-zilliz-cloud-pipelines-standalone}

いいえ、Pipelinesの機能にアクセスするには、Zilliz Cloudベクターデータベースのお客様である必要があります。

### Ingestion Pipelinesがサポートするデータソースは何ですか?{#what-data-sources-are-supported-by-ingestion-pipelines}

現在、Ingestion PipelinesはローカルファイルとAWS S 3およびGoogle Cloud Storageに保存されたファイルをサポートしています。今後、追加のデータソースのサポートを拡大するために積極的に取り組んでいます。

### Pipelinesでサポートされているドキュメントファイル形式は何ですか?{#what-document-file-formats-are-supported-by-pipelines}

サポートされているファイル形式には、`. txt`、.`pdf`、.`md`、`.html`、`.epub`、`.csv`、`.文書`、`.docx`、`.xls`、`.xlsx`、.`ppt`、`.pptx`があります。Ingestionパイプラインを実行する場合は、ローカルファイルをアップロードするか、S 3事前署名URLまたはGCS署名URLを使用できます。
