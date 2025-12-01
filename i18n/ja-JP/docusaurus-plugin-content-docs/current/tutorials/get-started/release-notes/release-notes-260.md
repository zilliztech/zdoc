---
title: "リリースノート (2024年3月13日) | Cloud"
slug: /release-notes-260
sidebar_label: "リリースノート (2024年3月13日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは最新リリースで2つの主要機能強化を導入しました。まず、Pipelinesは現在6つの最先端（SOTA）埋め込みモデルをサポートしており、データ処理能力が拡張されています。もう1つの主要機能強化は、オンボーディングエクスペリエンスを簡素化するためにCollection Playground機能が追加されたことです。この機能により、Zilliz Cloudコンソールから直接基本的なCreate、Run、Update、およびDelete（CRUD）操作を簡単に実行でき、データインタラクションプロセスがよりスムーズになります。今日からこれらの新機能を試して、より効率的で効果的なワークフローを楽しめます。 | Cloud"
type: origin
token: NmolwVTkCiQ2yZkXsJhcftyTnhc
sidebar_position: 17
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年3月13日)

Zilliz Cloudは最新リリースで2つの主要機能強化を導入しました。まず、Pipelinesは現在6つの最先端（SOTA）埋め込みモデルをサポートしており、データ処理能力が拡張されています。もう1つの主要機能強化は、オンボーディングエクスペリエンスを簡素化するためにCollection Playground機能が追加されたことです。この機能により、Zilliz Cloudコンソールから直接基本的なCreate、Run、Update、およびDelete（CRUD）操作を簡単に実行でき、データインタラクションプロセスがよりスムーズになります。今日からこれらの新機能を試して、より効率的で効果的なワークフローを楽しめます。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.3.x**と互換性があります。

## より多くの埋め込みモデル\{#more-embedding-models}

Zilliz Cloud Pipelineは現在、データ処理能力を広げるために6つのSOTA埋め込みモデルをサポートしています。

- **openai/text-embedding-3-small**

    OpenAIがホスト。この非常に効率的な埋め込みモデルは、前世代のtext-embedding-ada-002よりも優れた性能を持ち、推論コストと品質のバランスを実現しています。

- **openai/text-embedding-3-large**

    OpenAIがホスト。これはOpenAIの最高性能モデルです。**text-embedding-ada-002**と比較して、MTEBスコアは61.0%から64.6%に向上しています。

- **voyageai/voyage-2**

    Voyage AIがホスト。この一般目的モデルは、記述的なテキストとコードを含む技術ドキュメントの検索に優れています。より効率的なバージョンであるvoyage-lite-02-instructは、MTEBリーダーボードでトップランクです。

- **voyageai/voyage-code-2**

    Voyage AIがホスト。このモデルはプログラミングコード用に最適化されており、コードブロックの検索に優れた品質を提供します。

- **voyageai/voyage-large-2**

    Voyage AIがホスト。これはVoyage AIの最も強力な一般埋め込みモデルです。16kのコンテキスト長（voyage-2の4倍）をサポートし、技術および長文コンテキストドキュメントを含むさまざまなタイプのテキストで優れた性能を発揮します。このモデルは、言語が英語の場合にのみ利用可能です。

- **zilliz/bge-base-en-v1.5**

    BAAIがリリースしたこのSOTAオープンソースモデルは、Zilliz Cloudでホストされ、ベクトルデータベースと同居しており、良好な品質と最良のネットワークレイテンシを提供します。これはデフォルトの埋め込みモデルです。

## Collection Playground\{#collection-playground}

このリリースで、Zilliz Cloudはオンボーディングエクスペリエンスを合理化するように設計されたZilliz CloudのCollection Playgroundを導入しました。Playgroundにより、ユーザーはZilliz Cloudコンソールから直接挿入、アップサート、検索、クエリ、取得、および削除操作を含む基本的なCRUD操作をシームレスに実行できます。この新機能にアクセスするには、Zilliz CloudコンソールでコレクションのPlaygroundタブに移動します。この機能強化を探索し、コレクションとの簡素化されたインタラクションを楽しんでください！