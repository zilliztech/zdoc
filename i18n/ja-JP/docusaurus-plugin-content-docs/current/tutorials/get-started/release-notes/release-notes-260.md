---
title: "リリースノート（2024 年 3 月 13 日） | Cloud"
slug: /release-notes-260
sidebar_key: release-notes-260
sidebar_label: "2024 年 3 月 13 日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、最新のリリースで 2 つの主要な機能強化を導入しました。まず、Pipelines が 6 つの最先端（SOTA）埋め込みモデルをサポートするようになり、データ処理機能が拡張されました。もう一つの主要な強化点は、オンボーディング体験を簡素化するための「Collection Playground」機能が追加されたことです。この機能により、Zilliz Cloud コンソールから直接、基本的な作成（Create）、実行（Run）、更新（Update）、削除（Delete）操作（CRUD）を簡単に行えるようになり、データ連携プロセスがより合理化されます。これらの新機能を今日から試して、より効率的で効果的なワークフローをお楽しみください。 | Cloud"
type: origin
token: NmolwVTkCiQ2yZkXsJhcftyTnhc
sidebar_position: 22
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年3月13日）

Zilliz Cloud は最新リリースで2つの主要な機能強化を導入しました。まず、Pipelines が6つの最新鋭（SOTA）埋め込みモデルをサポートするようになり、データ処理能力が拡張されました。もう1つの主要な機能強化は、Collection Playground 機能の追加です。この機能により、オンボーディング体験がよりシンプルになります。この機能を使えば、Zilliz Cloud コンソールから直接、基本的な作成・実行・更新・削除（CRUD）操作を簡単に実行でき、データとのやり取りがよりスムーズになります。これらの新機能を今すぐ試して、より効率的で効果的なワークフローを体験してください。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

## より多くの埋め込みモデル\{#more-embedding-models}

Zilliz Cloud Pipeline は、データ処理能力をさらに広げるために、6つの SOTA 埋め込みモデルをサポートするようになりました。

- **openai/text-embedding-3-small**

    OpenAI がホストしています。この非常に効率的な埋め込みモデルは、先行モデルである text-embedding-ada-002 を上回るパフォーマンスを発揮し、推論コストと品質のバランスに優れています。

- **openai/text-embedding-3-large**

    OpenAI がホストしています。これは OpenAI の最高性能モデルです。**text-embedding-ada-002** と比較して、MTEB スコアが 61.0% から 64.6% に向上しています。

- **voyageai/voyage-2**

    Voyage AI がホストしています。この汎用モデルは、説明テキストやコードを含む技術ドキュメントの検索に優れています。より効率的なバージョンである voyage-lite-02-instruct は、MTEB リーダーボードでトップを獲得しています。

- **voyageai/voyage-code-2**

    Voyage AI がホストしています。このモデルはプログラミングコード向けに最適化されており、コードブロックの検索において卓越した品質を提供します。

- **voyageai/voyage-large-2**

    Voyage AI がホストしています。これは Voyage AI が提供する最も強力な汎用埋め込みモデルです。16k のコンテキスト長（voyage-2 の4倍）をサポートし、技術文書や長文コンテキストを含むさまざまなタイプのテキストで優れた性能を発揮します。このモデルは言語が ENGLISH の場合にのみ利用可能です。

- **zilliz/bge-base-en-v1.5**

    BAAI がリリースしたこの SOTA オープンソースモデルは、Zilliz Cloud 上でホストされ、ベクトルデータベースと同一ロケーションに配置されているため、高品質かつネットワーク遅延が最小限に抑えられています。これがデフォルトの埋め込みモデルです。

## Collection Playground\{#collection-playground}

今回のリリースでは、オンボーディング体験をよりスムーズにするために、Zilliz Cloud に Collection Playground を導入しました。Playground を使用すると、ユーザーは Zilliz Cloud コンソールから直接、挿入（insert）、更新挿入（upsert）、検索（search）、クエリ（query）、取得（get）、削除（delete）など、基本的な CRUD 操作をシームレスに実行できます。この新機能にアクセスするには、Zilliz Cloud コンソール上のコレクション内の Playground タブに移動してください。ぜひこの機能強化を活用し、コレクションとのやり取りをより簡単に体験してください！