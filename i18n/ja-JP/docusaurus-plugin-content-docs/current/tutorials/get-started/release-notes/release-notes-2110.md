---
title: "リリースノート（2024年11月6日） | Cloud"
slug: /release-notes-2110
sidebar_key: release-notes-2110
sidebar_label: "2024年11月6日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、新しい Web コンソールのユーザーインターフェース、Qdrant・Pinecone Serverless・Tencent VectorDB からのデータ移行サポート、よりスムーズな支払いプロセス、および詳細な支払い情報を備えた刷新された請求書ページが含まれています。 | Cloud"
type: origin
token: HwWfwN9SViqU0Ukcv68cufBAnBe
sidebar_position: 17
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年11月6日）

このリリースには、刷新されたWebコンソールのユーザーインターフェース、Qdrant、Pinecone Serverless、Tencent VectorDBからのデータ移行のサポート、よりスムーズな支払いプロセス、および詳細な支払い情報を備えた刷新された請求書ページが含まれています。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

## まったく新しいWebコンソールのユーザーインターフェース\{#a-brand-new-web-console-user-interface}

このリリースでは、Zilliz Cloud は完全にアップグレードされたWebコンソールUIを導入しました。おなじみのワークフローを維持しながら、新しいインターフェースはユーザーのインタラクティブな体験と視覚的な体験の両方を大幅に向上させます。

[Zilliz Cloud](https://cloud.zilliz.com) アカウントにログインして、新しいインターフェースをぜひお試しください！

## 拡張されたソースサポートによる強化されたデータ移行\{#enhanced-data-migration-with-expanded-source-support}

このリリースでは、Zilliz Cloud はデータ移行機能をアップグレードし、以下の追加データソースをサポートするようになりました：

- Qdrant

- Pinecone Serverless

- Tencent VectorDB

これらの強化により、これらのベンダーからZilliz Cloudへのデータ移行を簡単に行うことができ、Zilliz Cloud が提供する独自の機能と能力を活用できます。これらのソースからのデータ移行の詳細な手順については、[Qdrant から Zilliz Cloud への移行](./migrate-from-qdrant)、[Pinecone から Zilliz Cloud への移行](./migrate-from-pinecone)、および [Tencent Cloud から Zilliz Cloud への移行](./migrate-from-tencent-cloud) を参照してください。

## 改善された支払いプロセスと再設計された請求書ページ\{#improved-payment-process-and-redesigned-invoice-page}

このリリースでは、Zilliz Cloud は支払いプロセスを効率化し、請求書ページを刷新し、コスト管理においてより高い明確性と利便性を提供します。主なアップデートは以下の通りです：

- 支払い期限が近づいた際のタイムリーな通知

- 拡張された請求サイクルのサポートにより、支払い条件を企業の財務ワークフローに合わせ、サービスの中断を防止

- コストの可視性とダウンロードオプションを備えた項目別の請求書

これらのアップデートの詳細については、[請求書](./view-invoice) を参照してください。

### 機能強化\{#enhancements}

- レプリカ設定プロセスを最適化しました。この新しいバージョンでは、ユーザーは事前にすべてのコレクションを解放する必要なく、レプリカの数を直接調整できるようになりました。

