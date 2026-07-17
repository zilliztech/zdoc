---
title: "リリースノート（2023年6月11日） | Cloud"
slug: /release-notes-200
sidebar_label: "2023年6月11日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のリリースは、ベクトルデータベース管理に新たな基準を打ち立てます。初心者向けのユーザー体験を大幅に向上させ、より手頃で柔軟な料金オプションを提供し、シームレスなチームコラボレーションを可能にし、柔軟なスキーマ管理を実現します。このアップデートの主な機能には、サーバーレスクラスター、多様なプラン階層、組織とコラボレーションのサポート、RBAC のサポート、パーティションキー、動的スキーマ、JSON 型のサポートが含まれます。この画期的なアップデートをぜひ今すぐお試しください。 | Cloud"
type: origin
token: BcXMwUYQ3iD7mEkWKFhcU5PUnB5
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年6月11日）

Zilliz Cloud のリリースは、ベクトルデータベース管理に新たな基準を打ち立てます。初心者向けのユーザー体験を大幅に向上させ、より手頃で柔軟な料金オプションを提供し、シームレスなチームコラボレーションを可能にし、柔軟なスキーマ管理を実現します。このアップデートの主な機能には、サーバーレスクラスター、多様なプラン階層、組織とコラボレーションのサポート、RBAC のサポート、パーティションキー、動的スキーマ、JSON 型のサポートが含まれます。この画期的なアップデートをぜひ今すぐお試しください。

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.1.x** と互換性があります。

## Zilliz Cloud Serverless Vector Database Service Launch\{#zilliz-cloud-serverless-vector-database-service-launch}

Zilliz Cloud の Serverless Vector Database Service の提供開始を発表できることを大変うれしく思います。この新しいサービスは、当社の専用クラスターソリューションと比べて、さらに手間のかからないベクトルデータ検索体験を提供します。

初期段階のベンチャーを支援するため、Serverless Service の一部として 2 つの無料コレクションを提供しています。各コレクションは、768 次元スケールで 500,000 ベクトルを処理する能力を備えており、大規模なインフラを必要とせずに十分なデータ処理能力を提供します。この革新的な新機能を試して、今すぐデータ処理能力を向上させましょう。[無料トライアル](./free-trials)。

## Zilliz Cloud's Plan Tiers: Starter, Standard, Enterprise, and Self-hosted\{#zilliz-clouds-plan-tiers-starter-standard-enterprise-and-self-hosted}

Starter、Standard、Enterprise、Self-hosted の各種プラン階層を提供できることをうれしく思います。各階層は、コスト、サービス、セキュリティのバランスを考慮して設計されており、すべてのユーザーがニーズに合ったプランを選べるようになっています。Zilliz Cloud では、ビジネスの成長に合わせてベクトルデータベース管理を柔軟にスケールおよび進化させることができます。

- Starter Plan: Serverless インスタンスでフルマネージドなベクトルデータベースを体験するための最もシンプルな方法です。必要な設定は最小限で、GCP で利用できます。

- Standard Plan: 5 人未満のエンジニアで構成されるチームや複雑なワークロード向けに設計されています。高度なデータベース機能と設定を備えた専用クラスターを提供し、優れたコスト効率も実現します。AWS と GCP の両方で利用できます。

- Enterprise Plan: 高度なセキュリティとサポートを必要とする大規模組織向けに設計されています。フル機能、高可用性、高度な設定を備えた専用クラスターを提供し、AWS と GCP の両方で堅牢なデータベースソリューションを実現します。

- Self-hosted Plan: プライバシーと規制遵守を重視する企業に最適です。お客様の Virtual Private Cloud (VPC) 内で自己管理型のベクトルデータベースサービスを提供し、完全な制御を可能にします。プライバシーと規制遵守を優先する環境に適しています。

[料金ページで詳細をご覧ください。](https://zilliz.com/pricing)

## Organization, Collaboration, and RBAC\{#organization-collaboration-and-rbac}

Zilliz Cloud が高度な組織およびメンバー管理機能を提供するようになったことを発表できることを大変うれしく思います。これにより、複数のユーザーが Cluster、Project、Organization などのさまざまなレベルでシームレスに共同作業できるようになります。

この大きなアップデートは、Role-Based Access Control (RBAC) の統合によって支えられており、特定のリソースに誰がアクセスできるかをきめ細かく制御できます。これにより、セキュリティと柔軟性の両方が確保され、チームは高いレベルのデータ保護を維持しながら、より効率的に共同作業を進められます。

この強化により、プロジェクトアクセスの制御性が向上するだけでなく、コラボレーションのプロセスも効率化され、チームはより安全で整理された環境でベクトルデータベースを管理しやすくなります。ぜひこの機能を試して、Zilliz Cloud による新しいレベルのコラボレーション効率を体験してください。詳細については、[アクセス制御の説明](./access-control-overview) を参照してください。

## Partition Key\{#partition-key}

Zilliz Cloud 2.0.0 では Partition Key 機能が導入されました。この機能により、コレクションを作成する際に特定のフィールドをパーティションキーとして指定できます。その後、エンティティはそのパーティションキーの値に基づいてパーティションに保存されます。

この機能は、クエリのフィルタリング時に特に有用です。パーティションキーフィールドに対する条件は、従来のスキャンベースのフィルタリング方法よりも大幅に高速に実行できます。要するに、同じパーティションキーを持つエンティティは物理的にまとめてグループ化されるため、不要なスキャンを回避できます。

## Dynamic Schema\{#dynamic-schema}

Zilliz Cloud がバージョン 2.0.0 から Dynamic Schema をサポートするようになったことを発表できることを大変うれしく思います。この大きな強化により、多様なビジネス要件に対応する柔軟性が大幅に向上します。ユーザーは、事前に定義された静的スキーマに制限されることなく、動的に異なるフィールドを持つエンティティをコレクションに挿入できるようになりました。

上級ユーザー向けに、Dynamic Schema と Static Schema を組み合わせたハイブリッドなコレクション作成アプローチを導入しました。これにより、ユーザーはスキーマ設計において「必須」フィールドを指定し、高度なインデックス最適化を有効化できます。一方で、「任意」フィールドは動的スキーマの仕組みによってサポートされます。この新しいアプローチにより、スキーマの柔軟性を維持しながらクエリ性能が向上します。

Zilliz Cloud 2.0.0 でこの機能を活用し、データベーススキーマの適応性が大きく向上することをぜひ体感してください。

詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。

## JSON Type Support\{#json-type-support}

最新のアップデートにおける Zilliz Cloud の大きな強化として、JSON データ管理と Approximate Nearest Neighbor (ANN) Search 機能の統合を発表できることを大変うれしく思います。

JSON（JavaScript Object Notation）は、今日のデータベース管理の世界で不可欠となっている重要なデータ交換形式です。Zilliz Cloud に JSON サポートが導入されたことで、JSON データを簡単に保存および管理できるようになり、データ操作やクエリに無限の可能性が広がります。

真の力は、これが既存の ANN Search 機能と革新的に組み合わされている点にあります。この組み合わせにより、JSON データ構造の柔軟性と ANN 検索の精度を組み合わせた複雑なクエリを実行できるようになり、データベースのクエリ機能が大きく前進します。

これら 2 つの強力な技術が 1 つの場所に統合されることで生まれる相乗効果を体験し、データ管理およびクエリ作業における効率と精度の新たなレベルを引き出してください。今すぐ Zilliz Cloud とともにデータベース技術の未来へ踏み出しましょう。[この機能の詳細はこちら](./json-field-overview)。
