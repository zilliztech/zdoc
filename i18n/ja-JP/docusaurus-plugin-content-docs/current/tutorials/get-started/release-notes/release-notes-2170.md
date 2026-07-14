---
title: "リリースノート（2025年6月9日） | Cloud"
slug: /release-notes-2170
sidebar_label: "2025年6月9日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud の複数の機能にわたって、より洗練され直感的なユーザー体験を提供します。再設計された移行コンソールから、ポリシーベースのアラート、改善された mmap 制御まで、ワークフローをより高速で柔軟にし、管理しやすくすることに注力しました。新しい AI アシスタント機能と GCP 上の BYOC サポートにより、インフラ管理、環境監視、サポート利用のいずれにおいても、プラットフォームの機能と使いやすさがさらに拡張されます。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年6月9日）

このリリースでは、Zilliz Cloud の複数の機能にわたって、より洗練され直感的なユーザー体験を提供します。再設計された移行コンソールから、ポリシーベースのアラート、改善された mmap 制御まで、ワークフローをより高速で柔軟にし、管理しやすくすることに注力しました。新しい AI アシスタント機能と GCP 上の BYOC サポートにより、インフラ管理、環境監視、サポート利用のいずれにおいても、プラットフォームの機能と使いやすさがさらに拡張されます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud クラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **Generally Available** です。

## 洗練されたユーザーインターフェースとベストプラクティス文書により、移行体験を向上\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **新しいコンソールユーザーインターフェース:** クリーンで直感的な GUI により、データソースをすばやく見つけ、適切な移行方法を選択できます。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](https://zdoc-images.s3.us-west-2.amazonaws.com/m3k4bsnieoqbkexpdapcd6j7nvb.png "M3K4bSnIeoqBKExPdaPcd6j7nVb")

    Zilliz Cloud は、Zilliz Cloud クラスター間、Milvus インスタンスから、さらに複数の外部ソースからの移行をサポートしています。利用可能なデータソースの詳細については、[Zilliz から Zilliz への移行](./migrate-between-clusters) を参照してください。

- **高度なコレクションと構成ツール:** 改善されたデータ型サポート、動的フィールドから固定フィールドへの変換、さらにフィールド設定やシャード設定のための直感的な操作により、複雑なコレクションおよびフィールドのマッピングにも安心して対応できます。これらはすべて、応答性が高く使いやすいインターフェース内で利用できます。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](https://zdoc-images.s3.us-west-2.amazonaws.com/o3aebuicjonyfsxlrbucdp5snob.png "O3AebUiCjonYFSxLrbucDp5SnOb")

    外部ソースからの移行の一般的な手順については [External Migration Basics](./external-migration-basics) を参照してください。また、[Pinecone](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[Tencent Cloud](./migrate-from-tencent-cloud)、[OpenSearch](./migrate-from-opensearch) など、特定の外部ソースごとの要件や一般的な問題への対処ルールについても確認できます。

## きめ細かく柔軟な監視を可能にするポリシーベースのアラート\{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムのアップグレードでは、よりきめ細かく柔軟な監視を実現するために **アラートポリシー** が導入されました。 

- **ポリシーベースのアラート:** 特定のクラスターを対象に、より精密な監視を行えるようになりました。

- **ポリシーの複製:** 既存のポリシーをワンクリックで複製し、時間を節約できます。

- **OpenAPI サポート:** プログラムによるアクセスを通じてアラート管理を自動化できます。

- **シームレスな移行:** 既存の従来アラートはすべて中断なく新しいフレームワークへ移行されました。

ポリシーベースのアラートの詳細については、[Manage Project Alerts](./manage-project-alerts) およびアラートルールの [作成](/reference/restful/create-alert-rule-v2)、[更新](/reference/restful/update-alert-rule-v2)、[一覧表示](/reference/restful/list-alert-rules-v2)、[削除](/reference/restful/delete-alert-rule-v2) に関する RESTful API リファレンスページを参照してください。

## mmap 設定の UI サポート\{#ui-support-for-mmap-settings}

Zilliz Cloud は、CU タイプおよびプランに基づく [クラスター レベルのデフォルト](./use-mmap) に従います。このリリース以降、コレクション レベルおよびフィールド レベルで **mmap 設定** を GUI から直接管理できるようになりました。 

- **コレクション レベルの設定:** 必要に応じて、生データに mmap 設定を簡単に適用できます。

- **フィールド レベルの制御:** 特定のフィールドの生データおよびインデックスデータに対して、mmap 設定の有効化、無効化、削除を行えます。

![JspDbBt12o4ra2x353ycjG1Mn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/jspdbbt12o4ra2x353ycjg1mn7b.png "JspDbBt12o4ra2x353ycjG1Mn7b")

## BYOC が GCP で利用可能に\{#byoc-now-available-on-gcp}

Zilliz Cloud **Bring Your Own Cloud (BYOC)** は、**Google Cloud Platform (GCP)** をサポートするようになりました。

- **Data Plane のデプロイ:** Zilliz Cloud Data Plane を自身の GCP 環境で実行し、データとセキュリティを完全に制御できます。

- **柔軟なセットアップオプション:** IaC 自動化のために Terraform provider を使用することも、ステップごとの手動ガイドに従ってネットワーク、認証ルール、プロジェクトを構成することもできます。

詳細については、手動ガイドは [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp)、IaC 自動化は [Terraform Provider](/docs/byoc/terraform-provider) を参照してください。

## 使いやすく設計された AI アシスタントが Zilliz サポートへ直接つなぎます\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

このリリースでは、より直感的で快適なユーザー体験を実現するために Zilliz Cloud AI アシスタントのビジュアルデザインが強化され、さらに 2 つの新しいスマート機能が導入されました。

- **サポートへのエスカレーション:** 人によるサポートの依頼を自動的に検出し、すみやかに適切な窓口へルーティングします。

- **営業シグナルの検出:** 購入意向や営業関連の兆候を識別し、タイムリーなフォローアップを可能にします。

![OQTSbop2WoTH2px3o5tcbDmmnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/oqtsbop2woth2px3o5tcbdmmnyf.png "OQTSbop2WoTH2px3o5tcbDmmnYf")

## その他の改善\{#other-improvements}

- アラート設定およびアラート履歴表示を改善しました。

- **招待登録** と **パスワード回復** のワークフローを簡素化しました。

