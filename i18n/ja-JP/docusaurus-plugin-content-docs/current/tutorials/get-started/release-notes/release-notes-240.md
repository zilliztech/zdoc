---
title: "リリースノート（2023年12月11日） | Cloud"
slug: /release-notes-240
sidebar_label: "リリースノート（2023年12月11日）"
beta: FALSE
notebook: FALSE
description: "現在、Zilliz CloudサービスはAzureで利用可能であり、米国東部地域から開始されています。さらに、Zilliz Cloud Pipelines(ベータ版)を導入し、非構造化データをベクトル埋め込みに変換して取り込み、取得します。このリリースでは、クラスター内での改善されたRBACおよび資格情報管理も提供され、ユーザー管理のための3つの事前定義された役割(管理者、読み書き、読み取り専用)があります。その他の更新には、より信頼性の高いサービスのための強化されたエラーメッセージコンテンツと安定性の向上が含まれます。 | Cloud"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

現在、Zilliz CloudサービスはAzureで利用可能であり、米国東部地域から開始されています。さらに、Zilliz Cloud Pipelines(ベータ版)を導入し、非構造化データをベクトル埋め込みに変換して取り込み、取得します。このリリースでは、クラスター内での改善されたRBACおよび資格情報管理も提供され、ユーザー管理のための3つの事前定義された役割(管理者、読み書き、読み取り専用)があります。その他の更新には、より信頼性の高いサービスのための強化されたエラーメッセージコンテンツと安定性の向上が含まれます。

## Milvusの互換性{#milvus-compatibility}

このリリースは、Milvus 2.2. xおよびMilvus 2.3.x(Beta)と互換性があります。

## Zilliz Cloud on Azure Azureブログまとめ{#zilliz-cloud-on-azure}

私たちは、オファリングの大幅な拡大を発表できることを嬉しく思っています。Zilliz Cloudサービスは、東アメリカ地域からAzureで利用可能になりました。これは、当社のプラットフォームがAWS、GCP、Azureの3つの主要なパブリッククラウドとシームレスに統合され、複数の環境で一貫した統一されたユーザーエクスペリエンスが確保されるという重要なマイルストーンを示しています。Azure East US以外の地域での展開が必要な場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)でさらなるサポートを受けてください。

## パイプライン{#pipelines}

今日は、Zilliz Cloudの新しい追加機能であるZilliz Cloud Pipelines(Beta)を紹介できることを嬉しく思います。Pipelinesは、非構造化データをシームレスにベクトル埋め込みに変換し、Zilliz Cloudに取り込んでストレージと取得の可能性を引き出すように設計されています。このソリューションは、埋め込み、取り込み、ストレージ、取得などのプロセスを統合することにより、データワークフローを簡素化し、最新の[アクセス拡張生成(RAG)](https://zilliz.com/use-cases/llm-retrieval-augmented-generation)などの現代的な検索アプリケーションを構築する際に複数のスタックを統合することに苦労する開発者にとって、歓迎すべき安心感を提供します。

Zilliz Cloud Pipelinesには、Ingestion、Search、Deletionの3つの特定のパイプラインがあります。

- 「インジェスチョンパイプライン」は、構造化されていないデータを処理し、検索可能なベクトル埋め込みに変換し、Zillizベクトルデータベースに取り込んで保存および取得するための作業馬です。

- 検索パイプラインは、クエリ文字列をベクトル埋め込みに変換し、Zilliz Cloudに送信して、最も類似した上位K個のベクトルを取得することにより、意味検索を容易にします。

- **Deletion Pipeline**を使用すると、Zilliz Cloudコレクションから指定されたドキュメント内のすべてのチャンクを削除し、自分のデータを完全に制御し、Zillizコレクションのストレージ容量を解放できます。

詳細については、この[ドキュメント](./pipelines)を参照してください。

## クラスタ内のRBACと資格情報の管理{#rbac-and-credential-management-in-your-clusters}

このリリースでは、各クラスター内のRBAC(ロールベースアクセス制御)と資格情報を管理するための強化機能を紹介しています。この簡素化されたアプローチにより、ユーザーはクラスターユーザーを効率的に管理できます。これらの機能にアクセスするには、「クラスター」セクションに移動し、「your_cluster」を選択して、「ユーザー」タブに進んでください。このリリースには、簡素化されたユーザー管理のための3つの事前定義された役割、「admin」、「read-write」、「read-only」が含まれており、それぞれ異なるアクセスレベルと制御ニーズに合わせて調整されています。これらの新しい機能を利用するためのより包括的な詳細とガイダンスについては、[ドキュメント](./access-control)を参照してください。

## 新しいクラスタ操作APIエンドポイント{#new-cluster-manipulation-api-endpoints}

このリリースでは、クラスタを作成、変更、削除するための新しいRESTful APIエンドポイントのセットと、プロジェクトをリストするための別のAPIエンドポイントが導入されました。詳細については、こちらの[参考ドキュメント](/reference/restful/cluster-operations)を参照してください。

## エンハンスメント{#enhancements}

このリリースには、一連の強化も含まれています。

- 一連のエラーメッセージの内容を改善しました。

- 安定性の向上:既知の問題に対処して、サービスの信頼性をさらに向上させます。

