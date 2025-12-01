---
title: "リリースノート (2024年11月6日) | Cloud"
slug: /release-notes-2110
sidebar_label: "リリースノート (2024年11月6日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースには、新しいWebコンソールユーザーインターフェース、Qdrant、Pinecone Serverless、およびTencent VectorDBからのデータ移行サポート、スムーズな支払いプロセス、詳細な支払い情報付きのリニューアルされた請求書ページが含まれます。 | Cloud"
type: origin
token: HwWfwN9SViqU0Ukcv68cufBAnBe
sidebar_position: 10
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年11月6日)

このリリースには、新しいWebコンソールユーザーインターフェース、Qdrant、Pinecone Serverless、およびTencent VectorDBからのデータ移行サポート、スムーズな支払いプロセス、詳細な支払い情報付きのリニューアルされた請求書ページが含まれます。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.4.x**と互換性があります。

## ブランド新Webコンソールユーザーインターフェース\{#a-brand-new-web-console-user-interface}

このリリースで、Zilliz Cloudは完全にアップグレードされたWebコンソールUIを導入します。慣れ親しんだワークフローを維持しながら、新しいインターフェースはユーザーのインタラクティブおよびビジュアルエクスペリエンスを大幅に向上させます。

[Zilliz Cloud](https://cloud.zilliz.com)アカウントにログインして、新しいインターフェースを実際に試してみてください！

## 拡張されたソースサポートによる強化されたデータ移行\{#enhanced-data-migration-with-expanded-source-support}

このリリースで、Zilliz Cloudはデータ移行機能をアップグレードし、追加のデータソースをサポートするようになりました。これには以下が含まれます：

- Qdrant

- Pinecone Serverless

- Tencent VectorDB

これらの強化により、これらのベンダーからZilliz Cloudに簡単にデータを移行でき、Zilliz Cloudが提供する独自の機能および能力を活用できます。これらのソースからのデータ移行に関する詳細な手順については、[QdrantからZilliz Cloudへの移行](./migrate-from-qdrant)、[PineconeからZilliz Cloudへの移行](./migrate-from-pinecone)、および[Tencent CloudからZilliz Cloudへの移行](./migrate-from-tencent-cloud)を参照してください。

## 改善された支払いプロセスおよびリニューアルされた請求書ページ\{#improved-payment-process-and-redesigned-invoice-page}

このリリースで、Zilliz Cloudは支払いプロセスを合理化し、請求書ページをリフレッシュして、コスト管理における明確性と利便性を高めました。主なアップデートには以下が含まれます：

- 支払い期限時のタイムリーな通知

- 拡張請求サイクルのサポートにより、企業の財務ワークフローに支払い条件を合わせ、サービスの中断を防ぐ

- コストの可視性とダウンロードオプション付きの明細化された請求書

これらのアップデートの詳細については、[請求書](./view-invoice)を参照してください。

### 機能強化\{#enhancements}

- レプリカ構成プロセスを最適化しました。この新バージョンでは、ユーザーはすべてのコレクションを事前に解放する必要なく、レプリカ数を直接調整できるようになりました。