---
title: "リリースノート（2024年11月6日） | Cloud"
slug: /release-notes-2110
sidebar_label: "リリースノート（2024年11月6日）"
beta: FALSE
notebook: FALSE
description: "このリリースには、新しいWebコンソールのユーザーインターフェイス、Qdrant、Pinecone Serverless、およびテンセントVectorDBからのデータ移行のサポート、よりスムーズな支払い過程、および詳細な支払い情報を含む刷新された請求書ページが含まれています。 | Cloud"
type: origin
token: FrALwj4ihi3BEtk7vQjc1zRInUb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年11月6日）

このリリースには、新しいWebコンソールのユーザーインターフェイス、Qdrant、Pinecone Serverless、およびテンセントVectorDBからのデータ移行のサポート、よりスムーズな支払い過程、および詳細な支払い情報を含む刷新された請求書ページが含まれています。

## Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.4. x**と互換性があります。

## ウェブコンソールの新しいユーザーインターフェース{#a-brand-new-web-console-user-interface}

このリリースでは、Zilliz Cloudは完全にアップグレードされたWebコンソールUIを導入しました。使い慣れたワークフローを維持しながら、新しいインターフェースはユーザーのインタラクティブな体験とビジュアルな体験の両方を大幅に向上させます。

[Zilliz Cloud](https://cloud.zilliz.com)アカウントにログインして、新しいインターフェースをお試しください!

## 拡張されたソースサポートによるデータ移行の強化{#enhanced-data-migration-with-expanded-source-support}

このリリースでは、Zilliz Cloudはデータ移行機能をアップグレードし、以下のような追加のデータソースをサポートしました。

- Qdrant

- 松ぼっくりサーバーレス

- テンセントVectorDB

これらの機能強化により、Zilliz Cloudが提供する独自の機能を活用して、これらのベンダーからデータを簡単にZilliz Cloudに移行できます。これらのソースからデータを移行する詳細な手順については、[QdrantからZilliz Cloudへの移行](./migrate-from-qdrant),[PineconeからZilliz Cloudへの移行](./migrate-from-pinecone), と[テンセントクラウドからZilliz Cloudへの移行](./migrate-from-pgvector)を参照してください。

## 支払いプロセスの改善と請求書ページの再設計{#improved-payment-process-and-redesigned-invoice-page}

今回のリリースでは、Zilliz Cloudが支払い過程を簡素化し、請求書ページを一新し、コスト管理をより明確かつ便利にしました。主な更新内容は以下の通りです:

- 支払いが期限切れになったときのタイムリーな通知

- 企業の財務ワークフローに合わせて支払い条件を調整し、継続的なサービスを確保するために、長期間の請求サイクルをサポートします。

- コストとダウンロードオプションを可視化した項目別請求書

これらの更新の詳細については、[インボイス](./view-invoice)をご覧ください。

### エンハンスメント{#enhancements}

- レプリカの構成過程を最適化しました。この新しいバージョンでは、ユーザーは事前にすべてのコレクションをリリースする必要なく、レプリカの数を直接調整できます。

