---
title: "リリースノート (2023年12月11日) | Cloud"
slug: /release-notes-240
sidebar_key: release-notes-240
sidebar_label: "2023年12月11日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のサービスが Azure で利用可能になりました。最初は East US リージョンから開始します。また、非構造化データをベクトル埋め込みに変換して取り込み・検索を行う Zilliz Cloud Pipelines (Beta) を導入しました。このリリースでは、クラスター内の RBAC と認証情報管理も改善され、ユーザー管理用に3つの事前定義ロール（admin、read-write、read-only）が用意されています。その他の更新として、エラーメッセージの内容強化と、より信頼性の高いサービスを実現する安定性の向上が含まれます。"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 26
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

Zilliz Cloud サービスが Azure で利用可能になりました。最初は East US リージョンから開始します。さらに、非構造化データをベクトル埋め込みに変換して取り込みと検索を行う Zilliz Cloud Pipelines（Beta）を導入しました。このリリースでは、Cluster 内の RBAC と認証情報管理も改善され、ユーザー管理用に3つの事前定義ロール（admin、read-write、read-only）が用意されています。その他の更新として、エラーメッセージの内容の強化と、より信頼性の高いサービスを実現する安定性の向上が含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Azure 上の Zilliz Cloud\{#zilliz-cloud-on-azure}

Zilliz Cloud サービスが Azure で利用可能になりました。最初は East US リージョンから開始します。これは、当社のプラットフォームが AWS、GCP、Azure の3つの主要なパブリッククラウドとシームレスに統合され、複数の環境で一貫した統一されたユーザー体験を確保するという重要なマイルストーンとなります。Azure East US 以外のリージョンへのデプロイがビジネス要件で必要な場合は、さらなるサポートのために [お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

## Pipelines\{#pipelines}

本日、Zilliz Cloud の新機能として Zilliz Cloud Pipelines（Beta）をご紹介できることを嬉しく思います。Pipelines は、非構造化データをベクトル埋め込みにシームレスに変換し、Zilliz Cloud に取り込んで保存・検索することで、非構造化データの可能性を引き出すように設計されています。このソリューションは、埋め込み、取り込み、保存、検索などのプロセスを統合することでデータワークフローを簡素化し、最先端の [Retrieval Augmented Generation (RAG)](https://zilliz.com/use-cases/llm-retrieval-augmented-generation) などの最新の検索アプリケーションを構築する際に、複数のスタックを統合することに苦労していた開発者の負担を軽減します。

Zilliz Cloud Pipelines は、Ingestion、Search、Deletion の3つの特定のパイプラインで構成されています。

- **取り込みパイプライン** は、非構造化データを処理し、検索可能なベクトル埋め込みに変換して、Zilliz Vector データベース に取り込んで保存・検索する主力のパイプラインです。

- **Search pipelines** は、クエリ文字列をベクトル埋め込みに変換し、Zilliz Cloud に送信して最も類似した上位K個のベクトルを検索することで、セマンティック検索を実現します。

- **削除パイプライン** を使用すると、指定したドキュメント内のすべてのチャンクを Zilliz Cloud コレクションから削除でき、データを完全に管理でき、Zilliz コレクションのストレージ容量を解放できます。

## Cluster 内の RBAC と認証情報管理\{#rbac-and-credential-management-in-your-clusters}

このリリースでは、各 Cluster 内で RBAC（ロール-Based Access Control）と認証情報を管理するための機能強化を導入しました。この合理化されたアプローチにより、ユーザーは Cluster ユーザーを効率的に管理できます。これらの機能にアクセスするには、「Clusters」セクションに移動し、「your_cluster」を選択してから「Users」タブに進んでください。このリリースには、簡略化されたユーザー管理用に3つの事前定義ロールが含まれています。「admin」、「read-write」、「read-only」で、それぞれ異なるレベルのアクセスと制御のニーズに合わせて調整されています。これらの新機能を利用するための包括的な詳細とガイダンスについては、[ドキュメント](./access-control) を参照してください。

## 新しい Cluster 操作 API エンドポイント\{#new-cluster-manipulation-api-endpoints}

このリリースでは、Cluster の作成、変更、削除を行うための新しい RESTful API エンドポイントのセットと、プロジェクトを一覧表示するための別の API エンドポイントも導入しました。詳細については、こちらの [リファレンスドキュメント](/reference/restful/cluster-operations) を参照してください。

## 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれています。

- 一連のエラーメッセージの内容の改善。

- 安定性の強化：既知の問題に対処し、サービスの信頼性をさらに向上させました。

