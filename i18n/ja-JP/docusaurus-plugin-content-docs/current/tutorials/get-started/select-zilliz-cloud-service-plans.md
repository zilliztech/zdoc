---
title: "詳細なプラン比較 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "プラン比較"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、さまざまなワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャ要件に対応するため、複数のデプロイメントおよびプロジェクトプランのオプションを提供しています。 | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# デプロイメントとプランの比較

Zilliz Cloud は、さまざまなワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャ要件に対応するため、複数のデプロイメントおよびプロジェクトプランのオプションを提供しています。

リソースをデプロイする前に、まず **SaaS** と **BYOC** のどちらを使用するかを決定する必要があります。これにより、誰がインフラストラクチャを運用するのか、またデータプレーン環境がどこで実行されるのかが決まります。 

- SaaS を選択する場合は、その後プロジェクト内のリソースで利用可能な機能、SLA、コンプライアンス機能を定義するプロジェクトプランを選択します。

- BYOC を選択する場合、機能サポートは SaaS Business Critical プランと一致します。

このガイドを使用して Zilliz Cloud のプランを比較し、[プロジェクトを作成](./manage-projects#create-a-project)する前に適切なプランを選択してください。

## デプロイメントを選択する（SaaS vs. BYOC）\{#select-deployment-saas-vs-byoc}

| **判断要因** | **次の場合は SaaS を選択** | **次の場合は BYOC を選択** |
| --- | --- | --- |
| インフラストラクチャの所有権 | Zilliz にインフラストラクチャの運用を任せたい。 | 組織がクラウドアカウント、VPC/VNet、およびデータプレーン環境を所有する必要がある。 |
| データ主権 | リージョンレベルの制御で十分である。 | データを自社のクラウドアカウント内に保持する必要がある。 |
| ネットワーキング | パブリックエンドポイントまたは標準的なプライベートネットワーキングで問題ない。 | 顧客の VPC/VNet ローカルアクセスとプライベートエンドポイントのパターンが必要である。 |
| コンプライアンス | SaaS プランの管理機能で要件を満たせる。 | 顧客管理のインフラストラクチャまたはより厳格なクラウドガバナンスが要件として求められる。 |
| コストモデル | パッケージ化された SaaS 課金を希望する。 | Zilliz BYOC の価格設定と、自社のクラウドプロバイダー割引やコミットメントを組み合わせたい。 |
| 運用 | 運用負荷を最小限にしたい。 | クラウド、ネットワーク、ストレージ、セキュリティに関する共有責任を管理できる。 |

## プランを選択する\{#select-plan}

BYOC を選択した場合、追加でプランを選択する必要はありません。BYOC の機能サポートは SaaS Business Critical プランと同じです。SaaS デプロイメントを選択した場合は、次のオプションからプランを選択する必要があります。

- **Standard:** Standard プランは、重要度の低いワークロード向けに設計されています。プロトタイプやテスト環境に最適です。詳細は [Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

- **Enterprise:** Enterprise プランは、エンタープライズグレードの信頼性と制御機能を提供します。本番アプリケーションに最適です。詳細は [Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

- **Business Critical**: Business Critical プランは、規制要件に対応でき、最大限の耐障害性を備えています。医療、金融、ミッションクリティカルなシステムに最適です。Business Critical プランを選択するには、[営業にお問い合わせください](http://zilliz.com/contact-sales)。

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>Standard (SaaS)</strong></p></th>
     <th><p><strong>Enterprise (SaaS)</strong></p></th>
     <th><p><strong>Business Critical (SaaS) および BYOC</strong></p></th>
   </tr>
   <tr>
     <td><p>稼働率 SLA</p></td>
     <td><p>--</p></td>
     <td><p>99.95%</p></td>
     <td><ul><li><p>Business Critical: 99.99%（multi-replica が有効な場合）</p></li><li><p>BYOC: 99.95%</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./manual-scaling">手動スケーリング</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>オートスケーリング（<a href="./scheduled-scaling">スケジュール</a>および<a href="./auto-scaling">動的</a>スケーリングを含む）</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./auto-scaling">レプリカ</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">グローバルクラスター</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./on-demand-cluster">オンデマンドコンピュート</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><ul><li><p>Business Critical: ✅</p></li><li><p>BYOC: ❌</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./managed-volume">ボリューム</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./zilliz-migration-prompts">移行</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./metrics-alerts-reference">メトリクスとアラート</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>可観測性の統合（<a href="./integrate-with-datadog">Datadog</a>、<a href="./prometheus-monitoring">Prometheus</a>）</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-snapshots">スナップショット</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-backup">基本バックアップと復元</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">クロスリージョンバックアップ</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ストレージ統合（<a href="./integrate-with-aws-s3">AWS S3</a>、<a href="./integrate-with-gcp">Google Cloud Storage</a>、<a href="./integrate-with-azure-blob-storage">Azure Blob Storage</a>）</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><ul><li><p>Business Critical: ✅</p></li><li><p>BYOC: ❌</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">ロールベースアクセス制御（RBAC）</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./single-sign-on">シングルサインオン（SSO）</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-console-ip-allowlist">コンソール IP 許可リスト</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-whitelist">クラスター IP 許可リスト</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-a-private-link-aws">プライベートエンドポイント</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">顧客管理暗号化キー（CMEK）</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./audit-logs">監査ログ</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-log-overview">アクセスログ</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><ul><li><p>Business Critical: ✅</p></li><li><p>BYOC: ❌</p></li></ul></td>
   </tr>
</table>

