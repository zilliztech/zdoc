---
title: "リリースノート（2023年9月13日） | Cloud"
slug: /release-notes-220
sidebar_key: release-notes-220
sidebar_label: "2023年9月13日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のリリースをお知らせします。Zilliz Cloud クラスター間および ElasticSearch からのデータ移行、新しいチケットシステムの稼働、強化されたデータインポート機能など、ユーザーエクスペリエンスを向上させる新機能を多数搭載しています。 | Cloud"
type: origin
token: GqyhwKVspiYRwDk8OaucNfgJnhd
sidebar_position: 29
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート (2023年9月13日)

Zilliz Cloud のリリースをお知らせいたします。本リリースでは、Zilliz Cloud クラスター間および ElasticSearch からのデータ移行、新しいチケットシステムの稼働、強化されたデータインポート機能など、ユーザーエクスペリエンスを向上させる新機能を多数搭載しています。

## Milvus 互換性\{#milvus-compatibility}

本リリースは **Milvus 2.2.x** と互換性があります。

## 概要\{#overview}

本リリースでは、迅速かつ効率的なサポートを実現する新しくローンチされたチケットシステムを導入しました。また、更新されたデータインポートおよび移行ツールにより、Zilliz Cloud クラスター間のシームレスな移行が可能になり、複数ファイルの同時インポートにも対応しています。ぜひこれらのツールをご活用いただき、そのメリットを直接ご体験ください。

## Zilliz Cloud クラスター間のデータ移行\{#data-migration-across-zilliz-cloud-clusters}

本リリースでは、Zilliz Cloud 内でデータを簡単に移行できる効率的な機能が提供され、データの統合、設定、バランシングが効率的に行えるようになりました。

- 簡単な移行: 複数の Zilliz Cloud クラスター間でデータをシームレスに移行できます。

- セキュリティの強化: データの完全性と機密性を保護するため、移行時のデータセキュリティが強化されています。

- リアルタイムモニタリング: 直感的な UI で移行の進捗状況を監視し、ステータス更新を即座に受け取ることができます。

詳細については、[クラスター間の移行](./offline-migration) を参照してください。

## ElasticSearch から Zilliz Cloud への簡単な移行\{#easy-migration-from-elasticsearch-to-zilliz-cloud}

ElasticSearch から Zilliz Cloud への移行がこれまで以上に簡単になりました。包括的なドキュメントと組み込みツールを補完した移行パスを構築し、スムーズな切り替えと移行後のデータの一貫性を確保しています。詳細については、[Elasticsearch からの移行](./migrate-from-elasticsearch) を参照してください。

## 新チケットシステムの稼働\{#new-ticket-system-go-live}

新しいチケットシステムは、Zilliz Cloud ユーザーに当社チームへの直接チャネルを提供します。フィードバックの送信、問題の報告、専門的なサポートの依頼など、効率性と明確性を重視して設計されています。[チケットシステムを今すぐ探索し、効率化されたサポートをご体験ください。](https://support.zilliz.com/hc/en-us/)

## 強化されたデータインポート機能\{#enhanced-data-import-capabilities}

Zilliz Cloud へのデータインポート方法を革新しました:

- フォルダーインポート: 従来の単一ファイルモードの制約から解放されました。ファイルのフォルダー全体を使用してデータをインポートできるようになり、一括データ取り込みが効率化されます。

- インポートタスクのモニタリング: Zilliz Cloud Web Console を介してデータインポートタスクをリアルタイムで監視し、データアップロードの透明性と管理を確保できます。

詳細については、[データインポートの準備](./prepare-data-import) を確認してください。