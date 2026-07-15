---
title: "クラウドプロバイダーとリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_key: cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーとリージョン"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、AWS、Google Cloud、Microsoft Azure の複数のクラウドプロバイダーとリージョンをサポートしています。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - プロバイダー
  - リージョン

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーとリージョン

Zilliz Cloud は、AWS、Google Cloud、Microsoft Azure の複数のクラウドプロバイダーとリージョンをサポートしています。

リージョンのサポート状況は、ワークロードタイプ、デプロイオプション、機能によって異なる場合があります。このページを使用して、[プロジェクトを作成](./manage-projects#create-a-project)する前にリージョンを選択してください。

## クラウドリージョンの選び方\{#how-to-choose-a-cloud-region}

- アプリケーションまたはユーザーに近いリージョンを選択します。

- データレジデンシーとコンプライアンス要件を考慮します。

- レイテンシとリージョン間データ転送の影響を考慮します。

- 目的の機能がターゲットリージョンでサポートされているか確認します。

- 必要なリージョンまたは機能が利用できない場合は、[お問い合わせください](http://zilliz.com/contact-sales)。

## サポートされているリージョン\{#supported-regions}

### AWS\{#aws}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>オレゴン州、米国</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>バージニア州北部、米国</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>オハイオ州、米国</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ (中部)</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>東京、日本</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>ソウル、韓国</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>シドニー、オーストラリア</p></td>
   </tr>
</table>

### Google Cloud\{#google-cloud}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>us-west1</p></td>
     <td><p>オレゴン州、米国</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>バージニア州、米国</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>アイオワ州、米国</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
</table>

### Azure\{#azure}

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>East US</p></td>
     <td><p>バージニア州、米国</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>バージニア州、米国</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>アイオワ州、米国</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>Central India</p></td>
     <td><p>プネー、インド</p></td>
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
     <td><p>常時稼働コンピュート (<a href="./manage-cluster">Serving クラスター</a>)</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p><a href="./on-demand-cluster">オンデマンドコンピュート</a></p></td>
     <td><p>ℹ️ 一部のリージョン:</p><ul><li>us-west-2</li></ul></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Note">

<p>一覧にないリージョンでオンデマンドコンピュートが必要な場合は、<a href="http://zilliz.com/contact-sales">お問い合わせください</a>。</p>

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
     <td><p>ℹ️ 一部のリージョン:</p><ul><li><p>eu-central-1</p></li><li><p>eu-west-1</p></li></ul></td>
     <td><p>ℹ️ 一部のリージョン:</p><ul><li>us-west1</li></ul></td>
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
     <td><p>✅ すべてのリージョン</p><p>加えて ap-east-1 (香港特別行政区)</p></td>
     <td><p>✅ すべてのリージョン</p></td>
     <td><p>✅ すべてのリージョン</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Note">

<p>BYOC デプロイが必要な場合は、<a href="http://zilliz.com/contact-sales">お問い合わせください</a>。</p>

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
     <td><p>ℹ️ 一部のリージョン:</p><ul><li><p>gcp-us-central1</p></li><li><p>gcp-us-east4</p><Admonition type="caution" icon="🚧" title="undefined"> </Admonition></li></ul></td>
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
</table>

<Admonition type="info" icon="📘" title="Note">

<p>一部の機能は、追加設定、プロジェクトプラン、またはデプロイモードに依存します。詳細については、<a href="./select-zilliz-cloud-service-plans">デプロイとプランの比較</a>を参照してください。</p>

</Admonition>
