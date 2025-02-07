---
title: "リリースノート（2023年12月11日） | Cloud"
slug: /release-notes-240
sidebar_label: "リリースノート（2023年12月11日）"
beta: FALSE
notebook: FALSE
description: "現在、Zilliz CloudサービスはAzureで利用可能であり、米国東部地域から開始されています。さらに、Zilliz Cloud Pipelines(ベータ版)を導入し、非構造化データをベクトル埋め込みに変換して取り込み、取得します。このリリースでは、クラスター内のRBACおよび資格情報管理が改善され、ユーザー管理のための3つの事前定義された役割(管理者、読み書き、読み取り専用)が提供されます。その他の更新には、エラーメッセージのコンテンツの強化と安定性の向上が含まれ、より信頼性の高いサービスが提供されます。 | Cloud"
type: origin
token: MoxHw5tiDidpYvk9soqcFRp6nOc
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

現在、Zilliz CloudサービスはAzureで利用可能であり、米国東部地域から開始されています。さらに、Zilliz Cloud Pipelines(ベータ版)を導入し、非構造化データをベクトル埋め込みに変換して取り込み、取得します。このリリースでは、クラスター内のRBACおよび資格情報管理が改善され、ユーザー管理のための3つの事前定義された役割(管理者、読み書き、読み取り専用)が提供されます。その他の更新には、エラーメッセージのコンテンツの強化と安定性の向上が含まれ、より信頼性の高いサービスが提供されます。

## Milvusの互換性{#milvus}

このリリースは、**Milvus 2.2. x**および**Milvus 2.3.x(Beta)**と互換性があります。

## Zilliz Cloud onAzure Azureブログまとめ{#zilliz-cloud-onazure-azure}

私たちは、オファリングの大幅な拡大を発表できることを嬉しく思っています。Zilliz CloudサービスがAzureで利用可能になり、まずは米国東部地域から開始されます。これは、当社のプラットフォームがAWS、GCP、Azureの3つの主要なパブリッククラウドとシームレスに統合され、複数の環境で一貫した統一されたユーザーエクスペリエンスが確保されるという重要なマイルストーンを示しています。Azure East US以外の地域での展開が必要な場合は、さらなるサポートのためにお[問い合わせ](https://support.zilliz.com/hc/en-us)ください。

## パイプライン{#}

今日は、Zilliz Cloudの新しい追加機能であるZilliz Cloud Pipelines(Beta)を紹介できることを嬉しく思います。Pipelinesは、非構造化データをシームレスにベクトル埋め込みに変換し、Zilliz Cloudに取り込んでストレージと取得の可能性を引き出すように設計されています。このソリューションは、埋め込み、取り込み、ストレージ、取得などのプロセスを統合することにより、データワークフローを簡素化し、最新の検索アプリケーションを構築する際に複数のスタックを統合することに苦労する開発者にとって、歓迎すべき安心感を提供します。例えば、最先端の[Retrieval Augmented Generation(RAG)](https://zilliz.com/use-cases/llm-retrieval-augmented-generation)などです。

Zilliz Cloud Pipelinesには、Ingestion、Search、Deletionの3つの特定のパイプラインがあります。

- **インジェスチョンパイプライン**は、構造化されていないデータを処理し、検索可能なベクトル埋め込みに変換し、Zillizベクトルデータベースに取り込んで保存および取得するための作業馬です。

- **検索パイプライン**は、クエリ文字列をベクトル埋め込みに変換してZilliz Cloudに送信し、最も類似した上位K個のベクトルを取得することで、セマンティック検索を容易にします。

- **Deletion Pipeline**を使用すると、Zilliz Cloudコレクションから指定されたドキュメントのすべてのチャンクを削除できます。

詳細については、この[ドキュメント](null)を参照してください。

## クラスタ内のRBACと資格情報の管理{#rbac}

このリリースでは、各クラスター内のRBAC(ロールベースアクセス制御)と資格情報を管理するための強化機能を紹介しています。この簡素化されたアプローチにより、ユーザーはクラスターユーザーを効率的に管理できます。これらの機能にアクセスするには、「クラスター」セクションに移動し、「your_cluster」を選択して、「ユーザー」タブに進んでください。このリリースには、ユーザー管理を簡素化するための3つの事前定義された役割、「admin」、「read-write」、「read-only」が含まれており、それぞれ異なるアクセスレベルと制御ニーズに合わせて調整されています。これらの新しい機能を利用するためのより包括的な詳細とガイダンスについては、[ドキュメント](null)を参照してください。

## 新しいクラスタ操作APIエンドポイント{#api}

このリリースでは、クラスタを作成、変更、削除するための新しいRESTfulAPIエンドポイントのセットと、プロジェクトをリストするための別のAPIエンドポイントも導入されました。詳細については、こちらの[リファレンスドキュメント](/reference/restful/cluster-operations)を参照してください。

## エンハンスメント{#}

このリリースには、一連の機能強化も含まれています。

- 一連のエラーメッセージの内容を改善しました。

- 安定性の向上:既知の問題に対処して、サービスの信頼性をさらに向上させます。

