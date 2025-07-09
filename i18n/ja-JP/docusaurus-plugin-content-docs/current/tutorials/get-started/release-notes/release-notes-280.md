---
title: "リリースノート（2024年5月15日） | Cloud"
slug: /release-notes-280
sidebar_label: "リリースノート（2024年5月15日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのこのアップデートでは、BETAのServerlessプランが導入されました。これは、可変クエリボリュームを持つアプリケーション向けに設計されており、最小限の構成が必要で、滑らかなスケーラビリティを提供します。このプランは現在、GCP us-west 1(Oregon)で利用可能であり、BETA期間中に無料トライアルが含まれています。さらに、専用クラスターに対して新しいリージョンがサポートされています AzureのGermany West Central(Frankfurt)、GCPのヨーロッパ-west 3(Frankfurt)およびus-east-4(Virginia)。このリリースでは、モニタリングメトリック、検索精度制御、およびジョブのインポートにいくつかの強化が導入されています。 | Cloud"
type: origin
token: EL8jwqHsPikz2okhYzXcuLscnhf
sidebar_position: 11
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

Zilliz Cloudのこのアップデートでは、BETAのServerlessプランが導入されました。これは、可変クエリボリュームを持つアプリケーション向けに設計されており、最小限の構成が必要で、滑らかなスケーラビリティを提供します。このプランは現在、GCP us-west 1(Oregon)で利用可能であり、BETA期間中に無料トライアルが含まれています。さらに、専用クラスターに対して新しいリージョンがサポートされています: AzureのGermany West Central(Frankfurt)、GCPのヨーロッパ-west 3(Frankfurt)およびus-east-4(Virginia)。このリリースでは、モニタリングメトリック、検索精度制御、およびジョブのインポートにいくつかの強化が導入されています。

### Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.3. x**と互換性があります。

## サーバーレスベータ版{#serverless-beta}

サーバーレスプランは、可変または散発的なクエリボリュームを持つアプリケーションに合わせて調整されており、最小限の構成と最適化の負担と滑らかなスケーラビリティを提供します。ワークロードの要求に合わせて自動的にスケーリングされるサーバーレスクラスターを備えており、使いやすさと迅速なセットアップを保証します。

Serverlessは現在**BETA**で提供されており、**GCP us-west 1(Oregon)**で利用可能です。無料トライアルでは、支払い方法を追加することなく、最大1つのServerlessクラスターを作成できます。

詳細については、[Severlessプラン](./free-trials)を参照してください。

## 他の利用可能な地域{#more-available-regions}

新しいAzureリージョン:  

- ドイツ西中部（フランクフルト）

新しいGCPリージョン:

- euro-west 3（フランクフルト）

- us-east-4(バージニア)

利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。

## パイプライン{#pipelines}

- テキストパイプライン

    ドキュメント全体を取り込むだけでなく、製品説明やドキュメントチャンクなどのテキスト文字列を取り込んで検索することもサポートされるようになりました。これにより、RAGやセマンティック検索の開発においてより柔軟性が生まれます。詳細については、[テキストデータ](./pipelines-text-data)および[ドキュメントデータ](./pipelines-doc-data)を参照してください。

- イメージパイプライン

    画像検索のユースケースをアンロックするために、新しく追加された画像パイプラインはベクトル埋め込みを生成し、画像URLをクエリ入力として受け取ることができます。これにより、画像ごとに検索する必要があるアプリケーションの実装が可能になります。詳細については、[画像データ](./pipelines-image-data)を参照してください。

- 既存のコレクションでパイプラインを使用できるようになりました。REST APIでは、パイプラインのロジックが既存のコレクションのスキーマと一致している限り、既存のベクトルコレクションを宛先として作成することができます(たとえば、パイプラインが「public_date」というフィールドをPRESERVEと指定している場合、そのフィールドはコレクションスキーマにも存在する必要があります)。詳細については、[パイプライン参照](/reference/restful/pipeline-operations)ドキュメントを参照してください。

## エンハンスメント{#enhancements}

このリリースには、一連の強化も含まれています。

- クラスタを監視するための[メトリクス](./metrics-alerts-reference)を追加しました。

- 精度制御のための検索パラメータで、リコールと検索性能のトレードオフを5段階で提供します。詳細については、[levelパラメータについて](./autoindex-explained#about-the-inlinecodeplaceholder0-parameter)を参照してください。

- 1つのコレクションに対して最大10件の実行中または保留中のインポートジョブを許可します。

