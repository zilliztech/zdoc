---
title: "リリースノート (2025年6月9日) | Cloud"
slug: /release-notes-2170
sidebar_label: "リリースノート (2025年6月9日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloudの複数の機能全体でより洗練され直感的なユーザーエクスペリエンスを提供します。リデザインされた移行コンソールからポリシーベースのアラートおよび改善されたmmap制御まで、ワークフローをより高速、柔軟、管理しやすくすることに焦点を当てています。新しいAIアシスタント機能およびGCPでのBYOCサポートにより、インフラストラクチャの管理、環境の監視、またはサポートの検索にかかわらず、プラットフォームのパワーとユーザビリティがさらに拡張されます。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database

---

import Admonition from '@theme/Admonition';


# リリースノート (2025年6月9日)

このリリースでは、Zilliz Cloudの複数の機能全体でより洗練され直感的なユーザーエクスペリエンスを提供します。リデザインされた移行コンソールからポリシーベースのアラートおよび改善されたmmap制御まで、ワークフローをより高速、柔軟、管理しやすくすることに焦点を当てています。新しいAIアシスタント機能およびGCPでのBYOCサポートにより、インフラストラクチャの管理、環境の監視、またはサポートの検索にかかわらず、プラットフォームのパワーとユーザビリティがさらに拡張されます。

## Milvus互換性\{#milvus-compatibility}

このリリース後に作成されたすべてのZilliz Cloudクラスターは**Milvus v2.5.x**と互換性があり、Milvus v2.5.xのすべての機能は**一般提供**です。

## 洗練されたユーザーインターフェースとベストプラクティスドキュメント、移行エクスペリエンスの改善\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **新コンソールユーザーインターフェース**：クリーンで直感的なGUIでデータソースをすばやく検索し、適切な移行方法を選択できます。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](/img/M3K4bSnIeoqBKExPdaPcd6j7nVb.png)

    Zilliz Cloudは、Zilliz Cloudクラスター間、Milvusインスタンスから、およびいくつかの外部ソースからの移行をサポートします。可能なデータソースの詳細については、[移行](./migrations)を参照してください。

- **高度なコレクションおよび構成ツール**：改善されたデータ型サポート、動的から固定フィールドへの変換、およびフィールドおよびシャード設定用の直感的なコントロールにより、応答性の高いユーザーフレンドリーなインターフェース内で複雑なコレクションおよびフィールドマッピングを自信をもって処理できます。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](/img/O3AebUiCjonYFSxLrbucDp5SnOb.png)

    外部ソースからの移行の一般的な手順に関するガイダンスについては[外部移行の基本](./external-migration-basics)を読むことができます。また、[Pinecone](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[Tencent Cloud](./migrate-from-tencent-cloud)、および[OpenSearch](./migrate-from-opensearch)を含む特定の外部ソースの要件および一般的な問題処理ルールについて学ぶことができます。

## 細かい柔軟な監視のためのポリシーベースアラート\{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムアップグレードでは、より細かい柔軟な監視のための**アラートポリシー**を導入します。

- **ポリシーベースアラート**：精密な監視のために特定のクラスターを対象にできます。

- **ポリシーの複製**：既存のポリシーをクリック1つで複製して時間を節約できます。

- **OpenAPIサポート**：プログラムによるアクセスを介してアラート管理を自動化できます。

- **シームレスな移行**：すべてのレガシーなアラートは、混乱を起こすことなく新しいフレームワークに移行されました。

ポリシーベースアラートの詳細については、[プロジェクトアラートの管理](./manage-project-alerts)およびアラートルールの[作成](/reference/restful/create-alert-rule-v2)、[更新](/reference/restful/update-alert-rule-v2)、[一覧表示](/reference/restful/list-alert-rules-v2)、および[削除](/reference/restful/delete-alert-rule-v2)に関するRESTful APIリファレンスページを参照してください。

## mmap設定のUIサポート\{#ui-support-for-mmap-settings}

Zilliz Cloudは、CUタイプおよびプランに基づいて[クラスターレベルのデフォルト](./use-mmap#global-mmap-strategy)に従います。このリリース以来、グラフィカルユーザーインターフェース（GUI）からコレクションおよびフィールドレベルで**mmap設定**を直接管理できます。

- **コレクションレベル構成**：必要に応じて、生データにmmap設定を簡単に適用できます。

- **フィールドレベル制御**：特定フィールドの生データおよびインデックスデータに対するmmap設定を有効化、無効化、または削除できます。

![JspDbBt12o4ra2x353ycjG1Mn7b](/img/JspDbBt12o4ra2x353ycjG1Mn7b.png)

## BYOCがGCPで利用可能に\{#byoc-now-available-on-gcp}

Zilliz Cloud**Bring Your Own Cloud (BYOC)** は**Google Cloud Platform (GCP)** をサポートするようになりました。

- **データプレーン展開**：データおよびセキュリティを完全に制御するために、独自のGCP環境でZilliz Cloudデータプレーンを実行します。

- **柔軟なセットアップオプション**：IaC自動化のためのTerraformプロバイダーを使用するか、手順に従ったマニュアルガイドに従って、ネットワーク、認証ルール、およびプロジェクトを構成してください。

詳細については、マニュアルガイドの[Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) を、IaC自動化の[Terraform Provider](/docs/byoc/terraform-provider) を参照してください。

## 良く設計されたAIアシスタンスにより、Zillizのサポートに直接接続\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

このリリースでは、より直感的で快適なユーザーエクスペリエンスのためにZilliz Cloud AIアシスタンスのビジュアルデザインを強化し、2つの新しいスマート機能を導入しました：

- **サポートへのエスカレーション**：人間のサポートリクエストを自動検出し、迅速にルーティングします。

- **販売信号の検出**：タイムリーなフォローアップのための購買意図および販売関連の手がかりを識別します。

![OQTSbop2WoTH2px3o5tcbDmmnYf](/img/OQTSbop2WoTH2px3o5tcbDmmnYf.png)

## その他の改善\{#other-improvements}

- アラート設定およびアラート履歴表示の改善。

- **招待登録**および**パスワード回復**のワークフローを合理化。