---
title: "リリースノート（2023年9月13日） | Cloud"
slug: /release-notes-220
sidebar_label: "リリースノート（2023年9月13日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのリリースを発表できることを嬉しく思います。Zilliz Cloudクラスター間およびElastic Searchからのデータ移行、新しいチケットシステムの稼働、および強化されたデータインポート機能を含む、ユーザーエクスペリエンスを向上させるために設計された新機能のスイートを誇っています。 | Cloud"
type: origin
token: UYXeweIQ9iLFsMkyzoecTt87nSe
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年9月13日）

Zilliz Cloudのリリースを発表できることを嬉しく思います。Zilliz Cloudクラスター間およびElastic Searchからのデータ移行、新しいチケットシステムの稼働、および強化されたデータインポート機能を含む、ユーザーエクスペリエンスを向上させるために設計された新機能のスイートを誇っています。

## Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.2. x**と互換性があります。

## 概要について{#overview}

このリリースでは、新しく導入されたチケットシステムが導入され、迅速かつ効率的なサポートが保証されています。さらに、更新されたデータインポートおよび移行ツールにより、Zilliz Cloudクラスター間のスムーズな移行が可能になり、複数のファイルを一度にインポートするための改善されたサポートが提供されます。これらのツールを探索し、その利点を直接体験してください。

## Zillizクラウドクラスタ間のデータ移行{#data-migration-across-zilliz-cloud-clusters}

このリリースでは、ユーザーはZilliz Cloud内でデータを簡単に移行できるようになり、効率的なデータの統合、設定、およびバランスが確保されます。

- 簡単な移行:複数のZilliz Cloudクラスタ間でデータをシームレスに移行します。

- 強化されたセキュリティ:移行中のデータセキュリティを強化し、データの完全性と機密性を保護します。

- リアルタイムモニタリング:ユーザーが移行の進捗状況を監視し、ステータスの更新を瞬時に受け取るための直感的なUI。

詳細は[クラスタ間の移行](./migrate-between-clusters)を参照してください。

## Elastic SearchからZilliz Cloudへの簡単な移行{#easy-migration-from-elasticsearch-to-zilliz-cloud}

Elastic SearchからZilliz Cloudへの移行は、これまで以上に簡単になりました。私たちは、包括的なドキュメントと組み込みツールで補完されたパスウェイを作成し、移行後もスムーズな切り替えと一貫したデータを体験できるようにしました。詳細については、[ElasticsearchからZilliz Cloudへの移行](./migrate-from-elasticsearch)するをご覧ください。

## 新しいチケットシステムGo-Live{#new-ticket-system-go-live}

私たちの新しいチケットシステムは、Zilliz Cloudユーザーに私たちのチームへの直接的なチャネルを提供します。フィードバックを提出したり、問題を報告したり、専門家のサポートを求めたりする場合でも、私たちは効率性と明確さのためにシステムを設計しました。[今すぐチケットシステムを探索して、スムーズなサポートを体験してください。](https://support.zilliz.com/hc/en-us/)

## データインポート機能の強化{#enhanced-data-import-capabilities}

Zilliz Cloudにデータをインポートする方法を革新しました:

- フォルダーインポート:以前の単一ファイルモードの制約から解放されます。ファイルのフォルダー全体を使用してデータをインポートできるようになり、バルクデータの取り込みを効率化できます。

- インポートタスクの監視: Zilliz Cloudウェブコンソールを介して、データのインポートタスクをリアルタイムで監視し、データのアップロードに対する透明性と制御を確保します。

詳細は[データを変換する](./prepare-data-import)をご確認ください。