---
title: "リリースノート（2025年6月9日） | Cloud"
slug: /release-notes-2170
sidebar_label: "2025年6月9日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud の複数の機能にわたって、より洗練された直感的なユーザーエクスペリエンスを提供します。再設計された移行コンソールから、ポリシーベースのアラート、改善された mmap 制御まで、ワークフローをより迅速かつ柔軟で管理しやすくすることに注力しました。新しい AI アシスタント機能と GCP での BYOC のサポートにより、インフラストラクチャの管理、環境の監視、サポートの利用など、どのような場面でもプラットフォームの能力と使いやすさがさらに拡張されます。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 14
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年6月9日）

このリリースでは、Zilliz Cloud の複数の機能にわたって、より洗練された直感的なユーザーエクスペリエンスを提供します。再設計された移行コンソールから、ポリシーベースのアラート、改善された mmap 制御まで、ワークフローをより迅速かつ柔軟で管理しやすくすることに注力しました。新しい AI アシスタント機能と GCP での BYOC のサポートにより、インフラストラクチャの管理、環境の監視、サポートの利用など、どのような場面でもプラットフォームの能力と使いやすさがさらに拡張されます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud クラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **Generally Available** です。

## 洗練されたユーザーインターフェースとベストプラクティスドキュメントによる移行エクスペリエンスの改善\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **新しいコンソールユーザーインターフェース:** クリーンで直感的な GUI により、データソースをすばやく特定し、適切な移行方法を選択できます。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](https://zdoc-images.s3.us-west-2.amazonaws.com/m3k4bsnieoqbkexpdapcd6j7nvb.png "M3K4bSnIeoqBKExPdaPcd6j7nVb")

    Zilliz Cloud は、Zilliz Cloud クラスター間、Milvus インスタンスから、および複数の外部ソースからの移行をサポートしています。利用可能なデータソースの詳細については、[Zilliz 間の移行](./migrate-between-clusters) を参照してください。

- <strong>高度なコレクションおよび構成ツール:</strong> 改善されたデータ型のサポート、動的フィールドから固定フィールドへの変換、フィールド設定とシャード設定のための直感的な操作により、複雑なコレクションとフィールドのマッピングを自信を持って処理できます。これらはすべて、応答性が高く使いやすいインターフェース内で利用できます。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](https://zdoc-images.s3.us-west-2.amazonaws.com/o3aebuicjonyfsxlrbucdp5snob.png "O3AebUiCjonYFSxLrbucDp5SnOb")

    外部ソースからの移行の一般的な手順については、[外部移行の基本](./external-migration-basics) を参照してください。また、[Pinecone](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[Tencent Cloud](./migrate-from-tencent-cloud)、[OpenSearch](./migrate-from-opensearch) など、特定の外部ソースの要件と一般的な問題の対処ルールについても確認できます。

## きめ細かく柔軟なモニタリングを実現するポリシーベースのアラート\{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムのアップグレードでは、よりきめ細かく柔軟なモニタリングを実現するために **Alert Policies** が導入されました。

- **ポリシーベースのアラート:** 特定のクラスターを対象とした高精度なモニタリングが可能になりました。

- **ポリシーの複製:** 既存のポリシーをワンクリックで複製し、時間を節約できます。

- **OpenAPI サポート:** プログラムによるアクセスでアラート管理を自動化できます。

- **シームレスな移行:** 従来のすべてのアラートは、中断することなく新しいフレームワークに移行されました。

ポリシーベースのアラートの詳細については、[プロジェクトアラートの管理](./manage-project-alerts) およびアラートルールの [creating](/reference/restful/create-alert-rule-v2)、[updating](/reference/restful/update-alert-rule-v2)、[listing](/reference/restful/list-alert-rules-v2)、[deleting](/reference/restful/delete-alert-rule-v2) に関する RESTful API リファレンスページを参照してください。

## mmap 設定の UI サポート\{#ui-support-for-mmap-settings}

Zilliz Cloud は、CU タイプとプランに基づいて [クラスターレベルのデフォルト](./use-mmap#global-mmap-strategy) に従います。このリリース以降、コレクションレベルおよびフィールドレベルで、**mmap 設定** をグラフィカルユーザーインターフェース（GUI）から直接管理できます。

- **コレクションレベルの構成:** 必要に応じて、生データに mmap 設定を簡単に適用できます。

- **フィールドレベルの制御:** 特定のフィールドの生データとインデックスデータに対して、mmap 設定を有効化、無効化、または削除できます。

![JspDbBt12o4ra2x353ycjG1Mn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/jspdbbt12o4ra2x353ycjg1mn7b.png "JspDbBt12o4ra2x353ycjG1Mn7b")

## BYOC が GCP で利用可能に\{#byoc-now-available-on-gcp}

Zilliz Cloud の **Bring Your Own Cloud（BYOC）** が **Google Cloud Platform（GCP）** をサポートするようになりました。

- **データプレーンのデプロイ:** データとセキュリティを完全に制御するために、独自の GCP 環境で Zilliz Cloud データプレーンを実行できます。

- **柔軟なセットアップオプション:** IaC 自動化には当社の Terraform プロバイダーを使用するか、手順ごとの手動ガイドに従ってネットワーク、認証ルール、プロジェクトを構成できます。

詳細については、手動ガイドについては [GCP に BYOC をデプロイ](/docs/byoc/deploy-byoc-gcp)、IaC 自動化については [Terraform Provider](/docs/byoc/terraform-provider) を参照してください。

## 洗練された AI アシスタントが Zilliz サポートに直接つながります\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

このリリースでは、Zilliz Cloud AI アシスタントのビジュアルデザインが強化され、より直感的で快適なユーザーエクスペリエンスを実現するとともに、2つの新しいスマート機能が導入されました。

- **サポートへのエスカレーション:** 人間によるサポートの依頼を自動的に検出し、迅速にルーティングします。

- **セールスシグナルの検出:** 購買意欲やセールス関連の兆候を特定し、タイムリーなフォローアップを可能にします。

![OQTSbop2WoTH2px3o5tcbDmmnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/oqtsbop2woth2px3o5tcbdmmnyf.png "OQTSbop2WoTH2px3o5tcbDmmnYf")

## その他の改善\{#other-improvements}

- アラート設定とアラート履歴の表示を改善しました。

- **招待登録** と **パスワード復旧** のワークフローを簡素化しました。
