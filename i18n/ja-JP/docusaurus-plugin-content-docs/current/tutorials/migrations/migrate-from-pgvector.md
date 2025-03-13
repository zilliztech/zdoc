---
title: "テンセントクラウドからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "Tecent Cloudから"
beta: FALSE
notebook: FALSE
description: "テンセントクラウド VectorDB は、類似検索用に設計されたベクトルデータベースソリューションです。テンセントクラウドVectorDBからZilliz Cloudへのデータ移行により、ユーザーはZilliz Cloudの強化されたベクトル分析機能とスケーラブルなデータ管理を活用することができます。 | Cloud"
type: origin
token: FAn9woVv7igIzpkYvTPctzXAnud
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - postgresql
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


# テンセントクラウドからZilliz Cloudへの移行

[テンセントクラウド VectorDB ](https://www.tencentcloud.com/products/vdb)は、類似検索用に設計されたベクトルデータベースソリューションです。テンセントクラウドVectorDBからZilliz Cloudへのデータ移行により、ユーザーはZilliz Cloudの強化されたベクトル分析機能とスケーラブルなデータ管理を活用することができます。

このガイドでは、テンセントクラウドVectorDBからZilliz Cloudへのデータの移行について説明します。

## 考慮事項{#considerations}

- テンセントクラウドVectorDBからZilliz Cloudにデータを移行すると、ベクトルフィールドが直接転送されます。一方、テンセントクラウドVectorDBのスカラーフィールドは、Zilliz Cloud上の動的フィールドにJSON形式で保存されます。動的フィールド機能の詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

- 互換性を確保するため、Auto IDは無効になり、Zilliz Cloud上の各ターゲットコレクションに対して変更することはできません。

- 各移行タスクは、単一のソーステンセントCloud VectorDBインスタンスに制限されます。複数のソースクラスタにデータがある場合は、それぞれに別々の移行ジョブを設定できます。

## 始める前に{#before-you-start}

- ソースのテンセントクラウドVectorDBインスタンスは、パブリックインターネットからアクセスできます。

- ソースクラスターに必要な接続資格情報(インスタンスURLとAPIキー)を取得しました。

- Zilliz Cloudでは、組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## テンセントクラウドからZilliz Cloudへの移行{#migrate-from-tencent-cloud-to-zilliz-cloud}

![migrate_from_vectordb](/img/ja-JP/migrate_from_vectordb.png)

ソースデータを任意のプランレベルのZilliz Cloudクラスタに移行できます(CU体格がソースデータに対応している場合)。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトページに移動し、**移行**>**テンセントクラウドVectorDB**を選択してください。

1. [**データソースに接続**]ステップで、**インスタンスURL**と**APIキー**を入力します。次に、[**次**へ]をクリックします。

1. 「**ソースとターゲットを選択**」ステップで、ソースElasticsearchクラスタとターゲットZilliz Cloudクラスタの設定を行います。次に、「**次**へ」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>テンセントCloud VectorDBから移行する各ソースインデックスには、ベクトルフィールドを含める必要があります。</p>

    </Admonition>

1. 「**スキーマ構成**」ステップでは、

    1. [**スキーマプレビュー**]で、テンセントCloud VectorDBコレクションと対応するZilliz Cloudコレクションのフィールドマッピングを確認します。

        <Admonition type="info" icon="📘" title="ノート">

        <ul>
        <li><p>Auto IDは解除され、変更できません。</p></li>
        <li><p>テンセントクラウドVectorDBのレコードIDは、Zilliz Cloudの<code>VARCHAR</code>フィールドにプライマリフィールドとしてマップされ、<code>max_length</code>の範囲は1から65,535文字です。エンティティを挿入または挿入する場合は、<code>VARCHAR</code>フィールドの値がこの制限内に収まるようにしてください。</p></li>
        <li><p>フィールドの名前を変更することはできますが、データ型は固定されており、変更できません。</p></li>
        </ul>

        </Admonition>

    1. 「**詳細設定**」で、**ダイナミックフィールド**と**パーティションキー**の設定を確認してください。

        1. **ダイナミックフィールド**:デフォルトで有効になっており、変更できません。ソースコレクションからスカラーフィールドを保存し、一貫性を確保し、柔軟性を維持します。

        1. **パーティションキー**:デフォルトで無効になっており、変更できません。これは、テンセントクラウドVectorDBのスカラーフィールドが動的フィールドにJSONとして保存され、パーティションキーとして機能しないためです。Zilliz Cloudでは、スキーマで明示的に定義されたスカラーフィールドのみがパーティションキーとして使用できます。

    1. [**ターゲットコレクション名**と**説明**]で、ターゲットコレクション名と説明をカスタマイズします。コレクション名は、各クラスターで一意である必要があります。名前が既存の名前と重複する場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

## 移行過程を監視する{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/ja-JP/verify_collection.png)

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

