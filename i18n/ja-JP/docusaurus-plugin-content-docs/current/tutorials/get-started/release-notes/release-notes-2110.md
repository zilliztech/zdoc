---
title: "リリースノート（2024 年 11 月 6 日） | Cloud"
slug: /release-notes-2110
sidebar_key: release-notes-2110
sidebar_label: "2024 年 11 月 6 日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、新しい Web コンソールのユーザーインターフェース、Qdrant、Pinecone Serverless、Tencent VectorDB からのデータ移行サポート、よりスムーズな決済プロセス、および詳細な支払い情報を備えた刷新された請求書ページが含まれています。 | Cloud"
type: origin
token: HwWfwN9SViqU0Ukcv68cufBAnBe
sidebar_position: 15
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年11月6日)

今回のリリースでは、新しくデザインされたWebコンソールのユーザーインターフェース、Qdrant・Pinecone Serverless・Tencent VectorDBからのデータ移行サポート、スムーズな支払いプロセス、および詳細な支払い情報を表示する刷新された請求書ページが含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

## 新しいWebコンソールユーザーインターフェース\{#a-brand-new-web-console-user-interface}

今回のリリースでは、Zilliz Cloud が完全にアップグレードされた Web コンソール UI を導入しました。従来のワークフローを維持しつつ、新しいインターフェースによりユーザーのインタラクティブ体験と視覚的体験が大幅に向上しています。

[Zilliz Cloud](https://cloud.zilliz.com) アカウントにログインして、ぜひ新しいインターフェースをお試しください！

## 拡張されたデータソースサポートによる強化されたデータ移行機能\{#enhanced-data-migration-with-expanded-source-support}

今回のリリースでは、Zilliz Cloud のデータ移行機能がアップグレードされ、以下の追加データソースをサポートするようになりました。

- Qdrant

- Pinecone Serverless

- Tencent VectorDB

これらの機能強化により、これらのベンダーから Zilliz Cloud へ簡単にデータを移行し、Zilliz Cloud が提供する独自の機能や能力を活用できるようになります。これらのソースからのデータ移行に関する詳細な手順については、[Qdrant から Zilliz Cloud への移行](./migrate-from-qdrant)、[Pinecone から Zilliz Cloud への移行](./migrate-from-pinecone)、および [Tencent Cloud から Zilliz Cloud への移行](./migrate-from-tencent-cloud) をご参照ください。

## 改善された支払いプロセスと刷新された請求書ページ\{#improved-payment-process-and-redesigned-invoice-page}

今回のリリースでは、Zilliz Cloud が支払いプロセスを合理化し、請求書ページをリニューアルしました。これにより、コスト管理がより明確かつ便利になっています。主な更新内容は以下のとおりです。

- 支払い期限が近づいた際にタイムリーに通知

- 拡張された課金サイクルのサポートにより、企業の財務ワークフローに合わせた支払い条件を実現し、サービスの中断を防ぎます

- 費用の内訳が確認でき、ダウンロードも可能な明細付き請求書

これらの更新に関する詳細については、[請求書](./view-invoice) をご参照ください。

### 機能強化\{#enhancements}

- レプリカ設定プロセスを最適化しました。この新しいバージョンでは、ユーザーが事前にすべてのコレクションを解放することなく、直接レプリカ数を調整できるようになりました。

