---
title: "リリースノート（2023年12月11日） | Cloud"
slug: /release-notes-240
sidebar_label: "2023年12月11日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud サービスが Azure で利用可能になり、まずは East US リージョンから提供を開始しました。さらに、非構造化データを取り込みと検索のためのベクトル埋め込みに変換する Zilliz Cloud Pipelines（Beta）を導入します。このリリースでは、Cluster 内の RBAC と認証情報管理も改善され、ユーザー管理用に 3 つの事前定義ロール（admin、read-write、read-only）が提供されます。その他の更新には、エラーメッセージ内容の強化と、より信頼性の高いサービスを実現するための安定性向上が含まれます。 | Cloud"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 27
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

Zilliz Cloud サービスが Azure で利用可能になり、まずは East US リージョンから提供を開始しました。さらに、非構造化データを取り込みと検索のためのベクトル埋め込みに変換する Zilliz Cloud Pipelines（Beta）を導入します。このリリースでは、Cluster 内の RBAC と認証情報管理も改善され、ユーザー管理用に 3 つの事前定義ロール（admin、read-write、read-only）が提供されます。その他の更新には、エラーメッセージ内容の強化と、より信頼性の高いサービスを実現するための安定性向上が含まれます。

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Azure 上の Zilliz Cloud\{#zilliz-cloud-on-azure}

提供内容の大幅な拡張をお知らせできることを嬉しく思います。Zilliz Cloud サービスが Azure で利用可能になり、まずは East US リージョンから提供を開始しました。これは重要な節目であり、当社のプラットフォームが AWS、GCP、Azure の 3 大パブリッククラウドとシームレスに統合され、複数の環境にわたって一貫性のある統一されたユーザー体験を提供できるようになったことを意味します。Azure East US 以外のリージョンへのデプロイがビジネス要件として必要な場合は、追加サポートについて [お問い合わせください](https://support.zilliz.com/hc/en-us)。

## Pipelines\{#pipelines}

本日、Zilliz Cloud の新機能として Zilliz Cloud Pipelines（Beta）を導入できることを大変嬉しく思います。Pipelines は、非構造化データをシームレスにベクトル埋め込みに変換し、保存と検索のために Zilliz Cloud に取り込むことで、その可能性を引き出すよう設計されています。このソリューションは、埋め込み、取り込み、保存、検索といったプロセスを統合することでデータワークフローを簡素化し、最先端の [Retrieval Augmented Generation (RAG)](https://zilliz.com/use-cases/llm-retrieval-augmented-generation) のようなモダンな検索アプリケーションを構築する際に、複数のスタックを統合する負担に直面する開発者を大いに支援します。

Zilliz Cloud Pipelines は、Ingestion、Search、Deletion の 3 つの特定のパイプラインで構成されています。

- **Ingestion pipeline** は中核となる機能で、非構造化データを処理し、検索可能なベクトル埋め込みに変換して、保存と検索のために Zilliz Vector Database に取り込みます。

- **Search pipelines** は、クエリ文字列をベクトル埋め込みに変換し、それを Zilliz Cloud に送信して最も類似度の高い上位 K 個のベクトルを取得することで、セマンティック検索を実現します。

- **Deletion Pipeline** を使用すると、指定したドキュメント内のすべてのチャンクを Zilliz Cloud コレクションから削除できます。これにより、自身のデータを完全に制御できるようになり、Zilliz コレクションのストレージ容量を解放できます。

## Clusters における RBAC と認証情報管理\{#rbac-and-credential-management-in-your-clusters}

このリリースでは、各 Cluster 内で RBAC（Role-Based Access Control）と認証情報を管理するための機能強化を導入しました。この合理化されたアプローチにより、ユーザーは Cluster ユーザーを効率的に管理できます。これらの機能にアクセスするには、'Clusters' セクションに移動し、'your_cluster' を選択してから 'Users' タブに進みます。このリリースには、ユーザー管理を簡素化するための 3 つの事前定義ロール、'admin'、'read-write'、'read-only' が含まれており、それぞれ異なるアクセスレベルと制御ニーズに合わせて設計されています。これらの新機能の活用に関するより包括的な詳細とガイダンスについては、[Access Control Explained](./access-control-overview) を参照してください。

## 新しい Cluster 操作用 API エンドポイント\{#new-cluster-manipulation-api-endpoints}

このリリースでは、クラスターの作成、変更、削除を行うための一連の新しい RESTful API エンドポイントと、プロジェクトを一覧表示するための別の API エンドポイントも導入しました。詳細については、こちらの[リファレンスドキュメント](/reference/restful/cluster-operations)を参照してください。

## 機能強化\{#enhancements}

このリリースには、以下の機能強化も含まれます。

- 一連のエラーメッセージの内容を改善しました。

- 安定性の向上: 既知の問題に対処し、サービスの信頼性をさらに高めました。

