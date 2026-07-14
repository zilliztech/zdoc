---
title: "リリースノート（2024年5月15日） | Cloud"
slug: /release-notes-280
sidebar_label: "2024年5月15日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この Zilliz Cloud のアップデートでは、BETA 版の Serverless プランが導入されました。これは、クエリ量が変動するアプリケーション向けに設計されており、最小限の設定でシームレスなスケーラビリティを提供します。このプランは現在 GCP us-west1 (Oregon) で利用可能で、BETA 期間中は無料トライアルが含まれます。さらに、Dedicated cluster 向けの新しいリージョンとして、Azure では Germany West Central (Frankfurt)、GCP では europe-west3 (Frankfurt) および us-east-4 (Virginia) がサポートされます。このリリースでは、監視メトリクス、検索精度制御、インポートジョブに関するいくつかの機能強化も導入されています。 | Cloud"
type: origin
token: EL8jwqHsPikz2okhYzXcuLscnhf
sidebar_position: 23
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年5月15日）

この Zilliz Cloud のアップデートでは、BETA 版の Serverless プランが導入されました。これは、クエリ量が変動するアプリケーション向けに設計されており、最小限の設定でシームレスなスケーラビリティを提供します。このプランは現在 **GCP us-west1 (Oregon)** で利用可能で、BETA 期間中は無料トライアルが含まれます。さらに、Dedicated cluster 向けの新しいリージョンとして、Azure では **Germany West Central (Frankfurt)**、GCP では **europe-west3 (Frankfurt)** および **us-east-4 (Virginia)** がサポートされます。このリリースでは、監視メトリクス、検索精度制御、インポートジョブに関するいくつかの機能強化も導入されています。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

## Serverless Beta\{#serverless-beta}

Serverless プランは、クエリ量が変動または断続的なアプリケーション向けに設計されており、設定や最適化の負担を最小限に抑えつつ、シームレスなスケーラビリティを提供します。ワークロードの需要に応じて自動的にスケールする serverless cluster を備えており、使いやすさと迅速なセットアップを実現します。

Serverless は現在 **BETA** として提供されており、**GCP us-west1 (Oregon)** で利用可能です。無料トライアルでは、支払い方法を追加しなくても最大 1 つの Serverless cluster を作成できます。

詳細については、[Severless Plan](./free-trials) を参照してください。

## 利用可能なリージョンの追加\{#more-available-regions}

新しい Azure リージョン:  

- Germany West Central (Frankfurt)

新しい GCP リージョン：

- europe-west3 (Frankfurt)

- us-east-4 (Virginia)

利用可能なすべてのクラウドリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

## Pipelines\{#pipelines}

- テキストパイプライン

    ドキュメント全体を取り込むことに加えて、製品説明やドキュメントチャンクなどのテキスト文字列を検索用に取り込むこともサポートされるようになりました。これにより、RAG やセマンティック検索を開発する際の柔軟性が高まります。 

- 画像パイプライン

    画像検索のユースケースを実現するために、新たに追加された画像パイプラインでは vector 埋め込みを生成し、画像 URL をクエリ入力として受け取ることができます。これにより、画像で画像を検索する必要があるアプリケーションを実装できます。

- 既存の collection でも pipelines を使用できるようになりました。REST API では、create pipeline リクエストで既存の vector collection を宛先として指定できます。これは、pipeline のロジックが既存の collection のスキーマと一致している場合に限られます（たとえば、pipelines が "publish_date" というフィールドに対して PRESERVE を指定する場合、そのフィールドは collection スキーマ内にも存在している必要があります。

## 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれています。

- cluster を監視するための [metrics](./metrics-alerts-reference) を追加。

- 検索精度制御のための検索パラメータを追加し、recall と検索パフォーマンスのトレードオフに対して 5 つのレベルを提供します。詳細は、[level パラメータについて](./autoindex-explained#about-the-level-parameter) を参照してください。

- 単一の collection に対して、実行中または保留中のインポートジョブを最大 10 件まで許可。

