---
title: "ElasticsearchからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Elasticsearchから"
beta: FALSE
notebook: FALSE
description: "Elasticsearchは、大量のデータを処理するスピードと柔軟性で知られる、スケーラブルな検索および分析エンジンです。Zilliz Cloudの移行機能を活用することで、ElasticsearchインスタンスからZilliz Cloudクラスタへデータをシームレスに転送できます。 | Cloud"
type: origin
token: VCqgwwtyEieCCokZ0QGcYGalnoe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - elasticsearch
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';


# ElasticsearchからZilliz Cloudへの移行

[Elasticsearch](https://www.elastic.co/elasticsearch)は、大量のデータを処理するスピードと柔軟性で知られる、スケーラブルな検索および分析エンジンです。Zilliz Cloudの移行機能を活用することで、ElasticsearchインスタンスからZilliz Cloudクラスタへデータをシームレスに転送できます。

この移行過程では、既存のElasticsearchソースとの接続を確立し、そのデータインデックスをZilliz Cloudの対応するターゲットコレクションにレプリケートします。

## 考慮事項{#considerations}

- 現在、次のElasticsearchデータ型を移行できます:**dence_vector**、**text**、**string**、**キーワード**、**ip**、**date**、**timestamp**、**long**、**integer**、**short**、**byte**、**double**、**float**、**boolean**、**object**、**配列**。テーブルにサポートされていないデータ型のフィールドがある場合は、それらのフィールドを移行しないか、[サポートチケット](https://support.zilliz.com/hc/en-us/requests/new)を送信することができます。Elasticsearchデータ型がZilliz Cloudにマップされる方法については、「[フィールドマッピングリファレンス](./migrate-from-elasticsearch#field-mapping-reference)」を参照してください。

- 互換性を確保するため、Auto IDは無効になり、Zilliz Cloud上の各ターゲットコレクションに対して変更することはできません。

- 各移行タスクについて、各ソースインデックスから1つのベクトルフィールドのみを選択できます。

- 各移行タスクは、単一のソースElasticsearchクラスタに制限されます。複数のソースクラスタにデータがある場合は、それぞれに別々の移行ジョブを設定できます。

## 始める前に{#before-you-start}

次の前提条件が満たされていることを確認してください。

- ソースのElasticsearchクラスタはバージョン7. x以降が実行されており、パブリックインターネットからアクセスできます。

- ネットワーク環境で許可リストが設定されている場合は、Zilliz CloudのIPアドレスが追加されていることを確認してください。詳細については、「[Zilliz CloudのIPアドレス](./zilliz-cloud-ips)」を参照してください。

- 組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## ElasticsearchからZilliz Cloudへの移行{#migrate-from-elasticsearch-to-zilliz-cloud}

ソースデータを任意のプランレベルのZilliz Cloudクラスタに移行できます(CU体格がソースデータに対応している場合)。

![migrate_from_es](/img/migrate_from_es.png)

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトページに移動し、**Migrations**>**Elasticsearch**を選択してください。

1. 「**Connect to Data Source**」ステップで、ソースElasticsearchクラスタとやり取りする接続方法として、「**Via Endpoint**」または「**Via Cloud ID**」を選択します。次に、「**Next**」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p><a href="https://www.elastic.co/guide/en/cloud-enterprise/current/ece-connect.html#ece-connect">クラスターに接続</a>し、<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html">APIキー情報を取得</a>することで、必要な接続情報を取得できます。</p>

    </Admonition>

1. 「**ソースとターゲットを選択**」ステップで、ソースElasticsearchクラスタとターゲットZilliz Cloudクラスタの設定を行います。次に、「**次**へ」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Elasticsearchから移行する各ソースインデックスには、ベクトルフィールドを含める必要があります。</p>

    </Admonition>

1. 「**スキーマ構成**」ステップでは、

    1. あなたのElasticsearchデータと対応するZilliz Cloudデータタイプとのデータマッピングを確認してください。Zilliz Cloudには、Elasticsearchデータタイプを自分自身にマッピングするためのデフォルトのメカニズムがありますが、必要に応じてレビューして調整することができます。現在、フィールドの名前を変更することはできますが、基礎となるデータタイプを変更することはできません。

    1. 「**詳細設定**」で、**ダイナミックフィールド**と**パーティションキー**を設定します。詳細については、「[スキーマデザインハンズオン](./schema-design-hands-on)」と「[パーティションキーを使う](./use-partition-key)」を参照してください。

    1. [**ターゲットコレクション名**と**説明**]で、ターゲットコレクション名と説明をカスタマイズします。コレクション名は、各クラスターで一意である必要があります。名前が既存の名前と重複する場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

## 移行過程を監視する{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

## フィールドマッピングリファレンス{#field-mapping-reference}

以下の表を参照して、Elasticsearchのデータ型がZilliz Cloudのフィールド型にどのようにマップされるかを理解してください。

<table>
   <tr>
     <th><p><strong>Elasticsearchのフィールドタイプ</strong></p></th>
     <th><p><strong>Zilliz Cloudフィールドタイプ</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>密度ベクトル</p></td>
     <td><p>FloatVectorの</p></td>
     <td><p>ベクトルの寸法は変更されません。メトリックタイプとして<strong>L 2</strong>または<strong>IP</strong>を指定してください。</p></td>
   </tr>
   <tr>
     <td><p>テキスト、文字列、キーワード、ip、日付、タイムスタンプ</p></td>
     <td><p>VarChar</p></td>
     <td><p>最大長(1から65,535)を設定します。制限を超える文字列は移行エラーを引き起こす可能性があります。</p></td>
   </tr>
   <tr>
     <td><p>長い</p></td>
     <td><p>Int 64の</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>整数</p></td>
     <td><p>Int 32の</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>短い</p></td>
     <td><p>int 16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>バイト</p></td>
     <td><p>int 8</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ダブル</p></td>
     <td><p>ダブル</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>フロート</p></td>
     <td><p>フロート</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ブール値</p></td>
     <td><p>Bool</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>オブジェクト</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>配列</p></td>
     <td><p>アレイ</p></td>
     <td><p>-</p></td>
   </tr>
</table>

