---
title: "リリースノート（2023年6月11日） | Cloud"
slug: /release-notes-200
sidebar_label: "2023年6月11日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のリリースは、vector データベース管理に新たな基準を打ち立てます。初心者向けのユーザー体験を大幅に向上させ、より手頃で柔軟な料金オプションを提供し、シームレスなチームコラボレーションを実現し、柔軟な schema 管理を提供します。このアップデートの主な機能には、serverless cluster、多様な tier プラン、organization と collaboration のサポート、RBAC サポート、partition key、dynamic schema、JSON type サポートが含まれます。この画期的なアップデートをぜひ今すぐお試しください。 | Cloud"
type: origin
token: BcXMwUYQ3iD7mEkWKFhcU5PUnB5
sidebar_position: 32
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年6月11日）

Zilliz Cloud のリリースは、vector データベース管理に新たな基準を打ち立てます。初心者向けのユーザー体験を大幅に向上させ、より手頃で柔軟な料金オプションを提供し、シームレスなチームコラボレーションを実現し、柔軟な schema 管理を提供します。このアップデートの主な機能には、serverless cluster、多様な tier プラン、organization と collaboration のサポート、RBAC サポート、partition key、dynamic schema、JSON type サポートが含まれます。この画期的なアップデートをぜひ今すぐお試しください。

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.1.x** と互換性があります。

## Zilliz Cloud Serverless Vector Database Service Launch\{#zilliz-cloud-serverless-vector-database-service-launch}

Zilliz Cloud の Serverless Vector Database Service の提供開始を発表できることを嬉しく思います。この新しいサービスは、当社の dedicated cluster ソリューションと比べて、さらに手軽な vector データ検索体験を提供します。

初期段階のベンチャーを支援するため、Serverless Service の一部として 2 つの無料 collection を提供しています。各 collection は、768 次元スケールで 500,000 vectors を処理できる容量を備えており、大規模なインフラを必要とせずに十分なデータ処理能力を提供します。この革新的な新機能を試して、今すぐデータ処理能力を高めましょう。[無料トライアル](./free-trials)。

## Zilliz Cloud のプラン階層: Starter、Standard、Enterprise、Self-hosted\{#zilliz-clouds-plan-tiers-starter-standard-enterprise-and-self-hosted}

Starter、Standard、Enterprise、Self-hosted という幅広いプラン階層を提供できることを嬉しく思います。各階層は、コスト、サービス、セキュリティの考慮事項のバランスを取るように設計されており、すべてのユーザーがニーズに合ったプランを利用できます。Zilliz Cloud では、ビジネスの成長に合わせて vector データベース管理を柔軟に拡張し、進化させることができます。

- Starter Plan: Serverless インスタンスでフルマネージドの vector データベースを体験する最もシンプルな方法です。必要な設定は最小限で、GCP で利用できます。

- Standard Plan: 5 人未満のエンジニアによるチームと複雑なワークロード向けに設計されています。高度なデータベース機能と設定を備えた dedicated cluster を提供し、優れたコスト効率も実現します。AWS と GCP の両方で利用できます。

- Enterprise Plan: 高度なセキュリティとサポートを必要とする大規模組織向けに設計されています。フル機能、高可用性、高度な設定を備えた dedicated cluster を提供し、AWS と GCP の両方で堅牢なデータベースソリューションを実現します。

- Self-hosted Plan: プライバシーと規制遵守を重視する企業に最適です。Virtual Private Cloud (VPC) 内で自己管理型の vector データベースサービスを提供し、完全な制御を可能にします。プライバシーと規制遵守を優先する環境に適しています。

[料金ページで詳細を見る。](https://zilliz.com/pricing)

## Organization、Collaboration、および RBAC\{#organization-collaboration-and-rbac}

Zilliz Cloud が、洗練された organization とメンバー管理機能を提供するようになったことを発表できることを嬉しく思います。これにより、複数のユーザーが Cluster、Project、Organization などのさまざまなレベルでシームレスにコラボレーションできるようになります。

この大きなアップデートは、Role-Based Access Control (RBAC) の統合によって支えられており、特定のリソースに誰がアクセスできるかをきめ細かく制御できます。これにより、セキュリティと柔軟性の両方が確保され、チームは高いレベルのデータ保護を維持しながら、より効率的に共同作業を行えます。

この機能強化は、project アクセスに対するより大きな制御を提供するだけでなく、コラボレーションのプロセスも効率化し、チームがより安全で整理された環境で vector データベースを管理しやすくします。今すぐこの機能を活用して、Zilliz Cloud による新たなレベルのコラボレーション効率を体験してください。詳細については、[Access Control Explained](./access-control-overview) を参照してください。

## Partition Key\{#partition-key}

Zilliz Cloud 2.0.0 では Partition Key 機能が導入されました。この機能により、collection 作成時に特定の field を partition key として指定できます。その後、entity は partition key の値に基づいて partition に格納されます。

この機能は、クエリフィルタリング時に特に有用です。partition key field に対する条件は、従来のスキャンベースのフィルタリング方法よりも大幅に高速に実行できます。基本的に、同じ partition key を持つ entity は物理的にまとめて配置されるため、不要なスキャンを回避できます。

## Dynamic Schema\{#dynamic-schema}

Zilliz Cloud がバージョン 2.0.0 から Dynamic Schema をサポートするようになったことを発表できることを嬉しく思います。この大幅な機能強化により、多様なビジネス要件への対応における柔軟性が大きく向上します。これにより、ユーザーは事前定義された静的な schema に制限されることなく、動的に異なる field を持つ entity を collection に挿入できるようになります。

上級ユーザー向けには、Dynamic Schema と Static Schema を組み合わせた、collection 作成のハイブリッドアプローチを導入しました。これにより、ユーザーは schema 設計で「required」field を指定し、高度な indexing 最適化を有効化できます。一方で、「optional」field は dynamic schema の仕組みによってサポートされます。この新しいアプローチにより、schema の柔軟性を維持しながら、クエリパフォーマンスが向上します。

Zilliz Cloud 2.0.0 でこの機能を試し、データベース schema の適応性が大きく向上することを体感してください。

詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。

## JSON Type Support\{#json-type-support}

最新アップデートにおける Zilliz Cloud の大きな機能強化として、JSON データ管理と Approximate Nearest Neighbor (ANN) Search 機能の統合を発表できることを嬉しく思います。

JSON（JavaScript Object Notation）は、今日のデータベース管理の世界で不可欠となっている重要なデータ交換形式です。Zilliz Cloud に JSON サポートが導入されたことで、JSON データを簡単に保存および管理できるようになり、データ操作とクエリの可能性が大きく広がります。

真の力は、これが既存の ANN Search 機能と革新的に組み合わされている点にあります。この組み合わせにより、JSON データ構造の柔軟性と ANN search の精度を組み合わせた複雑なクエリを実行できるようになり、データベースのクエリ機能が大きく前進します。

1 か所でこれら 2 つの強力な技術の相乗効果を体験し、データ管理とクエリ作業における効率性と精度を新たなレベルへ引き上げてください。今すぐ Zilliz Cloud とともにデータベース技術の未来へ踏み出しましょう。[この機能の詳細を見る](./json-field-overview)。
