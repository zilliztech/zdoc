---
title: "リリースノート（2024年5月15日） | Cloud"
slug: /release-notes-280
sidebar_label: "リリースノート（2024年5月15日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのこのアップデートでは、BETAのServerlessプランが導入されました。これは、可変クエリボリュームを持つアプリケーション向けに設計されており、最小限の構成が必要で、滑らかなスケーラビリティを提供します。このプランは現在、GCP us-west 1(Oregon)で利用可能であり、BETA期間中に無料トライアルが含まれています。さらに、専用クラスターに対して新しいリージョンがサポートされています AzureのGermany West Central(Frankfurt)、GCPのヨーロッパ-west 3(Frankfurt)およびus-east-4(Virginia)。このリリースでは、モニタリングメトリクス、検索精度制御、およびジョブのインポートにいくつかの強化が導入されています。 | Cloud"
type: origin
token: C8ZGwL46hiuqTmkbdRZcggY2nXg
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年5月15日）

Zilliz Cloudのこのアップデートでは、BETAのServerlessプランが導入されました。これは、可変クエリボリュームを持つアプリケーション向けに設計されており、最小限の構成が必要で、滑らかなスケーラビリティを提供します。このプランは現在、**GCP us-west 1(Oregon)**で利用可能であり、BETA期間中に無料トライアルが含まれています。さらに、専用クラスターに対して新しいリージョンがサポートされています: Azureの**Germany West Central(Frankfurt)**、GCPの**ヨーロッパ-west 3(Frankfurt)**および**us-east-4(Virginia)**。このリリースでは、モニタリングメトリクス、検索精度制御、およびジョブのインポートにいくつかの強化が導入されています。

### Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.3. x**と互換性があります。

## サーバーレスベータ版{#serverless-beta}

サーバーレスプランは、可変または散発的なクエリボリュームを持つアプリケーションに合わせて調整されており、最小限の構成と最適化の負担と滑らかなスケーラビリティを提供します。ワークロードの要求に合わせて自動的にスケーリングされるサーバーレスクラスターを備えており、使いやすさと迅速なセットアップを保証します。

Serverlessは現在**BETA**で提供されており、**GCP us-west 1(Oregon)**で利用可能です。無料トライアルでは、支払い方法を追加することなく、最大1つのServerlessクラスタを作成できます。

詳細については、[Severlessプラン](./free-trials)を参照してください。

## 他の利用可能な地域{#more-available-regions}

新しいAzureリージョン: 

- ドイツ西中部（フランクフルト）

新しいGCPリージョン:

- ヨーロッパ西3（フランクフルト）

- us-east-4(バージニア)

利用可能なすべてのクラウドリージョンについては、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

## パイプライン{#pipelines}

- テキストパイプライン

    ドキュメント全体を取り込むだけでなく、商品説明やドキュメントチャンクなどのテキスト文字列を取り込んで検索できるようになりました。これにより、RAGやセマンティック検索をより柔軟に開発できます。詳細については、[テキストデータ](./pipelines-text-data)と[ドキュメントデータ](./pipelines-doc-data)を参照してください。

- イメージパイプライン

    新しく追加された画像パイプラインは、ベクトル埋め込みを生成し、画像URLをクエリ入力として受け取ることで、画像検索のユースケースをロック解除することができます。これにより、画像ごとに検索する必要があるアプリケーションを実装することができます。詳細については、[画像データ](./pipelines-image-data)を参照してください。

- パイプラインは既存のコレクションと一緒に使用できるようになりました。REST APIでは、パイプラインのロジックが既存のコレクションのスキーマと一致する限り、パイプラインの作成要求で既存のベクトルコレクションを宛先として指定できます(たとえば、パイプラインが「published_date」というフィールドをPRESERVEと指定する場合、そのフィールドはコレクションスキーマにも存在する必要があります)。詳細については、[パイプラインリファレンス](/reference/restful/pipeline-operations)ドキュメントを参照してください。

## エンハンスメント{#enhancements}

このリリースには、一連の機能強化も含まれています。

- クラスターを監視するためのより多くの[指標](./metrics-alerts-reference)。

- 精度制御のための検索パラメータで、リコールと検索パフォーマンスのトレードオフに5つのレベルを提供します。詳細については、[レベルパラメータについて](./autoindex-explained#about-the-level-parameter)読んでください。

- 1つのコレクションに対して最大10件の実行中または保留中のインポートジョブを許可します。

