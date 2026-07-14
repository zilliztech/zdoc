---
title: "リリースノート（2023年12月11日） | Cloud"
slug: /release-notes-240
sidebar_label: "2023年12月11日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud サービスが Azure で利用可能になり、まずは East US リージョンから提供を開始しました。さらに、非構造化データを取り込みと検索のためのベクトル埋め込みに変換する Zilliz Cloud Pipelines（Beta）を導入しました。このリリースでは、Cluster 内の RBAC と認証情報管理も改善され、ユーザー管理のために 3 つの事前定義ロール（admin、read-write、read-only）が追加されています。そのほか、エラーメッセージ内容の改善や、より信頼性の高いサービスのための安定性向上も含まれています。 | Cloud"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

Zilliz Cloud サービスが Azure で利用可能になり、まずは East US リージョンから提供を開始しました。さらに、非構造化データを取り込みと検索のためのベクトル埋め込みに変換する Zilliz Cloud Pipelines（Beta）を導入しました。このリリースでは、Cluster 内の RBAC と認証情報管理も改善され、ユーザー管理のために 3 つの事前定義ロール（admin、read-write、read-only）が追加されています。そのほか、エラーメッセージ内容の改善や、より信頼性の高いサービスのための安定性向上も含まれています。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Azure 上の Zilliz Cloud\{#zilliz-cloud-on-azure}

提供内容の大幅な拡張を発表できることを嬉しく思います。Zilliz Cloud サービスが Azure でも利用可能になり、まずは East US リージョンから提供を開始しました。これにより、当社のプラットフォームは AWS、GCP、Azure の 3 大パブリッククラウドとシームレスに統合され、複数の環境にわたって一貫性のある統一されたユーザー体験を提供できるようになりました。Azure East US 以外のリージョンでのデプロイがビジネス要件上必要な場合は、追加サポートについて [お問い合わせください](https://support.zilliz.com/hc/en-us)。

## Pipelines\{#pipelines}

本日、Zilliz Cloud の新機能として Zilliz Cloud Pipelines（Beta）を発表できることを大変嬉しく思います。Pipelines は、非構造化データをシームレスにベクトル埋め込みに変換し、保存と検索のために Zilliz Cloud に取り込むことで、その可能性を引き出すよう設計されています。このソリューションは、埋め込み、取り込み、保存、検索といった処理を統合することでデータワークフローを簡素化し、最先端の [Retrieval Augmented Generation (RAG)](https://zilliz.com/use-cases/llm-retrieval-augmented-generation) のようなモダンな検索アプリケーションを構築する際に、複数のスタックの統合に苦労しがちな開発者にとって大きな助けとなります。

Zilliz Cloud Pipelines は、Ingestion、Search、Deletion の 3 種類のパイプラインで構成されています。

- **Ingestion pipeline** は中核となる機能であり、非構造化データを処理して検索可能なベクトル埋め込みに変換し、保存と検索のために Zilliz Vector Database に取り込みます。

- **Search pipelines** は、クエリ文字列をベクトル埋め込みに変換し、それを Zilliz Cloud に送信して、最も類似した上位 K 個のベクトルを取得することでセマンティック検索を実現します。

- **Deletion Pipeline** では、指定したドキュメント内のすべてのチャンクを Zilliz Cloud コレクションから削除できるため、自身のデータを完全に管理でき、Zilliz コレクションのストレージ容量を解放できます。

## Cluster における RBAC と認証情報管理\{#rbac-and-credential-management-in-your-clusters}

このリリースでは、各 Cluster 内で RBAC（Role-Based Access Control）と認証情報を管理するための機能強化を導入しました。この合理化されたアプローチにより、ユーザーは Cluster ユーザーを効率的に管理できます。これらの機能にアクセスするには、'Clusters' セクションに移動し、'your_cluster' を選択してから、'Users' タブに進んでください。このリリースには、ユーザー管理を簡素化するための 3 つの事前定義ロール 'admin'、'read-write'、'read-only' が含まれており、それぞれ異なるアクセスレベルと制御ニーズに対応しています。これらの新機能の詳細や活用方法については、[Access Control Explained](./access-control-overview) を参照してください。

## 新しい Cluster 操作 API エンドポイント\{#new-cluster-manipulation-api-endpoints}

このリリースでは、cluster の作成、変更、削除を行うための新しい RESTful API エンドポイント群と、project を一覧表示するための別の API エンドポイントも導入しました。詳細については、こちらの[リファレンスドキュメント](/reference/restful/cluster-operations)を参照してください。

## 改善点\{#enhancements}

このリリースには、以下の改善も含まれています。

- 一連のエラーメッセージの内容を改善しました。

- 安定性の向上: 既知の問題に対処し、サービスの信頼性をさらに高めました。

