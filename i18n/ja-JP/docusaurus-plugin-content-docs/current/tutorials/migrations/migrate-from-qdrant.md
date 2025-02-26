---
title: "QdrantからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrantから"
beta: FALSE
notebook: FALSE
description: "Qdrantは、類似検索機能を提供するベクトルデータベースです。QdrantからZilliz Cloudにデータを移行することで、Qdrantがサポートするマルチベクトル構造との互換性を維持しながら、Zilliz Cloudの高度な検索と分析機能を活用することができます。 | Cloud"
type: origin
token: SQnCwR58ni8IivkAun0cDCp3nwb
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - qdrant
  - knn
  - Image Search
  - LLMs
  - Machine Learning

---

import Admonition from '@theme/Admonition';


# QdrantからZilliz Cloudへの移行

[Qdrant](https://qdrant.tech/)は、類似検索機能を提供するベクトルデータベースです。QdrantからZilliz Cloudにデータを移行することで、Qdrantがサポートするマルチベクトル構造との互換性を維持しながら、Zilliz Cloudの高度な検索と分析機能を活用することができます。

このガイドでは、QdrantからZilliz Cloudへデータを移行する手順をステップバイステップで説明します。接続の確立、データマッピングの設定、プロセス中に発生した問題のトラブルシューティングなどが含まれます。

## 考慮事項{#considerations}

- QdrantからZilliz Cloudにデータを移行すると、ベクトルフィールドが直接転送され、QdrantからのペイロードはZilliz Cloud上の動的フィールドにJSON形式で保存されます。動的フィールド機能の詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

- Nullペイロード値は移行でサポートされていません。Null値を保持するキーを設定する代わりに、ペイロードからキーを削除してください。

- 互換性を確保するため、Auto IDは無効になり、Zilliz Cloud上の各ターゲットコレクションに対して変更することはできません。

- 各移行タスクは、単一のソースQdrantクラスタに制限されます。複数のソースクラスタにデータがある場合は、複数の移行ジョブを有効にできます。

## 始める前に{#before-you-start}

- ソースQdrantクラスターは、パブリックインターネットからアクセスできます。

- ネットワーク環境で許可リストが設定されている場合は、Zilliz CloudのIPアドレスが追加されていることを確認してください。詳細については、「[Zilliz CloudのIPアドレス](./zilliz-cloud-ips)」を参照してください。

- ターゲットQdrantクラスターにアクセスするために必要な権限を持つクラスターエンドポイントとAPIキーを取得しました。

- Zilliz Cloudでは、組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## QdrantからZilliz Cloudへの移行{#migrate-from-qdrant-to-zilliz-cloud}

![migrate_from_qdrant](/img/ja-JP/migrate_from_qdrant.png)

ソースデータを任意のプランレベルのZilliz Cloudクラスタに移行できます(CU体格がソースデータに対応している場合)。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトページに移動し、**移行**>**Qdrant**を選択してください。

1. [**データソースに接続**]ステップで、ターゲットQdrantクラスターにアクセスするための資格情報として使用できる**クラスターエンドポイント**と**APIキー**を入力します。次に、[**次**へ]をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p><a href="https://qdrant.tech/documentation/cloud/authentication/?q=api+key">データベース認証</a>は、必要な接続情報を取得するためのガイドとなります。</p>

    </Admonition>

1. 「**ソースとターゲットを選択**」ステップで、ソースQdrantクラスターとターゲットZilliz Cloudクラスターの設定を行います。次に、「**次**へ」をクリックしてください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Qdrantから移行する各ソースコレクションには、少なくとも1つのベクトル場を含める必要があり、最大4つのベクトル場を含めることができます。</p>

    </Admonition>

1. 「**スキーマ構成**」ステップでは、

    1. [**スキーマプレビュー**]で、Qdrantコレクションと対応するZilliz Cloudコレクションのフィールドマッピングを確認します。

        <Admonition type="info" icon="📘" title="ノート">

        <ul>
        <li><p>Auto IDは解除され、変更できません。</p></li>
        <li><p>フィールドの名前を変更することはできますが、データ型は固定されており、変更できません。</p></li>
        </ul>

        </Admonition>

    1. 「**詳細設定**」で、**ダイナミックフィールド**と**パーティションキー**の設定を確認してください。

        1. **ダイナミックフィールド**:デフォルトで有効になっており、変更できません。ソースインデックスからペイロードを保存し、一貫性を確保し、柔軟性を維持します。

        1. **パーティションキー**:デフォルトで無効になっており、変更できません。これは、Qdrantからのペイロードが動的フィールドにJSONとして保存され、パーティションキーとして機能しないためです。Zilliz Cloudでは、スキーマで明示的に定義されたスカラーフィールドのみがパーティションキーとして使用できます。

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

