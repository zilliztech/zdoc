---
title: "クラウドプロバイダーとリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーとリージョン"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、AWS、Google Cloud、Microsoft Azure の複数のクラウドプロバイダーとリージョンをサポートしています。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーとリージョン

Zilliz Cloud は、AWS、Google Cloud、Microsoft Azure の複数のクラウドプロバイダーとリージョンをサポートしています。

リージョンのサポート状況は、ワークロードタイプ、デプロイオプション、機能によって異なる場合があります。プロジェクトを[作成する](./manage-projects#create-a-project)前に、このページを使用してリージョンを選択してください。

## クラウドリージョンの選択方法\{#how-to-choose-a-cloud-region}

- アプリケーションまたはユーザーに近いリージョンを選択してください。

- データレジデンシーとコンプライアンス要件を考慮してください。

- レイテンシーとリージョン間のデータ転送への影響を考慮してください。

- 目的の機能がターゲットリージョンでサポートされているか確認してください。

- 必要なリージョンまたは機能が利用できない場合は、[お問い合わせください](https://zilliz.com/all-regions#region-request)。

## サポートされているリージョン\{#supported-regions}

### AWS\{#aws}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>米国、オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国、バージニア北部</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>米国、オハイオ</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（中部）</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td><p>eu-west-2</p></td>
     <td><p>英国、ロンドン</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>日本、東京</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>韓国、ソウル</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリア、シドニー</p></td>
   </tr>
</table>

### Google Cloud\{#google-cloud}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>us-west1</p></td>
     <td><p>米国、オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>米国、バージニア</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>米国、アイオワ</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>asia-northeast1</p></td>
     <td><p>日本、東京</p></td>
   </tr>
</table>

### Azure\{#azure}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>East US</p></td>
     <td><p>米国、バージニア</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>米国、バージニア</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>米国、アイオワ</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>Central India</p></td>
     <td><p>インド、プネー</p></td>
   </tr>
</table>

## クラウドリージョンごとの機能サポート\{#feature-support-by-cloud-region}

### コンピューティングタイプのサポート\{#compute-type-support}

| **コンピューティングタイプ** | **AWS** | **Google Cloud** | **Microsoft Azure** |
| --- | --- | --- | --- |
| 常時稼働コンピューティング（[Serving クラスター](./manage-cluster)） | ✅ すべてのリージョン | ✅ すべてのリージョン | ✅ すべてのリージョン |
| [オンデマンドコンピューティング](./on-demand-cluster) | ✅ すべてのリージョン | ✅ すべてのリージョン | ✅ すべてのリージョン |

### デプロイオプションのサポート\{#deployment-option-support}

<table>
   <tr>
     <th><p><strong>デプロイオプション</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p>SaaS（Free & Serverless）</p></td>
     <td><p>ℹ️  一部のリージョン：</p><ul><li>eu-central-1</li></ul></td>
     <td><p>ℹ️  一部のリージョン：</p><ul><li>us-west1</li></ul></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>SaaS（Dedicated）</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p>BYOC</p></td>
     <td><p>✅ すべてのリージョン</p><p>追加：</p><ul><li><p>ap-east-1（香港特別行政区）</p></li><li><p>ap-southeast-7（タイ）</p></li></ul></td>
     <td><p>✅ すべてのリージョン</p><p>追加：</p><ul><li>europe-west9（フランス、パリ）</li></ul></td>
     <td><p>✅ すべてのリージョン</p><p>追加：</p><ul><li>Malaysia West（マレーシア、クアラルンプール）</li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Note">

BYOC デプロイが必要な場合は、[お問い合わせください](http://zilliz.com/contact-sales)。

</Admonition>

### 機能サポート\{#feature-support}

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./managed-volume">マネージドボリューム</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./external-volume">外部ボリューム</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-external-collections-console">外部コレクション</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p><p>Azure リージョンでこの機能を使用する必要がある場合は、<a href="http://support.zilliz.com">お問い合わせください</a>。</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">グローバルクラスター</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>ℹ️  一部のリージョン：</p><ul><li><p>gcp-us-central1</p></li><li><p>gcp-us-east4</p></li></ul><p>Google Cloud リージョンでこの機能を使用する必要がある場合は、<a href="http://support.zilliz.com">お問い合わせください</a>。</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">リージョン間バックアップ</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">CMEK</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="/docs/spark-batch-jobs">Spark バッチジョブ</a></p></td>
     <td><p>✅ すべてのリージョン（<a href="http://support.zilliz.com">リクエストに応じて</a>）</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>ダウンタイムなしの移行</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
</table>

<Admonition type="info" title="Note">

一部の機能は、追加の構成、プロジェクトプラン、またはデプロイモードに依存します。詳細は、[デプロイとプランの比較](./select-zilliz-cloud-service-plans) を参照してください。

</Admonition>
