---
title: "リリースノート (2023年12月11日) | Cloud"
slug: /release-notes-240
sidebar_label: "リリースノート (2023年12月11日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudサービスは東米リージョンから始まり、Azureで利用可能になりました。さらに、非構造化データをベクトル埋め込みに変換してインジェストおよび検索するZilliz Cloud Pipelines（ベータ版）を導入します。リリースには、ユーザー管理のための事前定義された3つのロール（管理者、読み書き、読み取り専用）を持つクラスター内のRBACおよび資格情報管理の改善も含まれます。その他の更新には、強化されたエラーメッセージコンテンツおよびより信頼性の高いサービスのための安定性向上が含まれます。 | Cloud"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 19
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination

---

import Admonition from '@theme/Admonition';


# リリースノート (2023年12月11日)

Zilliz Cloudサービスは東米リージョンから始まり、Azureで利用可能になりました。さらに、非構造化データをベクトル埋め込みに変換してインジェストおよび検索するZilliz Cloud Pipelines（ベータ版）を導入します。リリースには、ユーザー管理のための事前定義された3つのロール（管理者、読み書き、読み取り専用）を持つクラスター内のRBACおよび資格情報管理の改善も含まれます。その他の更新には、強化されたエラーメッセージコンテンツおよびより信頼性の高いサービスのための安定性向上が含まれます。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.2.x**および**Milvus 2.3.x (Beta)**と互換性があります。

## Azure版Zilliz Cloud\{#zilliz-cloud-on-azure}

重要な拡大を発表できることを嬉しく思います：Zilliz Cloudサービスが東米リージョンから始まり、Azureで利用可能になりました。これは、プラットフォームがAWS、GCP、Azureの3つの主要パブリッククラウドとシームレスに統合されるという重要なマイルストーンであり、複数の環境全体で一貫した統一されたユーザーエクスペリエンスを確保します。Azure東米リージョンを超えるリージョンで展開が必要なビジネス要件がある場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

## パイプライン\{#pipelines}

本日、Zilliz Cloudに新しく追加されたZilliz Cloud Pipelines（ベータ版）を導入できることを嬉しく思います。Pipelinesは、非構造化データの可能性を解放し、シームレスにベクトル埋め込みに変換してストレージおよび検索のためにZilliz Cloudにインジェストするように設計されています。このソリューションは、埋め込み、インジェスト、ストレージ、および検索などのプロセスを統合することによりデータワークフローを簡素化し、最新の検索アプリケーション（最先端の[検索拡張生成（RAG）](https://zilliz.com/use-cases/llm-retrieval-augmented-generation)など）構築時に複数のスタックを統合しなければならない開発者に朗報です。

Zilliz Cloud Pipelinesは、インジェスト、検索、および削除の3つの特定のパイプラインで構成されています。

- **インジェストパイプライン**は、非構造化データを処理し、検索可能なベクトル埋め込みに変換し、ストレージおよび検索のためにZillizベクトルデータベースにインジェストする主力です。

- **検索パイプライン**は、クエリ文字列をベクトル埋め込みに変換し、Zilliz Cloudに送信して上位K件の類似ベクトルを検索することで、セマンティック検索を促進します。

- **削除パイプライン**では、Zilliz Cloudコレクションから指定されたドキュメントのすべてのチャンクを削除でき、独自のデータを完全に制御し、Zillizコレクションのストレージ容量を解放できます。

## クラスターでのRBACおよび資格情報管理\{#rbac-and-credential-management-in-your-clusters}

このリリースでは、各クラスター内でのRBAC（ロールベースアクセス制御）および資格情報管理を管理するための強化された機能を導入します。この合理化されたアプローチにより、ユーザーはクラスターユーザーを効率的に管理できます。これらの機能にアクセスするには、「クラスター」セクションに移動し、「your_cluster」を選択し、次に「ユーザー」タブに進んでください。このリリースには、簡略化されたユーザー管理のための3つの事前定義ロール：「管理者」、「読み書き」、「読み取り専用」が含まれ、それぞれ異なるレベルのアクセスおよび制御ニーズに合わせて調整されています。これらの新機能の利用に関する詳細およびガイドについては、[ドキュメント](./access-control)を参照してください。

## 新しいクラスター操作APIエンドポイント\{#new-cluster-manipulation-api-endpoints}

このリリースでは、クラスターの作成、変更、および削除のための新しいRESTful APIエンドポイントセットも導入しており、プロジェクトを一覧表示するための別のAPIエンドポイントも導入しています。詳細については、[リファレンスドキュメント](/reference/restful/cluster-operations)を参照してください。

## 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれます：

- 一連のエラーメッセージのための改善されたコンテンツ。

- 安定性強化：サービスの信頼性をさらに向上させるために既知の問題に対処。