---
title: "リリースノート（2023年9月13日） | Cloud"
slug: /release-notes-220
sidebar_label: "2023年9月13日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のリリースをお知らせします。ユーザー体験を向上させるために設計された多数の新機能を備えており、Zilliz Cloud クラスター間および ElasticSearch からのデータ移行、新しいチケットシステムの稼働開始、強化されたデータインポート機能などが含まれます。 | Cloud"
type: origin
token: GqyhwKVspiYRwDk8OaucNfgJnhd
sidebar_position: 30
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年9月13日）

ユーザー体験を向上させるために設計された多数の新機能を備えた Zilliz Cloud のリリースをお知らせします。これには、Zilliz Cloud クラスター間および ElasticSearch からのデータ移行、新しいチケットシステムの稼働開始、強化されたデータインポート機能などが含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** と互換性があります。

## 概要\{#overview}

このリリースでは、新たに稼働を開始したチケットシステムを導入し、迅速で効率的なサポートを実現します。さらに、更新されたデータインポートおよび移行ツールにより、Zilliz Cloud クラスター間のシームレスな移行が可能になり、複数ファイルの一括インポートへの対応も強化されました。ぜひこれらのツールをお試しいただき、そのメリットを直接ご体験ください。

## Zilliz Cloud クラスター間のデータ移行\{#data-migration-across-zilliz-cloud-clusters}

このリリースでは、ユーザーは Zilliz Cloud 内でデータを容易に移行できるようになり、効率的なデータ統合、構成、および負荷分散を実現できます。

- 容易な移行: 複数の Zilliz Cloud クラスター間でデータをシームレスに移動できます。

- セキュリティの強化: 移行中のデータセキュリティを強化し、データの完全性と機密性を保護します。

- リアルタイム監視: 直感的な UI により、移行の進捗を監視し、ステータス更新を即座に受け取ることができます。

詳細は [Migrate Between Clusters](./offline-migration) を参照してください。

## ElasticSearch から Zilliz Cloud への簡単な移行\{#easy-migration-from-elasticsearch-to-zilliz-cloud}

ElasticSearch から Zilliz Cloud への移行がこれまでになく簡単になりました。包括的なドキュメントと組み込みツールを備えた移行パスを用意しており、スムーズな切り替えと、移行後も一貫したデータの維持を実現できます。詳細は [Migrate from Elasticsearch](./migrate-from-elasticsearch) を参照してください。

## 新しいチケットシステムの稼働開始\{#new-ticket-system-go-live}

新しいチケットシステムにより、Zilliz Cloud ユーザーは当社チームへ直接連絡できるようになりました。フィードバックの送信、問題の報告、専門的なサポートの依頼など、あらゆる場面で効率性と明確さを重視して設計されています。[今すぐチケットシステムを確認し、効率化されたサポートを体験してください。](https://support.zilliz.com/hc/en-us/)

## データインポート機能の強化\{#enhanced-data-import-capabilities}

Zilliz Cloud へのデータインポート方法を刷新しました。

- フォルダインポート: 従来の単一ファイルモードの制約から解放されました。ファイル一式を含むフォルダ全体を使ってデータをインポートできるようになり、大量データの取り込みを効率化します。

- インポートタスクの監視: Zilliz Cloud Web Console からデータインポートタスクをリアルタイムで監視でき、データアップロードの透明性と制御性を確保できます。

詳細は [Prepare Data Import](./prepare-data-import) を参照してください。
