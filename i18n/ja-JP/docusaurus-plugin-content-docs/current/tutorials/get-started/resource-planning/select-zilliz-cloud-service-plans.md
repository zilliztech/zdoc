---
title: "デプロイとプランの比較 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_key: select-zilliz-cloud-service-plans
sidebar_label: "デプロイとプラン"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャ要件に応じて選択できる複数のデプロイおよびプロジェクトプランを提供します。 | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスタープラン

---

import Admonition from '@theme/Admonition';


# デプロイとプランの比較

Zilliz Cloud は、ワークロード、信頼性、コンプライアンス、データ主権、インフラストラクチャ要件に応じて選択できる複数のデプロイおよびプロジェクトプランを提供します。

リソースをデプロイする前に、まず **SaaS** と **BYOC** のどちらを使用するかを決定する必要があります。これにより、誰がインフラストラクチャを運用するか、またデータプレーン環境がどこで実行されるかが決まります。

- SaaS を選択する場合は、その後、プロジェクト内のリソースで利用できる機能、SLA、コンプライアンス機能を定義するプロジェクトプランを選択します。

- BYOC を選択する場合、機能サポートは SaaS の Business Critical プランと同等です。

このガイドを使用して Zilliz Cloud のプランを比較し、[プロジェクトを作成](./manage-projects#create-a-project)する前に適切なプランを選択してください。

## デプロイの選択 (SaaS vs. BYOC)\{#select-deployment-saas-vs-byoc}

<table>
   <tr>
     <th><p><strong>判断基準</strong></p></th>
     <th><p><strong>SaaS を選ぶ場合</strong></p></th>
     <th><p><strong>BYOC を選ぶ場合</strong></p></th>
   </tr>
   <tr>
     <td><p>インフラストラクチャの所有</p></td>
     <td><p>Zilliz にインフラストラクチャの運用を任せたい場合。</p></td>
     <td><p>組織がクラウドアカウント、VPC/VNet、データプレーン環境を所有する必要がある場合。</p></td>
   </tr>
   <tr>
     <td><p>データ主権</p></td>
     <td><p>リージョンレベルの制御で十分な場合。</p></td>
     <td><p>データを自社のクラウドアカウント内に保持する必要がある場合。</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク</p></td>
     <td><p>パブリックエンドポイントまたは標準的なプライベートネットワークで要件を満たせる場合。</p></td>
     <td><p>顧客 VPC/VNet 内からのローカルアクセスやプライベートエンドポイント構成が必要な場合。</p></td>
   </tr>
   <tr>
     <td><p>コンプライアンス</p></td>
     <td><p>SaaS プランの制御機能で要件を満たせる場合。</p></td>
     <td><p>顧客管理のインフラストラクチャや、より厳格なクラウドガバナンスが求められる場合。</p></td>
   </tr>
   <tr>
     <td><p>コストモデル</p></td>
     <td><p>パッケージ化された SaaS 課金を希望する場合。</p></td>
     <td><p>Zilliz BYOC の料金と、自社のクラウドプロバイダー割引やコミットメントを組み合わせたい場合。</p></td>
   </tr>
   <tr>
     <td><p>運用</p></td>
     <td><p>運用負荷を最小限に抑えたい場合。</p></td>
     <td><p>クラウド、ネットワーク、ストレージ、セキュリティの共有責任を管理できる場合。</p></td>
   </tr>
</table>

## プランの選択\{#select-plan}

BYOC を選択した場合、追加でプランを選択する必要はありません。BYOC の機能サポートは SaaS Business Critical プランと同じです。SaaS デプロイを選択した場合は、次のオプションからプランを選択します。

- **Standard:** Standard プランは、非クリティカルなワークロード向けに設計されています。プロトタイプやテスト環境に最適です。詳細については、[Zilliz Cloud 料金](https://zilliz.com/pricing)を参照してください。

- **Enterprise:** Enterprise プランは、エンタープライズグレードの信頼性と制御機能を提供します。本番アプリケーションに最適です。詳細については、[Zilliz Cloud 料金](https://zilliz.com/pricing)を参照してください。

- **Business Critical**: Business Critical プランは、規制対応に適し、最大限の耐障害性を備えています。医療、金融、ミッションクリティカルなシステムに最適です。Business Critical プランを選択するには、[営業部門にお問い合わせ](http://zilliz.com/contact-sales)ください。

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>Standard (SaaS)</strong></p></th>
     <th><p><strong>Enterprise (SaaS)</strong></p></th>
     <th><p><strong>Business Critical (SaaS) および BYOC</strong></p></th>
   </tr>
   <tr>
     <td><p>稼働時間 SLA</p></td>
     <td><p>--</p></td>
     <td><p>99.95%</p></td>
     <td><ul><li><p>Business Critical: 99.99% (マルチレプリカが有効な場合)</p></li><li><p>BYOC: 99.95%</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./scale-query-cu#manual-scaling">手動スケーリング</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>自動スケーリング (<a href="./scale-query-cu#scheduled-scaling">スケジュールスケーリング</a>および<a href="./scale-query-cu#dynamic-scaling">動的スケーリング</a>を含む)</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-replica">レプリカ</a></p></td>
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
     <td><p><a href="./on-demand-compute">オンデマンドコンピュート</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><ul><li><p>Business Critical: ✅</p></li><li><p>BYOC: ❌</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./volume">Volume</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrations">移行</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./metrics-and-alerts">メトリクスとアラート</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>可観測性インテグレーション (<a href="./integrate-with-datadog">Datadog</a>、<a href="./prometheus-monitoring">Prometheus</a>)</p></td>
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
     <td><p><a href="./backup-to-other-regions">クロスリージョンバックアップ</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ストレージインテグレーション (<a href="./integrate-with-aws-s3">AWS S3</a>、<a href="./integrate-with-gcp">Google Cloud Storage</a>、<a href="./integrate-with-azure-blob-storage">Azure Blob Storage</a>)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">ロールベースアクセス制御 (RBAC)</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./single-sign-on">シングルサインオン (SSO)</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-console-ip-allowlist">Console IP 許可リスト</a></p></td>
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
     <td><p><a href="./setup-a-private-link">プライベートエンドポイント</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">カスタマー管理暗号化キー (CMEK)</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./auditing">監査ログ</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-logs">アクセスログ</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>
