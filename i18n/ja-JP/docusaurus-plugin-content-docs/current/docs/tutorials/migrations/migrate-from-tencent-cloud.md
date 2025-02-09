---
title: "Postgre SQLからZilliz Cloudに移行 | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Postgre SQLからZilliz Cloudに移行"
beta: FALSE
notebook: FALSE
description: "Postgre SQL](https//www.postgresql.org/)は、拡張性、データの整合性、パフォーマンスで有名な堅牢でオープンソースのオブジェクトリレーショナルデータベースエンジンです。[pgvector拡張機能を利用することで、Postgre SQLはベクトルデータを保存および管理する機能を獲得します。 | Cloud"
type: origin
token: RVMfwwMmCiPmVTkhPF7cHusWnCb
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - tencent cloud
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';


# Postgre SQLからZilliz Cloudに移行

[Postgre SQL](https://www.postgresql.org/)は、拡張性、データの整合性、パフォーマンスで有名な堅牢でオープンソースのオブジェクトリレーショナルデータベースエンジンです。[pgvector](https://github.com/pgvector/pgvector)拡張機能を利用することで、Postgre SQLはベクトルデータを保存および管理する機能を獲得します。

オンプレミスまたはクラウドホストに[pgvector](https://github.com/pgvector/pgvector)がインストールされたPostgre SQLデータベースを持っている場合、それらをZilliz Cloudクラスターにシームレスに移行できます。この移行過程には、既存のソースデータベースとの接続を確立し、そのデータをソーステーブルからZilliz Cloud上の対応するターゲットコレクションに複製することが含まれます。

## 考慮事項{#considerations}{#considerations}

- 次のPostgre SQLデータ型を移行できます:**vector**、**text**/**varchar**/**date/time/json**、**smallint**、**bigint**、**bigint**、**integer**、**smallint**、**倍精度**、**real**、**boolean**、**array**。テーブルにサポートされていないデータ型のフィールドがある場合は、それらのフィールドを移行しないか、[サポートチケット](https://support.zilliz.com/hc/en-us/requests/new)を送信することができます。Postgre SQLデータ型がZilliz Cloudにマップされる方法については、[フィールドマッピングリファレンス](./migrate-from-tencent-cloud#field-mapping-reference)を参照してください。

- 互換性を確保するため、Auto IDは無効になり、Zilliz Cloud上の各ターゲットコレクションに対して変更することはできません。

- 各移行タスクについて、各ソーステーブルから1つのベクトルフィールドのみを選択できます。

- 各移行タスクは、単一のソースPostgre SQLデータベースに制限されます。複数のソースデータベースにデータがある場合は、複数の移行ジョブを有効にできます。

## 始める前に{#before-you-start}{#before-you-start}

次の前提条件が満たされていることを確認してください。

- ソースのPostgre SQLデータベースは一般のインターネットからアクセスできます。

- ネットワーク環境で許可リストが設定されている場合は、Zilliz CloudのIPアドレスが追加されていることを確認してください。詳細については、「[Zilliz CloudのIPアドレス](./zilliz-cloud-ips)」を参照してください。

- 組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## Postgre SQLからZilliz Cloudに移行{#migrate-from-postgresql-to-zilliz-cloud}{#postgre-sqlzilliz-cloudmigrate-from-postgresql-to-zilliz-cloud}

ソースデータを任意のプランレベルのZilliz Cloudクラスタに移行できます(CU体格がソースデータに対応している場合)。

![migrate_from_pgvector](/img/ja-JP/migrate_from_pgvector.png)

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトに移動し、**移行**>**Postgre SQL**を選択してください。

1. 「**データソースに接続**」ステップで、ソースPostgre SQLデータベースのエンドポイントを「**データベースエンドポイント**」フィールドに入力し、データベースに関連付けられたユーザ名とパスワードを入力して、「**次**へ」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>接続情報の詳細については、<a href="https://jdbc.postgresql.org/documentation/use/#connecting-to-the-database">データベースへの接続を</a>参照してください。</p>

    </Admonition>

1. 「**ソースとターゲットを選択**」ステップで、ソースデータベースとターゲットのZilliz Cloudクラスタの設定を行います。次に、「**次**へ」をクリックしてください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Postgre SQLから移行する各テーブルには、ベクトルフィールドを含める必要があります。</p>

    </Admonition>

1. 「**スキーマ構成**」ステップでは、

    1. Postgre SQLデータと対応するZilliz Cloudデータタイプとのデータマッピングを確認してください。Zilliz Cloudには、Postgre SQLデータタイプを自分自身にマッピングするためのデフォルトのメカニズムがありますが、必要に応じてレビューして調整することができます。現在、フィールドの名前を変更することはできますが、基礎となるデータタイプを変更することはできません。

    1. 「**詳細設定**」で、**ダイナミックフィールド**と**パーティションキー**を設定します。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」と「[パーティションキーを使う](./use-partition-key)」を参照してください。

    1. [**ターゲットコレクション名**と**説明**]で、ターゲットコレクション名と説明をカスタマイズします。コレクション名は、各クラスターで一意である必要があります。名前が既存の名前と重複する場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

## 移行過程を監視する{#monitor-the-migration-process}{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESSFUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/ja-JP/verify_collection.png)

## 移行ジョブをキャンセル{#cancel-migration-job}{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

## フィールドマッピングリファレンス{#field-mapping-reference}{#field-mapping-reference}

Postgre SQLのフィールドタイプがZilliz Cloudのフィールドタイプにどのようにマップされるかを理解するために、以下の表を確認してください。

<table>
   <tr>
     <th><p>Postgre SQLのフィールドタイプ</p></th>
     <th><p>Zilliz Cloudフィールドタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>ベクトル</p></td>
     <td><p>FloatVectorの</p></td>
     <td><p>ベクトルの寸法は変更されません。メトリックタイプとして<strong>L 2</strong>または<strong>IP</strong>を指定してください。</p></td>
   </tr>
   <tr>
     <td><p>テキスト/varchar/日時/JSON</p></td>
     <td><p>VarChar</p></td>
     <td><p>最大長(1から65,535)を設定します。制限を超える文字列は移行エラーを引き起こす可能性があります。</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>Int 64の</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>整数</p></td>
     <td><p>Int 32の</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>int 16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ダブルプレシジョン</p></td>
     <td><p>ダブル</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>リアル</p></td>
     <td><p>フロート</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ブール値</p></td>
     <td><p>Bool</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>配列</p></td>
     <td><p>配列</p></td>
     <td><p>-</p></td>
   </tr>
</table>

