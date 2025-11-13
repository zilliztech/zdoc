---
title: "リリースノート (2023年9月13日) | Cloud"
slug: /release-notes-220
sidebar_label: "リリースノート (2023年9月13日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ユーザーエクスペリエンスを向上させるように設計された新機能スイートを備えたZilliz Cloudのリリースを発表できることを嬉しく思います。これには、Zilliz Cloudクラスター間およびElasticSearchからのデータ移行、新しく運用開始されたチケットシステム、強化されたデータインポート機能が含まれます。 | Cloud"
type: origin
token: GqyhwKVspiYRwDk8OaucNfgJnhd
sidebar_position: 22
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database

---

import Admonition from '@theme/Admonition';


# リリースノート (2023年9月13日)

ユーザーエクスペリエンスを向上させるように設計された新機能スイートを備えたZilliz Cloudのリリースを発表できることを嬉しく思います。これには、Zilliz Cloudクラスター間およびElasticSearchからのデータ移行、新しく運用開始されたチケットシステム、強化されたデータインポート機能が含まれます。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.2.x**と互換性があります。

## 概要\{#overview}

このリリースでは、迅速かつ効率的なサポートを保証する新しくローンチされたチケットシステムを導入します。さらに、更新されたデータインポートおよび移行ツールにより、Zilliz Cloudクラスター間でのシームレスな移行が可能になり、一度に複数のファイルをインポートするためのサポートが強化されます。これらのツールを探索し、その利点を実際に体験することをお勧めします。

## Zilliz Cloudクラスター間のデータ移行\{#data-migration-across-zilliz-cloud-clusters}

このリリースでは、ユーザーはZilliz Cloud内でデータを容易に移行する機能を有効にされ、効率的なデータ統合、構成、およびバランス調整が可能です。

- 容易な移行：複数のZilliz Cloudクラスター間でデータをシームレスに移動します。

- 強化されたセキュリティ：データの完全性と機密性を保護するために、移行中のデータセキュリティを強化しました。

- リアルタイム監視：移行の進行状況を監視し、状況更新を即座に受信するための直感的なUI。

詳細については、[クラスター間の移行](./offline-migration)を参照してください。

## ElasticSearchからZilliz Cloudへの簡単な移行\{#easy-migration-from-elasticsearch-to-zilliz-cloud}

ElasticSearchからZilliz Cloudへの移行はかつてないほど簡単になりました。包括的なドキュメントと組み込みツールで補完されたパスを用意し、移行後も一貫したデータとともにスムーズな切り替えを体験できるようにしました。詳細については、[Elasticsearchからの移行](./migrate-from-elasticsearch)を参照してください。

## 新チケットシステム運用開始\{#new-ticket-system-go-live}

ブランド新のチケットシステムにより、Zilliz Cloudユーザーはチームに直接連絡するチャネルを手に入れます。フィードバックの送信、問題の報告、または専門サポートの検索にかかわらず、効率と明確性のためにシステムを設計しました。[今日チケットシステムを探索し、効率的なサポートを体験してください。](https://support.zilliz.com/hc/en-us/)

## 強化されたデータインポート機能\{#enhanced-data-import-capabilities}

Zilliz Cloudへのデータインポート方法を革新しました：

- フォルダインポート：以前の単一ファイルモードの制約から解放されます。現在は、ファイルのフォルダ全体を使用してデータをインポートでき、一括データインジェストを合理化します。

- インポートタスク監視：Zilliz Cloud Webコンソール経由でリアルタイムでデータインポートタスクを監視し、データアップロードの透明性と制御を確保します。

詳細については、[データインポートの準備](./prepare-data-import)を確認してください。