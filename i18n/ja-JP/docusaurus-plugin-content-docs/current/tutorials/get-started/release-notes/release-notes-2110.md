---
title: "リリースノート（2024年11月6日） | Cloud"
slug: /release-notes-2110
sidebar_label: "2024年11月6日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースには、新しい Web コンソールのユーザーインターフェース、Qdrant、Pinecone Serverless、Tencent VectorDB からのデータ移行のサポート、よりスムーズな支払いプロセス、詳細な支払い情報を備えた刷新された Invoice ページが含まれます。 | Cloud"
type: origin
token: HwWfwN9SViqU0Ukcv68cufBAnBe
sidebar_position: 18
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年11月6日）

このリリースには、新しい Web コンソールのユーザーインターフェース、Qdrant、Pinecone Serverless、Tencent VectorDB からのデータ移行のサポート、よりスムーズな支払いプロセス、詳細な支払い情報を備えた刷新された Invoice ページが含まれます。

## Milvus compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

## まったく新しい Web コンソールのユーザーインターフェース\{#a-brand-new-web-console-user-interface}

このリリースでは、Zilliz Cloud は Web コンソールの UI を全面的にアップグレードしました。使い慣れたワークフローは維持しつつ、新しいインターフェースによって、ユーザーの操作性と視覚体験の両方が大幅に向上しています。

ご自身で新しいインターフェースを試すには、[Zilliz Cloud](https://cloud.zilliz.com) アカウントにログインしてください。

## ソースサポートの拡張によるデータ移行機能の強化\{#enhanced-data-migration-with-expanded-source-support}

このリリースでは、Zilliz Cloud はデータ移行機能を強化し、以下を含む追加のデータソースをサポートするようになりました。

- Qdrant

- Pinecone Serverless

- Tencent VectorDB

これらの強化により、これらのベンダーから Zilliz Cloud へデータを簡単に移行し、Zilliz Cloud が提供する独自の機能と性能を活用できます。これらのソースからデータを移行するための詳細な手順については、[Qdrant から Zilliz Cloud への移行](./migrate-from-qdrant)、[Pinecone から Zilliz Cloud への移行](./migrate-from-pinecone)、および [Tencent Cloud から Zilliz Cloud への移行](./migrate-from-tencent-cloud) を参照してください。

## 支払いプロセスの改善と Invoice ページの再設計\{#improved-payment-process-and-redesigned-invoice-page}

このリリースでは、Zilliz Cloud は支払いプロセスを効率化し、Invoice ページを刷新しました。これにより、コスト管理における明確さと利便性が向上しています。主な更新内容は次のとおりです。

- 支払期日が来た際のタイムリーな通知

- 請求サイクルの延長に対応し、支払い条件をエンタープライズの財務ワークフローに合わせることで、サービスの中断を防止

- 費用の内訳が確認でき、ダウンロードオプションも備えた明細付き請求書

これらの更新の詳細については、[Invoices](./view-invoice) を参照してください。

### 機能強化\{#enhancements}

- replica 構成プロセスを最適化しました。この新しいバージョンでは、すべての collection を事前にリリースする必要なく、ユーザーは replica 数を直接調整できるようになりました。

