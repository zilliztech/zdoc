---
title: "リリースノート (2024年5月15日) | Cloud"
slug: /release-notes-280
sidebar_label: "リリースノート (2024年5月15日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このZilliz Cloudへのアップデートでは、BETA版のServerlessプランを導入します。可変的なクエリボリュームを持つアプリケーション向けに設計され、最小限の構成を必要とし、シームレスなスケーラビリティを提供します。このプランはGCP us-west1（オレゴン）で利用可能になり、BETA期間中は無料トライアルが含まれます。さらに、専用クラスター向けに新しいリージョンがサポートされます：AzureのGermany West Central（フランクフルト）、およびGCPのeurope-west3（フランクフルト）とus-east-4（バージニア）。このリリースでは、監視メトリクス、検索精度制御、インポートジョブの強化もいくつか導入されます。 | Cloud"
type: origin
token: EL8jwqHsPikz2okhYzXcuLscnhf
sidebar_position: 15
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年5月15日)

このZilliz Cloudへのアップデートでは、BETA版のServerlessプランを導入します。可変的なクエリボリュームを持つアプリケーション向けに設計され、最小限の構成を必要とし、シームレスなスケーラビリティを提供します。このプランは**GCP us-west1（オレゴン）**で利用可能になり、BETA期間中は無料トライアルが含まれます。さらに、専用クラスター向けに新しいリージョンがサポートされます：Azureの**Germany West Central（フランクフルト）**、およびGCPの**europe-west3（フランクフルト）**と**us-east-4（バージニア）**。このリリースでは、監視メトリクス、検索精度制御、インポートジョブの強化もいくつか導入されます。

### Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.3.x**と互換性があります。

## Serverless Beta\{#serverless-beta}

Serverlessプランは、可変または断続的なクエリボリュームを持つアプリケーション向けに設計され、最小限の構成および最適化の負担を提供し、シームレスなスケーラビリティを実現します。ワークロードの要求に合わせて自動スケーリングするServerlessクラスターを備えており、使いやすさと迅速なセットアップを保証します。

Serverlessは現在**BETA**として提供され、**GCP us-west1（オレゴン）**で利用可能です。無料トライアルにより、支払い方法を追加することなく最大1つのServerlessクラスターを作成できます。

詳細については、[Serverlessプラン](./free-trials)を参照してください。

## 利用可能なリージョンの追加\{#more-available-regions}

新しいAzureリージョン：

- Germany West Central（フランクフルト）

新しいGCPリージョン：

- europe-west3（フランクフルト）

- us-east-4（バージニア）

利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダーおよびリージョン](./cloud-providers-and-regions)を参照してください。

## パイプライン\{#pipelines}

- テキストパイプライン

    ドキュメント全体をインジェストするだけでなく、検索用の商品説明やドキュメントチャンクなどのテキスト文字列のインジェストもサポートするようになりました。これにより、RAGやセマンティック検索の開発における柔軟性が高まります。

- 画像パイプライン

    画像検索ユースケースを解き放つために、新しく追加された画像パイプラインはベクトル埋め込みを生成し、画像URLをクエリ入力として受け取ることができます。これにより、画像で画像を検索する必要があるアプリケーションの実装が可能になります。

- パイプラインを既存のコレクションで使用できるようになりました。REST APIでは、作成パイプラインリクエストで、パイプラインのロジックが既存のコレクションのスキーマと一致していれば、既存のベクトルコレクションを宛先として指定できます（例：パイプラインが「publish_date」というフィールドをPRESERVEとして指定する場合、そのフィールドもコレクションスキーマに存在する必要があります）。

## 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれます：

- クラスター監視のためのより多くの[メトリクス](./metrics-alerts-reference)。

- 精度制御のための検索パラメータで、リコールと検索パフォーマンスのトレードオフのための5つのレベルを提供します。詳細については、[levelパラメータについて](./autoindex-explained#about-the-level-parameter)を読んでください。

- 単一コレクションに対して最大10個の実行中または保留中のインポートジョブを許可します。