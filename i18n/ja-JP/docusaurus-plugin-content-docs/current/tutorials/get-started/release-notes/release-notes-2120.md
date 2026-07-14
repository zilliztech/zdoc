---
title: "リリースノート（2024年12月26日） | Cloud"
slug: /release-notes-2120
sidebar_label: "2024年12月26日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "今回のリリースでは、Zilliz Cloud は BYOC ソリューション全体のセキュリティ、パフォーマンス、使いやすさを向上させるための重要な機能強化を導入します。グローバルな mmap 戦略が実装され、field レベルおよび index レベルの両方でカスタマイズ可能な設定を提供することで、検索パフォーマンスを維持しながら collection 容量を拡張できるようになりました。Milvus を基盤として、Zilliz Cloud は cluster 内での database 作成をサポートし、より優れたデータ管理とマルチテナンシーを実現する collection レベルのロールベースアクセス制御（RBAC）も提供します。さらに、検索精度設定が改善され、recall rate 推定機能と組み合わせて使用できるようになったことで、検索精度とパフォーマンスを効果的に最適化できます。 | Cloud"
type: origin
token: OJVrwOiE4i3fFjk2J3NcneLznfh
sidebar_position: 17
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年12月26日）

今回のリリースでは、Zilliz Cloud は BYOC ソリューション全体のセキュリティ、パフォーマンス、使いやすさを向上させるための重要な機能強化を導入します。グローバルな mmap 戦略が実装され、field レベルおよび index レベルの両方でカスタマイズ可能な設定を提供することで、検索パフォーマンスを維持しながら collection 容量を拡張できるようになりました。Milvus を基盤として、Zilliz Cloud は cluster 内での database 作成をサポートし、より優れたデータ管理とマルチテナンシーを実現する collection レベルのロールベースアクセス制御（RBAC）も提供します。さらに、検索精度設定が改善され、recall rate 推定機能と組み合わせて使用できるようになったことで、検索精度とパフォーマンスを効果的に最適化できます。

## Milvus compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。 

## BYOC - データセキュリティと権限制御のためのまったく新しいソリューション\{#byoc-a-brand-new-solution-for-data-security-and-permission-control}

企業による Zilliz Cloud の採用が進むにつれて、データセキュリティガバナンスや権限制御への関心も高まっています。そのため、このリリースでは、vector database サービスにおける厳格なデータセキュリティおよびサービス品質の要件を満たすために、まったく新しい Bring-Your-Own (BYOC) ソリューションを導入します。このソリューションにより、以下を実現します。

- **安全な通信**: コントロールプレーンとデータプレーン間の通信は、アウトバウンドポート 443 のみを使用して行われるようになり、堅牢で安全な接続を確保します。

- **最適化された権限**: デプロイおよび運用タスクに必要な権限設定が最小化され、きめ細かく制御できるようになったことで、セキュリティと管理のしやすさが向上しました。完全な権限リストは[こちら](/docs/byoc/permissions-in-roles)をご覧ください。

詳細については、[BYOC Overview](/docs/byoc/byoc-intro) および [Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) を参照してください。

## 新しい利用可能リージョン: GCP us-central1 (lowa)\{#new-region-available-gcp-us-central1-lowa}

Zilliz Cloud は現在、GCP us-central1 リージョン（Iowa）でも利用可能になっており、米国中部のユーザーに対して、より低いレイテンシと高いパフォーマンスを提供します。

利用可能なすべてのリージョンの詳細な料金情報については、[料金ページ](https://zilliz.com/pricing)をご覧ください。

## Database レイヤーのサポート\{#support-for-database-layer}

Zilliz Cloud には、cluster と collection の間に位置する database レイヤーが追加され、マルチテナンシーを実現しながら、データを効率的に管理および整理できるようになりました。この構造では、database はデータを整理および管理するための論理単位です。ユーザーは複数の database を作成し、異なるアプリケーションやテナント間でデータを論理的に分離することで、データセキュリティを強化し、マルチテナンシーを実現できます。[database の詳細はこちら](/docs/database)。

## データ容量拡張のための mmap サポート\{#mmap-support-for-expanded-data-capacity}

このリリースにより、Zilliz Cloud で `mmap` がサポートされ、最適な形で最大 3 倍のデータを提供できるようになりました。`mmap` を使用すると、ディスク上に保存された大きなファイルにメモリから直接アクセスできるため、Zilliz Cloud は index とデータをメモリとディスクの両方にまたがって保存できます。この構成では、アクセス頻度に基づいてデータ配置が最適化されるため、検索パフォーマンスを維持しながら collection の保存容量を大幅に拡張できます。

Dedicated cluster ユーザーの場合、`mmap` 設定はワークロード要件に応じて完全にカスタマイズ可能です。ユーザーは各 collection 内の vector データ、scalar データ、scalar index に対する `mmap` 戦略を柔軟に制御できます。グローバル mmap 戦略の詳細については、[Use mmap](./use-mmap) を参照してください。

## Collection レベルの RBAC サポート\{#collection-level-rbac-support}

このリリースでは、collection レベルの Role-Based Access Control (RBAC) のサポートが導入され、ユーザーは collection レベルで権限を管理し、マルチテナンシー分離を適用できるようになりました。

現在、3 つの組み込み collection レベル権限グループが利用可能です。

- **CollectionReadOnly (COLL_RO)**: collection データへの読み取り専用アクセスを付与します。

- **CollectionReadWrite (COLL_RW)**: collection データへの読み取りおよび書き込みアクセスの両方を付与します。

- **CollectionAdmin (COLL_ADMIN)**: collection データへの読み取りおよび書き込みアクセスに加えて、collection を管理する権限を付与します。

詳細については、[collection レベル権限グループを参照](./cluster-privileges#collection-level-privilege-groups)してください。

## 高 Recall Search\{#high-recall-search}

Zilliz Cloud では、検索精度を制御して vector 検索を最適化するために、`level` という検索パラメータを導入しました。このパラメータの範囲は **1 から 10** で、デフォルト値は **1** です。このパラメータを調整することで、ユーザーは検索の recall とパフォーマンスのバランスを取ることができます。

- **デフォルト値 (leve=1)**: 一般的なケースで 90% を超える recall を提供しつつ、最適な検索パフォーマンスを維持します。

- **高 Recall Search (level=6~10)**: 高い recall rate（例: 99% 以上）が必要なシナリオでは、ユーザーはこのパラメータを **6** から **10** の間に設定できます。パフォーマンスがそれほど重要でない場合は **10** を選択できます。

この柔軟性により、ユーザーは特定の要件に合わせて検索動作を調整し、精度と速度の望ましいバランスを実現できます。詳細については、[use the 'level' parameter](./single-vector-search#use-level) を参照してください。

## Recall Rate Estimation\{#recall-rate-estimation}

検索中に recall rate を推定する機能を導入しました。`search_params` で `enable_recall_calculation` パラメータを有効にして `true` に設定すると、検索結果の一部としてシステム推定の recall rate を受け取ることができます。

recall rate 推定を `level` パラメータと組み合わせることで、ユーザーはアプリケーションに必要な recall rate を達成するための適切な `level` 設定を簡単に特定できます。詳細については、[get recall rate](./single-vector-search#get-recall-rate) を参照してください。

