---
title: "リリースノート（2025年6月9日） | Cloud"
slug: /release-notes-2170
sidebar_label: "2025年6月9日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud の複数の機能にわたって、より洗練され直感的なユーザーエクスペリエンスを提供します。再設計された migration コンソールから、ポリシーベースのアラートや改善された mmap 制御まで、ワークフローをより高速で柔軟にし、管理しやすくすることに注力しました。新しい AI アシスタント機能と GCP 上での BYOC サポートにより、インフラの管理、環境のモニタリング、サポートの利用など、あらゆる場面でプラットフォームの機能性と使いやすさがさらに拡張されます。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 13
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年6月9日）

このリリースでは、Zilliz Cloud の複数の機能にわたって、より洗練され直感的なユーザーエクスペリエンスを提供します。再設計された migration コンソールから、ポリシーベースのアラートや改善された mmap 制御まで、ワークフローをより高速で柔軟にし、管理しやすくすることに注力しました。新しい AI アシスタント機能と GCP 上での BYOC サポートにより、インフラの管理、環境のモニタリング、サポートの利用など、あらゆる場面でプラットフォームの機能性と使いやすさがさらに拡張されます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud cluster は **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **Generally Available** です。

## 洗練されたユーザーインターフェースとベストプラクティス文書により migration エクスペリエンスを改善\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **新しいコンソールのユーザーインターフェース:** クリーンで直感的な GUI により、データソースをすばやく見つけ、適切な migration 方法を選択できます。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](https://zdoc-images.s3.us-west-2.amazonaws.com/m3k4bsnieoqbkexpdapcd6j7nvb.png "M3K4bSnIeoqBKExPdaPcd6j7nVb")

    Zilliz Cloud は、Zilliz Cloud cluster 間、Milvus インスタンスから、さらに複数の外部ソースからの migration をサポートしています。利用可能なデータソースの詳細については、[Zilliz to Zilliz Migrations](./migrate-between-clusters) を参照してください。

- **高度な collection と設定ツール:** 改善されたデータ型サポート、動的フィールドから固定フィールドへの変換、さらにフィールド設定や shard 設定のための直感的な操作により、複雑な collection およびフィールドのマッピングにも安心して対応できます。これらはすべて、応答性が高く使いやすいインターフェース内で利用できます。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](https://zdoc-images.s3.us-west-2.amazonaws.com/o3aebuicjonyfsxlrbucdp5snob.png "O3AebUiCjonYFSxLrbucDp5SnOb")

    外部ソースからの migration の一般的な手順については [External Migration Basics](./external-migration-basics) を参照してください。また、[Pinecone](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[Tencent Cloud](./migrate-from-tencent-cloud)、および [OpenSearch](./migrate-from-opensearch) を含む、特定の外部ソースに関する要件や一般的な問題への対応ルールについても確認できます。

## きめ細かく柔軟なモニタリングを実現するポリシーベースのアラート\{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムのアップグレードでは、よりきめ細かく柔軟なモニタリングを実現するために **Alert Policies** が導入されました。 

- **ポリシーベースのアラート:** 特定の cluster を対象にした高精度なモニタリングが可能になりました。

- **ポリシーの複製:** 既存のポリシーをワンクリックで複製し、時間を節約できます。

- **OpenAPI サポート:** プログラムによるアクセスでアラート管理を自動化できます。

- **シームレスな移行:** 従来のすべてのアラートは中断なく新しいフレームワークへ移行されました。

ポリシーベースのアラートの詳細については、[Manage Project Alerts](./manage-project-alerts) およびアラートルールの [作成](/reference/restful/create-alert-rule-v2)、[更新](/reference/restful/update-alert-rule-v2)、[一覧表示](/reference/restful/list-alert-rules-v2)、[削除](/reference/restful/delete-alert-rule-v2) に関する RESTful API リファレンスページを参照してください。

## mmap 設定の UI サポート\{#ui-support-for-mmap-settings}

Zilliz Cloud は、CU タイプとプランに基づく [cluster レベルのデフォルト](./use-mmap#global-mmap-strategy) に従います。このリリース以降、collection レベルおよびフィールドレベルで **mmap 設定** をグラフィカルユーザーインターフェース（GUI）から直接管理できるようになりました。 

- **collection レベルの設定:** 必要に応じて raw データに mmap 設定を簡単に適用できます。

- **フィールドレベルの制御:** 特定のフィールドの raw データおよび index データに対して mmap 設定を有効化、無効化、または削除できます。

![JspDbBt12o4ra2x353ycjG1Mn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/jspdbbt12o4ra2x353ycjg1mn7b.png "JspDbBt12o4ra2x353ycjG1Mn7b")

## BYOC が GCP で利用可能に\{#byoc-now-available-on-gcp}

Zilliz Cloud **Bring Your Own Cloud (BYOC)** が **Google Cloud Platform (GCP)** をサポートするようになりました。

- **Data Plane のデプロイ:** 自身の GCP 環境で Zilliz Cloud Data Plane を実行し、データとセキュリティを完全に制御できます。

- **柔軟なセットアップオプション:** Terraform provider を使用して IaC 自動化を行うことも、手順に沿った手動ガイドに従ってネットワーク、認証ルール、プロジェクトを設定することもできます。

詳細については、手動ガイドは [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp)、IaC 自動化は [Terraform Provider](/docs/byoc/terraform-provider) を参照してください。

## よく設計された AI アシスタンスが Zilliz サポートに直接つなぎます\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

このリリースでは、より直感的で快適なユーザーエクスペリエンスのために Zilliz Cloud AI アシスタンスのビジュアルデザインが強化され、さらに 2 つの新しいスマート機能が導入されました。

- **サポートへのエスカレーション:** 人によるサポートへのリクエストを自動的に検出し、迅速に適切な窓口へルーティングします。

- **営業シグナルの検出:** 購買意図や営業関連の兆候を識別し、タイムリーなフォローアップを可能にします。

![OQTSbop2WoTH2px3o5tcbDmmnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/oqtsbop2woth2px3o5tcbdmmnyf.png "OQTSbop2WoTH2px3o5tcbDmmnYf")

## その他の改善\{#other-improvements}

- アラート設定とアラート履歴の表示を改善しました。

- **招待登録** と **パスワード復旧** のワークフローを簡素化しました。

