---
title: "リリースノート（2023 年 9 月 13 日） | Cloud"
slug: /release-notes-220
sidebar_key: release-notes-220
sidebar_label: "2023 年 9 月 13 日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の新リリースをお知らせいたします。本アップデートでは、Zilliz Cloud クラスター間および ElasticSearch からのデータ移行機能、新しいチケットシステムの導入、データインポート機能の強化など、ユーザーエクスペリエンスを向上させる多数の新機能を搭載しています。 | Cloud"
type: origin
token: GqyhwKVspiYRwDk8OaucNfgJnhd
sidebar_position: 27
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年9月13日）

Zilliz Cloud の新リリースをお知らせします。本リリースでは、ユーザー体験を向上させるための新機能が多数追加されており、Zilliz Cloud クラスター間および ElasticSearch からのデータ移行機能、新たに導入されたチケットシステム、強化されたデータインポート機能などが含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** と互換性があります。

## 概要\{#overview}

本リリースでは、新たにチケットシステムを導入し、迅速かつスムーズなサポートを実現しました。さらに、更新されたデータインポートおよび移行ツールにより、Zilliz Cloud クラスター間でのシームレスな移行が可能になり、複数ファイルの一括インポートもより簡単にサポートされるようになりました。ぜひこれらのツールをお試しいただき、そのメリットを体感してください。

## Zilliz Cloud クラスター間でのデータ移行\{#data-migration-across-zilliz-cloud-clusters}

今回のリリースにより、ユーザーは Zilliz Cloud 内でデータを簡単に移行できるようになり、効率的なデータ統合、設定、負荷分散が可能になります。

- 簡単な移行: 複数の Zilliz Cloud クラスター間でデータをシームレスに移動できます。

- 強化されたセキュリティ: 移行中のデータセキュリティを強化し、データの整合性と機密性を保護します。

- リアルタイム監視: 直感的な UI を通じて、ユーザーは移行の進捗状況をリアルタイムで監視し、ステータス更新を即座に受け取れます。

詳細については、[クラスター間の移行](./offline-migration)をご覧ください。

## ElasticSearch から Zilliz Cloud への簡単な移行\{#easy-migration-from-elasticsearch-to-zilliz-cloud}

ElasticSearch から Zilliz Cloud への移行がこれまでになく簡単になりました。包括的なドキュメントと組み込みツールを用意し、スムーズな切り替えと移行後のデータの一貫性を保証します。詳細については、[Elasticsearch からの移行](./migrate-from-elasticsearch)をご確認ください。

## 新チケットシステムの提供開始\{#new-ticket-system-go-live}

新たに導入されたチケットシステムにより、Zilliz Cloud ユーザーは当社チームへ直接連絡できるチャネルを獲得しました。フィードバックの送信、問題の報告、専門的なサポートの依頼など、どのような場合でも効率的かつ明確な対応を実現するよう設計されています。[今すぐチケットシステムをご利用いただき、スムーズなサポートを体験してください。](https://support.zilliz.com/hc/en-us/)

## 強化されたデータインポート機能\{#enhanced-data-import-capabilities}

Zilliz Cloud へのデータインポート方法を大幅に改善しました。

- フォルダインポート: これまでの単一ファイルモードの制限から解放され、複数ファイルを含むフォルダ全体を一度にインポートできるようになり、大量データの取り込みが効率化されます。

- インポートタスクの監視: Zilliz Cloud Web コンソールを通じて、データインポートタスクをリアルタイムで監視でき、データアップロードの透明性とコントロールが確保されます。

詳細については、[データインポートの準備](./prepare-data-import)をご確認ください。