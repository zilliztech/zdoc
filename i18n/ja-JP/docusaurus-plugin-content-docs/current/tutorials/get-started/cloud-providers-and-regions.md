---
title: "クラウドプロバイダーとリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーとリージョン"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、AWS、Google Cloud、Microsoft Azure にわたる複数のクラウドプロバイダーとリージョンをサポートしています。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーとリージョン

Zilliz Cloud は、AWS、Google Cloud、Microsoft Azure にわたる複数のクラウドプロバイダーとリージョンをサポートしています。

リージョンのサポート状況は、ワークロードの種類、デプロイオプション、機能によって異なる場合があります。[プロジェクトを作成する](./manage-projects#create-a-project)前に、このページを使用してリージョンを選択してください。

## クラウドリージョンの選択方法\{#how-to-choose-a-cloud-region}

- アプリケーションまたはユーザーに近いリージョンを選択します。

- データレジデンシーとコンプライアンスの要件を考慮します。

- レイテンシとリージョン間のデータ転送の影響を考慮します。

- 目的の機能が対象リージョンでサポートされているかどうかを確認します。

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
     <td><p>米国オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国バージニア北部</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>米国オハイオ</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（中部）</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td><p>eu-west-2</p></td>
     <td><p>英国ロンドン</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>日本東京</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>韓国ソウル</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリア シドニー</p></td>
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
     <td><p>米国オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>米国バージニア</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>米国アイオワ</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>ドイツ フランクフルト</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>asia-northeast1</p></td>
     <td><p>日本東京</p></td>
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
     <td><p>米国バージニア</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>米国バージニア</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>米国アイオワ</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>ドイツ フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>Central India</p></td>
     <td><p>インド プネー</p></td>
   </tr>
</table>

## クラウドリージョン別の機能サポート\{#feature-support-by-cloud-region}

### コンピューティングタイプのサポート\{#compute-type-support}

<table>
   <tr>
     <th><p><strong>コンピューティングタイプ</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p>常時稼働コンピューティング（<a href="./manage-cluster">Serving クラスター</a>）</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p><a href="./on-demand-cluster">オンデマンドコンピューティング</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
     <td><p>ℹ️  一部のリージョン:</p><ul><li>East US</li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Note">

一覧にないリージョンでオンデマンドコンピューティングが必要な場合は、[お問い合わせください](http://zilliz.com/contact-sales)。

</Admonition>

### デプロイオプションのサポート\{#deployment-option-support}

<table>
   <tr>
     <th><p><strong>デプロイオプション</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p>SaaS (Free & Serverless)</p></td>
     <td><p>ℹ️  一部のリージョン:</p><ul><li>eu-central-1</li></ul></td>
     <td><p>ℹ️   一部のリージョン:</p><ul><li>us-west1</li></ul></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>SaaS (Dedicated)</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p>BYOC</p></td>
     <td><p>✅ すべてのリージョン</p><p>さらに:</p><ul><li><p>ap-east-1（香港特別行政区）</p></li><li><p>ap-southeast-7（タイ）</p></li></ul></td>
     <td><p>✅ すべてのリージョン</p><p>さらに:</p><ul><li>europe-west9（フランス パリ）</li></ul></td>
     <td><p>✅ すべてのリージョン</p> <NextChannel action="include"><p>さらに:</p><ul><li>Malaysia West（マレーシア クアラルンプール）</li></ul> </NextChannel></td>
   </tr>
</table>

<Admonition type="info" title="Note">

BYOC デプロイが必要な場合は、[お問い合わせください](http://zilliz.com/contact-sales)。

</Admonition>

### 機能のサポート\{#feature-support}

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./managed-volume">ボリューム</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-external-collections-console">外部コレクション</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">グローバルクラスター</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>ℹ️   一部のリージョン:</p><ul><li><p>gcp-us-central1</p></li><li><p>gcp-us-east4</p></li></ul><Admonition type="info" title="Note"> Google Cloud リージョンでこの機能を使用する必要がある場合は、[お問い合わせください](http://support.zilliz.com)。 </Admonition></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">クロスリージョンバックアップ</a></p></td>
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
     <td><p>ℹ️   一部のリージョン:</p><ul><li>us-west-2</li></ul></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

<Admonition type="info" title="Note">

一部の機能は、追加の構成、プロジェクトプラン、またはデプロイモードによって異なります。詳細については、[デプロイとプランの比較](./select-zilliz-cloud-service-plans) を参照してください。

</Admonition>
