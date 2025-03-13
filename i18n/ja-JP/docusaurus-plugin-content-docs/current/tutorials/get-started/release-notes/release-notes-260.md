---
title: "リリースノート（2024年3月13日） | Cloud"
slug: /release-notes-260
sidebar_label: "リリースノート（2024年3月13日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは最新リリースで2つの主要な改良を導入しました。まず、Pipelinesは現在、6つの最新の(SOTA)埋め込みモデルをサポートしており、データ処理能力を拡張しています。もう1つの主要な改良は、Collection Playground機能が追加され、オンボーディング体験を簡素化することです。この機能を使用すると、Zilliz Cloudコンソールから基本的な作成、実行、更新、削除(CRUD)操作を簡単に実行でき、データインタラクションプロセスをより効率的に行うことができます。これらの新機能を今すぐ試して、より効率的かつ効果的なワークフローを楽しむことができます。 | Cloud"
type: origin
token: GNqXwvnHDiFtWqk3ytcc60xlnae
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年3月13日）

Zilliz Cloudは最新リリースで2つの主要な改良を導入しました。まず、Pipelinesは現在、6つの最新の(SOTA)埋め込みモデルをサポートしており、データ処理能力を拡張しています。もう1つの主要な改良は、Collection Playground機能が追加され、オンボーディング体験を簡素化することです。この機能を使用すると、Zilliz Cloudコンソールから基本的な作成、実行、更新、削除(CRUD)操作を簡単に実行でき、データインタラクションプロセスをより効率的に行うことができます。これらの新機能を今すぐ試して、より効率的かつ効果的なワークフローを楽しむことができます。

## Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.3. x**と互換性があります。

## 他の組み込みモデル{#more-embedding-models}

Zilliz Cloud Pipelineは現在、6つのSOTA埋め込みモデルをサポートしており、データ処理能力を拡大しています。

- **OPENAI/text-embedding-3-small**

    Open AIによってホストされています。この非常に効率的な埋め込みモデルは、前身のtext-embedding-ada-002よりも強力なパフォーマンスを持ち、推論コストと品質のバランスを取っています。

- **OPENAI/text-embedding-3-large**

    Open AIがホストしています。これはOpen AIの最高のパフォーマンスモデルです。**text-embedding-ada-002**と比較して、MTEBスコアは61.0%から64.6%に増加しました。

- **タイトル: voyageai/voyage-2**

    Voyage AIによってホストされています。この汎用モデルは、説明的なテキストやコードを含む技術文書を取得することに優れています。より効率的なバージョンvoyage-lite-02-instructは、MTEBリーダーボードでトップにランクされています。

- **voyageai/航海コード-2**

    Voyage AIがホストしています。このモデルはプログラミングコードに最適化されており、検索コードブロックに優れた品質を提供します。

- **voyageai/ヴォヤージュラージ2**

    Voyage AIによってホストされています。これはVoyage AIからの最も強力な汎用埋め込みモデルです。16 kのコンテキスト長(voyage-2の4倍)をサポートし、技術的および長いコンテキスト文書を含むさまざまなタイプのテキストで優れています。このモデルは、言語が英語の場合にのみ利用可能です。

- **zilliz/bge-based-en-v 1.5-ダウンロード**

    BAAIによってリリースされたこのSOTAオープンソースモデルは、Zilliz Cloudでホストされ、ベクトルデータベースと共同配置されており、高品質で最高のネットワークレイテンシを提供します。これはデフォルトの埋め込みモデルです。

## コレクションプレイグラウンド{#collection-playground}

このリリースでは、Zilliz CloudはZilliz CloudのCollection Playgroundを導入し、オンボーディング体験を効率化するように設計されています。Playgroundにより、ユーザーはZilliz Cloudコンソールから直接基本的なCRUD操作をシームレスに実行できます。これには、挿入、アップロード、検索、クエリ、取得、削除などの操作が含まれます。この新機能にアクセスするには、Zilliz CloudコンソールのコレクションのPlaygroundタブに移動してください。この強化機能を探索し、コレクションとの簡単なインタラクションを楽しむことができます!