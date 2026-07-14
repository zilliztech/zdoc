---
title: "リリースノート（2024年3月13日） | Cloud"
slug: /release-notes-260
sidebar_label: "2024年3月13日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は最新リリースで 2 つの主要な機能強化を導入しました。まず、Pipelines が 6 つの最先端（SOTA）埋め込みモデルをサポートするようになり、データ処理機能が拡張されました。もう 1 つの主要な機能強化は、オンボーディング体験を簡素化するために Collection Playground 機能が追加されたことです。この機能により、Zilliz Cloud コンソールから直接、基本的な Create、Run、Update、Delete（CRUD）操作を簡単に実行でき、データ操作プロセスをより効率化できます。これらの新機能を今すぐ試して、より効率的で効果的なワークフローを体験してください。 | Cloud"
type: origin
token: NmolwVTkCiQ2yZkXsJhcftyTnhc
sidebar_position: 25
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年3月13日）

Zilliz Cloud は最新リリースで 2 つの主要な機能強化を導入しました。まず、Pipelines が 6 つの最先端（SOTA）埋め込みモデルをサポートするようになり、データ処理機能が拡張されました。もう 1 つの主要な機能強化は、オンボーディング体験を簡素化するために Collection Playground 機能が追加されたことです。この機能により、Zilliz Cloud コンソールから直接、基本的な Create、Run、Update、Delete（CRUD）操作を簡単に実行でき、データ操作プロセスをより効率化できます。これらの新機能を今すぐ試して、より効率的で効果的なワークフローを体験してください。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

## さらに多くの埋め込みモデル\{#more-embedding-models}

Zilliz Cloud Pipeline は、データ処理機能を拡張するために 6 つの SOTA 埋め込みモデルをサポートするようになりました。

- **openai/text-embedding-3-small**

    OpenAI によってホストされています。非常に効率的なこの埋め込みモデルは、前世代の text-embedding-ada-002 よりも高い性能を持ち、推論コストと品質のバランスを実現しています。

- **openai/text-embedding-3-large**

    OpenAI によってホストされています。これは OpenAI の中で最も高性能なモデルです。**text-embedding-ada-002** と比較すると、MTEB スコアは 61.0% から 64.6% に向上しています。

- **voyageai/voyage-2**

    Voyage AI によってホストされています。この汎用モデルは、説明テキストやコードを含む技術文書の取得に優れています。より効率的なバージョンである voyage-lite-02-instruct は、MTEB リーダーボードで上位にランクインしています。

- **voyageai/voyage-code-2**

    Voyage AI によってホストされています。このモデルはプログラミングコード向けに最適化されており、コードブロックの取得において優れた品質を提供します。

- **voyageai/voyage-large-2**

    Voyage AI によってホストされています。これは Voyage AI の最も強力な汎用埋め込みモデルです。16k のコンテキスト長（voyage-2 の 4 倍）をサポートし、技術文書や長いコンテキスト文書を含むさまざまな種類のテキストで優れた性能を発揮します。このモデルは、言語が ENGLISH の場合にのみ利用できます。

- **zilliz/bge-base-en-v1.5**

    BAAI がリリースしたこの SOTA オープンソースモデルは Zilliz Cloud 上でホストされ、vector database と同じ場所に配置されるため、優れた品質と最適なネットワークレイテンシを提供します。これはデフォルトの埋め込みモデルです。

## Collection Playground\{#collection-playground}

このリリースで、Zilliz Cloud は Zilliz Cloud 内に Collection Playground を導入し、オンボーディング体験の効率化を図りました。Playground では、insert、upsert、search、query、get、delete 操作を含む基本的な CRUD 操作を、Zilliz Cloud コンソールから直接シームレスに実行できます。この新機能にアクセスするには、Zilliz Cloud コンソールで対象の collection の Playground タブに移動してください。ぜひこの機能強化をお試しいただき、collection とのやり取りの簡素化をご体験ください！
