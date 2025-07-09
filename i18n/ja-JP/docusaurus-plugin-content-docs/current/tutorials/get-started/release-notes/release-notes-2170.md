---
title: "リリースノート(2025年6月9日) | Cloud"
slug: /release-notes-2170
sidebar_label: "リリースノート(2025年6月9日)"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloudの複数の機能にわたって、より洗練された直感的なユーザーエクスペリエンスが提供されます。再設計された移行コンソールからポリシーベースのアラート、改良されたmmapコントロールまで、ワークフローをより速く、柔軟に、管理しやすくすることに焦点を当てています。新しいAIアシスタント機能とGCP上のBYOCのサポートにより、インフラストラクチャの管理、環境の監視、またはサポートを求める場合でも、プラットフォームのパワーと使いやすさがさらに拡張されます。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial

---

import Admonition from '@theme/Admonition';


# リリースノート(2025年6月9日)

このリリースでは、Zilliz Cloudの複数の機能にわたって、より洗練された直感的なユーザーエクスペリエンスが提供されます。再設計された移行コンソールからポリシーベースのアラート、改良されたmmapコントロールまで、ワークフローをより速く、柔軟に、管理しやすくすることに焦点を当てています。新しいAIアシスタント機能とGCP上のBYOCのサポートにより、インフラストラクチャの管理、環境の監視、またはサポートを求める場合でも、プラットフォームのパワーと使いやすさがさらに拡張されます。

## Milvusの互換性{#milvus-compatibility}

このリリース以降に作成されたすべてのZilliz Cloudクラスターは、Milvus v 2.5. xと互換性があり、Milvus v 2.5.xのすべての機能が一般に利用可能です。

## ユーザーインターフェースとお客様様事例のドキュメントを改善し、移行体験を改善しました{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- 新しいコンソールユーザーインターフェース:クリーンで直感的なGUIを使用して、データソースを素早く検索し、適切な移行方法を選択します。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](/img/M3K4bSnIeoqBKExPdaPcd6j7nVb.png)

    Zilliz Cloudは、Zilliz Cloudクラスタ間、Milvusインスタンス、および複数の外部ソースからの移行をサポートしています。可能なデータソースの詳細については、[マイグレーション](./migrations)を参照してください。

- 高度な収集および構成ツール:改良されたデータ型サポート、動的から固定フィールド変換、フィールドおよびシャード設定の直感的なコントロールにより、複雑な収集およびフィールドマッピングを自信を持って処理できます。これらはすべて、レスポンシブで使いやすいインターフェース内で行われます。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](/img/O3AebUiCjonYFSxLrbucDp5SnOb.png)

    外部ソースからの移行の一般的な手順については、[外部マイグレーションの基本](./external-migration-basics)を参照してください。また、[松ぼっくり](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearchについて](./migrate-from-elasticsearch)、[Postgre SQL](./migrate-from-pgvector)、[テンセントクラウド](./migrate-from-tencent-cloud)、[Open Search](./migrate-from-opensearch)など、特定の外部ソースのルールを処理するための要件と一般的な問題についても学ぶことができます。

## ポリシーベースのアラートによる細かく柔軟なモニタリング{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムのアップグレードにより、より細かく柔軟なモニタリングのための**アラートポリシー**が導入されます。 

- ポリシーベースのアラート:精密モニタリングのために特定のクラスタをターゲットにできるようになりました。

- **クローンポリシー:**クリックするだけで既存のポリシーを複製して時間を節約しましょう。

- **Open APIサポート:**プログラムアクセスによるアラート管理の自動化。

- シームレスな移行:すべてのレガシーアラートは、中断することなく新しいフレームワークに移行されました。

ポリシーベースのアラートの詳細については、[プロジェクトのアラートを管理する](./manage-project-alerts)および[作成する](/reference/restful/create-alert-rule-v2)、[更新する](/reference/restful/update-alert-rule-v2)、[リスティング](/reference/restful/list-alert-rules-v2)、[削除する](/reference/restful/delete-alert-rule-v2)のアラートルールに関するRESTful APIリファレンスページを参照してください。

## mmap設定のUIサポート{#ui-support-for-mmap-settings}

Zilliz Cloudは、CUタイプとプランに基づいて[クラスタレベルのデフォルト](./use-mmap#global-mmap-strategy)に従います。このリリース以降、コレクションレベルとフィールドレベルのグラフィカルユーザーインターフェイス(GUI)から直接**mmap設定**を管理可能になりました。 

- **コレクションレベルの設定:**必要に応じて生データに簡単にmmap設定を適用できます。

- **フィールドレベルコントロール:**特定のフィールドの生データとインデックスデータのmmap設定を有効、無効、または削除します。

![JspDbBt12o4ra2x353ycjG1Mn7b](/img/JspDbBt12o4ra2x353ycjG1Mn7b.png)

## BYOCがGCPで利用可能になりました{#byoc-now-available-on-gcp}

Zilliz CloudのBring Your Own Cloud（BYOC）は、現在Google Cloud Platform（GCP）をサポートしています。

- **データプレーンのデプロイメント:**Zilliz Cloud Data Planeを独自のGCP環境で実行し、データとセキュリティを完全に制御します。

- **柔軟なセットアップオプション:**当社のTerraformプロバイダを使用してIaCオートメーションを設定するか、ステップバイステップのマニュアルガイドに従ってネットワーキング、認証ルール、プロジェクトを設定してください。

詳細については、マニュアルガイドの[GCPでBYOCをデプロイする](/docs/byoc/deploy-byoc-gcp)とIaCオートメーションの[テラフォームプロバイダName](/docs/byoc/terraform-provider)を参照してください。

## よく設計されたAIアシスタンスは、Zillizサポートに直接接続します{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

このリリースでは、Zilliz Cloud AIアシスタンスのビジュアルデザインが強化され、より直感的で快適なユーザーエクスペリエンスが実現され、2つの新しいスマート機能が導入されました。

- **サポートにエスカレーション:**人間のサポートの要求を自動的に検出し、迅速にルーティングします。

- 販売シグナルを検出:タイムリーなフォローアップのために購入意図と販売関連の手がかりを特定します。

![OQTSbop2WoTH2px3o5tcbDmmnYf](/img/OQTSbop2WoTH2px3o5tcbDmmnYf.png)

## その他の改善{#other-improvements}

- アラート設定とアラート履歴の表示を改善しました。

- 招待登録とパスワード回復のためのワークフローを効率化しました。

