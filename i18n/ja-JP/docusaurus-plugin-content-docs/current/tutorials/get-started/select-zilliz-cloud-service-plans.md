---
title: "デプロイとプランの比較 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "プラン比較"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、さまざまなワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャの要件に合わせて、複数のデプロイとプロジェクトプランのオプションを提供しています。 | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# デプロイとプランの比較

Zilliz Cloud は、さまざまなワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャの要件に合わせて、複数のデプロイとプロジェクトプランのオプションを提供しています。

リソースをデプロイする前に、まず **SaaS** と **BYOC** のどちらを使用するかを決定する必要があります。これにより、インフラストラクチャを誰が運用するか、およびデータプレーン環境がどこで実行されるかが決まります。

- SaaS を選択した場合は、その後、そのプロジェクト内のリソースで利用できる機能、SLA、コンプライアンス機能を定義するプロジェクトプランを選択します。

- BYOC を選択した場合、機能サポートは SaaS の Business Critical プランと一致します。

このガイドを使用して、Zilliz Cloud のプランを比較し、[プロジェクトを作成する](./manage-projects#create-a-project)前に適切なプランを選択してください。

## デプロイの選択（SaaS vs. BYOC）\{#select-deployment-saas-vs-byoc}

| **判断要素** | **SaaS を選択する場合...** | **BYOC を選択する場合...** |
| --- | --- | --- |
| インフラストラクチャの所有権 | Zilliz にインフラストラクチャの運用を任せたい場合。 | 組織がクラウドアカウント、VPC/VNet, およびデータプレーン環境を所有する必要がある場合。 |
| データ主権 | リージョンレベルの制御で十分な場合。 | データを自社のクラウドアカウント内に保持する必要がある場合。 |
| ネットワーキング | パブリックエンドポイントまたは標準的なプライベートネットワーキングで問題ない場合。 | 顧客の VPC/VNet-local アクセスと、プライベートエンドポイントのパターンが必要な場合。 |
| コンプライアンス | SaaS プランの制御で要件を満たせる場合。 | 顧客管理のインフラストラクチャや、より厳格なクラウドガバナンスが要件として求められる場合。 |
| コストモデル | パッケージ化された SaaS の課金を希望する場合。 | Zilliz BYOC の料金と、自社のクラウドプロバイダーの割引やコミットメントを組み合わせたい場合。 |
| 運用 | 運用負荷を最小限にしたい場合。 | 共有のクラウド、ネットワーク、ストレージ、およびセキュリティの責任を管理できる場合。 |

## プランの選択\{#select-plan}

BYOC を選択した場合は、プランをさらに選択する必要はありません。BYOC の機能サポートは SaaS の Business Critical プランと同じです。SaaS デプロイを選択した場合は、以下のオプションからプランを選択する必要があります。

- **Standard:** Standard プランは、重要度の低いワークロード向けに調整されています。プロトタイプやテスト環境に最適です。詳細は [Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

- **Enterprise:** Enterprise プランは、エンタープライズグレードの信頼性と制御機能を提供します。本番アプリケーションに最適です。詳細は [Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

- **Business Critical**: Business Critical プランは、規制要件に対応できるよう準備されており、最大限のレジリエンスを備えています。医療、金融、ミッションクリティカルなシステムに最適です。Business Critical プランを選択するには、[営業担当者にお問い合わせください](http://zilliz.com/contact-sales)。

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>Standard（SaaS）</strong></p></th>
     <th><p><strong>Enterprise（SaaS）</strong></p></th>
     <th><p><strong>Business Critical（SaaS）および BYOC</strong></p></th>
   </tr>
   <tr>
     <td><p>稼働率 SLA</p></td>
     <td><p>--</p></td>
     <td><p>99.95%</p></td>
     <td><ul><li><p>Business Critical: 99.99%（マルチレプリカが有効な場合）</p></li><li><p>BYOC: 99.95%</p></li></ul></td>
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
     <td><p><a href="./on-demand-cluster">オンデマンドコンピューティング</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./external-volume">ボリューム</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>移行</p></td>
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
     <td><p><a href="./create-backup">基本的なバックアップと復元</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>クロスリージョンバックアップ</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p><Admonition type="info" title="Note"> クロスリージョンバックアップは現在 BYOC ではサポートされていません。 </Admonition></td>
   </tr>
   <tr>
     <td><p>ストレージ統合（AWS S3、Google Cloud Storage、Azure Blob Storage）</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
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
     <td><p>クラスター IP 許可リスト</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p><Admonition type="info" title="Note"> クラスター IP 許可リストは現在 BYOC ではサポートされていません。 </Admonition></td>
   </tr>
   <tr>
     <td><p>プライベートエンドポイント</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">カスタマー管理の暗号化キー（CMEK）</a></p></td>
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
     <td><p>✅</p></td>
   </tr>
</table>
