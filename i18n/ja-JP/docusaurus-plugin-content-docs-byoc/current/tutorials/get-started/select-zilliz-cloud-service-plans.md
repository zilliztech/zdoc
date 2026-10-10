---
title: "デプロイとプランの比較 | BYOC"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "プランの比較"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、さまざまなワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャの要件に合わせて、複数のデプロイおよびプロジェクトプランのオプションを提供しています。 | BYOC"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# デプロイとプランの比較

Zilliz Cloud は、さまざまなワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャの要件に合わせて、複数のデプロイおよびプロジェクトプランのオプションを提供しています。

リソースをデプロイする前に、まず **SaaS** または **BYOC** のどちらを使用するかを決定する必要があります。これにより、誰がインフラストラクチャを運用し、データプレーン環境がどこで実行されるかが決まります。

- SaaS を選択した場合は、次に、そのプロジェクト内のリソースで利用できる機能、SLA、コンプライアンス機能を定義するプロジェクトプランを選択します。

- BYOC を選択した場合、機能サポートは SaaS Business Critical プランと一致します。

## デプロイの選択（SaaS と BYOC）\{#select-deployment-saas-vs-byoc}

| **判断基準** | **SaaS を選択する場合** | **BYOC を選択する場合** |
| --- | --- | --- |
| インフラストラクチャの所有 | Zilliz がインフラストラクチャを運用することを希望します。 | 組織がクラウドアカウント、VPC/VNet, データプレーン環境を所有する必要があります。 |
| データ主権 | リージョンレベルの制御で十分です。 | データを自社のクラウドアカウント内に保持する必要があります。 |
| ネットワーキング | パブリックエンドポイントまたは標準的なプライベートネットワーキングで問題ありません。 | お客様の VPC/VNet-local アクセスおよびプライベートエンドポイントのパターンが必要です。 |
| コンプライアンス | SaaS プランの制御が要件を満たしています。 | 要件が、お客様が制御するインフラストラクチャまたはより厳格なクラウドガバナンスを求めています。 |
| コストモデル | パッケージ化された SaaS 請求を希望します。 | Zilliz BYOC の価格設定と、自社のクラウドプロバイダーの割引およびコミットメントを組み合わせることを希望します。 |
| 運用 | 運用負担を最小限に抑えることを希望します。 | 共有クラウド、ネットワーク、ストレージ、セキュリティの責任を管理できます。 |

## プランの選択\{#select-plan}

BYOC を選択した場合、プランをさらに選択する必要はありません。BYOC の機能サポートは SaaS Business Critical プランと同じです。SaaS デプロイを選択した場合は、以下のオプションからプランを選択する必要があります。

- **Standard:** Standard プランは、重要度の低いワークロード向けに調整されています。プロトタイプやテスト環境に最適です。詳細は、[Zilliz Cloud の料金](https://zilliz.com/pricing) を参照してください。

- **Enterprise:** Enterprise プランは、エンタープライズグレードの信頼性と制御を提供します。本番アプリケーションに最適です。詳細は、[Zilliz Cloud の料金](https://zilliz.com/pricing) を参照してください。

- **Business Critical**: Business Critical プランは、最大限の回復力を備えた規制対応のプランです。ヘルスケア、金融、ミッションクリティカルなシステムに最適です。Business Critical プランを選択するには、[営業担当者](http://zilliz.com/contact-sales) にお問い合わせください。

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>Standard (SaaS)</strong></p></th>
     <th><p><strong>Enterprise (SaaS)</strong></p></th>
     <th><p><strong>Business Critical (SaaS) and BYOC</strong></p></th>
   </tr>
   <tr>
     <td><p>稼働時間 SLA</p></td>
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
     <td><p><a href="./on-demand-cluster">オンデマンドコンピュート</a></p></td>
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
     <td><p>可観測性インテグレーション（<a href="./integrate-with-datadog">Datadog</a>、<a href="./prometheus-monitoring">Prometheus</a>）</p></td>
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
     <td><p>クロスリージョンバックアップ</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p><Admonition type="info" title="Note"> クロスリージョンバックアップは現在 BYOC ではサポートされていません。 </Admonition></td>
   </tr>
   <tr>
     <td><p>ストレージインテグレーション（AWS S3、Google Cloud Storage、Azure Blob Storage）</p></td>
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
     <td><p><a href="./scim-provisioning-overview">SCIM（System for Cross-domain Identity Management）</a></p></td>
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
     <td><p><a href="./cmek">カスタマー管理暗号化キー（CMEK）</a></p></td>
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
