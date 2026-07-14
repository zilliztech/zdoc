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

リージョンのサポートは、ワークロードタイプ、デプロイオプション、機能によって異なる場合があります。[プロジェクトを作成](./manage-projects#create-a-project)する前に、このページを使用してリージョンを選択してください。

## クラウドリージョンの選び方\{#how-to-choose-a-cloud-region}

- アプリケーションまたはユーザーに近いリージョンを選択します。

- データ所在地とコンプライアンス要件を考慮します。

- レイテンシーとリージョン間データ転送の影響を考慮します。

- 使用したい機能が対象リージョンでサポートされているかを確認します。

- 必要なリージョンまたは機能が利用できない場合は、[お問い合わせ](http://zilliz.com/contact-sales)ください。

## サポートされているリージョン\{#supported-regions}

### AWS\{#aws}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>所在地</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>米国、オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国、北バージニア</p></td>
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
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
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
     <th><p><strong>所在地</strong></p></th>
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
     <th><p><strong>所在地</strong></p></th>
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
     <td><p>インド、プネ</p></td>
   </tr>
</table>

## クラウドリージョン別の機能サポート\{#feature-support-by-cloud-region}

### コンピュートタイプのサポート\{#compute-type-support}

<table>
   <tr>
     <th><p><strong>コンピュートタイプ</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p>常時稼働コンピュート（<a href="./manage-cluster">Serving cluster</a>）</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p><a href="./on-demand-cluster">オンデマンドコンピュート</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
     <td><p>ℹ️  一部のリージョン:</p><ul><li>East US</li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注">

一覧にないリージョンでオンデマンドコンピュートが必要な場合は、[お問い合わせ](http://zilliz.com/contact-sales)ください。

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
     <td><p>SaaS（Free & Serverless）</p></td>
     <td><p>ℹ️  一部のリージョン:</p><ul><li><p>eu-central-1</p></li><li><p>eu-west-1</p></li></ul></td>
     <td><p>ℹ️   一部のリージョン:</p><ul><li>us-west1</li></ul></td>
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
     <td><p>✅ すべてのリージョン</p><p>加えて ap-east-1（香港特別行政区）</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注">

BYOC デプロイが必要な場合は、[お問い合わせ](http://zilliz.com/contact-sales)ください。

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
     <td><p><a href="./managed-volume">Volume</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-external-collections-console">External collection</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">Global cluster</a></p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>ℹ️   一部のリージョン:</p><ul><li><p>gcp-us-central1</p></li><li><p>gcp-us-east4</p><Admonition type="info" icon="📘" title="注"> Google Cloud リージョンでこの機能を使用する必要がある場合は、[お問い合わせ](http://support.zilliz.com)ください。 </Admonition></li></ul></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">リージョン間バックアップ </a></p></td>
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
</table>

<Admonition type="info" icon="📘" title="注">

一部の機能は、追加の設定、プロジェクトプラン、またはデプロイモードに依存します。詳細については、[デプロイとプランの比較](./select-zilliz-cloud-service-plans)を参照してください。

</Admonition>

