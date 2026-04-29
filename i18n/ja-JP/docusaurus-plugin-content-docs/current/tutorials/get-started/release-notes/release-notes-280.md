---
title: "リリースノート（2024 年 5 月 15 日） | Cloud"
slug: /release-notes-280
sidebar_key: release-notes-280
sidebar_label: "2024 年 5 月 15 日"
beta: FALSE
notebook: FALSE
description: "この Zilliz Cloud のアップデートでは、ベータ版として Serverless プランを導入しました。このプランは変動するクエリ量に対応するアプリケーション向けに設計されており、最小限の設定でシームレスなスケーラビリティを提供します。現在、GCP の us-west1（オレゴン）リージョンで利用可能であり、ベータ期間中は無料トライアルを提供しています。さらに、専用クラスター向けに新しいリージョンのサポートを追加しました。Azure では Germany West Central（フランクフルト）、GCP では europe-west3（フランクフルト）および us-east-4（バージニア）が対象です。本リリースでは、監視メトリクス、検索精度制御、インポートジョブに関する複数の機能強化も実施されています。 | Cloud"
type: origin
token: EL8jwqHsPikz2okhYzXcuLscnhf
sidebar_position: 20
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年5月15日）

今回の Zilliz Cloud のアップデートでは、**BETA版**として **Serverless プラン**を導入しました。このプランは、クエリ量が変動するアプリケーション向けに設計されており、最小限の設定でシームレスなスケーラビリティを提供します。このプランは現在 **GCP us-west1 (Oregon)** で利用可能であり、BETA期間中は無料トライアルもご利用いただけます。また、専用クラスターでは新たなリージョンがサポートされました：Azure では **Germany West Central (Frankfurt)**、GCP では **europe-west3 (Frankfurt)** および **us-east-4 (Virginia)** です。さらに、このリリースではモニタリングメトリクス、検索精度制御、インポートジョブに関するいくつかの機能強化も含まれています。

### Milvus 互換性\{#milvus-compatibility}

本リリースは **Milvus 2.3.x** と互換性があります。

## Serverless BETA\{#serverless-beta}

Serverless プランは、クエリ量が変動的または断続的なアプリケーション向けに最適化されており、設定やチューニングの手間を最小限に抑えつつ、シームレスなスケーラビリティを実現します。このプランでは、ワークロードの需要に応じて自動的にスケールするサーバーレスクラスターを利用でき、使いやすさと迅速なセットアップを保証します。

Serverless プランは現在 **BETA** として提供されており、**GCP us-west1 (Oregon)** で利用可能です。無料トライアルにより、支払い方法を登録せずに最大1つの Serverless クラスターを作成できます。

詳細については、[Serverless プラン](./free-trials) を参照してください。

## 利用可能なリージョンの拡大\{#more-available-regions}

新しい Azure リージョン：

- Germany West Central (Frankfurt)

新しい GCP リージョン：

- europe-west3 (Frankfurt)

- us-east-4 (Virginia)

利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

## パイプライン\{#pipelines}

- テキストパイプライン

    ドキュメント全体をそのまま取り込むことに加え、商品説明やドキュメントのチャンクなどのテキスト文字列を検索のために取り込むことが可能になりました。これにより、RAG やセマンティック検索の開発における柔軟性が向上します。

- 画像パイプライン

    画像検索のユースケースを実現するために、新たに追加された画像パイプラインでは、ベクトル埋め込みを生成し、画像の URL をクエリ入力として受け取ることができます。これにより、画像による画像検索が必要なアプリケーションを実装できるようになります。

- パイプラインを既存のコレクションと併用できるようになりました。REST API では、パイプライン作成リクエスト時に既存のベクトルコレクションを宛先として指定できます。ただし、パイプラインのロジックが既存コレクションのスキーマと一致している必要があります（例：パイプラインで "publish_date" というフィールドを PRESERVE と指定する場合、そのフィールドがコレクションのスキーマにも存在している必要があります）。

## 機能強化\{#enhancements}

今回のリリースには以下の機能強化も含まれています：

- クラスターの監視に役立つ追加の [メトリクス](./metrics-alerts-reference)。
- 検索精度を制御するための検索パラメータ。リコールと検索パフォーマンスのトレードオフを調整するための5段階のレベルを提供します。詳細については、[level パラメータについて](./autoindex-explained#about-the-level-parameter) を参照してください。
- 単一のコレクションに対して、最大10個の実行中または保留中のインポートジョブを許可。

