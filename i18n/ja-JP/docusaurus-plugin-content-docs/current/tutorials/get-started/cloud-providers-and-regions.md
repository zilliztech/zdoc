---
title: "クラウドプロバイダーとリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーとリージョン"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は AWS、Google Cloud、Microsoft Azure で利用できます。このページを使用してリージョンを見つけ、ご利用のデプロイオプションと必要な機能をそのリージョンがサポートしているかどうかを確認してください。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーとリージョン

Zilliz Cloud は AWS、Google Cloud、Microsoft Azure で利用できます。このページを使用してリージョンを見つけ、そのリージョンがご利用のデプロイオプションと必要な機能をサポートしているかどうかを確認してください。

## クラウドリージョンを選択する\{#choose-a-cloud-region}

リージョンを選択する際は、次の点を考慮してください。

- **データレジデンシー：** データレジデンシーとコンプライアンスの要件を満たすリージョンを選択してください。

- **アプリケーションのロケーション：** ネットワークレイテンシーを減らすために、クラスターを、そのクラスターにアクセスするアプリケーションサービスに近い場所に配置してください。

- **可用性：** デプロイオプションと必要な機能がそのリージョンで利用できることを確認してください。

- **データ転送：** リージョン間またはクラウドプロバイダー間でデータを転送する際のレイテンシーとコストを考慮してください。

## サポートされているリージョン\{#supported-regions}

次の表は、各クラウドプロバイダーでサポートされているリージョンを示しています。Zilliz-Managed Cloud では、常時稼働コンピューティング（[Serving クラスター](./manage-cluster)）と[オンデマンドコンピューティング](./on-demand-cluster)の可用性を個別に示しています。BYOC の可用性は別途記載しています。チェックマーク（✅）は、そのリージョンで利用可能であることを示します。

<Admonition type="info" title="Note">

必要なリージョンが一覧にない場合は、[リージョンのリクエストを送信してください](https://zilliz.com/all-regions#region-request)。 

独自のクラウド環境（BYOC）に Zilliz Cloud をデプロイする場合は、[営業担当者にお問い合わせください](https://zilliz.com/contact-sales)。

</Admonition>

### AWS\{#aws}

<table>
   <tr>
     <th rowspan="3"><p><strong>大陸</strong></p></th>
     <th rowspan="3"><p><strong>リージョン</strong></p></th>
     <th rowspan="3"><p><strong>ロケーション</strong></p></th>
     <th colspan="3"><p><strong>Zilliz-Managed Cloud</strong></p></th>
     <th rowspan="3"><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p><strong>常時稼働コンピューティング（Serving クラスター）</strong></p></td>
     <td rowspan="2"><p><strong>オンデマンドコンピューティング</strong></p></td>
   </tr>
   <tr>
     <td><p><strong>Free & Serverless</strong></p></td>
     <td><p><strong>Dedicated</strong></p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>米国、オレゴン</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国、バージニア北部</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>米国、オハイオ</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（中部）</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>eu-west-2</p></td>
     <td><p>英国、ロンドン</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>日本、東京</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>韓国、ソウル</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-east-1</p></td>
     <td><p>香港特別行政区</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-7</p></td>
     <td><p>タイ</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリア、シドニー</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

### Google Cloud\{#google-cloud}

<table>
   <tr>
     <th rowspan="3"><p><strong>大陸</strong></p></th>
     <th rowspan="3"><p><strong>リージョン</strong></p></th>
     <th rowspan="3"><p><strong>ロケーション</strong></p></th>
     <th colspan="3"><p><strong>Zilliz-Managed Cloud</strong></p></th>
     <th rowspan="3"><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p><strong>常時稼働コンピューティング（Serving クラスター）</strong></p></td>
     <td rowspan="2"><p><strong>オンデマンドコンピューティング</strong></p></td>
   </tr>
   <tr>
     <td><p><strong>Free & Serverless</strong></p></td>
     <td><p><strong>Dedicated</strong></p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>us-west1</p></td>
     <td><p>米国、オレゴン</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>米国、バージニア</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>米国、アイオワ</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>europe-west4</p></td>
     <td><p>オランダ、エームスハーフェン</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>europe-west9</p></td>
     <td><p>フランス、パリ</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>asia-northeast1</p></td>
     <td><p>日本、東京</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

### Microsoft Azure\{#microsoft-azure}

<table>
   <tr>
     <th rowspan="3"><p><strong>大陸</strong></p></th>
     <th rowspan="3"><p><strong>リージョン</strong></p></th>
     <th rowspan="3"><p><strong>ロケーション</strong></p></th>
     <th colspan="3"><p><strong>Zilliz-Managed Cloud</strong></p></th>
     <th rowspan="3"><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p><strong>常時稼働コンピューティング（Serving クラスター）</strong></p></td>
     <td rowspan="2"><p><strong>オンデマンドコンピューティング</strong></p></td>
   </tr>
   <tr>
     <td><p><strong>Free & Serverless</strong></p></td>
     <td><p><strong>Dedicated</strong></p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>East US</p></td>
     <td><p>米国、バージニア</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>米国、バージニア</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>米国、アイオワ</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>アジア</p></td>
     <td><p>Central India</p></td>
     <td><p>インド、プネー</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Japan East</p></td>
     <td><p>日本、東京および埼玉</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
     <td><p>利用できません</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

## リージョンごとの機能の可用性\{#feature-availability-by-region}

次の表は、クラウドプロバイダーとリージョンごとの機能の可用性を示しています。

<table>
   <tr>
     <th><p><strong>機能</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./managed-volume">マネージドボリューム</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>利用できません</p></td>
   </tr>
   <tr>
     <td><p><a href="./external-volume">外部ボリューム</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-external-collections-console">外部コレクション</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョンで、<a href="https://support.zilliz.com/">リクエスト</a>に応じて利用できます。</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">グローバルクラスター</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p><a href="https://support.zilliz.com/">リクエスト</a>に応じて、次のリージョンで利用できます：</p><ul><li><p><code>us-central1</code></p></li><li><p><code>us-east4</code></p></li></ul></td>
     <td><p>利用できません</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">リージョン間バックアップ</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>利用できません</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">CMEK</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>利用できません</p></td>
   </tr>
   <tr>
     <td><p><a href="/docs/spark-batch-jobs">Spark バッチジョブ</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョンで、<a href="https://support.zilliz.com/">リクエスト</a>に応じて利用できます。</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
   </tr>
   <tr>
     <td><p><a href="/docs/zero-downtime-migration">ダウンタイムなしの移行</a></p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
     <td><p>✅ 一覧に記載されているすべてのリージョン</p></td>
   </tr>
</table>

<Admonition type="info" title="Note">

リージョンでの可用性は、すべてのデプロイオプションまたはプロジェクトプランで利用できることを保証するものではありません。構成とバージョンの要件については各機能のドキュメントを、プランの可用性については[デプロイとプランの比較](./select-zilliz-cloud-service-plans)を参照してください。

</Admonition>

